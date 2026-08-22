const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    deviceId: { type: String, required: true },
    location: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    riskScore: { type: Number, default: null }, // 0-100
    riskReasons: { type: [String], default: [] },
    status: {
      type: String,
      enum: ["pending", "safe", "flagged"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
