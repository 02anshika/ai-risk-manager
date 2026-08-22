import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/transactions`);
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err.message);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleNewTransaction = (txn) => {
    setTransactions((prev) => [txn, ...prev]);
  };

  const flaggedCount = transactions.filter((t) => t.status === "flagged").length;

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
      </div>
      <TransactionForm onNewTransaction={handleNewTransaction} />
      <TransactionTable transactions={transactions} />
    </div>
  );
}
