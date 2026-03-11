import pickle
import numpy as np
from pathlib import Path

from app.database.db import SessionLocal
from app.database.models import Transaction

MODEL_PATH = Path(__file__).resolve().parents[2] / "models" / "fraud_model_v1.pkl"

with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)


def predict_fraud(data):

    features = [
        data["step"],
        data["transaction_type"],
        data["amount"],
        data["oldbalanceOrg"],
        data["newbalanceOrig"],
        data["oldbalanceDest"],
        data["newbalanceDest"]
    ]

    features = np.array(features).reshape(1, -1)

    # ML prediction
    probability = float(model.predict_proba(features)[0][1])

    score = probability * 100

    # -----------------
    # RULE ENGINE
    # -----------------

    if data["amount"] > 20000:
        score += 20

    if data["location"] not in ["Delhi", "Mumbai", "Bangalore"]:
        score += 10

    if data["transaction_type"] == 1:
        score += 10

    score = min(score, 100)

    # -----------------
    # RISK LEVEL
    # -----------------

    if score >= 60:
        risk_level = "fraud"
    elif score >= 40:
        risk_level = "suspicious"
    else:
        risk_level = "safe"

    risk_score = int(score)

    # Save transaction
    db = SessionLocal()

    transaction = Transaction(
        upi_id=data["upi_id"],
        amount=data["amount"],
        device_id=data["device_id"],
        location=data["location"],
        transaction_type=str(data["transaction_type"]),
        prediction=risk_level,
        risk_score=risk_score
    )

    db.add(transaction)
    db.commit()
    db.close()
    
    print("Calculated score:", score)

    return {
        "upi_id": data["upi_id"],
        "risk_level": risk_level,
        "score": round(score, 2),
        "risk_score": risk_score
    }