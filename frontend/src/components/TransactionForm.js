import React, { useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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

  return (
    <form className="txn-form" onSubmit={handleSubmit}>
      <h3>Simulate a Transaction</h3>
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
      <button type="submit" disabled={loading}>
        {loading ? "Scoring..." : "Submit Transaction"}
      </button>
    </form>
  );
}
