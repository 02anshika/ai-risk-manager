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
_(Fill this in as you build — keep notes here, then copy into the submission form)_

-
-
-

## Team
Anshika — B.Tech CSE, SISTec GN
