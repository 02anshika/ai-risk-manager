import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const DEMO_LOCATIONS = ["Mumbai", "Bengaluru", "Delhi", "Pune", "Chennai", "Unknown VPN"];
const DEMO_DEVICES = ["device-A1", "device-B2", "device-C3", "new-unrecognized-device"];

function randomTransaction(highRisk) {
  const userId = "user-" + Math.floor(100 + Math.random() * 900);
  if (highRisk) {
    return {
      userId,
      amount: String(Math.floor(50000 + Math.random() * 150000)),
      deviceId: "new-unrecognized-device",
      location: "Unknown VPN",
    };
  }
  return {
    userId,
    amount: String(Math.floor(200 + Math.random() * 3000)),
    deviceId: DEMO_DEVICES[Math.floor(Math.random() * (DEMO_DEVICES.length - 1))],
    location: DEMO_LOCATIONS[Math.floor(Math.random() * (DEMO_LOCATIONS.length - 1))],
  };
}

export default function TransactionForm({ onNewTransaction }) {
  const [form, setForm] = useState({
    userId: "",
    amount: "",
    deviceId: "",
    location: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/transactions`, {
        ...form,
        amount: Number(form.amount),
      });
      onNewTransaction(res.data);
      setForm({ userId: "", amount: "", deviceId: "", location: "" });
    } catch (err) {
      alert("Error submitting transaction: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Demo buttons only fill the form — they do NOT auto-submit.
  // Review the values, then hit "Submit" yourself.
  const handleRandom = (highRisk) => {
    const txn = randomTransaction(highRisk);
    setForm(txn);
  };

  return (
    <form className="txn-form" onSubmit={handleSubmit}>
      <h3>Simulate a Transaction</h3>
      <div className="txn-form-row">
        <input
          name="userId"
          placeholder="User ID"
          value={form.userId}
          onChange={handleChange}
          required
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount (₹)"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <input
          name="deviceId"
          placeholder="Device ID"
          value={form.deviceId}
          onChange={handleChange}
          required
        />
        <input
          name="location"
          placeholder="Location"
          value={form.location}
          onChange={handleChange}
          required
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? "Scoring…" : "Submit"}
        </button>
      </div>
      <div className="demo-buttons">
        <span className="demo-label">Quick fill:</span>
        <button
          type="button"
          className="btn-demo btn-demo-safe"
          onClick={() => handleRandom(false)}
          disabled={loading}
        >
          🟢 Fill Normal Transaction
        </button>
        <button
          type="button"
          className="btn-demo btn-demo-risk"
          onClick={() => handleRandom(true)}
          disabled={loading}
        >
          🔴 Fill Risky Transaction
        </button>
        <span className="demo-hint">(review, then hit Submit)</span>
      </div>
    </form>
  );
}
