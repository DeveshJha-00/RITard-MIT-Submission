import requests
import json
import random
import time
import uuid
from datetime import datetime, timedelta
import uuid
# Configuration
CLIENT_ID = "ramaiah3316"
CLIENT_SECRET = "12345678"
USERNAME = "1ms23cy027@msrit.edu"
PASSWORD = "karteek**05U"
BASE_URL = "https://api.mockbank.io"

# Constants from Swagger documentation
ALLOWED_PURPOSE_CODES = ["BKDF", "ICDT", "CASH", "OTHR"]
ACCOUNT_TYPES = ["CASH", "CURRENT", "SAVINGS"]
CURRENCY = "INR"

def get_access_token():
    try:
        auth = requests.auth.HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET)
        data = {
            "grant_type": "password",
            "username": USERNAME,
            "password": PASSWORD
        }
        response = requests.post(f"{BASE_URL}/oauth/token", auth=auth, data=data)
        response.raise_for_status()
        return response.json()["access_token"]
    except Exception as e:
        print(f"❌ Auth failed: {str(e)}")
        raise

def create_customer(token):
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        customer_data = {
            "address": "MG Road, Bangalore",
            "city": "Bangalore",
            "zip": "560001",
            "countryCode": "IN",
            "fullName": "Rahul Sharma",
            "msisdn": "+919876543210",
            "password": "SecurePass123!",
            "username": "rahul.sharma@example.com"
        }
        response = requests.post(f"{BASE_URL}/customers", headers=headers, json=customer_data)
        response.raise_for_status()
        return response.json()["externalId"]
    except Exception as e:
        print(f"❌ Customer creation failed: {str(e)}")
        raise

def create_account(token, customer_id):
    try:
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        account_data = {
            "currency": CURRENCY,
            "name": "Primary Account",
            "type": random.choice(ACCOUNT_TYPES),
            "status": "enabled",
            "iban": f"IN{random.randint(1000000000000000, 9999999999999999)}",
            "bic": "MOCKINBBXXX"
        }
        response = requests.post(
            f"{BASE_URL}/customers/{customer_id}/accounts",
            headers=headers,
            json=account_data
        )
        response.raise_for_status()
        return response.json()["externalId"]
    except Exception as e:
        print(f"❌ Account creation failed: {str(e)}")
        raise

def generate_transactions(token, customer_id, account_id, count=100):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    
    def create_account_ref():
        return {
            "iban": f"IN{random.randint(1000000000000000, 9999999999999999)}",
            "bban": str(random.randint(10000000000000, 99999999999999)),
            "currency": CURRENCY
        }

    categories = {
        "groceries": {"merchants": ["BigBasket", "D-Mart"], "range": (-25000, -1000)},
        "dining": {"merchants": ["Swiggy", "Zomato"], "range": (-5000, -100)},
        "transport": {"merchants": ["Ola", "Uber"], "range": (-3000, -50)},
        "salary": {"merchants": ["Company"], "range": (3000000, 15000000)},
        "rent": {"merchants": ["Landlord"], "range": (-300000, -80000)},
    }

    transactions = []
    start_date = datetime.now() - timedelta(days=365)

    for i in range(1, count+1):
        try:
            # Select category and calculate amount in paise
            category = random.choice(list(categories.keys()))
            min_amount, max_amount = categories[category]["range"]
            amount = random.randint(min_amount, max_amount)
            
            # Create transaction payload
            transaction = {
                "accountId": account_id,
                "amount": amount,
                "currency": CURRENCY,
                "bookingDate": (start_date + timedelta(days=random.randint(0,365))).isoformat()[:10],
                "valueDate": datetime.now().isoformat()[:10],
                "operationId": f"OP-{uuid.uuid4().hex[:8]}",
                "entryReference": f"REF-{uuid.uuid4().hex[:6]}",
                "endToEndId": f"E2E-{uuid.uuid4().hex[:8]}",
                "remittanceInformationUnstructured": f"{category} - {random.choice(categories[category]['merchants'])}",
                "purposeCode": random.choice(ALLOWED_PURPOSE_CODES),
                "bankTransactionCode": "PMT",
                "proprietaryBankTransactionCode": "CRDT" if amount > 0 else "DEBT"
            }

            # Add account references
            if amount > 0:
                transaction.update({
                    "creditorAccount": create_account_ref(),
                    "creditorBic": "MOCKINBBXXX"
                })
            else:
                transaction.update({
                    "debtorAccount": create_account_ref(),
                    "debtorBic": "MOCKINBBXXX"
                })

            # API call
            response = requests.post(
                f"{BASE_URL}/customers/{customer_id}/transactions",
                headers=headers,
                json=transaction
            )
            response.raise_for_status()
            
            transactions.append(response.json())
            print(f"✅ Transaction {i}/{count}: {abs(amount/100):.2f} INR ({category})")
            time.sleep(0.2)  # Rate limiting

        except Exception as e:
            print(f"❌ Transaction {i} failed: {str(e)}")
            if response.status_code == 400:
                print(f"Request: {json.dumps(transaction, indent=2)}")
                print(f"Response: {response.text}")

    return transactions

if __name__ == "__main__":
    print("🏦 Starting MockBank Data Generation")
    try:
        token = get_access_token()
        customer_id = create_customer(token)
        account_id = create_account(token, customer_id)
        transactions = generate_transactions(token, customer_id, account_id, 50)
        
        print(f"\n🎉 Successfully created:")
        print(f"👤 Customer ID: {customer_id}")
        print(f"💳 Account ID: {account_id}")
        print(f"🧾 Transactions: {len(transactions)}")
        
        with open("mockbank_data.json", "w") as f:
            json.dump({
                "customer": customer_id,
                "account": account_id,
                "transactions": transactions
            }, f, indent=2)

    except Exception as e:
        print(f"\n🔥 Critical error: {str(e)}")