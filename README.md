# AI Risk Manager — Transaction Risk Scanner

Built for **Razorpay Buildathon Hackathon** — Track 2: AI Risk Manager

## Problem
Payment platforms process thousands of transactions per second. Manually reviewing each one for fraud is impossible, and rigid rule-based systems either miss sophisticated fraud or flag too many legitimate transactions.

## Solution
A real-time transaction risk scoring system that combines:
1. **Rule-based checks** (amount thresholds, time-of-day anomalies, velocity/frequency of transactions, new device/location)
2. **ML anomaly detection** (Isolation Forest trained on transaction patterns)
3. **Explainable output** — every flagged transaction shows *why* it was flagged, not just a black-box score

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   React     │─────▶│   Node.js    │─────▶│  Python (FastAPI)│
│  Dashboard  │◀─────│   Express    │◀─────│   ML Risk Engine │
└─────────────┘      └──────┬───────┘      └─────────────────┘
                             │
                             ▼
                      ┌─────────────┐
                      │  MongoDB    │
                      └─────────────┘
```

- **Frontend (React)**: Dashboard showing transactions with color-coded risk scores
- **Backend (Node/Express)**: API layer, stores transactions, orchestrates rule engine + calls ML service
- **ML Service (Python/FastAPI)**: Isolation Forest model for anomaly scoring
- **MongoDB**: Transaction data store

## Tech Stack
Node.js, Express, MongoDB, React, Python, FastAPI, scikit-learn, Docker, AWS EC2

## Local Setup

```bash
# Clone
git clone <your-repo-url>
cd ai-risk-manager

# Run everything with Docker Compose
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000

## Manual Setup (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**ML Service:**
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## Build Challenges & Technical Obstacles

**1. Large dataset breaking the GitHub push**
After training the Isolation Forest on the real Kaggle "Credit Card Fraud Detection" dataset (~144MB), a routine `git push` was rejected — GitHub enforces a hard 100MB per-file limit, and our commit history still referenced the file even after removing it from the latest commit. Fix: used `git reset --mixed HEAD~2` to unwind the last two commits without losing any working files, added the dataset path to `.gitignore`, and recommitted clean. The trained model artifact (`isolation_forest.joblib`, <1MB) was committed separately so the deployed service always has a ready-to-use model without needing the raw dataset on the server.

**2. AWS security group CIDR misconfiguration**
While opening inbound ports (3000, 5000, 8000) for the EC2 instance, selecting "Anywhere-IPv4" from the source dropdown's category label — instead of the actual `0.0.0.0/0` CIDR entry beneath it — caused `Instance launch failed: CIDR block Anywhere-IPv4 is malformed`. Amazon Q's inline diagnostics confirmed the fix: the dropdown auto-suggests both a label and a value, and only the literal CIDR notation is valid input.

**3. Docker Compose CLI syntax mismatch on the EC2 host**
The `docker-compose` (hyphenated, v1) binary used during local development wasn't available on the fresh Ubuntu EC2 instance — the standard repos now ship Compose as a Docker CLI plugin (`docker compose`, v2, space-separated). Deployment initially failed with `command not found` until switching to the v2 syntax.

**4. Rebuilding the ML pipeline mid-flight**
The system was first validated end-to-end on synthetic data with a heuristic fallback scorer (for cases where the ML microservice was unreachable). Swapping in the real Kaggle dataset required reworking `train.py` to handle the dataset's `Time`/`Amount`/`Class` schema — converting elapsed seconds into an hour-of-day feature and building a balanced sample (all ~492 known fraud rows + a 20,000-row normal sample) so training stayed fast without discarding the rare-event signal that matters most for fraud detection.

**What this taught us:** most of the real friction in shipping an AI system isn't the model — it's the surrounding infrastructure (git history, cloud networking, environment drift between local and prod). The rule-based + ML hybrid scorer, combined with a transparent "why flagged" explanation, was a deliberate choice to keep the system auditable rather than a black box, which matters a lot in a fintech risk context.

## Team
Anshika — B.Tech CSE, SISTec GN
