import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Leaflet green marker icon configuration for Managers
const managerMarkerIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DISTRICT_PRESETS = {
  "Bangalore": { lat: 12.9716, lng: 77.5946 },
  "Mysore": { lat: 12.2958, lng: 76.6394 },
  "Mangalore": { lat: 12.9141, lng: 74.8560 },
  "Hubli-Dharwad": { lat: 15.3647, lng: 75.1240 },
  "Belagavi": { lat: 15.8497, lng: 74.4977 },
  "Udupi": { lat: 13.3409, lng: 74.7421 },
  "Shimoga": { lat: 13.9299, lng: 75.5681 },
  "Davanagere": { lat: 14.4644, lng: 75.9218 },
  "Tumkur": { lat: 13.3379, lng: 77.1006 },
  "Gulbarga": { lat: 17.3291, lng: 76.8343 },
  "Bellary": { lat: 15.1394, lng: 76.9214 },
  "Bidar": { lat: 17.9104, lng: 77.5199 },
  "Hassan": { lat: 13.0071, lng: 76.1026 },
  "Chikmagalur": { lat: 13.3161, lng: 75.7720 },
  "Mandya": { lat: 12.5218, lng: 76.8973 },
  "Kolar": { lat: 13.1362, lng: 78.1293 },
};

export default function AdminManagers() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("Bangalore");
  const [customDistrict, setCustomDistrict] = useState("");
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchManagers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/admin/managers`);
      setManagers(res.data);
    } catch (err) {
      console.error("Fetch Managers error:", err);
    } finally {
      setLoading(false);
    }
  }, [BACKEND_URL]);

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleDistrictChange = (districtName) => {
    setSelectedDistrict(districtName);
    if (districtName === "Custom") {
      setLat("");
      setLng("");
    } else {
      const coords = DISTRICT_PRESETS[districtName];
      if (coords) {
        setLat(coords.lat);
        setLng(coords.lng);
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    const finalDistrict = selectedDistrict === "Custom" ? customDistrict : selectedDistrict;
    if (!finalDistrict.trim()) {
      setMessage({ type: "error", text: "Please enter a valid district name" });
      return;
    }

    try {
      await axios.post(`${BACKEND_URL}/api/admin/managers`, {
        name,
        email,
        password,
        district: finalDistrict,
        latitude: parseFloat(lat) || 0,
        longitude: parseFloat(lng) || 0
      });

      setMessage({ type: "success", text: "District Manager created successfully!" });
      // Reset form
      setName("");
      setEmail("");
      setPassword("");
      setCustomDistrict("");
      // Refresh list
      fetchManagers();
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to create manager" 
      });
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm("Are you sure you want to remove this District Manager?")) return;
    
    try {
      await axios.delete(`${BACKEND_URL}/api/admin/managers/${id}`);
      setMessage({ type: "success", text: "Manager removed successfully." });
      fetchManagers();
    } catch (err) {
      console.error("Remove Manager error:", err);
      setMessage({ type: "error", text: "Failed to remove manager." });
    }
  };

  const styles = {
    pageWrapper: {
      maxWidth: "1200px",
      margin: "2rem auto",
      padding: "0 1.5rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#1e293b",
    },
    header: {
      fontSize: "1.8rem",
      fontWeight: "900",
      marginBottom: "2rem",
      color: "#0f172a",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "1.2fr 2fr",
      gap: "2rem",
      alignItems: "start",
    },
    card: {
      background: "#ffffff",
      padding: "2rem",
      borderRadius: "24px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      border: "1px solid #f1f5f9",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      marginBottom: "1rem",
      borderRadius: "10px",
      border: "2px solid #e2e8f0",
      fontSize: "0.95rem",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
    },
    select: {
      width: "100%",
      padding: "0.75rem",
      marginBottom: "1rem",
      borderRadius: "10px",
      border: "2px solid #e2e8f0",
      fontSize: "0.95rem",
      boxSizing: "border-box",
      backgroundColor: "#ffffff",
      cursor: "pointer",
    },
    button: {
      width: "100%",
      background: "#3b5f3a",
      color: "#ffffff",
      border: "none",
      padding: "0.75rem",
      borderRadius: "10px",
      fontWeight: "700",
      cursor: "pointer",
      fontSize: "1rem",
    },
    listItem: {
      padding: "1rem",
      borderBottom: "1px solid #f1f5f9",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    removeBtn: {
      background: "#ef4444",
      color: "#ffffff",
      border: "none",
      padding: "6px 12px",
      borderRadius: "6px",
      fontSize: "0.8rem",
      fontWeight: "bold",
      cursor: "pointer",
    },
    mapCard: {
      marginTop: "2rem",
      background: "#ffffff",
      padding: "1.5rem",
      borderRadius: "24px",
      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)",
      border: "1px solid #f1f5f9",
    },
    mapWrapper: {
      height: "450px",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid #cbd5e1",
      marginTop: "1rem",
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <h1 style={styles.header}>Manage District Managers</h1>

      {message.text && (
        <div style={{ 
          padding: "1rem", 
          borderRadius: "12px", 
          marginBottom: "1.5rem",
          background: message.type === "success" ? "#dcfce7" : "#fee2e2",
          color: message.type === "success" ? "#166534" : "#991b1b",
          border: `1px solid ${message.type === "success" ? "#bbf7d0" : "#fecaca"}`,
          fontWeight: "600"
        }}>
          {message.text}
        </div>
      )}

      <div style={styles.grid}>
        {/* CREATE MANAGER FORM */}
        <div style={styles.card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", fontWeight: "800", marginBottom: "1.2rem" }}>
            Add New District Manager
          </h2>
          <form onSubmit={handleCreate}>
            <input 
              style={styles.input} 
              placeholder="Manager Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
            <input 
              style={styles.input} 
              type="email" 
              placeholder="Login Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
            <input 
              style={styles.input} 
              type="password" 
              placeholder="Initial Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
              autoComplete="new-password"
            />

            {/* District Selection Preset */}
            <label style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#64748b", display: "block", marginBottom: "4px" }}>
              District Jurisdiction
            </label>
            <select
              style={styles.select}
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
            >
              {Object.keys(DISTRICT_PRESETS).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
              <option value="Custom">Other (Custom Coordinates)</option>
            </select>

            {selectedDistrict === "Custom" && (
              <input
                style={styles.input}
                placeholder="District Name"
                value={customDistrict}
                onChange={(e) => setCustomDistrict(e.target.value)}
                required
              />
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b" }}>Latitude</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.000001"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#64748b" }}>Longitude</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.000001"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" style={styles.button}>Create Manager Account</button>
          </form>
        </div>

        {/* LIST EXISTING MANAGERS */}
        <div style={styles.card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", fontWeight: "800", marginBottom: "1.2rem" }}>
            Active District Managers
          </h2>
          {loading ? (
            <p>Loading managers...</p>
          ) : managers.length > 0 ? (
            <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
              {managers.map((m) => (
                <div key={m._id} style={styles.listItem}>
                  <div>
                    <div style={{ fontWeight: "800", color: "#0f172a" }}>{m.name}</div>
                    <div style={{ fontSize: "0.85rem", color: "#64748b" }}>📧 {m.email}</div>
                    <div style={{ fontSize: "0.85rem", color: "#1a5f24", fontWeight: "600" }}>
                      📍 District: <b>{m.district}</b>
                    </div>
                  </div>
                  <button onClick={() => handleRemove(m._id)} style={styles.removeBtn}>
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No managers created yet.</p>
          )}
        </div>
      </div>

      {/* TERRITORY MAP */}
      <div style={styles.mapCard}>
        <h2 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "800" }}>
          Manager Jurisdiction Map (Territory Map)
        </h2>
        <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
          Displays positions of active managers and their respective districts
        </p>

        <div style={styles.mapWrapper}>
          <MapContainer center={[15.0, 76.0]} zoom={7} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {managers.map((m) => {
              return (
                <Marker key={m._id} position={[m.latitude || 12.9716, m.longitude || 77.5946]} icon={managerMarkerIcon}>
                  <Popup>
                    <div style={{ fontFamily: "sans-serif" }}>
                      <h4 style={{ margin: "0 0 4px", color: "#1a5f24" }}>{m.name}</h4>
                      <p style={{ margin: "2px 0" }}>District: <b>{m.district}</b></p>
                      <p style={{ margin: "2px 0", fontSize: "0.75rem", color: "#64748b" }}>Email: {m.email}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}
