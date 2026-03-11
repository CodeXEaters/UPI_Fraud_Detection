import requests
import random

API_URL = "http://127.0.0.1:8000/api/verify-transaction"

upi_ids = [
    "cashback-reward@upi",
    "refundhelpdesk@upi",
    "lotterywinner@upi",
    "quickloan@upi",
    "giftcard-claim@upi",
    "support-refund@upi"
]

locations = [
    "Delhi",
    "Mumbai",
    "Bangalore",
    "UnknownCity",
    "RemoteTown"
]

for i in range(50):  # number of fake transactions

    data = {
        "upi_id": random.choice(upi_ids),
        "step": random.randint(1, 5),
        "transaction_type": random.randint(0, 1),
        "amount": random.randint(500, 50000),
        "oldbalanceOrg": random.randint(1000, 100000),
        "newbalanceOrig": random.randint(0, 90000),
        "oldbalanceDest": random.randint(0, 50000),
        "newbalanceDest": random.randint(0, 120000),
        "device_id": f"device{random.randint(1,20)}",
        "location": random.choice(locations)
    }

    try:
        res = requests.post(API_URL, json=data)
        print(f"Transaction {i+1} →", res.json())
    except Exception as e:
        print("Error:", e)