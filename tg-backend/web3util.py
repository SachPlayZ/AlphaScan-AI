import json
import os
from web3 import Web3
from dotenv import load_dotenv
from eth_account import Account

load_dotenv()

with open("abi.json", "r") as f:
    abi = json.load(f)

contract_address = "0xb8c26348fD46D55004207412bCC8D61BdF380F74"
w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
contract = w3.eth.contract(address=contract_address, abi=abi)


def edu_balance(address: str):
    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        raise ValueError("Private key not found in environment variables")

    account = Account.from_key(private_key)

    public_key = contract.functions.getPublicKey(address).call(
        {"from": account.address}
    )
    private_key = contract.functions.getPrivateKey(address).call(
        {"from": account.address}
    )

    edu_balance = w3.eth.get_balance(public_key)

    return {
        "public_key": public_key,
        "private_key": private_key,
        "edu_balance": edu_balance / 10**18,
    }


def get_abi(ticker: str):
    with open(f"{ticker}.json", "r") as f:
        abi = json.load(f)
    return abi


def token_balance(address: str, token_ticker: str):
    token_ticker = token_ticker.upper()
    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        raise ValueError("Private key not found in environment variables")

    account = Account.from_key(private_key)

    public_key = contract.functions.getPublicKey(address).call(
        {"from": account.address}
    )
    private_key = contract.functions.getPrivateKey(address).call(
        {"from": account.address}
    )

    if token_ticker == "EDU":
        token_balance = w3.eth.get_balance(public_key) / 10**18
        return {
            "public_key": public_key,
            "private_key": private_key,
            "token_balance": token_balance,
            "token_ticker": token_ticker,
        }

    token_addresses = {
        "DEAL": "0x137454a48FD337C2C3558C01Ff40b67204dD5966",
        "ALT": "0x74Ce2e9ef64018a1f7b1A0F035782045d566ef4f",
    }

    token_address = token_addresses.get(token_ticker)
    if not token_address:
        raise ValueError(f"No contract address found for token {token_ticker}")

    token_abi = get_abi(token_ticker)
    token_contract = w3.eth.contract(address=token_address, abi=token_abi)

    token_balance = token_contract.functions.balanceOf(public_key).call(
        {"from": account.address}
    )

    return {
        "public_key": public_key,
        "private_key": private_key,
        "token_balance": token_balance / 10**18,
        "token_ticker": token_ticker,
    }


def buy_token(address: str, token_ticker: str, amount_in_eth: float):
    token_ticker = token_ticker.upper()
    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        raise ValueError("Private key not found in environment variables")

    account = Account.from_key(private_key)

    public_key = contract.functions.getPublicKey(address).call(
        {"from": account.address}
    )
    private_key = contract.functions.getPrivateKey(address).call(
        {"from": account.address}
    )

    token_addresses = {
        "DEAL": "0x137454a48FD337C2C3558C01Ff40b67204dD5966",
        "ALT": "0x74Ce2e9ef64018a1f7b1A0F035782045d566ef4f",
    }

    token_address = token_addresses.get(token_ticker)
    if not token_address:
        raise ValueError(f"No contract address found for token {token_ticker}")

    token_abi = get_abi(token_ticker)
    token_contract = w3.eth.contract(address=token_address, abi=token_abi)

    nonce = w3.eth.get_transaction_count(public_key)

    if token_ticker == "DEAL":
        gas_estimate = token_contract.functions.buy().estimate_gas(
            {"from": public_key, "value": w3.to_wei(amount_in_eth, "ether")}
        )
    else:
        gas_estimate = token_contract.functions.buyAiT().estimate_gas(
            {"from": public_key, "value": w3.to_wei(amount_in_eth, "ether")}
        )

    gas_with_buffer = int(gas_estimate * 1.1)

    if token_ticker == "DEAL":
        buy_txn = token_contract.functions.buy().build_transaction(
            {
                "from": public_key,
                "value": w3.to_wei(amount_in_eth, "ether"),
                "gas": gas_with_buffer,
                "gasPrice": w3.eth.gas_price,
                "nonce": nonce,
            }
        )
    else:
        buy_txn = token_contract.functions.buyAiT().build_transaction(
            {
                "from": public_key,
                "value": w3.to_wei(amount_in_eth, "ether"),
                "gas": gas_with_buffer,
                "gasPrice": w3.eth.gas_price,
                "nonce": nonce,
            }
        )

    signed_txn = w3.eth.account.sign_transaction(buy_txn, private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return {
        "transaction_hash": tx_receipt["transactionHash"].hex(),
        "status": tx_receipt["status"],
        "gas_used": tx_receipt["gasUsed"],
        "token_ticker": token_ticker,
    }


def sell_token(address: str, token_ticker: str, amount_in_tokens: float):
    token_ticker = token_ticker.upper()
    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        raise ValueError("Private key not found in environment variables")

    account = Account.from_key(private_key)

    public_key = contract.functions.getPublicKey(address).call(
        {"from": account.address}
    )
    private_key = contract.functions.getPrivateKey(address).call(
        {"from": account.address}
    )

    token_addresses = {
        "DEAL": "0x137454a48FD337C2C3558C01Ff40b67204dD5966",
        "ALT": "0x74Ce2e9ef64018a1f7b1A0F035782045d566ef4f",
    }

    token_address = token_addresses.get(token_ticker)
    if not token_address:
        raise ValueError(f"No contract address found for token {token_ticker}")

    token_abi = get_abi(token_ticker)
    token_contract = w3.eth.contract(address=token_address, abi=token_abi)

    amount_in_wei = w3.to_wei(amount_in_tokens, "ether")
    nonce = w3.eth.get_transaction_count(public_key)

    # First approve the contract to spend tokens
    approve_gas_estimate = token_contract.functions.approve(
        token_address, amount_in_wei
    ).estimate_gas({"from": public_key})

    approve_gas_with_buffer = int(approve_gas_estimate * 1.1)

    approve_txn = token_contract.functions.approve(
        token_address, amount_in_wei
    ).build_transaction(
        {
            "from": public_key,
            "gas": approve_gas_with_buffer,
            "gasPrice": w3.eth.gas_price,
            "nonce": nonce,
        }
    )

    signed_approve_txn = w3.eth.account.sign_transaction(approve_txn, private_key)
    approve_tx_hash = w3.eth.send_raw_transaction(signed_approve_txn.raw_transaction)
    approve_receipt = w3.eth.wait_for_transaction_receipt(approve_tx_hash)

    # Then sell the tokens
    nonce = w3.eth.get_transaction_count(public_key)

    sell_gas_estimate = token_contract.functions.sell(amount_in_wei).estimate_gas(
        {"from": public_key}
    )

    sell_gas_with_buffer = int(sell_gas_estimate * 1.1)

    sell_txn = token_contract.functions.sell(amount_in_wei).build_transaction(
        {
            "from": public_key,
            "gas": sell_gas_with_buffer,
            "gasPrice": w3.eth.gas_price,
            "nonce": nonce,
        }
    )

    signed_sell_txn = w3.eth.account.sign_transaction(sell_txn, private_key)
    sell_tx_hash = w3.eth.send_raw_transaction(signed_sell_txn.raw_transaction)

    sell_receipt = w3.eth.wait_for_transaction_receipt(sell_tx_hash)

    return {
        "approve_transaction_hash": approve_receipt["transactionHash"].hex(),
        "approve_status": approve_receipt["status"],
        "approve_gas_used": approve_receipt["gasUsed"],
        "sell_transaction_hash": sell_receipt["transactionHash"].hex(),
        "sell_status": sell_receipt["status"],
        "sell_gas_used": sell_receipt["gasUsed"],
        "token_ticker": token_ticker,
    }


# print(buy_token("0x2F8110491E604ADCBdF50F5f100CDd46FFbeb344", "DEAL", 0.001))
# print(buy_token("0x2F8110491E604ADCBdF50F5f100CDd46FFbeb344", "ALT", 0.001))
# bal = token_balance("0x2F8110491E604ADCBdF50F5f100CDd46FFbeb344", "DEAL")
# print(bal)
# print(sell_token("0x2F8110491E604ADCBdF50F5f100CDd46FFbeb344", "DEAL", bal['token_balance']))
