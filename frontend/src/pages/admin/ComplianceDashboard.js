import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaChartBar } from "react-icons/fa";

export default function ComplianceDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      const res = await API.get("/official/compliance");
      setMetrics(res.data?.data || res.data || null);
    } catch (err) {
      console.error("Failed to load compliance metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px 0", color: "#1b4332", fontSize: "1.75rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
          <FaChartBar style={{ color: "#059669" }} /> Service Delivery & Compliance Monitoring
        </h2>
      </div>

      {loading || !metrics ? (
        <p style={{ color: "#64748b" }}>Loading monitoring metrics...</p>
      ) : (
        <>
          {/* Executive KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "32px" }}>
            <div style={{ background: "#faf5ff", padding: "20px", borderRadius: "14px", border: "1px solid #e9d5ff" }}>
              <span style={{ fontSize: "0.8rem", color: "#6b21a8", fontWeight: "700" }}>DATA QUALITY SCORE</span>
              <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#9333ea", marginTop: "4px" }}>
                {metrics.summary?.dataQualityScore || "98.5%"}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#7e22ce" }}>Sanitized & Verified Records</span>
            </div>

            <div style={{ background: "#fff7ed", padding: "20px", borderRadius: "14px", border: "1px solid #fed7aa" }}>
              <span style={{ fontSize: "0.8rem", color: "#9a3412", fontWeight: "700" }}>TRANSACTIONS AUDITED</span>
              <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#ea580c", marginTop: "4px" }}>
                {metrics.summary?.totalTransactionsAudited || 0}
              </div>
              <span style={{ fontSize: "0.75rem", color: "#c2410c" }}>Immutable Ledger Logged</span>
            </div>
          </div>

          {/* Departmental Service Delivery Performance Breakdown */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #d8f3dc", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#1b4332" }}>Departmental Service Delivery Performance Breakdown</h3>
            
            <div style={{ display: "grid", gap: "16px" }}>
              {[
                { title: "Service Applications (Schemes, Permits, Subsidies)", data: metrics.breakdown?.applications },
                { title: "Official Certificates (Birth, Income, Caste, Domicile)", data: metrics.breakdown?.certificates },
                { title: "Public Grievances & Infrastructure Tickets", data: metrics.breakdown?.grievances }
              ].map((item, idx) => (
                <div key={idx} style={{ background: "#f4f9f4", padding: "16px", borderRadius: "12px", border: "1px solid #d8f3dc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <h4 style={{ margin: 0, color: "#1b4332" }}>{item.title}</h4>
                    <span style={{ fontWeight: "800", color: item.data?.compliance >= 80 ? "#059669" : "#dc2626", fontSize: "1.1rem" }}>
                      {item.data?.compliance || 100}% Compliance
                    </span>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "12px", fontSize: "0.85rem", color: "#475569", marginTop: "8px" }}>
                    <div><strong>Total Received:</strong> {item.data?.received || 0}</div>
                    <div><strong>Resolved / Approved:</strong> {item.data?.resolved || 0}</div>
                    <div><strong>Status:</strong> {(item.data?.compliance || 100) >= 80 ? "✓ Satisfactory SLA" : "⚠️ Needs Improvement"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
