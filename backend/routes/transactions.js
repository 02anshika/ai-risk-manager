const express = require("express");
const axios = require("axios");
const router = express.Router();
const Transaction = require("../models/Transaction");
const { runRules } = require("../services/riskEngine");

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

// POST /api/transactions — create + score a new transaction
router.post("/", async (req, res) => {
  try {
    const { userId, amount, deviceId, location, timestamp } = req.body;

    // Trim stray whitespace/tab characters (e.g. from Tab-key focus jumps)
    // so the same user/device is recognized consistently across submissions.
    const txnDraft = {
      userId: String(userId).trim(),
      amount,
      deviceId: String(deviceId).trim(),
      location: String(location).trim(),
      timestamp: timestamp ? new Date(timestamp) : new Date(),
    };

    // 1. Rule-based score
    const { ruleScore, reasons } = await runRules(txnDraft);

    // 2. ML anomaly score (call Python service)
    let mlScore = 0;
    try {
      const mlResponse = await axios.post(`${ML_SERVICE_URL}/predict`, {
        amount,
        hour: txnDraft.timestamp.getHours(),
      });
      mlScore = mlResponse.data.risk_score; // expected 0-100
    } catch (err) {
      console.warn("ML service unavailable, using rule score only:", err.message);
      mlScore = ruleScore; // graceful fallback
    }

    // 3. Combine — weighted average (tune weights as needed)
    const finalScore = Math.round(0.6 * ruleScore + 0.4 * mlScore);
    const status = finalScore >= 60 ? "flagged" : "safe";

    const transaction = new Transaction({
      ...txnDraft,
      riskScore: finalScore,
      riskReasons: reasons,
      status,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions — list all, most recent first
router.get("/", async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ timestamp: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transactions/:id — single transaction detail
router.get("/:id", async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ error: "Not found" });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/transactions — clear all transactions
router.delete("/", async (req, res) => {
  try {
    const result = await Transaction.deleteMany({});
    res.json({ deletedCount: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
