from datetime import datetime
import json
import os
import asyncio
import random
from fastapi import FastAPI, HTTPException, Depends, Request    
from groq import Groq
from langsmith import expect
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
from telethon import TelegramClient, events, functions
from telethon.sessions import StringSession
from typing import Dict, List, Any, Tuple   
from dotenv import load_dotenv
from cryptography.fernet import Fernet
from pydantic_core import from_json

load_dotenv()

app = FastAPI()

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
    return f"Thanks for your message: {message_text}"


async def init_message_listener(
    user_id: str, api_id: int, api_hash: str, session_string: str
):
    """Initialize and start a message listener for a user"""
    try:
        session = StringSession(session_string)
        client = TelegramClient(session, api_id, api_hash)

        await client.connect()
        if not await client.is_user_authorized():
            await client.disconnect()
            return

        @client.on(events.NewMessage(incoming=True))
        async def handler(event):
            if not event.is_private:
                return
            reply = generate_reply(event.message.text)
            await event.reply(reply)

        asyncio.create_task(client.run_until_disconnected())
        message_listener_clients[user_id] = client
    except Exception as e:
        print(f"Error initializing listener for {user_id}: {str(e)}")


async def get_user_client(user_id: str) -> TelegramClient:
    user = await db[COLLECTION_NAME].find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not registered")

    session = decrypt_data(user["session_string"])
    client = TelegramClient(
        StringSession(session), user["api_id"], decrypt_data(user["api_hash"])
    )

    if not client.is_connected():
        await client.connect()
        if not await client.is_user_authorized():
            raise HTTPException(status_code=401, detail="Session expired")

    return client


@app.on_event("startup")
async def startup_event():
    """Start message listeners for all existing users on startup"""
    print("Starting application...")
    
    print("Initializing message listeners for existing users...")
    async for user in db[COLLECTION_NAME].find():
        try:
            print(f"Setting up listener for user {user['user_id']}")
            api_id = user["api_id"]
            api_hash = decrypt_data(user["api_hash"])
            session_string = decrypt_data(user["session_string"])
            await init_message_listener(
                user["user_id"], api_id, api_hash, session_string
            )
        except Exception as e:
            print(f"Failed to initialize listener for {user['user_id']}: {str(e)}")

    print("Initializing group watchers...")
    try:
        cursor = db[WATCHED_GROUPS_COLLECTION].find({})
        watch_entries = await cursor.to_list(None)
        print(f"Found {len(watch_entries)} watch entries to initialize")

        for entry in watch_entries:
            try:
                print(f"Starting watcher for group {entry['group_name']} (ID: {entry['group_id']})")
                await start_group_watcher(
                    entry["user_id"], entry["group_id"], entry.get("topic_id")
                )
            except Exception as e:
                print(f"Failed to start watcher for {entry['group_name']}: {str(e)}")

    except Exception as e:
        print(f"Error restarting watchers: {str(e)}")
    
    print("Startup process completed")


@app.on_event("shutdown")
async def shutdown_event():
    """Disconnect all message listeners on shutdown"""
    for client in message_listener_clients.values():
        await client.disconnect()

    for task in active_watchers.values():
        task.cancel()


@app.post("/init")
async def initialize_user(request: UserInitRequest):
    existing = await db[COLLECTION_NAME].find_one({"user_id": request.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    client = TelegramClient(StringSession(), API_ID, API_HASH)
    await client.connect()

    try:
        sent_code = await client.send_code_request(request.phone)
        temp_clients[request.user_id] = {
            "client": client,
            "phone_code_hash": sent_code.phone_code_hash,
        }
        return {"status": "OTP sent"}
    except Exception as e:
        await client.disconnect()
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

        if request.webhook_url:
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
        print(f"Error getting watched groups: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    
async def get_topic_ids(user_id: str):
    cursor = db[WATCHED_GROUPS_COLLECTION].find({"user_id": user_id})
    watched_groups = await cursor.to_list(None)
    return [group["topic_id"] if group["topic_id"] is not None else group["group_id"] for group in watched_groups]


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
    print(f"Starting group watcher with key: {watcher_key}")

    if watcher_key in active_watchers:
        print(f"Cancelling existing watcher for {watcher_key}")
        active_watchers[watcher_key].cancel()
        del active_watchers[watcher_key]

    print(f"Creating new watcher task for {watcher_key}")
    task = asyncio.create_task(watch_group_messages(user_id, group_id, topic_id))
    active_watchers[watcher_key] = task
    print(f"Watcher task created and stored for {watcher_key}")

    return task


async def watch_group_messages(user_id, group_id, topic_id=None):
    """Background task to watch for messages in a group/channel"""
    try:
        print(f"Starting watch_group_messages for user {user_id}, group {group_id}, topic {topic_id}")
        
        user = await db[COLLECTION_NAME].find_one({"user_id": user_id})
        if not user:
            print(f"User {user_id} not found for watcher")
            return

        print(f"Found user {user_id} in database")

        watch_entry = await db[WATCHED_GROUPS_COLLECTION].find_one(
            {"user_id": user_id, "group_id": group_id, "topic_id": topic_id}
        )

        if not watch_entry:
            print(f"Watch entry not found for {user_id}:{group_id}:{topic_id}")
            return

        print(f"Found watch entry for group {watch_entry['group_name']}")
        print(f"Setting up client for user {user_id} to watch group {group_id}")
        
        session = decrypt_data(user["session_string"])
        print("Decrypted session string")
        
        client = TelegramClient(
            StringSession(session), user["api_id"], decrypt_data(user["api_hash"])
        )
        print("Created TelegramClient instance")

        print("Attempting to connect client...")
        await client.connect()
        print("Client connected")
        
        if not await client.is_user_authorized():
            print(f"User {user_id} not authorized for watcher")
            await client.disconnect()
            return

        print(f"Successfully connected client for user {user_id}")
        print(f"Starting watcher for {watch_entry['group_name']}{f' - {watch_entry['topic_name']}' if topic_id else ''}")

        @client.on(events.NewMessage(chats=group_id))
        async def handler(event):
            print("DEBUG: New message event received!")
            try:
                if topic_id is not None:
                    if not hasattr(event.message, "reply_to") or event.message.reply_to is None:
                        print("DEBUG: Message has no reply_to attribute or is None")
                        return
                    if not hasattr(event.message.reply_to, "forum_topic") or not event.message.reply_to.forum_topic:
                        print("DEBUG: Message is not in a forum topic")
                        return
                    topic_ids = await get_topic_ids(user_id)
                    if event.message.reply_to.reply_to_msg_id not in topic_ids:
                        print(f"DEBUG: Message topic ID {event.message.reply_to.reply_to_msg_id} doesn't match expected {topic_id}")
                        return

                topicId = event.message.reply_to.reply_to_msg_id
                watch_entry = await get_watch_entry(user_id, topicId)
                sender = await event.get_sender()
                first_name = getattr(sender, "first_name", "") or ""
                last_name = getattr(sender, "last_name", "") or ""
                sender_name = f"{first_name} {last_name}"
                sender_name = sender_name.strip() or sender.username or "Unknown"
                await process_message(watch_entry['group_name'], watch_entry['topic_name'], sender_name, event.message.text, user_id)

            except Exception as e:
                print(f"Error in message handler: {str(e)}")

        print("DEBUG: Event handler registered, starting to run client")
        await client.run_until_disconnected()

    except asyncio.CancelledError:
        print(f"Watcher for {user_id}:{group_id}:{topic_id} cancelled")
        if "client" in locals() and client.is_connected():
            await client.disconnect()

    except Exception as e:
        print(f"Error in watcher {user_id}:{group_id}:{topic_id}: {str(e)}")
        if "client" in locals() and client.is_connected():
            await client.disconnect()

async def get_watch_entry(user_id: str, topic_id: int):
    return await db[WATCHED_GROUPS_COLLECTION].find_one({"user_id": user_id, "topic_id": topic_id})

@app.get("/get-queue")
async def get_queue():
    global queue
    return queue


async def process_message(group_name: str, topic_name: str, sender_name: str, message_text: str, user_id: str):
    global queue

    queue[topic_name] = queue.get(topic_name, [])
    queue[topic_name].append({
        "group_name": group_name,
        "topic_name": topic_name,
        "sender_name": sender_name,
        "message_text": message_text,
        "user_id": user_id,
        "overlap": False
    })
    if len(queue[topic_name]) == 10:
        last_10_messages = queue[topic_name]
        queue[topic_name] = []
        overlap_messages = last_10_messages[-3:]
        for message in overlap_messages:
            message["overlap"] = True
            queue[topic_name].append(message)
        await analyse_texts(last_10_messages)


def generate(prompt: str):
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
    print("AI Response: ", response)
    output = response.choices[0].message.content
    print("Output: ", output)
    output = output.split("</think>")[1]
    return output


def get_eth_balance() -> bool:
    # TODO: Get eth balance
    return True

def get_token_balance(token: str) -> bool:
    # TODO: Get token balance
    return True


async def log_action(action: str, input_data: Any, output_data: Any) -> None:
    """
    Logs an action with its input and output to the database
    
    Args:
        action: The name/type of action being logged
        input_data: The input data for the action
        output_data: The output/result of the action
    """
    try:
        log_entry = {
            "timestamp": datetime.utcnow(),
            "action": action,
            "input": input_data,
            "output": output_data
        }
        
        await db["logs"].insert_one(log_entry)
    except Exception as e:
        print(f"Error logging action: {str(e)}")


async def analyse_texts(queue: List[Dict]) -> Any:
    tg_alpha = get_alpha(queue)
    await log_action("Get Alpha from Group Texts", queue, tg_alpha)
    if len(tg_alpha) == 0:
        await log_action("Analyse Texts", tg_alpha, "No tokens detected")
        return
    for token in tg_alpha:
        await log_action("Analyse Each Alpha", token, "Analyzing alpha")
        if token["sentiment"] == "positive":
            await log_action("Check ETH Balance [Alpha is positive so we need to buy using ETH]", token, "Checking ETH balance")
            if not get_eth_balance():
                await log_action("Check ETH Balance", token, "ETH balance is not enough")
                return
        elif token["sentiment"] == "negative":
            await log_action("Check Token Balance [Alpha is negative so we need to sell the token]", token, "Checking token balance")
            if not get_token_balance(token["token"]):
                await log_action("Check Token Balance", token, "Token balance is not enough")
                return
        _, sentiment, valid = await validation_layer(token)
        if not valid:
            await log_action("Validation Layer Declined", token, "Token is not valid")
            return
        trust, pnl_potential = trust_layer(sentiment, token)
        if not trust:
            await log_action("Trust Layer Declined", token, "Token is not trusted")
            return
        if abs(pnl_potential) < 10:
            await log_action("PNL Potential is too low", token, "PNL Potential is too low")
            return
        await transaction_layer(token)
    return


def transaction_layer(token: Dict):
    # TODO: Implement transaction layer
    pass

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

def generate_market_data(trend="rising", days=10, start_price=random.uniform(1, 100), start_volume=random.uniform(1e3, 1e6)):
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
    
    return {"prices": prices, "market_caps": market_caps, "total_volumes": total_volumes}

def get_historical_data(token: Dict) -> Dict:
    good_bad = "rising" if random.random() < (0.9 if token["sentiment"] == "positive" else 0.1) else "falling"
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
    
    profit_or_loss_potential = price_change * (avg_market_cap / max(market_caps)) * (avg_volume / max(volumes))
    
    return profit_or_loss_potential


async def trust_layer(sentiment: str, token: Dict) -> Tuple[bool, float]:
    historical_data = get_historical_data(token)
    await log_action("Get Historical Data", token, historical_data)
    trends = detect_trend(historical_data)
    await log_action("Detect Trends", token, trends)
    if not trends["prices"] == "positive" and sentiment == "positive":
        await log_action("Sentiment and Trends do not match", {
            "token": token,
            "sentiment": sentiment,
            "trends": trends
        }, "Sentiment and Trends do not match")
        return False
    if not trends["prices"] == "negative" and sentiment == "negative":
        await log_action("Sentiment and Trends do not match", {
            "token": token,
            "sentiment": sentiment,
            "trends": trends
        }, "Sentiment and Trends do not match")
        return False
    
    pnl_potential = get_pnl_potential(historical_data)
    await log_action("Get PNL Potential", token, pnl_potential)
    
    return True, pnl_potential

def get_tweets(token: Dict) -> List[Dict]:
    good_bad = "good" if random.random() < (0.7 if token["sentiment"] == "positive" else 0.3) else "bad"
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


async def validation_layer(alpha: Dict) -> Tuple[List[str], Dict, bool]:
    tweets = get_tweets(alpha)
    await log_action("Get Tweets", alpha, tweets)
    sentiment = analyse_tweets(tweets, alpha["token"])["sentiment"]
    await log_action("Analyse Tweets", alpha, sentiment)
    if not sentiment == alpha["sentiment"]:
        await log_action("Validation Layer", alpha, "Sentiment does not match")
        return tweets, sentiment, False
    await log_action("Validation Layer", alpha, "Sentiment matches")
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
                if hasattr(value, '__dict__'):
                    nested_dict = {}
                    for k, v in value.__dict__.items():
                        if isinstance(v, StringSession):
                            continue
                        elif hasattr(v, '__dict__'):
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
            
            print(json.dumps(dialog_dict, indent=4))
            for dialog in dialogs:
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
                            if getattr(entity, "title", None) == "HyperDrive Community":
                                print(topic.__dict__)
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
                "regular_groups": regular_groups,
                "supergroups": super_groups,
                "channels": channels,
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
        await init_message_listener(
            request.user_id,
            user_data["api_id"],
            decrypt_data(user_data["api_hash"]),
            decrypt_data(user_data["session_string"]),
        )
    except Exception as e:
        print(f"Failed to start listener for new user {request.user_id}: {str(e)}")

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


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("tele:app", host="0.0.0.0", port=8000, reload=True)
