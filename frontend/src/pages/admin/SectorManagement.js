import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaSchool, FaHospital, FaShoppingBag, FaFilm, FaBolt, FaCheckCircle, FaTimesCircle, FaChartPie } from "react-icons/fa";

export default function SectorManagement() {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [activeSector, setActiveSector] = useState("All");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchSectorData();
  }, [activeSector]);

  const fetchSectorData = async () => {
    try {
      setLoading(true);
      const [statsRes, reqsRes] = await Promise.all([
        API.get("/sectors/stats"),
        API.get(`/sectors/all?sector=${activeSector === "All" ? "" : activeSector}`)
      ]);
      setStats(statsRes.data || null);
      setRequests(reqsRes.data || []);
    } catch (err) {
      console.error("Failed to load sector management data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setProcessingId(id);
    try {
      await API.put(`/sectors/${id}/status`, { status, remarks: `Official action: Marked as ${status}` });
      fetchSectorData();
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.75rem", fontWeight: "700" }}>
          🏛 Sector Services Management & Oversight
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Monitor sector metrics and approve permits across Schools, Hospitals, Commercial Malls, Cinemas, and Utilities.
        </p>
      </div>

      {/* KPI Stats Cards */}
      {stats && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "32px" }}>
          <div style={{ background: "#ffffff", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700" }}>TOTAL SECTOR REQUESTS</span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#0f172a", marginTop: "4px" }}>{stats.totalRequests}</div>
          </div>
          <div style={{ background: "#eff6ff", padding: "16px", borderRadius: "12px", border: "1px solid #bfdbfe" }}>
            <span style={{ fontSize: "0.8rem", color: "#1e40af", fontWeight: "700" }}>🏫 SCHOOL REQUESTS</span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#1d4ed8", marginTop: "4px" }}>{stats.schoolCount}</div>
          </div>
          <div style={{ background: "#ecfdf5", padding: "16px", borderRadius: "12px", border: "1px solid #a7f3d0" }}>
            <span style={{ fontSize: "0.8rem", color: "#065f46", fontWeight: "700" }}>🏥 HOSPITAL OPD / BEDS</span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#059669", marginTop: "4px" }}>{stats.hospitalCount}</div>
          </div>
          <div style={{ background: "#fff7ed", padding: "16px", borderRadius: "12px", border: "1px solid #fed7aa" }}>
            <span style={{ fontSize: "0.8rem", color: "#9a3412", fontWeight: "700" }}>🛍 MALL TRADER PERMITS</span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#ea580c", marginTop: "4px" }}>{stats.mallCount}</div>
          </div>
          <div style={{ background: "#faf5ff", padding: "16px", borderRadius: "12px", border: "1px solid #e9d5ff" }}>
            <span style={{ fontSize: "0.8rem", color: "#6b21a8", fontWeight: "700" }}>🎬 CINEMA PERMITS</span>
            <div style={{ fontSize: "1.75rem", fontWeight: "800", color: "#9333ea", marginTop: "4px" }}>{stats.cinemaCount}</div>
          </div>
        </div>
      )}

      {/* Sector Filters */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px", marginBottom: "24px" }}>
        {["All", "School", "Hospital", "Mall", "Cinema", "Utilities"].map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveSector(sec)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              border: activeSector === sec ? "2px solid #2563eb" : "1px solid #cbd5e1",
              background: activeSector === sec ? "#eff6ff" : "#ffffff",
              color: activeSector === sec ? "#1d4ed8" : "#475569",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer"
            }}
          >
            {sec} Sector
          </button>
        ))}
      </div>

      {/* Requests Table */}
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading sector records...</p>
      ) : requests.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", background: "#ffffff", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <p style={{ color: "#64748b", margin: 0 }}>No sector requests found under "{activeSector}".</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "14px" }}>
          {requests.map((req) => (
            <div key={req._id} style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
                    {req.sector} Sector
                  </span>
                  <h4 style={{ margin: "4px 0 2px 0", color: "#0f172a" }}>{req.serviceName}</h4>
                  <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Request ID: {req.requestId}</span>
                </div>
                <span style={{ fontSize: "0.85rem", background: req.status === "Approved" ? "#d1fae5" : req.status === "Rejected" ? "#fee2e2" : "#fef3c7", color: req.status === "Approved" ? "#065f46" : req.status === "Rejected" ? "#991b1b" : "#92400e", padding: "4px 12px", borderRadius: "12px", fontWeight: "700" }}>
                  {req.status}
                </span>
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", color: "#475569", marginBottom: "12px" }}>
                <div><strong>Applicant:</strong> {req.details?.applicantName || req.user?.name || "Resident"}</div>
                <div><strong>Contact:</strong> {req.details?.contact || req.user?.phone || "N/A"}</div>
                <div><strong>Description / Notes:</strong> {req.details?.description || "Sector service booking."}</div>
              </div>

              {req.status !== "Approved" && req.status !== "Rejected" && (
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => handleUpdateStatus(req._id, "Approved")}
                    disabled={processingId === req._id}
                    style={{ background: "#059669", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <FaCheckCircle /> Approve Permit
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(req._id, "Rejected")}
                    disabled={processingId === req._id}
                    style={{ background: "#dc2626", color: "white", border: "none", padding: "6px 14px", borderRadius: "6px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
