import pickle
import numpy as np

# Load trained model
model = pickle.load(open("ml/fraud_model.pkl", "rb"))

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