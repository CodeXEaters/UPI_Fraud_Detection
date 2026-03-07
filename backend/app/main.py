from fastapi import FastAPI
from app.database.models import Base
from app.database.db import engine
from app.routes.prediction import router as prediction_router
from app.routes.dashboard import router as dashboard_router
from app.routes.report import router as report_router

app = FastAPI(title="UPI Fraud Detection API")

Base.metadata.create_all(bind=engine)

app.include_router(dashboard_router)

app.include_router(prediction_router)

app.include_router(report_router)

@app.get("/")
def home():
    return {"message": "Fraud Detection API Running"}