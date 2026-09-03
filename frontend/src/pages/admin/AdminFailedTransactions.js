import React from "react";
import { FaExclamationTriangle, FaBug, FaRedo, FaShieldAlt } from "react-icons/fa";

export default function AdminFailedTransactions() {
  const failedLogs = [
    { id: "ERR-9901", timestamp: "2026-09-02 14:22:10", portal: "Municipal Portal", endpoint: "/api/interop/mapped-data", errorType: "TIMEOUT_FALLBACK_TRIGGERED", details: "Land registry query timed out after 3000ms. Local cache returned gracefully.", handled: true },
    { id: "ERR-9902", timestamp: "2026-09-02 12:05:44", portal: "Health Portal", endpoint: "/api/interop/check-consent", errorType: "CONSENT_TOKEN_EXPIRED", details: "Citizen consent token expired. Prompted resident re-authorization.", handled: true },
    { id: "ERR-9903", timestamp: "2026-09-02 09:12:30", portal: "Revenue Portal", endpoint: "/api/revenue/applications", errorType: "SCHEMA_VALIDATION_WARNING", details: "Missing optional plot survey number field. Auto-corrected to NULL.", handled: true }
  ];

  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #fee2e2", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" }}>
        <div>
          <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase" }}>
            EXCEPTIONAL HANDLER LOG
          </span>
          <h3 style={{ margin: "6px 0 0 0", color: "#991b1b", fontSize: "1.3rem", fontWeight: "800" }}>
            Failed Transactions & Exception Monitoring (1.5%)
          </h3>
        </div>

        <span style={{ background: "#dcfce7", color: "#166534", padding: "6px 14px", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem" }}>
          🛡 100% Exceptions Handled (Graceful Degradation)
        </span>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
        <thead>
          <tr style={{ background: "#fef2f2", borderBottom: "2px solid #fecaca", textAlign: "left", color: "#991b1b" }}>
            <th style={{ padding: "10px" }}>Log ID</th>
            <th style={{ padding: "10px" }}>Timestamp</th>
            <th style={{ padding: "10px" }}>Source Portal</th>
            <th style={{ padding: "10px" }}>Exception Type</th>
            <th style={{ padding: "10px" }}>Handling Resolution</th>
          </tr>
        </thead>
        <tbody>
          {failedLogs.map(log => (
            <tr key={log.id} style={{ borderBottom: "1px solid #fee2e2" }}>
              <td style={{ padding: "10px", fontWeight: "800", color: "#dc2626" }}>{log.id}</td>
              <td style={{ padding: "10px", color: "#64748b" }}>{log.timestamp}</td>
              <td style={{ padding: "10px", fontWeight: "700" }}>{log.portal}</td>
              <td style={{ padding: "10px" }}><code style={{ color: "#991b1b", background: "#fef2f2", padding: "2px 6px", borderRadius: "4px" }}>{log.errorType}</code></td>
              <td style={{ padding: "10px", color: "#334155" }}>{log.details}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
