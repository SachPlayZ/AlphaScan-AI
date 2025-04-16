from datetime import datetime, UTC
import os
import asyncio
import random
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from telethon import TelegramClient, events, functions
from telethon.sessions import StringSession
from typing import Dict, List, Any, Tuple
from dotenv import load_dotenv
from cryptography.fernet import Fernet
from pydantic_core import from_json
from web3util import edu_balance, token_balance, buy_token, sell_token
from rich import print

load_dotenv()

def debug(msg):
    print(f"[bold blue][DEBUG][/bold blue] [white]{msg}[/white]")

def error(msg):
    print(f"[bold red][ERROR][/bold red] [red]{msg}[/red]")

def critical(msg):
    print(f"[bold white on red][CRITICAL][/bold white on red] [bold red]{msg}[/bold red]")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI")
DB_NAME = os.getenv("DB_NAME")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY", Fernet.generate_key().decode())
API_ID = int(os.getenv("API_ID"))
API_HASH = os.getenv("API_HASH")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "users")
fernet = Fernet(ENCRYPTION_KEY)

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

WATCHED_GROUPS_COLLECTION = "watched_groups"

active_watchers = {}

queue = {}

temp_clients: Dict[str, dict] = {}
message_listener_clients: Dict[str, TelegramClient] = {}


class UserInitRequest(BaseModel):
    user_id: str
    phone: str


class WatchGroupRequest(BaseModel):
    user_id: str
    group_name: str
    topic_name: str = None
    webhook_url: str = None


class VerifyOTPRequest(BaseModel):
    user_id: str
    otp_code: str


class SendMessageRequest(BaseModel):
    recipient: str
    message: str


def encrypt_data(data: str) -> str:
    return fernet.encrypt(data.encode()).decode()


def decrypt_data(encrypted_data: str) -> str:
    return fernet.decrypt(encrypted_data.encode()).decode()


def generate_reply(message_text: str) -> str:
    """Dummy reply generator"""
    response = generate("You are Arnab's helpful assistant that generates replies to messages representing Arnab. The user will send you a message and you will generate a reply to it. The reply should be a single sentence and should be in the same language as the message. The reply should be short and to the point. The message is: " + message_text)
    return response

async def init_message_listener(
    user_id: str, api_id: int, api_hash: str, session_string: str
):
    """Initialize and start a message listener for a user"""
    try:
        # Check if client already exists for this user
        if user_id in message_listener_clients:
            debug(f"Client already exists for user {user_id}, disconnecting old client")
            try:
                await message_listener_clients[user_id].disconnect()
            except Exception as e:
                error(f"Error disconnecting old client for {user_id}: {str(e)}")
        
        session = StringSession(session_string)
        client = TelegramClient(session, api_id, api_hash)

        await client.connect()
        if not await client.is_user_authorized():
            debug(f"User {user_id} not authorized, disconnecting client")
            await client.disconnect()
            return

        @client.on(events.NewMessage(incoming=True))
        async def handler(event):
            if not event.is_private:
                return
            # reply = generate_reply(event.message.text)
            # await event.reply(reply)

        # Store the client in the dictionary
        message_listener_clients[user_id] = client
        
        # Run the client in the background
        asyncio.create_task(client.run_until_disconnected())
        debug(f"Message listener initialized for user {user_id}")
    except Exception as e:
        error(f"Error initializing listener for {user_id}: {str(e)}")


async def get_user_client(user_id: str) -> TelegramClient:
    """Get a Telegram client for a user, reusing existing client if available"""
    # Check if we already have a client for this user
    if user_id in message_listener_clients:
        client = message_listener_clients[user_id]
        # Check if the client is connected
        if not client.is_connected():
            try:
                await client.connect()
                if not await client.is_user_authorized():
                    raise HTTPException(status_code=401, detail="Session expired")
            except Exception as e:
                error(f"Error reconnecting client for {user_id}: {str(e)}")
                # Remove the invalid client
                del message_listener_clients[user_id]
                # Create a new client
                return await create_new_client(user_id)
        return client
    
    # Create a new client if we don't have one
    return await create_new_client(user_id)


async def create_new_client(user_id: str) -> TelegramClient:
    """Create a new Telegram client for a user"""
    user = await db[COLLECTION_NAME].find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not registered")

    session = decrypt_data(user["session_string"])
    client = TelegramClient(
        StringSession(session), user["api_id"], decrypt_data(user["api_hash"])
    )

    try:
        await client.connect()
        if not await client.is_user_authorized():
            await client.disconnect()
            raise HTTPException(status_code=401, detail="Session expired")
        
        # Store the client for future use
        message_listener_clients[user_id] = client
        return client
    except Exception as e:
        if client.is_connected():
            await client.disconnect()
        raise HTTPException(status_code=500, detail=f"Error creating client: {str(e)}")


@app.on_event("startup")
async def startup_event():
    """Start message listeners for all existing users on startup"""
    debug("Starting application...")

    debug("Initializing message listeners for existing users...")
    async for user in db[COLLECTION_NAME].find():
        try:
            debug(f"Setting up listener for user {user['user_id']}")
            api_id = user["api_id"]
            api_hash = decrypt_data(user["api_hash"])
            session_string = decrypt_data(user["session_string"])
            await init_message_listener(
                user["user_id"], api_id, api_hash, session_string
            )
        except Exception as e:
            error(f"Failed to initialize listener for {user['user_id']}: {str(e)}")

    debug("Initializing group watchers...")
    try:
        # Group watch entries by user_id for better organization
        user_watch_entries = {}
        cursor = db[WATCHED_GROUPS_COLLECTION].find({})
        watch_entries = await cursor.to_list(None)
        debug(f"Found {len(watch_entries)} watch entries to initialize")

        # Group entries by user_id
        for entry in watch_entries:
            user_id = entry["user_id"]
            if user_id not in user_watch_entries:
                user_watch_entries[user_id] = []
            user_watch_entries[user_id].append(entry)

        # Initialize watchers for each user in parallel
        for user_id, entries in user_watch_entries.items():
            debug(f"Initializing watchers for user {user_id} with {len(entries)} groups")
            for entry in entries:
                try:
                    debug(
                        f"Starting watcher for group {entry['group_name']} (ID: {entry['group_id']})"
                    )
                    await start_group_watcher(
                        entry["user_id"], entry["group_id"], entry.get("topic_id")
                    )
                except Exception as e:
                    error(f"Failed to start watcher for {entry['group_name']}: {str(e)}")

    except Exception as e:
        error(f"Error restarting watchers: {str(e)}")

    debug("Startup process completed")


@app.on_event("shutdown")
async def shutdown_event():
    """Disconnect all message listeners on shutdown"""
    debug("Shutting down application...")
    
    # Cancel all active watchers
    debug(f"Cancelling {len(active_watchers)} active watchers")
    for watcher_key, task in active_watchers.items():
        try:
            debug(f"Cancelling watcher {watcher_key}")
            task.cancel()
        except Exception as e:
            error(f"Error cancelling watcher {watcher_key}: {str(e)}")
    
    # Wait for all tasks to be cancelled
    if active_watchers:
        await asyncio.sleep(2)  # Give tasks time to cancel
    
    # Disconnect all clients
    debug(f"Disconnecting {len(message_listener_clients)} message listener clients")
    for user_id, client in message_listener_clients.items():
        try:
            debug(f"Disconnecting client for user {user_id}")
            await client.disconnect()
        except Exception as e:
            error(f"Error disconnecting client for user {user_id}: {str(e)}")
    
    debug("Shutdown complete")


@app.post("/init")
async def initialize_user(request: UserInitRequest):
    debug(f"Initializing user: {request.user_id}")
    existing = await db[COLLECTION_NAME].find_one({"user_id": request.user_id})
    if existing:
        error(f"User already exists: {request.user_id}")
        raise HTTPException(status_code=400, detail="User already exists")

    client = TelegramClient(StringSession(), API_ID, API_HASH)
    await client.connect()

    try:
        sent_code = await client.send_code_request(request.phone)
        temp_clients[request.user_id] = {
            "client": client,
            "phone_code_hash": sent_code.phone_code_hash,
        }
        debug(f"OTP sent to {request.phone}")
        return {"status": "OTP sent"}
    except Exception as e:
        await client.disconnect()
        critical(f"Error sending OTP: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/watch-group")
async def watch_group(request: WatchGroupRequest):
    """Add a group/channel to watch list"""
    try:
        user = await db[COLLECTION_NAME].find_one({"user_id": request.user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not registered")

        session = decrypt_data(user["session_string"])
        client = TelegramClient(
            StringSession(session), user["api_id"], decrypt_data(user["api_hash"])
        )

        await client.connect()
        if not await client.is_user_authorized():
            await client.disconnect()
            raise HTTPException(status_code=401, detail="Session expired")

        found_entity = None
        found_topic_id = None

        try:
            found_entity = await client.get_entity(request.group_name)
        except:
            dialogs = await client.get_dialogs()
            for dialog in dialogs:
                if dialog.title.lower() == request.group_name.lower() or (
                    hasattr(dialog.entity, "username")
                    and dialog.entity.username
                    and dialog.entity.username.lower() == request.group_name.lower()
                ):
                    found_entity = dialog.entity
                    break

        if not found_entity:
            await client.disconnect()
            raise HTTPException(
                status_code=404,
                detail=f"Group/channel '{request.group_name}' not found",
            )

        if request.topic_name and getattr(found_entity, "forum", False):
            topics = await client(
                functions.channels.GetForumTopicsRequest(
                    channel=found_entity,
                    offset_date=0,
                    offset_id=0,
                    offset_topic=0,
                    limit=100,
                )
            )

            for topic in topics.topics:
                if topic.title.lower() == request.topic_name.lower():
                    found_topic_id = topic.id
                    break

            if not found_topic_id:
                await client.disconnect()
                raise HTTPException(
                    status_code=404,
                    detail=f"Topic '{request.topic_name}' not found in the forum",
                )

        watch_entry = {
            "user_id": request.user_id,
            "group_id": found_entity.id,
            "group_name": found_entity.title,
            "is_channel": hasattr(found_entity, "broadcast") and found_entity.broadcast,
            "is_forum": hasattr(found_entity, "forum") and found_entity.forum,
            "topic_id": found_topic_id,
            "topic_name": request.topic_name if found_topic_id else None,
            "webhook_url": request.webhook_url,
            "created_at": datetime.now(),
            "username": getattr(found_entity, "username", None),
        }

        result = await db[WATCHED_GROUPS_COLLECTION].update_one(
            {
                "user_id": request.user_id,
                "group_id": found_entity.id,
                "topic_id": found_topic_id,
            },
            {"$set": watch_entry},
            upsert=True,
        )

        # Always start the watcher after adding/updating the entry
        await start_group_watcher(request.user_id, found_entity.id, found_topic_id)

        await client.disconnect()

        return {
            "status": "success",
            "message": f"Now watching {'topic' if found_topic_id else 'group/channel'}: {found_entity.title}{f' - {request.topic_name}' if found_topic_id else ''}",
            "watch_entry": watch_entry,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/watched-groups/{user_id}")
async def get_watched_groups(user_id: str):
    """Get all watched groups for a user"""
    try:
        cursor = db[WATCHED_GROUPS_COLLECTION].find({"user_id": user_id})
        watched_groups = await cursor.to_list(None)

        for group in watched_groups:
            group["_id"] = str(group["_id"])
            if "created_at" in group:
                group["created_at"] = group["created_at"].isoformat()

        return {"watched_groups": watched_groups}

    except Exception as e:
        error(f"Error getting watched groups: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


async def get_topic_ids(user_id: str):
    cursor = db[WATCHED_GROUPS_COLLECTION].find({"user_id": user_id})
    watched_groups = await cursor.to_list(None)
    return [
        group["topic_id"] if group["topic_id"] is not None else group["group_id"]
        for group in watched_groups
    ]


@app.delete("/unwatch-group")
async def unwatch_group(user_id: str, group_id: int, topic_id: int = None):
    """Remove a group/channel from watch list"""
    try:
        filter_query = {"user_id": user_id, "group_id": group_id}

        if topic_id is not None:
            filter_query["topic_id"] = topic_id

        result = await db[WATCHED_GROUPS_COLLECTION].delete_one(filter_query)

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Watched group/topic not found")

        watcher_key = f"{user_id}:{group_id}:{topic_id}"
        if watcher_key in active_watchers:
            active_watchers[watcher_key].cancel()
            del active_watchers[watcher_key]

        return {"status": "success", "message": "Stopped watching group/topic"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def start_group_watcher(user_id, group_id, topic_id=None):
    """Start a background task to watch a group/channel for messages"""
    watcher_key = f"{user_id}:{group_id}:{topic_id}"
    debug(f"Starting group watcher with key: {watcher_key}")

    # Cancel existing watcher if it exists
    if watcher_key in active_watchers:
        debug(f"Cancelling existing watcher for {watcher_key}")
        try:
            active_watchers[watcher_key].cancel()
            await asyncio.sleep(1)  # Give the task time to cancel
        except Exception as e:
            error(f"Error cancelling watcher {watcher_key}: {str(e)}")
        del active_watchers[watcher_key]

    # Create a new watcher task
    debug(f"Creating new watcher task for {watcher_key}")
    task = asyncio.create_task(watch_group_messages(user_id, group_id, topic_id))
    active_watchers[watcher_key] = task
    
    # Add error handling for the task
    task.add_done_callback(lambda t: handle_watcher_task_done(t, watcher_key))
    
    debug(f"Watcher task created and stored for {watcher_key}")
    return task


def handle_watcher_task_done(task, watcher_key):
    """Handle task completion and cleanup"""
    try:
        # Check if the task was cancelled
        if task.cancelled():
            debug(f"Watcher task {watcher_key} was cancelled")
            return
        
        # Check if there was an exception
        exc = task.exception()
        if exc:
            error(f"Watcher task {watcher_key} failed with exception: {str(exc)}")
            # Remove the failed watcher from active_watchers
            if watcher_key in active_watchers:
                del active_watchers[watcher_key]
    except Exception as e:
        error(f"Error handling watcher task completion for {watcher_key}: {str(e)}")


async def watch_group_messages(user_id, group_id, topic_id=None):
    """Background task to watch for messages in a group/channel using a dedicated client"""
    client = None  # Initialize client to None
    try:
        debug(
            f"Starting watch_group_messages for user {user_id}, group {group_id}, topic {topic_id}"
        )

        user = await db[COLLECTION_NAME].find_one({"user_id": user_id})
        if not user:
            error(f"User {user_id} not found for watcher")
            return

        debug(f"Found user {user_id} in database")

        watch_entry = await db[WATCHED_GROUPS_COLLECTION].find_one(
            {"user_id": user_id, "group_id": group_id, "topic_id": topic_id}
        )

        if not watch_entry:
            error(f"Watch entry not found for {user_id}:{group_id}:{topic_id}")
            return

        debug(f"Found watch entry for group {watch_entry['group_name']}")
        debug(f"Setting up DEDICATED client for user {user_id} to watch group {group_id}")

        # Create a new, dedicated client for this watcher instance
        session = decrypt_data(user["session_string"])
        client = TelegramClient(
            StringSession(session), user["api_id"], decrypt_data(user["api_hash"])
        )
        debug(f"Created dedicated client for watcher {user_id}:{group_id}:{topic_id}")

        await client.connect()
        if not await client.is_user_authorized():
            debug(f"User {user_id} not authorized for watcher {group_id}")
            await client.disconnect()
            return
        
        debug(f"Dedicated client connected and authorized for watcher {user_id}:{group_id}:{topic_id}")

        # Create a unique event handler for this specific group/topic
        @client.on(events.NewMessage(chats=group_id))
        async def handler(event):
            debug(f"New message event received for user {user_id} in group {group_id} (watcher)!")
            try:
                # Check if the watcher should still be active before processing
                watcher_key = f"{user_id}:{group_id}:{topic_id}"
                if watcher_key not in active_watchers:
                    debug(f"Watcher {watcher_key} is no longer active, ignoring message.")
                    return

                # Existing topic filtering logic...
                if topic_id is not None:
                    if (
                        not hasattr(event.message, "reply_to")
                        or event.message.reply_to is None
                    ):
                        debug("Message has no reply_to attribute or is None")
                        return
                    if (
                        not hasattr(event.message.reply_to, "forum_topic")
                        or not event.message.reply_to.forum_topic
                    ):
                        debug("Message is not in a forum topic")
                        return
                    
                    # Fetch topic IDs dynamically within the handler to ensure freshness
                    current_topic_ids = await get_topic_ids(user_id)
                    if event.message.reply_to.reply_to_msg_id not in current_topic_ids:
                        debug(
                            f"Message topic ID {event.message.reply_to.reply_to_msg_id} not in watched topics for user {user_id}"
                        )
                        return
                
                # More specific check for topic ID match if topic_id is provided
                if topic_id is not None and event.message.reply_to.reply_to_msg_id != topic_id:
                    debug(f"Message topic ID {event.message.reply_to.reply_to_msg_id} doesn't match specific watcher topic {topic_id}")
                    return
                
                # Fetch the correct watch entry based on group_id and potentially topic_id
                current_watch_entry = await db[WATCHED_GROUPS_COLLECTION].find_one(
                    {"user_id": user_id, "group_id": group_id, "topic_id": topic_id}
                )
                if not current_watch_entry:
                    error(f"Watch entry not found for {user_id}:{group_id}:{topic_id} during message processing.")
                    return

                sender = await event.get_sender()
                first_name = getattr(sender, "first_name", "") or ""
                last_name = getattr(sender, "last_name", "") or ""
                sender_name = f"{first_name} {last_name}"
                sender_name = sender_name.strip() or sender.username or "Unknown"
                
                await process_message(
                    current_watch_entry["group_name"],
                    current_watch_entry["topic_name"],
                    sender_name,
                    event.message.text,
                    user_id,
                )

            except Exception as e:
                error(f"Error in message handler for watcher {user_id}:{group_id}:{topic_id}: {str(e)}")

        debug(f"Event handler registered for dedicated watcher {user_id}:{group_id}:{topic_id}")
        
        # Run the client until disconnected
        await client.run_until_disconnected()
        debug(f"Watcher client {user_id}:{group_id}:{topic_id} disconnected.")

    except asyncio.CancelledError:
        debug(f"Watcher task for {user_id}:{group_id}:{topic_id} was cancelled.")
        # Ensure client is disconnected on cancellation
        if client and client.is_connected():
            debug(f"Disconnecting client for cancelled watcher {user_id}:{group_id}:{topic_id}")
            await client.disconnect()

    except Exception as e:
        critical(f"ERROR in watcher task {user_id}:{group_id}:{topic_id}: {str(e)}")
        # Ensure client is disconnected on error
        if client and client.is_connected():
            debug(f"Disconnecting client for failed watcher {user_id}:{group_id}:{topic_id}")
            await client.disconnect()
    finally:
        # Final check for disconnection
        if client and client.is_connected():
             await client.disconnect()
        debug(f"Watcher task {user_id}:{group_id}:{topic_id} finished.")


async def get_watch_entry(user_id: str, topic_id: int):
    return await db[WATCHED_GROUPS_COLLECTION].find_one(
        {"user_id": user_id, "topic_id": topic_id}
    )


@app.get("/get-queue")
async def get_queue():
    global queue
    return queue


async def process_message(
    group_name: str, topic_name: str, sender_name: str, message_text: str, user_id: str
):
    global queue

    key = f"{group_name}:{topic_name}" if topic_name is not None else group_name

    queue[key] = queue.get(key, [])
    queue[key].append(
        {
            "group_name": group_name,
            "topic_name": topic_name,
            "sender_name": sender_name,
            "message_text": message_text,
            "user_id": user_id,
            "overlap": False,
        }
    )
    # print("Message received:", message_text)
    # print("Queue:", queue)
    if len(queue[key]) == 10:
        last_10_messages = queue[key]
        queue[key] = []
        overlap_messages = last_10_messages[-3:]
        for message in overlap_messages:
            message["overlap"] = True
            queue[key].append(message)
        await analyse_texts(last_10_messages, user_id)


def generate(prompt: str):
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            client = Groq(
                api_key=os.getenv("GROQ_API_KEY"),
            )
            response = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model=os.getenv("GROQ_MODEL"),
                stream=False,
            )
            output = response.choices[0].message.content
            output = output.split("</think>")[1]
            return output
            
        except Exception as e:
            retry_count += 1
            if retry_count == max_retries:
                raise Exception(f"Failed after {max_retries} retries: {str(e)}")
            debug(f"Attempt {retry_count} failed, retrying...")


def get_eth_balance(user_id: str) -> bool:
    debug(f"Getting ETH balance for user {user_id}")
    balance = edu_balance(user_id)["edu_balance"]
    return balance > 0


def get_token_balance(token: str, user_id: str) -> bool:
    debug(f"Getting token balance for user {user_id} and token {token}")
    balance = token_balance(user_id, token)["token_balance"]
    return balance > 0


async def log_action(action: str, input_data: Any, output_data: Any, user_id: str) -> None:
    """
    Logs an action with its input and output to the database

    Args:
        action: The name/type of action being logged
        input_data: The input data for the action
        output_data: The output/result of the action
    """
    debug(f"Logging action: {action}")
    try:
        log_entry = {
            "timestamp": datetime.now(UTC),
            "action": action,
            "input": input_data,
            "output": output_data,
            "user_id": user_id
        }

        await db["logs"].insert_one(log_entry)
    except Exception as e:
        error(f"Error logging action: {str(e)}")


async def analyse_texts(queue: List[Dict], user_id: str) -> Any:
    debug("Analyzing texts")
    tg_alpha = get_alpha(queue)
    await log_action("Get Alpha from Group Texts", queue, tg_alpha, user_id)
    if len(tg_alpha) == 0:
        await log_action("Analyse Texts", tg_alpha, "No token alphas detected", user_id)
        return
    for token in tg_alpha:
        await log_action("Analyse Each Alpha", token, "Analyzing alpha", user_id)
        if token["sentiment"] == "positive":
            await log_action(
                "Check EDU Balance [Alpha is positive so we need to buy using EDU]",
                token,
                "Checking EDU balance",
                user_id
            )
            if not get_eth_balance(user_id):
                await log_action(
                    "Check EDU Balance", token, "EDU balance is zero", user_id
                )
                return
        elif token["sentiment"] == "negative":
            await log_action(
                "Check Token Balance [Alpha is negative so we need to sell the token]",
                token,
                "Checking token balance",
                user_id

            )
            if not get_token_balance(token["token"], user_id):
                await log_action(
                    "Check Token Balance", token, "Token balance is zero", user_id
                )
                return
        _, sentiment, valid = await validation_layer(token, user_id)
        if not valid:
            await log_action("Validation Layer Declined", token, {
                "reason": "Token is not valid",
                "sentiment": sentiment,
                "validity": valid,
            }, user_id)
            return
        trust, pnl_potential = await trust_layer(sentiment, token, user_id)
        if not trust:
            await log_action("Trust Layer Declined", {
                "token": token,
                "sentiment": sentiment
            }, {
                "reason": "Token is not trusted",
                "trust": trust,
                "pnl_potential": pnl_potential,
            },
            user_id)
            return
        if abs(pnl_potential) < 10:
            await log_action(
                "PNL Potential is too low", pnl_potential, "PNL Potential is too low", user_id
            )
            return
        await transaction_layer(token, user_id)
    return


@app.get("/get-logs/{user_id}")
async def get_logs(user_id: str):
    cursor = db["logs"].find({"user_id": user_id})
    logs = await cursor.to_list(length=None)
    # Convert ObjectId to string and clean up non-serializable objects
    cleaned_logs = []
    for log in logs:
        log['_id'] = str(log['_id'])  # Convert ObjectId to string
        # Convert timestamp to ISO format string if it exists
        if 'timestamp' in log:
            log['timestamp'] = log['timestamp'].isoformat()
        cleaned_logs.append(log)
    return cleaned_logs


async def store_token_transaction(user_id: str, token_symbol: str):
    """
    Store token transaction history for a user in the database.
    Updates the user's token history by adding new tokens they interact with.

    Args:
        user_id: The ID of the user making the transaction
        token_symbol: The symbol of the token being bought/sold
    """
    try:
        token_history = await db["token_history"].find_one({"user_id": user_id})

        if token_history:
            if token_symbol not in token_history["tokens"]:
                await db["token_history"].update_one(
                    {"user_id": user_id}, {"$push": {"tokens": token_symbol}}
                )
        else:
            await db["token_history"].insert_one(
                {
                    "user_id": user_id,
                    "tokens": [token_symbol],
                    "created_at": datetime.now(UTC),
                }
            )

    except Exception as e:
        error(f"Error storing token transaction: {str(e)}")


async def get_token_history(user_id: str) -> List[str]:
    token_history = await db["token_history"].find_one({"user_id": user_id})
    return token_history["tokens"]


@app.get("/get-token-history/{user_id}")
async def get_token_history_endpoint(user_id: str):
    tokens = await get_token_history(user_id)
    res = []
    for token in tokens:
        balance = token_balance(user_id, token)
        res.append({"token": token, "balance": balance})
    return res


async def transaction_layer(token: Dict, user_id: str):
    await store_token_transaction(user_id, token["token"])
    if token["sentiment"] == "positive":
        balance = edu_balance(user_id)["edu_balance"]
        if balance > 0:
            tx = buy_token(user_id, token["token"], balance * 0.6)
            await log_action(f"Buy Token {token['token']}", token, tx, user_id)
    elif token["sentiment"] == "negative":
        balance = token_balance(user_id, token["token"])["token_balance"]
        if balance > 0:
            tx = sell_token(user_id, token["token"], balance)
            await log_action(f"Sell Token {token['token']}", token, tx, user_id)


def detect_trend(data):
    trends = {}

    for key, values in data.items():
        if all(values[i] >= values[i + 1] for i in range(len(values) - 1)):
            trends[key] = "negative"
        elif all(values[i] <= values[i + 1] for i in range(len(values) - 1)):
            trends[key] = "positive"
        else:
            trends[key] = "mixed"
    return trends


def generate_market_data(
    trend="rising",
    days=10,
    start_price=random.uniform(1, 100),
    start_volume=random.uniform(1e3, 1e6),
):
    prices, market_caps, total_volumes = [], [], []

    prices.append(start_price)
    total_volumes.append(start_volume)
    market_caps.append(start_price * start_volume)

    for _ in range(days - 1):
        if trend == "rising":
            price_change = random.uniform(0.5, 2.0)
            volume_change = random.uniform(1e3, 5e3)
        elif trend == "falling":
            price_change = random.uniform(-2.0, -0.5)
            volume_change = random.uniform(-5e3, -1e3)
        else:
            price_change = random.uniform(-1.5, 1.5)
            volume_change = random.uniform(-3e3, 3e3)

        new_price = max(1, prices[-1] + price_change)
        new_volume = max(1e3, total_volumes[-1] + volume_change)
        new_market_cap = new_price * new_volume

        prices.append(new_price)
        total_volumes.append(new_volume)
        market_caps.append(new_market_cap)

    return {
        "prices": prices,
        "market_caps": market_caps,
        "total_volumes": total_volumes,
    }


def get_historical_data(token: Dict) -> Dict:
    good_bad = (
        "rising"
        if random.random() < (0.9 if token["sentiment"] == "positive" else 0.1)
        else "falling"
    )
    return generate_market_data(good_bad)


def get_pnl_potential(data: Dict):
    prices = data.get("prices", [])
    market_caps = data.get("market_caps", [])
    volumes = data.get("total_volumes", [])

    if not prices or not market_caps or not volumes:
        return 0

    initial_price = prices[0]
    final_price = prices[-1]
    price_change = (final_price - initial_price) / initial_price * 100

    avg_market_cap = sum(market_caps) / len(market_caps)
    avg_volume = sum(volumes) / len(volumes)

    profit_or_loss_potential = (
        price_change * (avg_market_cap / max(market_caps)) * (avg_volume / max(volumes))
    )

    return profit_or_loss_potential


async def trust_layer(sentiment: str, token: Dict, user_id: str) -> Tuple[bool, float]:
    historical_data = get_historical_data(token)
    await log_action("Get Historical Data", token, historical_data, user_id)
    trends = detect_trend(historical_data)
    await log_action("Detect Trends", token, trends, user_id)
    if not trends["prices"] == "positive" and sentiment == "positive":
        await log_action(
            "Sentiment and Trends do not match",
            {"token": token, "sentiment": sentiment, "trends": trends},
            "Sentiment and Trends do not match",
            user_id
        )
        return False, 0
    if not trends["prices"] == "negative" and sentiment == "negative":
        await log_action(
            "Sentiment and Trends do not match",
            {"token": token, "sentiment": sentiment, "trends": trends},
            "Sentiment and Trends do not match",
            user_id
        )
        return False, 0

    pnl_potential = get_pnl_potential(historical_data)
    await log_action("Get PNL Potential", {
        "token": token,
        "historical_data": historical_data,
    }, pnl_potential, user_id)

    return True, pnl_potential


def get_tweets(token: Dict) -> List[Dict]:
    good_bad = (
        "good"
        if random.random() < (0.8 if token["sentiment"] == "positive" else 0.2)
        else "bad"
    )
    prompt = f"""You are an expert crypto token tweet generator. You are given a token name and you need to generate 10 tweets about the token. Sentiment of the tweets should be {good_bad}.
    The tweets should be short and to the point, max 280 characters each.
    The tweets should be engaging and interesting, and not be promotional.
    Some tweets should be weird and funny.
    One or two tweets can be opposite of the overall sentiment, to make it more interesting, but not more than 2.
    All tweets should be about the token itself, not the project behind it.
    Make sure all the tweets are in English or Hindi.
    Return the tweets in this JSON format:
    {{
        "tweets": [
            "tweet 1",
            "tweet 2",
            ...
        ]
    }}
    Token name: {token["token"]}
    """
    response = generate(prompt)
    return from_json(response, allow_inf_nan=True, allow_partial=True)["tweets"]


def analyse_tweets(tweets: List[str], token: str) -> Dict:
    prompt = f"""You are an expert cryptocurrency analyst with deep experience in sentiment analysis and market psychology. You are given a list of tweets discussing a specific token.

    Your task is to carefully analyze these tweets to determine the overall market sentiment. Consider:
    - The tone and language used (sarcasm, enthusiasm, fear, etc.)
    - Any specific criticisms or praise of the token
    - References to price movement, trading volume, or market dynamics
    - The credibility and context of the statements
    - The ratio of positive to negative comments
    - The intensity of the sentiment expressed

    Weigh all factors to make a binary sentiment determination. Be especially alert for:
    - Coordinated pumping or FUD campaigns
    - Overly emotional or irrational statements
    - Technical analysis claims without evidence
    - Market manipulation attempts

    Return your analysis as a JSON with this exact format:
    {{
        "sentiment": "positive/negative"
    }}

    Tweets to analyze: {tweets}
    Token being discussed: {token}
    """
    response = generate(prompt)
    return from_json(response, allow_inf_nan=True, allow_partial=True)


async def validation_layer(alpha: Dict, user_id: str) -> Tuple[List[str], Dict, bool]:
    tweets = get_tweets(alpha)
    await log_action("Get Tweets", alpha, tweets, user_id)
    sentiment = analyse_tweets(tweets, alpha["token"])["sentiment"]
    await log_action("Analyse Tweets", {
        "token": alpha["token"],
        "tweets": tweets,
    }, sentiment, user_id)
    if not sentiment == alpha["sentiment"]:
        await log_action("Validation Layer", {
            "sentiment": sentiment,
            "expected_sentiment": alpha["sentiment"],
        }, "Sentiment does not match", user_id)
        return tweets, sentiment, False
    await log_action("Validation Layer Passed", {
        "token": alpha["token"],
        "tweets": tweets,
        "sentiment": sentiment,
        "expected_sentiment": alpha["sentiment"],
    }, "Sentiment matches", user_id)
    return tweets, sentiment, True


def get_alpha(queue: List[Dict]):
    prompt = f"""You are an expect cryptocurrency analyst with deep knowledge of tokens, DeFi protocols, and market trends. Analyze the following group chat messages and:

1. Identify any cryptocurrency tokens being discussed, including:
   - Direct token mentions (e.g. BTC, ETH)
   - Indirect references (e.g. "the blue chip", "Vitalik's creation")
   - Related protocol/platform tokens

2. For each identified token:
   - Extract relevant message snippets showing the discussion context
   - Determine overall sentiment (positive/negative) based on:
     * Price discussion
     * Project developments
     * Market outlook
     * User reactions

3. If the messages are overlap message, only take them into account if they are relevant to the non-overlap messages.

3. Return results in this JSON format:
[
    {{
        "token": "token_symbol", 
        "texts": ["relevant message 1", "relevant message 2"],
        "sentiment": "positive/negative",
        "confidence": 0.8  // How confident the token identification is (0-1)
    }},
    ...
]

Return empty list if no tokens detected.

Messages to analyze: {queue}"""
    response = generate(prompt)
    return from_json(response, allow_inf_nan=True, allow_partial=True)


@app.get("/user-groups/{user_id}")
async def get_user_groups(user_id: str):
    try:
        user = await db[COLLECTION_NAME].find_one({"user_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not registered")

        session = decrypt_data(user["session_string"])
        client = TelegramClient(
            StringSession(session), user["api_id"], decrypt_data(user["api_hash"])
        )

        try:
            await client.connect()
            if not await client.is_user_authorized():
                raise HTTPException(status_code=401, detail="Session expired")

            dialogs = await client.get_dialogs()

            regular_groups = []
            super_groups = []
            channels = []
            dialog_dict = {}
            for key, value in dialogs[0].__dict__.items():
                if hasattr(value, "__dict__"):
                    nested_dict = {}
                    for k, v in value.__dict__.items():
                        if isinstance(v, StringSession):
                            continue
                        elif hasattr(v, "__dict__"):
                            nested_dict[k] = str(v)
                        elif isinstance(v, datetime):
                            nested_dict[k] = v.isoformat()
                        else:
                            nested_dict[k] = str(v)
                    dialog_dict[key] = nested_dict
                elif isinstance(value, datetime):
                    dialog_dict[key] = value.isoformat()
                elif isinstance(value, StringSession):
                    continue
                else:
                    dialog_dict[key] = str(value)

            for dialog in dialogs:
                if getattr(
                        dialog.entity, "participants_count", None
                    ) is None or getattr(dialog.entity, "participants_count", None) < 1:
                    continue
                group_info = {
                    "id": getattr(dialog.entity, "id", None),
                    "title": dialog.title,
                    "participants_count": getattr(
                        dialog.entity, "participants_count", None
                    ),
                    "username": getattr(dialog.entity, "username", None),
                    "description": getattr(dialog.entity, "about", None),
                }

                if dialog.is_channel:
                    if getattr(dialog.entity, "megagroup", False):
                        group_info["type"] = "supergroup"
                        super_groups.append(group_info)
                    else:
                        group_info["type"] = "channel"
                        channels.append(group_info)
                elif dialog.is_group:
                    group_info["type"] = "group"
                    regular_groups.append(group_info)

            for group in super_groups:
                try:
                    entity = await client.get_entity(group["id"])
                    if getattr(entity, "forum", False):
                        topics = await client(
                            functions.channels.GetForumTopicsRequest(
                                channel=entity,
                                offset_date=0,
                                offset_id=0,
                                offset_topic=0,
                                limit=100,
                            )
                        )

                        group["is_forum"] = True
                        group["topics"] = []

                        for topic in topics.topics:
                            group["topics"].append(
                                {
                                    "id": topic.id,
                                    "title": topic.title,
                                    "icon_color": (
                                        topic.icon_color
                                        if hasattr(topic, "icon_color")
                                        else None
                                    ),
                                    "icon_emoji": (
                                        topic.icon_emoji
                                        if hasattr(topic, "icon_emoji")
                                        else None
                                    ),
                                }
                            )
                    else:
                        group["is_forum"] = False
                except Exception as e:
                    group["is_forum"] = False
                    group["topics_error"] = str(e)

            return {
                "regular_groups": regular_groups if len(regular_groups) > 0 else [],
                "supergroups": super_groups if len(super_groups) > 0 else [],
                "channels": channels if len(channels) > 0 else [],
            }

        finally:
            await client.disconnect()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/verify")
async def verify_otp(request: VerifyOTPRequest):
    temp_data = temp_clients.get(request.user_id)
    if not temp_data:
        raise HTTPException(status_code=404, detail="OTP flow not initiated")

    client = temp_data["client"]
    try:
        await client.sign_in(
            phone=client._phone,
            code=request.otp_code,
            phone_code_hash=temp_data["phone_code_hash"],
        )
    except Exception as e:
        error(f"Error signing in: {str(e)}")
        await client.disconnect()
        del temp_clients[request.user_id]
        raise HTTPException(status_code=401, detail="Invalid OTP")

    session_string = client.session.save()
    user_data = {
        "user_id": request.user_id,
        "api_id": client.api_id,
        "api_hash": encrypt_data(client.api_hash),
        "phone": client._phone,
        "session_string": encrypt_data(session_string),
    }

    await db[COLLECTION_NAME].insert_one(user_data)

    try:
        # Initialize message listener for the new user
        await init_message_listener(
            request.user_id,
            user_data["api_id"],
            decrypt_data(user_data["api_hash"]),
            decrypt_data(user_data["session_string"]),
        )
        
        # Check if the user has any watched groups and initialize them
        cursor = db[WATCHED_GROUPS_COLLECTION].find({"user_id": request.user_id})
        watch_entries = await cursor.to_list(None)
        
        if watch_entries:
            debug(f"Initializing {len(watch_entries)} watched groups for new user {request.user_id}")
            for entry in watch_entries:
                try:
                    await start_group_watcher(
                        entry["user_id"], entry["group_id"], entry.get("topic_id")
                    )
                except Exception as e:
                    error(f"Failed to start watcher for new user {request.user_id}, group {entry['group_name']}: {str(e)}")
    except Exception as e:
        error(f"Failed to initialize services for new user {request.user_id}: {str(e)}")

    await client.disconnect()
    del temp_clients[request.user_id]

    return {"status": "Authentication successful"}


@app.post("/send-message")
async def send_message(
    request: SendMessageRequest, client: TelegramClient = Depends(get_user_client)
):
    try:
        await client.send_message(request.recipient, request.message)
        return {"status": "Message sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await client.disconnect()


@app.get("/")
async def root():
    return {
        "name": "AlphaScan Backend",
        "status": "online",
        "version": "1.0.0", 
        "description": "Backend service for AlphaScan - Telegram group monitoring and crypto trading signals",
        "endpoints": {
            "auth": ["/init-user", "/verify-otp"],
            "groups": ["/watched-groups/{user_id}", "/watch-group", "/unwatch-group"],
            "messages": ["/send-message"],
            "data": ["/get-logs/{user_id}", "/get-token-history/{user_id}", "/get-queue"]
        },
        "health": {
            "ping": "pong",
            "uptime": "online",
            "database": "connected"
        }
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("tele:app", host="0.0.0.0", port=8000, reload=True)
