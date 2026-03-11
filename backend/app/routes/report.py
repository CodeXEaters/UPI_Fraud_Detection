from fastapi import APIRouter
from pydantic import BaseModel
from app.database.db import SessionLocal
from app.database.models import Report

router = APIRouter()


class ReportRequest(BaseModel):
    upi_id: str
    scam_type: str
    description: str
    screenshot: str | None = None


@router.post("/report")
def create_report(report: ReportRequest):

    db = SessionLocal()

    new_report = Report(
        upi_id=report.upi_id,
        scam_type=report.scam_type,
        description=report.description,
        screenshot=report.screenshot
    )

    db.add(new_report)
    db.commit()
    db.close()

    return {"message": "Report submitted successfully"}