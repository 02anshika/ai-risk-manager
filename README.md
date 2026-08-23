# AI Risk Manager

Built for the **Razorpay Buildathon Hackathon** — Track 2: AI Risk Manager

## What this is

A payment platform like Razorpay handles an insane number of transactions every second, and there's no realistic way for a human to review each one for fraud. Most rule-based fraud systems end up doing one of two things badly — either they miss real fraud because the rules are too loose, or they annoy genuine customers by blocking them because the rules are too strict.

I wanted to try something in between: a system that scores every transaction in real time using both hard rules *and* a machine learning model, and — this part mattered a lot to me — actually explains *why* it flagged something instead of just spitting out a number. In fintech especially, a black-box "trust me" score isn't good enough.

So that's what this is. You feed it a transaction (amount, user, device, location), and it comes back with a risk score from 0–100, a safe/flagged status, and a plain-English reason for the score.

## How the scoring actually works

It's two systems working together:

1. **Rule-based checks** — is the amount unusually high? Did this happen at 2–5 AM? Has this user made several transactions in the last few minutes (velocity check)? Is this a device we haven't seen from them before?
2. **An ML model** — specifically an Isolation Forest, trained on the real Kaggle "Credit Card Fraud Detection" dataset (284,807 real transactions, 492 of them actual fraud). It looks for transactions that don't fit the normal pattern.

The two scores get combined into a final number, and every flagged transaction shows exactly which rules fired and why — no black box.

## Architecture

```
             ┌──────────────────────┐
             │   React Dashboard    │
             └──────────────────────┘
                         │
                         ▼
             ┌──────────────────────┐
             │  Node.js + Express   │
             │    (rule engine)     │
             └──────────────────────┘
                         │
            ┌────────────┴─────────────┐
            ▼                          ▼
┌──────────────────────┐   ┌──────────────────────┐
│    Python FastAPI    │   │       MongoDB        │
│   (ML risk engine)   │   │ (transaction store)  │
└──────────────────────┘   └──────────────────────┘
```

- **Frontend (React)** — dashboard with a live transaction feed, color-coded risk scores, and quick-demo buttons for simulating normal/risky transactions
- **Backend (Node/Express)** — API layer, runs the rule engine, calls the ML service, stores everything
- **ML Service (Python/FastAPI)** — the Isolation Forest model, served as its own microservice
- **MongoDB** — transaction store

## Tech stack

Node.js, Express, MongoDB, React, Python, FastAPI, scikit-learn, Docker, AWS EC2

## Running it locally

```bash
git clone <this-repo-url>
cd ai-risk-manager
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- ML Service: http://localhost:8000

If you want to retrain the model yourself, download the Kaggle "Credit Card Fraud Detection" dataset, drop `creditcard.csv` into `ml-service/data/`, then run `python train.py` inside the ml-service container.

## Manual setup (without Docker)

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

## Build challenges — the actual "what broke at 2 AM" list

I'll be honest, none of these were huge conceptual problems — they were all the kind of small, dumb infrastructure things that eat an entire evening if you don't know what to look for.

**The dataset that wouldn't push.** After training on the real Kaggle data, I went to push my code and GitHub just... rejected it. Turned out `creditcard.csv` was 144MB, and GitHub caps individual files at 100MB. Even after I removed it from my latest commit, the push still failed — because it was still sitting in an earlier commit's history. Had to `git reset --mixed HEAD~2` to unwind the last two commits without losing my actual code changes, add the dataset to `.gitignore`, and recommit clean. The trained model itself (`isolation_forest.joblib`) is tiny — under 1MB — so that's what's actually committed. The raw dataset never needs to touch the deployed server.

**"Anywhere-IPv4" is not a CIDR block.** Setting up the AWS security group, I needed to open ports 3000/5000/8000 to the world. The source dropdown showed a suggestion list with a category header "Anywhere-IPv4" sitting right above the actual value `0.0.0.0/0`. I clicked the header. AWS's error was blunt: `CIDR block Anywhere-IPv4 is malformed`. Lesson: the label and the value are not the same clickable thing.

**`docker-compose` vs `docker compose`.** Worked fine locally. On the fresh Ubuntu EC2 instance, `docker-compose` (hyphenated, v1) wasn't installed — modern Ubuntu ships Compose as a plugin, invoked as `docker compose` (space, v2). Small syntax difference, whole command not found until I caught it.

**The disk filled up and MongoDB quietly vanished from the network.** This one was the most confusing. Everything was deployed and working, then a day later transactions started failing with `getaddrinfo EAI_AGAIN mongo` — the backend couldn't resolve the MongoDB hostname anymore. `docker compose ps` showed all four containers as "Up." Turned out the EC2 instance's 6.7GB disk had filled up to 100% from accumulated Docker build layers, and in that state Docker had silently failed to attach the mongo container to the network on the last restart — it just wasn't in the network's container list at all. Running `docker builder prune -a -f` freed up about 1.9GB, and a clean `docker compose down && docker compose up -d` brought everything back onto the same network correctly. The actual database volume was never touched, so no data was lost — just a scary hour of debugging a "why does everything say it's running but nothing works" situation.

**What all of this actually taught me:** the model was, honestly, the easy part. scikit-learn does the hard math for you. What eats real time when you're shipping an AI system is everything *around* the model — git hygiene with large files, cloud networking quirks, disk management on a small instance, and the gap between "works on my machine" and "works after I `git pull` on a fresh server." The rule-based + ML hybrid, and the explainability on every flagged transaction, were deliberate choices — in a fintech risk context, I think a system nobody can audit is almost as risky as no system at all.

## Team

Anshika — B.Tech CSE, SISTec GN
