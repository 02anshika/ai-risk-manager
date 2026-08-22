import React, { useState } from "react";

function riskColor(score) {
  if (score >= 60) return "#e74c3c"; // red
  if (score >= 30) return "#f1c40f"; // yellow
  return "#2ecc71"; // green
}

export default function TransactionTable({ transactions }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!transactions.length) {
    return <p className="empty-state">No transactions yet. Simulate one above.</p>;
  }

  return (
    <table className="txn-table">
      <thead>
        <tr>
          <th>User</th>
          <th>Amount</th>
          <th>Device</th>
          <th>Location</th>
          <th>Risk Score</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((txn) => (
          <React.Fragment key={txn._id}>
            <tr
              onClick={() =>
                setExpandedId(expandedId === txn._id ? null : txn._id)
              }
              style={{ cursor: "pointer" }}
            >
              <td>{txn.userId}</td>
              <td>₹{txn.amount}</td>
              <td>{txn.deviceId}</td>
              <td>{txn.location}</td>
              <td>
                <span
                  className="risk-badge"
                  style={{ backgroundColor: riskColor(txn.riskScore) }}
                >
                  {txn.riskScore}
                </span>
              </td>
              <td>{txn.status}</td>
            </tr>
            {expandedId === txn._id && (
              <tr className="reason-row">
                <td colSpan={6}>
                  <strong>Why flagged:</strong>
                  <ul>
                    {txn.riskReasons.length ? (
                      txn.riskReasons.map((reason, i) => <li key={i}>{reason}</li>)
                    ) : (
                      <li>No rule triggers — score driven by ML anomaly detection</li>
                    )}
                  </ul>
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}
