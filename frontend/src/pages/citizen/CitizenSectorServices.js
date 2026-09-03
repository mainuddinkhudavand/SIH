import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaSchool, FaHospital, FaShoppingBag, FaFilm, FaBolt, FaCheckCircle, FaPaperPlane } from "react-icons/fa";

export default function CitizenSectorServices() {
  const [activeSector, setActiveSector] = useState("School");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  // Form state
  const [serviceName, setServiceName] = useState("School Admission Application");
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    detailsText: "",
    preferredDate: ""
  });

  useEffect(() => {
    fetchMySectorRequests();
  }, []);

  const fetchMySectorRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/sectors/my-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to load sector requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSectorChange = (sector) => {
    setActiveSector(sector);
    if (sector === "School") setServiceName("School Admission Application");
    if (sector === "Hospital") setServiceName("Hospital OPD Appointment");
    if (sector === "Mall") setServiceName("Commercial Trader Permit");
    if (sector === "Cinema") setServiceName("Event & Public Screening Permit");
    if (sector === "Utilities") setServiceName("Sector Utility & Infrastructure Request");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        sector: activeSector,
        serviceName: serviceName,
        details: {
          applicantName: formData.name,
          contact: formData.contact,
          description: formData.detailsText,
          preferredDate: formData.preferredDate
        }
      };

      const res = await API.post("/sectors/request", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: `Sector request submitted! Request ID: ${res.data.sectorRequest.requestId}` });
      setFormData({ name: "", contact: "", detailsText: "", preferredDate: "" });
      fetchMySectorRequests();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit request." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.75rem", fontWeight: "700" }}>
          🏢 Sector Services Modules
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Access integrated community services for Schools, Hospitals, Commercial Malls, Cinemas, and Infrastructure.
        </p>
      </div>

      {/* Sector Selection Tabs */}
      <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "12px", marginBottom: "28px" }}>
        {[
          { id: "School", label: "Schools & Education", icon: <FaSchool /> },
          { id: "Hospital", label: "Hospitals & Health", icon: <FaHospital /> },
          { id: "Mall", label: "Malls & Local Commerce", icon: <FaShoppingBag /> },
          { id: "Cinema", label: "Cinema & Events", icon: <FaFilm /> },
          { id: "Utilities", label: "Utilities & Infrastructure", icon: <FaBolt /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSectorChange(tab.id)}
            style={{
              padding: "12px 20px",
              borderRadius: "12px",
              border: activeSector === tab.id ? "2px solid #2563eb" : "1px solid #cbd5e1",
              background: activeSector === tab.id ? "#eff6ff" : "#ffffff",
              color: activeSector === tab.id ? "#1d4ed8" : "#475569",
              fontWeight: "700",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Active Sector Dynamic Module Content */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Left Column: Form & Services */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#0f172a" }}>Submit {activeSector} Service Request</h3>

          {message && (
            <div style={{ padding: "12px", borderRadius: "8px", marginBottom: "16px", background: message.type === "success" ? "#ecfdf5" : "#fef2f2", color: message.type === "success" ? "#065f46" : "#991b1b" }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Service Action</label>
              <select
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              >
                {activeSector === "School" && (
                  <>
                    <option value="School Admission Application">School Admission Application</option>
                    <option value="School Transfer Certificate Request">School Transfer Certificate Request</option>
                    <option value="Scholarship Application">Scholarship Application</option>
                  </>
                )}
                {activeSector === "Hospital" && (
                  <>
                    <option value="Hospital OPD Appointment">Hospital OPD Appointment</option>
                    <option value="Emergency Ambulance Request">Emergency Ambulance Request</option>
                    <option value="Bed Status Inquiry">Bed Status & Admission Inquiry</option>
                  </>
                )}
                {activeSector === "Mall" && (
                  <>
                    <option value="Commercial Trader Permit">Commercial Trader Permit</option>
                    <option value="Mall Vendor Space Request">Mall Vendor Space Allotment</option>
                    <option value="Commercial Safety Inspection">Commercial Safety Inspection</option>
                  </>
                )}
                {activeSector === "Cinema" && (
                  <>
                    <option value="Event & Public Screening Permit">Event & Public Screening Permit</option>
                    <option value="Cinema Venue Safety Clearance">Cinema Venue Safety Clearance</option>
                    <option value="Cultural Performance Sanction">Cultural Performance Sanction</option>
                  </>
                )}
                {activeSector === "Utilities" && (
                  <>
                    <option value="Sector Utility & Infrastructure Request">Sector Utility & Infrastructure Request</option>
                    <option value="Streetlight Outage Repair">Streetlight Outage Repair</option>
                    <option value="Water Pipeline Leakage Fix">Water Pipeline Leakage Fix</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Applicant Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Contact Phone</label>
              <input
                type="text"
                placeholder="Phone Number"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Preferred Date / Timeline</label>
              <input
                type="date"
                value={formData.preferredDate}
                onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Request Details & Remarks</label>
              <textarea
                rows="3"
                placeholder="Provide specific details regarding your request..."
                value={formData.detailsText}
                onChange={(e) => setFormData({ ...formData, detailsText: e.target.value })}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: "#2563eb",
                color: "white",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {submitting ? "Submitting..." : <><FaPaperPlane /> Submit {activeSector} Request</>}
            </button>
          </form>
        </div>

        {/* Right Column: History of Active Sector Requests */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#0f172a" }}>Submitted {activeSector} Requests</h3>
          {loading ? (
            <p style={{ color: "#64748b" }}>Loading sector records...</p>
          ) : requests.filter((r) => r.sector === activeSector).length === 0 ? (
            <p style={{ color: "#64748b" }}>No requests submitted under {activeSector} sector module yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {requests.filter((r) => r.sector === activeSector).map((req) => (
                <div key={req._id} style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.95rem" }}>{req.serviceName}</span>
                    <span style={{ fontSize: "0.75rem", background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>{req.status}</span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                    <strong>ID:</strong> {req.requestId} | <strong>Submitted:</strong> {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "6px" }}>
                    {req.details?.description || "Request logged in sector module."}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
