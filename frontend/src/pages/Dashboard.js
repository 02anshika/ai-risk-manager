import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "flagged", label: "🔴 Flagged" },
  { key: "safe", label: "🟢 Safe" },
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleNewTransaction = (txn) => {
    setTransactions((prev) => [txn, ...prev]);
  };

  const handleClearAll = async () => {
    if (!window.confirm("Clear all transactions? This cannot be undone.")) {
      return;
    }
    setClearing(true);
    try {
      await axios.delete(`${API_URL}/api/transactions`);
      setTransactions([]);
    } catch (err) {
      alert("Error clearing transactions: " + err.message);
    } finally {
      setClearing(false);
    }
  };

  const flaggedCount = transactions.filter((t) => t.status === "flagged").length;
  const avgScore = transactions.length
    ? Math.round(
        transactions.reduce((sum, t) => sum + t.riskScore, 0) / transactions.length
      )
    : 0;

  const filteredTransactions =
    filter === "all"
      ? transactions
      : transactions.filter((t) => t.status === filter);

  return (
    <div className="dashboard">
      <div className="stats">
        <div className="stat-card">
          <span className="stat-number">{transactions.length}</span>
          <span className="stat-label">Total Transactions</span>
        </div>
        <div className="stat-card flagged">
          <span className="stat-number">{flaggedCount}</span>
          <span className="stat-label">Flagged</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{avgScore}</span>
          <span className="stat-label">Avg Risk Score</span>
        </div>
      </div>

      <TransactionForm onNewTransaction={handleNewTransaction} />

      <div className="table-header">
        <h3>Transactions</h3>
        <div className="table-header-actions">
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-tab ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          {transactions.length > 0 && (
            <button
              className="btn-clear"
              onClick={handleClearAll}
              disabled={clearing}
            >
              {clearing ? "Clearing…" : "🗑️ Clear All"}
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <p className="loading-text">Loading transactions…</p>
      ) : (
        <TransactionTable transactions={filteredTransactions} />
      )}
    </div>
  );
}
