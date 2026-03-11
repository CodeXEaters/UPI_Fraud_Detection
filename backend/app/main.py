from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
import os
from app.database.models import Base
from app.database.db import engine
from app.routes.prediction import router as prediction_router
from app.routes.dashboard import router as dashboard_router
from app.routes.report import router as report_router
from app.routes.analytics import router as analytics_router
from app.routes.upi_risk import router as upi_risk_router


def _get_allowed_origins() -> list[str]:
    configured = os.getenv("CORS_ORIGINS", "").strip()
    if configured:
        return [origin.strip() for origin in configured.split(",") if origin.strip()]

    return [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ]


app = FastAPI(title="UPI Fraud Detection API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(dashboard_router)

app.include_router(prediction_router)

app.include_router(report_router)

app.include_router(upi_risk_router)

app.include_router(analytics_router)

@app.get("/")
def home():
    return {"message": "Fraud Detection API Running"}