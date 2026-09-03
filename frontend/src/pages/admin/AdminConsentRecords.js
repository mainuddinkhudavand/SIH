import React from "react";
import { FaShieldAlt, FaCheckCircle, FaExchangeAlt } from "react-icons/fa";

export default function AdminConsentRecords() {
  const consents = [
    { id: "CONSENT-CTZ-984210", resident: "Pavan", citizenId: "CTZ-984210", requestingDept: "Municipality Portal", targetDept: "Revenue Portal", scope: "PROPERTY_OWNERSHIP_VERIFICATION", status: "ACTIVE", grantedAt: "2026-09-02 10:14:00" },
    { id: "CONSENT-CTZ-441209", resident: "Anita Sharma", citizenId: "CTZ-441209", requestingDept: "Health Portal", targetDept: "Municipal Sanitation Node", scope: "VITAL_STATISTICS_VERIFICATION", status: "ACTIVE", grantedAt: "2026-09-01 16:30:12" },
    { id: "CONSENT-CTZ-110293", resident: "Rajesh Kumar", citizenId: "CTZ-110293", requestingDept: "Revenue Portal", targetDept: "Municipal Tax Clearance", scope: "INCOME_TAX_ASSESSMENT", status: "ACTIVE", grantedAt: "2026-08-30 11:20:45" }
  ];

  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #dcfce7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 4px 0", color: "#166534", fontSize: "1.3rem", fontWeight: "800" }}>
          🛡 GovConnect Consent Manager Records Audit
        </h3>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
          Immutable ledger of resident consents authorizing cross-departmental data exchanges.
        </p>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
        <thead>
          <tr style={{ background: "#f0fdf4", borderBottom: "2px solid #bbf7d0", textAlign: "left", color: "#166534" }}>
            <th style={{ padding: "10px" }}>Token ID</th>
            <th style={{ padding: "10px" }}>Resident</th>
            <th style={{ padding: "10px" }}>Data Flow</th>
            <th style={{ padding: "10px" }}>Scope</th>
            <th style={{ padding: "10px" }}>Granted Date</th>
            <th style={{ padding: "10px" }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {consents.map((c) => (
            <tr key={c.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
              <td style={{ padding: "10px", fontFamily: "monospace", fontWeight: "800", color: "#0284c7" }}>{c.id}</td>
              <td style={{ padding: "10px", fontWeight: "800", color: "#0f172a" }}>{c.resident}</td>
              <td style={{ padding: "10px" }}>{c.requestingDept} → {c.targetDept}</td>
              <td style={{ padding: "10px" }}><code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>{c.scope}</code></td>
              <td style={{ padding: "10px", color: "#64748b" }}>{c.grantedAt}</td>
              <td style={{ padding: "10px" }}>
                <span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem" }}>
                  🟢 {c.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
