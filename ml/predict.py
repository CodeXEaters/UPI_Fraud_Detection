import pickle
import numpy as np

# Load trained model
model = pickle.load(open("ml/fraud_model.pkl", "rb"))

def predict_transaction(data):
    data = np.array(data).reshape(1, -1)
    prediction = model.predict(data)

    if prediction[0] == 1:
        return "Fraud"
    else:
        return "Not Fraud"
if __name__ == "__main__":
    sample = [0]*30
    print(predict_transaction(sample))