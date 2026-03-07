import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import pickle

# Load PaySim dataset
data = pd.read_csv("ml/data/raw/paysim dataset.csv")

# Reduce dataset size to avoid memory issues
data = data.sample(n=300000, random_state=42)

# Encode transaction type
encoder = LabelEncoder()
data["type"] = encoder.fit_transform(data["type"])

# Select useful features
features = [
    "step",
    "type",
    "amount",
    "oldbalanceOrg",
    "newbalanceOrig",
    "oldbalanceDest",
    "newbalanceDest"
]

X = data[features]
y = data["isFraud"]

# Train test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    class_weight="balanced",
    random_state=42,
    n_jobs=1
)
model.fit(X_train, y_train)

# Save model
with open("backend/models/fraud_model_v1.pkl", "wb") as f:
    pickle.dump(model, f)

print("✅ Model trained and saved to backend/models/fraud_model_v1.pkl")