"""
Generates a synthetic transaction dataset for training.
Swap this out for a real Kaggle fraud dataset (e.g. 'Credit Card Fraud Detection')
if you want stronger results for the demo — just make sure it has
'amount' and 'hour' (or equivalent) columns, or adjust train.py accordingly.

Run: python generate_data.py
Output: transactions.csv
"""

import numpy as np
import pandas as pd

np.random.seed(42)

N_NORMAL = 950
N_ANOMALY = 50

# Normal transactions: modest amounts, daytime hours
normal_amount = np.random.normal(loc=2000, scale=1500, size=N_NORMAL).clip(50, 20000)
normal_hour = np.random.normal(loc=14, scale=4, size=N_NORMAL).clip(0, 23).astype(int)

# Anomalies: high amounts and/or odd hours
anomaly_amount = np.random.normal(loc=60000, scale=25000, size=N_ANOMALY).clip(20000, 200000)
anomaly_hour = np.random.choice(range(0, 5), size=N_ANOMALY)

amounts = np.concatenate([normal_amount, anomaly_amount])
hours = np.concatenate([normal_hour, anomaly_hour])
labels = np.concatenate([np.zeros(N_NORMAL), np.ones(N_ANOMALY)])  # 1 = anomaly (for reference only)

df = pd.DataFrame({"amount": amounts, "hour": hours, "is_anomaly": labels.astype(int)})
df = df.sample(frac=1, random_state=42).reset_index(drop=True)  # shuffle

df.to_csv("transactions.csv", index=False)
print(f"Generated {len(df)} rows -> transactions.csv")
