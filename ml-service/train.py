"""
Trains an Isolation Forest anomaly detector on transaction data
and saves it to models/isolation_forest.joblib

Usage:
    cd ml-service/data && python generate_data.py && cd ..
    python train.py
"""

import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

DATA_PATH = os.path.join("data", "transactions.csv")
MODEL_PATH = os.path.join("models", "isolation_forest.joblib")

def main():
    df = pd.read_csv(DATA_PATH)
    X = df[["amount", "hour"]]

    # contamination = expected proportion of anomalies in the data
    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
    )
    model.fit(X)

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained and saved to {MODEL_PATH}")

if __name__ == "__main__":
    main()
