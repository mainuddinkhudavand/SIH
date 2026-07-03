import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Custom red marker icon
const RedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function AdminEscalations() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMapCoords, setSelectedMapCoords] = useState(null);

  const { t } = useTranslation();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // Admin Auth Header
  const isAdmin = localStorage.getItem("isAdmin");
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${isAdmin}`
    }
  };

  const fetchEscalations = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/admin/complaints`, authHeaders);
      // Filter only complaints escalated to admin
      const escalated = res.data.filter(c => c.isEscalatedToAdmin === true);
      setComplaints(escalated);
    } catch (err) {
      console.error("Error fetching escalated complaints:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEscalations();
  }, []);

  const handleRemoveManager = async (managerId) => {
    if (!window.confirm("Are you sure you want to dismiss this manager? This will revoke their credentials immediately.")) {
      return;
    }
    try {
      await axios.put(`${BACKEND_URL}/api/admin/managers/${managerId}/remove`, {}, authHeaders);
      alert("Manager dismissed from post successfully!");
      fetchEscalations();
    } catch (err) {
      console.error("Remove Manager Error:", err);
      alert(err.response?.data?.message || "Failed to remove manager.");
    }
  };

  const styles = {
    wrapper: {
      maxWidth: "1100px",
      margin: "0 auto",
      padding: "2rem 1.5rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#1e293b",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "2rem",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "800",
      color: "#0f172a",
      margin: 0,
    },
    badge: {
      background: "#fee2e2",
      color: "#991b1b",
      padding: "6px 14px",
      borderRadius: "30px",
      fontSize: "0.85rem",
      fontWeight: "800",
      border: "1px solid #fecaca",
    },
    card: {
      background: "#ffffff",
      borderRadius: "16px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
      border: "1px solid #e2e8f0",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "2fr 1fr",
      gap: "1.5rem",
    },
    infoBlock: {
      background: "#f8fafc",
      padding: "1rem",
      borderRadius: "12px",
      border: "1px solid #f1f5f9",
      marginBottom: "10px",
    },
    label: {
      fontSize: "0.75rem",
      fontWeight: "800",
      color: "#64748b",
      textTransform: "uppercase",
      display: "block",
      marginBottom: "4px",
    },
    value: {
      fontSize: "0.95rem",
      fontWeight: "700",
      color: "#0f172a",
    },
    managerCard: {
      background: "#fff5f5",
      border: "1px solid #fee2e2",
      borderRadius: "12px",
      padding: "1rem",
      marginTop: "15px",
    },
    dismissBtn: {
      background: "#ef4444",
      color: "#ffffff",
      border: "none",
      padding: "10px 16px",
      borderRadius: "8px",
      fontWeight: "800",
      cursor: "pointer",
      marginTop: "10px",
      fontSize: "0.9rem",
      transition: "background-color 0.2s",
      width: "100%",
    },
    mapBtn: {
      background: "#0f172a",
      color: "#ffffff",
      border: "none",
      padding: "8px 12px",
      borderRadius: "8px",
      fontWeight: "700",
      cursor: "pointer",
      marginTop: "10px",
      fontSize: "0.85rem",
    },
    mapModalOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 9999,
    },
    mapModalContent: {
      background: "#ffffff",
      padding: "1.5rem",
      borderRadius: "20px",
      width: "600px",
      maxWidth: "90%",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>🚨 Escalated Complaints</h1>
          <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: "0.95rem" }}>
            Critical complaints escalated to Super Admin due to District Manager negligence.
          </p>
        </div>
        <span style={styles.badge}>{complaints.length} Escalations</span>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>Loading escalated issues...</p>
      ) : complaints.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "#ffffff", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
          <span style={{ fontSize: "2.5rem" }}>🛡️</span>
          <h3 style={{ margin: "10px 0 5px", color: "#0f172a" }}>All Clear!</h3>
          <p style={{ color: "#64748b", margin: 0 }}>No district manager escalations pending administrative action.</p>
        </div>
      ) : (
        complaints.map(c => (
          <div key={c._id} style={styles.card}>
            <div style={styles.grid}>
              {/* Left Side: Complaint details */}
              <div>
                <span style={{ ...styles.badge, background: "#fef3c7", color: "#d97706", border: "1px solid #fde68a", display: "inline-block", marginBottom: "10px" }}>
                  🚨 ESCALATED TO ADMIN
                </span>
                <h3 style={{ margin: "0 0 10px 0", fontSize: "1.4rem", fontWeight: "800" }}>{c.title}</h3>
                <p style={{ color: "#475569", fontSize: "0.95rem", lineHeight: 1.5, margin: "0 0 15px 0" }}>{c.description}</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={styles.infoBlock}>
                    <span style={styles.label}>Citizen Reporter</span>
                    <span style={styles.value}>{c.user?.name || "N/A"}</span>
                  </div>
                  <div style={styles.infoBlock}>
                    <span style={styles.label}>Contact Phone</span>
                    <span style={styles.value}>{c.user?.phone || "N/A"}</span>
                  </div>
                  <div style={styles.infoBlock}>
                    <span style={styles.label}>Target Department</span>
                    <span style={styles.value}>{c.department?.name || "Unassigned"}</span>
                  </div>
                  <div style={styles.infoBlock}>
                    <span style={styles.label}>Assigned District</span>
                    <span style={styles.value}>{c.address?.district || "N/A"}</span>
                  </div>
                </div>

                {c.location?.coordinates?.length === 2 && (
                  <button 
                    style={styles.mapBtn} 
                    onClick={() => setSelectedMapCoords({ lat: c.location.coordinates[1], lng: c.location.coordinates[0], title: c.title })}
                  >
                    📍 View Grievance GPS Location
                  </button>
                )}
              </div>

              {/* Right Side: Negligent Manager Details & Action */}
              <div style={{ borderLeft: "1px solid #e2e8f0", paddingLeft: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  <h4 style={{ margin: "0 0 10px 0", color: "#ef4444", fontWeight: "800", fontSize: "1rem" }}>Negligent Manager</h4>
                  
                  {c.escalatedManager ? (
                    <div style={styles.managerCard}>
                      <span style={{ ...styles.label, color: "#ef4444" }}>Manager Name</span>
                      <span style={styles.value}>{c.escalatedManager.name}</span>

                      <span style={{ ...styles.label, color: "#ef4444", marginTop: "8px" }}>Manager Email</span>
                      <span style={{ ...styles.value, wordBreak: "break-all" }}>{c.escalatedManager.email}</span>

                      <span style={{ ...styles.label, color: "#ef4444", marginTop: "8px" }}>Territory Jurisdiction</span>
                      <span style={styles.value}>{c.escalatedManager.district}</span>
                    </div>
                  ) : (
                    <p style={{ color: "#64748b", fontStyle: "italic", fontSize: "0.9rem" }}>No manager found for this district.</p>
                  )}
                </div>

                {c.escalatedManager && (
                  <button style={styles.dismissBtn} onClick={() => handleRemoveManager(c.escalatedManager._id)}>
                    🚫 Dismiss Manager From Post
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Map Modal */}
      {selectedMapCoords && (
        <div style={styles.mapModalOverlay} onClick={() => setSelectedMapCoords(null)}>
          <div style={styles.mapModalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 15px 0", fontSize: "1.1rem" }}>GPS Location: {selectedMapCoords.title}</h3>
            
            <div style={{ height: "350px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #cbd5e1" }}>
              <MapContainer center={[selectedMapCoords.lat, selectedMapCoords.lng]} zoom={14} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <Marker position={[selectedMapCoords.lat, selectedMapCoords.lng]} icon={RedIcon}>
                  <Popup>{selectedMapCoords.title}</Popup>
                </Marker>
              </MapContainer>
            </div>

            <button 
              style={{ ...styles.dismissBtn, background: "#475569", marginTop: "15px" }} 
              onClick={() => setSelectedMapCoords(null)}
            >
              Close Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
