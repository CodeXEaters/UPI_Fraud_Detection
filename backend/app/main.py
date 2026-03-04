from fastapi import FastAPI
from app.routes.prediction import router as prediction_router

app = FastAPI(title="UPI Fraud Detection API")

app.include_router(prediction_router)


@app.get("/")
def home():
    return {"message": "Fraud Detection API Running"}