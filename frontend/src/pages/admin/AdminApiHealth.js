import React from "react";
import { FaHeartbeat, FaCheckCircle, FaExclamationTriangle, FaServer, FaChartLine } from "react-icons/fa";

export default function AdminApiHealth() {
  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "1.3rem", fontWeight: "800" }}>
          🌐 GovConnect API Gateway Health & Monitoring
        </h3>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
          Real-time API throughput, latency analytics, and gateway node health metrics.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#f0fdf4", padding: "18px", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#166534" }}>Gateway Status</span>
          <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#15803d", marginTop: "4px" }}>HEALTHY (99.98%)</div>
          <small style={{ color: "#166534" }}>Latency: 14ms avg</small>
        </div>

        <div style={{ background: "#f0f9ff", padding: "18px", borderRadius: "12px", border: "1px solid #bae6fd" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#0369a1" }}>Successful APIs</span>
          <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#0284c7", marginTop: "4px" }}>98.5% (1,226)</div>
          <small style={{ color: "#0369a1" }}>HTTP 200 OK</small>
        </div>

        <div style={{ background: "#fef2f2", padding: "18px", borderRadius: "12px", border: "1px solid #fecaca" }}>
          <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#991b1b" }}>Failed APIs</span>
          <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#dc2626", marginTop: "4px" }}>1.5% (19)</div>
          <small style={{ color: "#991b1b" }}>Handled Exceptions</small>
        </div>
      </div>

      <h4 style={{ color: "#0f172a", marginBottom: "12px" }}>Active Department API Endpoints</h4>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
        <thead>
          <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
            <th style={{ padding: "10px" }}>Endpoint</th>
            <th style={{ padding: "10px" }}>Target Portal</th>
            <th style={{ padding: "10px" }}>Avg Response</th>
            <th style={{ padding: "10px" }}>Success Rate</th>
            <th style={{ padding: "10px" }}>Health</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "10px", fontFamily: "monospace" }}>/api/municipal/applications</td>
            <td style={{ padding: "10px", fontWeight: "700" }}>Municipal Portal</td>
            <td style={{ padding: "10px" }}>12ms</td>
            <td style={{ padding: "10px", color: "#16a34a", fontWeight: "700" }}>99.2%</td>
            <td style={{ padding: "10px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem" }}>🟢 OPERATIONAL</span></td>
          </tr>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "10px", fontFamily: "monospace" }}>/api/revenue/applications</td>
            <td style={{ padding: "10px", fontWeight: "700" }}>Revenue Portal</td>
            <td style={{ padding: "10px" }}>16ms</td>
            <td style={{ padding: "10px", color: "#16a34a", fontWeight: "700" }}>98.8%</td>
            <td style={{ padding: "10px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem" }}>🟢 OPERATIONAL</span></td>
          </tr>
          <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
            <td style={{ padding: "10px", fontFamily: "monospace" }}>/api/health/applications</td>
            <td style={{ padding: "10px", fontWeight: "700" }}>Health Portal</td>
            <td style={{ padding: "10px" }}>11ms</td>
            <td style={{ padding: "10px", color: "#16a34a", fontWeight: "700" }}>99.5%</td>
            <td style={{ padding: "10px" }}><span style={{ background: "#dcfce7", color: "#166534", padding: "3px 8px", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem" }}>🟢 OPERATIONAL</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
