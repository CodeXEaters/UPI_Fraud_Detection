from fastapi import APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.db import SessionLocal
from app.database.models import Transaction

router = APIRouter()


@router.get("/analytics")
def get_analytics():

    db: Session = SessionLocal()

    # Risk distribution
    safe_count = db.query(Transaction).filter(
        Transaction.prediction == "safe"
    ).count()

    suspicious_count = db.query(Transaction).filter(
        Transaction.prediction == "suspicious"
    ).count()

    fraud_count = db.query(Transaction).filter(
        Transaction.prediction == "fraud"
    ).count()

    # Fraud trend (last transactions grouped)
    fraud_trend = db.query(
        Transaction.prediction,
        func.count(Transaction.id)
    ).group_by(
        Transaction.prediction
    ).all()

    db.close()

    return {
        "risk_distribution": {
            "safe": safe_count,
            "suspicious": suspicious_count,
            "fraud": fraud_count
        },
        "fraud_trend": [
            {"label": item[0], "count": item[1]} for item in fraud_trend
        ]
    }