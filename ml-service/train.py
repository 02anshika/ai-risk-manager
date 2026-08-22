"""
Trains an Isolation Forest anomaly detector on transaction data
and saves it to models/isolation_forest.joblib

Supports two data sources:
1. Real Kaggle "Credit Card Fraud Detection" dataset (creditcard.csv)
   -> download from Kaggle, place in ml-service/data/creditcard.csv
2. Synthetic fallback (transactions.csv) if creditcard.csv isn't found
   -> generate with: cd data && python generate_data.py

Usage:
    python train.py
"""

import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

KAGGLE_PATH = os.path.join("data", "creditcard.csv")
SYNTHETIC_PATH = os.path.join("data", "transactions.csv")
MODEL_PATH = os.path.join("models", "isolation_forest.joblib")

SAMPLE_SIZE = 20000  # keep training fast; full 284k rows isn't needed for a demo


def load_kaggle_data():
    """
    The Kaggle dataset has columns: Time (seconds since first txn),
    Amount, V1-V28 (PCA features), Class (1 = actual fraud, for reference only
    -- IsolationForest is unsupervised so we don't train on Class).
    We convert Time to an hour-of-day approximation and keep Amount.
    """
    df = pd.read_csv(KAGGLE_PATH)

    # Time is seconds elapsed; convert to hour-of-day (0-23) assuming it
    # starts at midnight of day 1. This is an approximation for demo purposes.
    df["hour"] = ((df["Time"] // 3600) % 24).astype(int)
    df = df.rename(columns={"Amount": "amount"})

    # Balanced-ish sample: keep all fraud rows (rare) + a random sample of normal ones,
    # so the model sees enough of both without training on all 284k rows.
    fraud = df[df["Class"] == 1]
    normal = df[df["Class"] == 0].sample(
        n=min(SAMPLE_SIZE, len(df[df["Class"] == 0])), random_state=42
    )
    sampled = pd.concat([fraud, normal]).sample(frac=1, random_state=42)

    print(
        f"Loaded Kaggle dataset: {len(sampled)} rows "
        f"({len(fraud)} known fraud, {len(normal)} normal sample)"
    )
    return sampled[["amount", "hour"]]


def load_synthetic_data():
    df = pd.read_csv(SYNTHETIC_PATH)
    print(f"Loaded synthetic dataset: {len(df)} rows")
    return df[["amount", "hour"]]


def main():
    if os.path.exists(KAGGLE_PATH):
        X = load_kaggle_data()
    elif os.path.exists(SYNTHETIC_PATH):
        print("No creditcard.csv found — falling back to synthetic data.")
        X = load_synthetic_data()
    else:
        raise FileNotFoundError(
            "No dataset found. Either place the Kaggle 'creditcard.csv' in "
            "ml-service/data/, or run 'python data/generate_data.py' to "
            "create synthetic data."
        )

    # contamination = expected proportion of anomalies in the data
    model = IsolationForest(
        n_estimators=200,
        contamination=0.03,
        random_state=42,
    )
    model.fit(X)

    os.makedirs("models", exist_ok=True)
    joblib.dump(model, MODEL_PATH)
    print(f"Model trained and saved to {MODEL_PATH}")


if __name__ == "__main__":
    main()