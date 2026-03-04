from fastapi import APIRouter
from pydantic import BaseModel
from app.services.fraud_service import predict_fraud

router = APIRouter()


class Transaction(BaseModel):
    amount: float
    device_id: str
    location: str
    transaction_type: str


@router.post("/verify-transaction")
def verify_transaction(transaction: Transaction):

    data = transaction.dict()

    result = predict_fraud(data)

    return result