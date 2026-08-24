const Transaction = require("../models/Transaction");

// Thresholds — tune these against your dataset during Day 3-4
const HIGH_AMOUNT_THRESHOLD = 50000; // ₹
const VELOCITY_WINDOW_MINUTES = 5;
const VELOCITY_COUNT_THRESHOLD = 3; // >3 transactions in window = suspicious
const ODD_HOUR_START = 0; // 12 AM
const ODD_HOUR_END = 5; // 5 AM

/**
 * Runs rule-based checks on a transaction and returns
 * { ruleScore: 0-100, reasons: string[] }
 */
async function runRules(txn) {
  const reasons = [];
  let ruleScore = 0;

  // 1. High amount check
  if (txn.amount >= HIGH_AMOUNT_THRESHOLD) {
    ruleScore += 30;
    reasons.push(`High transaction amount (₹${txn.amount})`);
  }

  // 2. Odd-hour check (converted to IST, since the server runs in UTC
  // but transactions are assumed to happen in India)
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(new Date(txn.timestamp).getTime() + istOffsetMs);
  const hour = istDate.getUTCHours();
  if (hour >= ODD_HOUR_START && hour < ODD_HOUR_END) {
    ruleScore += 20;
    reasons.push(`Transaction at unusual hour (${hour}:00)`);
  }

  // 3. Velocity check — same user, multiple transactions in short window
  const windowStart = new Date(
    new Date(txn.timestamp).getTime() - VELOCITY_WINDOW_MINUTES * 60 * 1000
  );
  const recentCount = await Transaction.countDocuments({
    userId: txn.userId,
    timestamp: { $gte: windowStart, $lte: txn.timestamp },
  });
  if (recentCount >= VELOCITY_COUNT_THRESHOLD) {
    ruleScore += 30;
    reasons.push(
      `${recentCount} transactions from this user within ${VELOCITY_WINDOW_MINUTES} minutes`
    );
  }

  // 4. New device/location check
  const priorFromDevice = await Transaction.findOne({
    userId: txn.userId,
    deviceId: txn.deviceId,
  });
  if (!priorFromDevice) {
    ruleScore += 20;
    reasons.push("First transaction from this device");
  }

  return { ruleScore: Math.min(ruleScore, 100), reasons };
}

module.exports = { runRules };