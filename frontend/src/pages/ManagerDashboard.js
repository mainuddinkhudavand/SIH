import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet red marker icon configuration
const customMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function ManagerDashboard() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [warningNotes, setWarningNotes] = useState({});
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  const { t } = useTranslation();
  const managerDetailsStr = localStorage.getItem("managerDetails");
  const manager = managerDetailsStr ? JSON.parse(managerDetailsStr) : null;
  const token = localStorage.getItem("managerToken");

  const fetchComplaints = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/manager/my-complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (err) {
      console.error("Fetch escalated complaints error:", err);
      setMessage({ type: "error", text: "Failed to load escalated complaints." });
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL, token]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleWarnResend = async (complaintId) => {
    const note = warningNotes[complaintId] || "";
    if (!note.trim()) {
      alert("Please enter a warning note before resending.");
      return;
    }

    setActionLoading(prev => ({ ...prev, [complaintId]: true }));
    try {
      await axios.put(
        `${BACKEND_URL}/api/manager/complaints/${complaintId}/warn-resend`,
        { warningMessage: note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: "success", text: "Complaint successfully resent to department with warning!" });
      
      // Clear note
      setWarningNotes(prev => ({ ...prev, [complaintId]: "" }));
      // Refresh list
      fetchComplaints();
    } catch (err) {
      console.error("Resend Error:", err);
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to resend complaint." });
    } finally {
      setActionLoading(prev => ({ ...prev, [complaintId]: false }));
    }
  };

  const handleNoteChange = (complaintId, val) => {
    setWarningNotes(prev => ({ ...prev, [complaintId]: val }));
  };

  const styles = {
    pageWrapper: {
      maxWidth: "1200px",
      margin: "2rem auto",
      padding: "0 1.5rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#1e293b",
    },
    headerCard: {
      background: "linear-gradient(135deg, #2e4d2c, #1a5f24)",
      color: "#ffffff",
      padding: "2.5rem",
      borderRadius: "24px",
      boxShadow: "0 15px 30px rgba(26, 95, 36, 0.15)",
      marginBottom: "2rem",
    },
    title: {
      margin: 0,
      fontSize: "2rem",
      fontWeight: "900",
    },
    badgeContainer: {
      display: "flex",
      gap: "1rem",
      marginTop: "1rem",
      flexWrap: "wrap",
    },
    badge: {
      background: "rgba(255, 255, 255, 0.15)",
      padding: "6px 12px",
      borderRadius: "8px",
      fontSize: "0.85rem",
      fontWeight: "bold",
    },
    cardList: {
      display: "flex",
      flexDirection: "column",
      gap: "2rem",
    },
    complaintCard: {
      background: "#ffffff",
      borderRadius: "24px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      display: "grid",
      gridTemplateColumns: "1.2fr 1fr",
      minHeight: "450px",
    },
    cardContent: {
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
    },
    mapContainer: {
      height: "100%",
      width: "100%",
      position: "relative",
      backgroundColor: "#e2e8f0",
    },
    metaGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1rem",
      margin: "1.5rem 0",
      fontSize: "0.9rem",
    },
    metaLabel: {
      fontWeight: "bold",
      color: "#64748b",
      display: "block",
      marginBottom: "2px",
    },
    metaVal: {
      color: "#0f172a",
      fontWeight: "600",
    },
    actionSection: {
      borderTop: "1px solid #f1f5f9",
      paddingTop: "1.5rem",
      marginTop: "1rem",
    },
    textarea: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "10px",
      border: "2px solid #cbd5e1",
      fontSize: "0.9rem",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      resize: "vertical",
      minHeight: "60px",
      marginBottom: "0.75rem",
    },
    resendBtn: {
      width: "100%",
      background: "#dc2626",
      color: "#ffffff",
      border: "none",
      padding: "0.85rem",
      borderRadius: "10px",
      fontWeight: "800",
      fontSize: "0.95rem",
      cursor: "pointer",
      transition: "background-color 0.2s",
      boxShadow: "0 4px 6px rgba(220, 38, 38, 0.1)",
    },
    toast: {
      padding: "1rem",
      borderRadius: "12px",
      marginBottom: "1.5rem",
      fontWeight: "700",
      fontSize: "0.95rem",
      textAlign: "center",
      background: message.type === "success" ? "#dcfce7" : "#fee2e2",
      color: message.type === "success" ? "#166534" : "#991b1b",
      border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
    }
  };

  if (!manager) {
    return (
      <div style={styles.pageWrapper}>
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <h2>Access Denied</h2>
          <p>Please log in as a manager to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      {/* MANAGER BANNER CARD */}
      <div style={styles.headerCard}>
        <h1 style={styles.title}>Welcome back, {manager.name}</h1>
        <p style={{ margin: "4px 0 0", opacity: 0.9 }}>District Manager Dashboard</p>
        <div style={styles.badgeContainer}>
          <div style={styles.badge}>📍 District: {manager.district}</div>
          <div style={styles.badge}>⚠️ Escalated Grievances: {complaints.length}</div>
        </div>
      </div>

      {message.text && <div style={styles.toast}>{message.text}</div>}

      <h2 style={{ fontSize: "1.3rem", fontWeight: "800", marginBottom: "1.5rem", color: "#0f172a" }}>
        Escalated Grievances Queue
      </h2>

      {loading ? (
        <p>Loading escalated complaints...</p>
      ) : complaints.length > 0 ? (
        <div style={styles.cardList}>
          {complaints.map((c) => {
            const hasCoords = c.location?.coordinates && c.location.coordinates[0] !== 0;
            const lat = hasCoords ? c.location.coordinates[1] : 12.9716;
            const lng = hasCoords ? c.location.coordinates[0] : 77.5946;

            return (
              <div key={c._id} style={styles.complaintCard}>
                {/* Left Side: Details & Actions */}
                <div style={styles.cardContent}>
                  <div>
                    <span style={{
                      display: "inline-block",
                      background: "#fee2e2",
                      color: "#b91c1c",
                      padding: "4px 8px",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      marginBottom: "0.5rem"
                    }}>
                      ⚠️ ESCALATED
                    </span>
                    <h3 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: "900", color: "#0f172a" }}>
                      {c.title}
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#64748b", margin: 0 }}>Category: <b>{c.grievance}</b></p>
                    <p style={{ margin: "1rem 0", fontSize: "0.95rem", color: "#334155", lineHeight: 1.5 }}>
                      {c.description}
                    </p>

                    <div style={styles.metaGrid}>
                      <div>
                        <span style={styles.metaLabel}>Citizen</span>
                        <span style={styles.metaVal}>{c.user?.name || "Anonymous"}</span>
                      </div>
                      <div>
                        <span style={styles.metaLabel}>Escalated On</span>
                        <span style={styles.metaVal}>
                          {c.escalatedToManagerAt ? new Date(c.escalatedToManagerAt).toLocaleDateString() : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span style={styles.metaLabel}>District</span>
                        <span style={styles.metaVal}>{c.address?.district || "N/A"}</span>
                      </div>
                      <div>
                        <span style={styles.metaLabel}>Town/Village</span>
                        <span style={styles.metaVal}>{c.address?.town || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Warning Resend Section */}
                  <div style={styles.actionSection}>
                    <textarea
                      placeholder="Type warning/instruction message to the department here..."
                      style={styles.textarea}
                      value={warningNotes[c._id] || ""}
                      onChange={(e) => handleNoteChange(c._id, e.target.value)}
                    />
                    <button
                      style={styles.resendBtn}
                      onClick={() => handleWarnResend(c._id)}
                      disabled={actionLoading[c._id]}
                    >
                      {actionLoading[c._id] ? "Processing..." : "⚠️ Send Warning & Resend to Department"}
                    </button>
                  </div>
                </div>

                {/* Right Side: Map location */}
                <div style={styles.mapContainer}>
                  {hasCoords ? (
                    <MapContainer center={[lat, lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      <Marker position={[lat, lng]} icon={customMarkerIcon}>
                        <Popup>
                          <b>{c.title}</b><br/>{c.address?.street}
                        </Popup>
                      </Marker>
                    </MapContainer>
                  ) : (
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", color: "#64748b" }}>
                      No map coordinates supplied
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ textAlign: "center", background: "#f8fafc", padding: "4rem 2rem", borderRadius: "24px", border: "1px dashed #cbd5e1" }}>
          <span style={{ fontSize: "3rem" }}>🎉</span>
          <h3 style={{ margin: "1rem 0 4px", color: "#0f172a" }}>All Clear!</h3>
          <p style={{ color: "#64748b", margin: 0 }}>There are no escalated complaints in your district queue.</p>
        </div>
      )}
    </div>
  );
}
