import os
import joblib
import numpy as np
from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="AI Risk Manager — ML Service")

MODEL_PATH = os.path.join("models", "isolation_forest.joblib")
model = None

class TransactionInput(BaseModel):
    amount: float
    hour: int


@app.on_event("startup")
def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print("Model loaded.")
    else:
        print(
            "WARNING: no trained model found at "
            f"{MODEL_PATH}. Run train.py first. "
            "Falling back to a simple heuristic until then."
        )


def score_to_risk(score: float) -> int:
    """
    IsolationForest's score_samples() returns roughly -0.5 (anomalous)
    to 0.5 (normal). We flip and rescale to a 0-100 risk score.
    Tune the multiplier/offset against your own data if scores cluster differently.
    """
    risk = (0.5 - score) * 100
    return int(np.clip(risk, 0, 100))


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict")
def predict(txn: TransactionInput):
    if model is None:
        # Fallback heuristic so the pipeline never fully breaks during dev
        heuristic = 0
        if txn.amount >= 50000:
            heuristic += 50
        if txn.hour < 5:
            heuristic += 30
        return {"risk_score": min(heuristic, 100), "model": "heuristic-fallback"}

    X = np.array([[txn.amount, txn.hour]])
    score = model.score_samples(X)[0]
    risk_score = score_to_risk(score)
    return {"risk_score": risk_score, "model": "isolation-forest"}
