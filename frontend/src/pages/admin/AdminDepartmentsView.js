import React from "react";
import { FaBuilding, FaLandmark, FaHeartbeat, FaCheckCircle, FaNetworkWired } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function AdminDepartmentsView() {
  const departments = [
    { name: "Municipality", portal: "Municipal Portal", status: "ONLINE", indicator: "🟢", bg: "#e0f2fe", border: "#38bdf8", path: "/portals/municipal", services: ["Water Connection", "Birth Certificate", "Property Service", "Municipal Grievance"] },
    { name: "Revenue", portal: "Revenue Portal", status: "ONLINE", indicator: "🟢", bg: "#fef3c7", border: "#fbbf24", path: "/portals/revenue", services: ["Property Records", "Ownership Verification", "Tax Verification", "Stamp Duty NOC"] },
    { name: "Health", portal: "Health Portal", status: "ONLINE", indicator: "🟢", bg: "#dcfce7", border: "#4ade80", path: "/portals/health", services: ["Birth/Death Certificates", "Food Safety Permits", "Healthcare Schemes", "Sanitation Clearance"] }
  ];

  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <h3 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "1.3rem", fontWeight: "800" }}>
            Connected Departmental Portals (3 Active)
          </h3>
          <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
            Live status of connected departmental gateway nodes on GovConnect Interoperability Platform.
          </p>
        </div>

        <span style={{ background: "#dcfce7", color: "#166534", padding: "6px 14px", borderRadius: "8px", fontWeight: "800", fontSize: "0.85rem" }}>
          Connected Departments: 3 / 3 🟢
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
        {departments.map((dept, idx) => (
          <div key={idx} style={{ background: "#ffffff", borderRadius: "14px", padding: "22px", border: `1px solid ${dept.border}`, boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h4 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
                {dept.name}
              </h4>
              <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "12px", fontSize: "0.8rem", fontWeight: "800" }}>
                {dept.indicator} {dept.status}
              </span>
            </div>

            <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "14px" }}>
              Portal: <strong>{dept.portal}</strong>
            </p>

            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Core Department Services:</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {dept.services.map((s, sIdx) => (
                  <span key={sIdx} style={{ background: dept.bg, color: "#0f172a", fontSize: "0.75rem", fontWeight: "700", padding: "3px 8px", borderRadius: "6px" }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <Link to={dept.path} style={{ display: "inline-block", width: "100%", textAlign: "center", padding: "10px", background: "#0f172a", color: "white", borderRadius: "8px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem" }}>
              Inspect {dept.name} Portal →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
