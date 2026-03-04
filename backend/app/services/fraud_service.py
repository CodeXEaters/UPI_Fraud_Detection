def predict_fraud(data):
    
    amount = data["amount"]

    # simple temporary fraud rule
    if amount > 10000:
        prediction = "Fraud"
        probability = 0.85
    else:
        prediction = "Safe"
        probability = 0.15

    return {
        "prediction": prediction,
        "fraud_probability": probability,
        "risk_score": int(probability * 100)
    }