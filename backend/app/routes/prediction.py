from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.fraud_service import predict_fraud

router = APIRouter(
    prefix="/api",
    tags=["Fraud Verification"]
)


from pydantic import BaseModel

class Transaction(BaseModel):
    upi_id: str
    step: int
    transaction_type: int
    amount: float
    oldbalanceOrg: float
    newbalanceOrig: float
    oldbalanceDest: float
    newbalanceDest: float
    device_id: str
    location: str


class PredictionResponse(BaseModel):
    risk_level: str
    score: float


@router.post("/verify-transaction", response_model=PredictionResponse)
async def verify_transaction(transaction: Transaction):
    """
    Verify a transaction and predict fraud risk using the ML model
    """

    try:

        # convert request object to dictionary
        transaction_data = transaction.dict()

        # call fraud detection service
        result = predict_fraud(transaction_data)

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Fraud prediction failed: {str(e)}"
        )