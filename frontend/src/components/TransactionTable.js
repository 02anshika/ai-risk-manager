import React, { useState } from "react";

function riskColor(score) {
  if (score >= 60) return "#e74c3c"; // red
  if (score >= 30) return "#f1c40f"; // yellow
  return "#2ecc71"; // green
}

function riskEmoji(score) {
  if (score >= 60) return "🔴";
  if (score >= 30) return "🟡";
  return "🟢";
}

export default function TransactionTable({ transactions }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!transactions.length) {
    return (
      <div className="empty-state">
        <span className="empty-icon">📭</span>
        <p>No transactions match this filter yet.</p>
      </div>
    );
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
              className={`txn-row txn-row-${txn.status}`}
              onClick={() =>
                setExpandedId(expandedId === txn._id ? null : txn._id)
              }
            >
              <td>{txn.userId}</td>
              <td>₹{txn.amount.toLocaleString("en-IN")}</td>
              <td>{txn.deviceId}</td>
              <td>{txn.location}</td>
              <td>
                <span
                  className="risk-badge"
                  style={{ backgroundColor: riskColor(txn.riskScore) }}
                >
                  {riskEmoji(txn.riskScore)} {txn.riskScore}
                </span>
              </td>
              <td>
                <span className={`status-pill status-${txn.status}`}>
                  {txn.status}
                </span>
              </td>
            </tr>
            {expandedId === txn._id && (
              <tr className="reason-row">
                <td colSpan={6}>
                  <strong>Why this score:</strong>
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
