import pickle
import numpy as np
import os

# Get current file directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Construct model path
MODEL_PATH = os.path.join(BASE_DIR, "..", "ml", "fraud_model.pkl")

# Load trained model
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)


def predict_transaction(data):
    data = np.array(data).reshape(1, -1)
    prediction = model.predict(data)[0]
    probability = model.predict_proba(data)[0][1]

    return {
        "prediction": "Fraud" if prediction == 1 else "Not Fraud",
        "fraud_probability": float(probability)
    }


if __name__ == "__main__":
    sample = [0]*30
    print(predict_transaction(sample))