from fastapi import APIRouter
from sqlalchemy.orm import Session
from app.database.db import SessionLocal
from app.database.models import Transaction

router = APIRouter()


# Dashboard statistics
@router.get("/dashboard/stats")
def get_dashboard_stats():

    db: Session = SessionLocal()

    total = db.query(Transaction).count()

    fraud = db.query(Transaction).filter(
        Transaction.prediction == "fraud"
    ).count()

    fraud_rate = (fraud / total * 100) if total > 0 else 0

    db.close()

    return {
        "total_verifications": total,
        "fraud_detected": fraud,
        "fraud_rate": round(fraud_rate, 2)
    }


# Live verification logs
@router.get("/verifications")
def get_verifications():

    db: Session = SessionLocal()

    transactions = (
        db.query(Transaction)
        .order_by(Transaction.id.desc())
        .limit(20)
        .all()
    )

    db.close()

    results = []

    for t in transactions:
        results.append({
            "id": t.id,
            "amount": t.amount,
            "device_id": t.device_id,
            "location": t.location,
            "transaction_type": t.transaction_type,
            "prediction": t.prediction,
            "risk_score": t.risk_score
        })

    return results