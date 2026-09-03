import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaHistory, FaSearch, FaFilter, FaShieldAlt, FaUserCheck, FaTerminal } from "react-icons/fa";

export default function AuditLogsViewer() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterResource, setFilterResource] = useState("");

  useEffect(() => {
    fetchAuditLogs();
  }, [filterAction, filterResource]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const query = [];
      if (filterAction) query.push(`action=${filterAction}`);
      if (filterResource) query.push(`resourceType=${filterResource}`);
      const queryString = query.length > 0 ? `?${query.join("&")}` : "";

      const res = await API.get(`/official/audit-logs${queryString}`);
      setLogs(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.75rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
          <FaHistory style={{ color: "#2563eb" }} /> Immutable System Audit Logs Ledger
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Track every system transaction, approval action, certificate issue, and consent grant for legal compliance.
        </p>
      </div>

      {/* Filter Bar */}
      <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "220px" }}>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Resource Type</label>
          <select
            value={filterResource}
            onChange={(e) => setFilterResource(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          >
            <option value="">All Resources</option>
            <option value="Application">Applications</option>
            <option value="Certificate">Certificates</option>
            <option value="Grievance">Grievances</option>
            <option value="Notice">Notices</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading audit ledger...</p>
      ) : logs.length === 0 ? (
        <div style={{ padding: "36px", textAlign: "center", background: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <p style={{ color: "#64748b", margin: 0 }}>No audit logs recorded yet.</p>
        </div>
      ) : (
        <div style={{ background: "#ffffff", borderRadius: "14px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "140px 180px 140px 1fr 160px", background: "#f8fafc", padding: "12px 16px", fontWeight: "700", fontSize: "0.8rem", color: "#475569", borderBottom: "1px solid #e2e8f0" }}>
            <div>LOG ID</div>
            <div>ACTION</div>
            <div>ACTOR ROLE</div>
            <div>RESOURCE TARGET</div>
            <div>TIMESTAMP</div>
          </div>

          {logs.map((log) => (
            <div key={log._id || log.logId} style={{ display: "grid", gridTemplateColumns: "140px 180px 140px 1fr 160px", padding: "12px 16px", fontSize: "0.85rem", borderBottom: "1px solid #f1f5f9", alignItems: "center" }}>
              <div style={{ fontWeight: "700", color: "#2563eb", fontFamily: "monospace" }}>{log.logId}</div>
              <div>
                <span style={{ background: "#eff6ff", color: "#1d4ed8", padding: "2px 8px", borderRadius: "4px", fontWeight: "700", fontSize: "0.75rem" }}>
                  {log.action}
                </span>
              </div>
              <div style={{ color: "#475569", fontWeight: "600" }}>{log.userRole || "Official"}</div>
              <div style={{ color: "#0f172a" }}>
                <strong>{log.resourceType}:</strong> {log.resourceId}
              </div>
              <div style={{ color: "#64748b", fontSize: "0.75rem" }}>{new Date(log.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
