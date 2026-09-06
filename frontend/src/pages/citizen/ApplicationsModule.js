import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaPaperPlane, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaPlus, FaTint, FaHome, FaHeartbeat, FaExclamationCircle, FaCertificate } from "react-icons/fa";

export default function ApplicationsModule() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterService, setFilterService] = useState("ALL");

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/applications/my-applications");
      const list = Array.isArray(res.data) ? res.data : (res.data?.applications || res.data?.data || []);
      setApplications(list);
    } catch (err) {
      console.error("Failed to load applications:", err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span style={{ background: "#d1fae5", color: "#065f46", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}><FaCheckCircle /> Approved</span>;
      case "Rejected":
        return <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}><FaTimesCircle /> Rejected</span>;
      default:
        return <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "6px" }}><FaHourglassHalf /> {status || "Submitted"}</span>;
    }
  };

  const filtered = applications.filter(app => filterService === "ALL" || app.serviceType?.toLowerCase().includes(filterService.toLowerCase()));

  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ display: "inline-block", background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", marginBottom: "6px" }}>
            Single Sign-On Ledger
          </div>
          <h2 style={{ margin: 0, color: "#0f172a", fontSize: "1.75rem", fontWeight: "800" }}>
            My Applications
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
            Track all submitted civic service requests, certificate issuances, and grievances in real-time.
          </p>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", "Water", "Property", "Certificate"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterService(cat)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                background: filterService === cat ? "#0f172a" : "#f1f5f9",
                color: filterService === cat ? "#ffffff" : "#475569",
                fontWeight: "700",
                fontSize: "0.8rem",
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / List */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading application history...</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <p style={{ color: "#64748b", margin: 0, fontWeight: "600" }}>No applications found matching your selection.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {filtered.map((app) => (
            <div
              key={app._id}
              style={{
                background: "#ffffff",
                borderRadius: "14px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "#0284c7", fontWeight: "800" }}>App ID: {app.applicationId || app._id}</span>
                  <h4 style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "1.15rem", fontWeight: "800" }}>{app.title || app.serviceType}</h4>
                  <span style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "600" }}>Service: {app.serviceType}</span>
                </div>
                <div>{getStatusBadge(app.status)}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", background: "#f8fafc", padding: "14px", borderRadius: "10px", fontSize: "0.85rem", color: "#475569" }}>
                <div><strong>Applicant:</strong> {app.applicantDetails?.fullName || app.user?.name || "Resident"}</div>
                <div><strong>Contact:</strong> {app.applicantDetails?.phone || "Registered Contact"}</div>
                <div><strong>Date Filed:</strong> {new Date(app.createdAt).toLocaleDateString()}</div>
                <div><strong>Processing Progress:</strong> {app.remarks || "Application logged at GovConnect Gateway"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
