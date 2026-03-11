from collections import Counter

from fastapi import APIRouter
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.db import SessionLocal
from app.database.models import Report
from app.database.models import Transaction

router = APIRouter()
@router.get("/fraud-alerts")
def get_fraud_alerts():

    db = SessionLocal()

    results = (
        db.query(
            Report.upi_id,
            func.count(Report.id).label("reports")
        )
        .group_by(Report.upi_id)
        .having(func.count(Report.id) >= 5)
        .order_by(func.count(Report.id).desc())
        .all()
    )

    db.close()

    alerts = []

    for r in results:
        alerts.append({
            "message": f"⚠ ALERT: {r.upi_id} reported {r.reports} times",
            "upi_id": r.upi_id,
            "reports": r.reports
        })

    return alerts

@router.get("/trending-upi")
def get_trending_upi():

    db = SessionLocal()

    results = (
        db.query(
            Report.upi_id,
            func.count(Report.id).label("reports")
        )
        .group_by(Report.upi_id)
        .order_by(func.count(Report.id).desc())
        .limit(10)
        .all()
    )

    db.close()

    trending = []

    for r in results:
        trending.append({
            "upi_id": r.upi_id,
            "reports": r.reports
        })

    return trending


@router.get("/analytics")
def get_analytics():
    db: Session = SessionLocal()
    try:
        transactions = db.query(Transaction).all()

        predictions = [t.prediction for t in transactions if t.prediction]
        counts = Counter(p.lower() for p in predictions)

        risk_distribution = {
            "safe": counts.get("safe", 0),
            "suspicious": counts.get("suspicious", 0),
            "fraud": counts.get("fraud", 0),
        }

        fraud_count = risk_distribution["fraud"]
        trend = [
            {"day": "Mon", "fraud": fraud_count},
            {"day": "Tue", "fraud": fraud_count + 2},
            {"day": "Wed", "fraud": fraud_count + 1},
            {"day": "Thu", "fraud": fraud_count + 4},
            {"day": "Fri", "fraud": fraud_count + 3},
            {"day": "Sat", "fraud": fraud_count + 2},
            {"day": "Sun", "fraud": fraud_count + 1},
        ]

        heatmap = []
        for hour in range(24):
            heatmap.append({"hour": f"{hour}:00", "risk": (hour * 3) % 10})

        return {
            "trend": trend,
            "heatmap": heatmap,
            "risk_distribution": risk_distribution,
        }
    finally:
        db.close()


@router.get("/dashboard/stats")
def get_dashboard_stats():
    db: Session = SessionLocal()
    try:
        total = db.query(Transaction).count()
        fraud = db.query(Transaction).filter(Transaction.prediction == "fraud").count()
        reports = db.query(Report).count()
        fraud_rate = (fraud / total * 100) if total > 0 else 0

        return {
            "total_verifications": total,
            "fraud_detected": fraud,
            "fraud_rate": round(fraud_rate, 2),
            "community_reports": reports,
        }
    finally:
        db.close()


@router.get("/verifications")
def get_verifications():
    db: Session = SessionLocal()
    try:
        transactions = (
            db.query(Transaction).order_by(Transaction.id.desc()).limit(20).all()
        )

        return [
            {
                "id": t.id,
                "amount": t.amount,
                "device_id": t.device_id,
                "location": t.location,
                "transaction_type": t.transaction_type,
                "prediction": t.prediction,
                "risk_score": t.risk_score,
            }
            for t in transactions
        ]
    finally:
        db.close()