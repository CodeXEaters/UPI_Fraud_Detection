from fastapi import APIRouter
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.db import SessionLocal
from app.database.models import Transaction, Report

router = APIRouter()


@router.get("/upi/{upi_id}/risk")
def get_upi_risk(upi_id: str):

    db: Session = SessionLocal()

    # Total transactions
    total_transactions = db.query(Transaction).filter(
        Transaction.upi_id == upi_id
    ).count()

    # Fraud transactions
    fraud_transactions = db.query(Transaction).filter(
        Transaction.upi_id == upi_id,
        Transaction.prediction == "fraud"
    ).count()

    # Suspicious transactions
    suspicious_transactions = db.query(Transaction).filter(
        Transaction.upi_id == upi_id,
        Transaction.prediction == "suspicious"
    ).count()

    # Total reports
    reports_count = db.query(Report).filter(
        Report.upi_id == upi_id
    ).count()

    # Most common scam type
    common_scam = db.query(
        Report.scam_type,
        func.count(Report.scam_type)
    ).filter(
        Report.upi_id == upi_id
    ).group_by(
        Report.scam_type
    ).order_by(
        func.count(Report.scam_type).desc()
    ).first()

    db.close()

    common_scam_type = common_scam[0] if common_scam else None

    # -----------------------
    # Community Trust Score
    # -----------------------

    trust_score = 100

    trust_score -= fraud_transactions * 20
    trust_score -= suspicious_transactions * 10
    trust_score -= reports_count * 15

    trust_score = max(trust_score, 0)

    # -----------------------
    # Risk Level
    # -----------------------

    if trust_score < 30:
        risk_level = "fraud"
    elif trust_score < 60:
        risk_level = "suspicious"
    else:
        risk_level = "safe"

    return {
        "upi_id": upi_id,
        "risk_level": risk_level,
        "community_trust": trust_score,
        "reports_count": reports_count,
        "fraud_transactions": fraud_transactions,
        "suspicious_transactions": suspicious_transactions,
        "common_scam_type": common_scam_type
    }