import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getMediaUrl } from "../../utils/url";

// ✅ Custom red marker icon to fix Leaflet marker visibility issue in React
const RedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function DepartmentDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [workers, setWorkers] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [visibleMapId, setVisibleMapId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); 

  const token = localStorage.getItem("departmentToken");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"; 

  const fetchMyComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/department/my-complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // We still need to fetch workers here so we can populate the "Delegate to Worker" dropdown!
  const fetchWorkers = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/department/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(res.data || []);
    } catch (err) {
      console.error("Worker Fetch Error:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchMyComplaints();
    fetchWorkers();
  }, [fetchMyComplaints, fetchWorkers]);

  const assignTaskToWorker = async (complaintId, workerId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/department/complaints/${complaintId}/assign`, 
        { workerId }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyComplaints();
    } catch (err) {
      alert("Failed to assign worker.");
    }
  };

  const verifyWorkerWork = async (complaintId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/department/complaints/${complaintId}/verify`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchMyComplaints();
    } catch (err) {
      alert("Failed to verify completion.");
    }
  };

  const styles = {
    pageWrapper: { maxWidth: "1400px", margin: "2rem auto", padding: "0 1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1e293b" },
    headerCard: { background: "linear-gradient(135deg, #3b5f3a 0%, #0f172a 100%)", color: "white", padding: "2rem", borderRadius: "20px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" },
    tableContainer: { background: "#ffffff", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", overflow: "hidden", border: "1px solid #f1f5f9" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { background: "#f8fafc", padding: "1.25rem 1.5rem", fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: "left" },
    td: { padding: "1.5rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.95rem", verticalAlign: "top" },
    badge: (status) => ({ background: status === "Completed" ? "#dcfce7" : "#fefce8", color: status === "Completed" ? "#166534" : "#854d0e", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", display: "inline-block" }),
    btnBlue: { background: "#3b5f3a", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem" },
    btnGreen: { background: "#16a34a", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "700", fontSize: "0.85rem", marginTop: "0.5rem", width: "100%" },
    evidenceThumb: { width: "120px", height: "80px", borderRadius: "10px", objectFit: "cover", cursor: "pointer", border: "2px solid #e2e8f0", marginTop: "10px", display: "block" },
    modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" },
    formInput: { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "10px" }
  };

  return (
    <div style={styles.pageWrapper}>
      
      {/* 🚀 IMAGE LIGHTBOX */}
      {selectedImage && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <div style={{ textAlign: "center" }}>
            <img 
              src={selectedImage} 
              alt="Full Evidence" 
              style={{ maxWidth: "100%", maxHeight: "85vh", borderRadius: "12px", border: "4px solid white" }} 
            />
            <p style={{ color: "white", marginTop: "15px", fontWeight: "bold" }}>Click anywhere to close</p>
          </div>
        </div>
      )}

      <div style={styles.headerCard}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "900" }}>Department Portal</h1>
          <p style={{ margin: "0.5rem 0 0 0", color: "#94a3b8" }}>Manage assigned tasks and verify field resolutions.</p>
        </div>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            style={{ ...styles.btnBlue, background: "#3b5f3a" }} 
            onClick={() => navigate("/department/workers")}
          >
            ⚙️ Manage Field Workers
          </button>
          <button style={styles.btnBlue} onClick={() => { fetchMyComplaints(); fetchWorkers(); }}>
            🔄 Refresh
          </button>
        </div>
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "4rem" }}>Loading tasks...</div>
        ) : complaints.length === 0 ? (
          <div style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
            🎉 No active tasks assigned to your department right now!
          </div>
        ) : (
          <table className="responsive-table" style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Issue Details & Citizen Evidence</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Worker Proof</th>
                <th style={styles.th}>Assignment & Verification</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id}>
                  <td data-label="Issue" style={styles.td}>
                    <strong style={{ color: "#3b5f3a", fontSize: "1.05rem" }}>{c.title}</strong>
                    <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "4px" }}>
                      📅 Filed: {new Date(c.createdAt).toLocaleDateString()} <br/>
                      👤 Citizen: {c.user?.name}
                    </div>

                    {c.imageUrl ? (
                      <div style={{ marginTop: "12px" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#64748b" }}>📸 CITIZEN EVIDENCE:</span>
                        <img 
                          src={getMediaUrl(c.imageUrl)} 
                          alt="Evidence" 
                          style={styles.evidenceThumb}
                          onClick={() => setSelectedImage(getMediaUrl(c.imageUrl))}
                          title="Click to view full image"
                        />
                      </div>
                    ) : (
                      <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>No photo provided.</div>
                    )}

                    <p style={{ fontSize: "0.9rem", color: "#334155", marginTop: "10px" }}>{c.description}</p>
                  </td>

                  <td data-label="Location" style={styles.td}>
                    <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", fontSize: "0.85rem", marginBottom: "8px" }}>
                      📍 {c.address?.street}, {c.address?.town}
                    </div>

                    {c.location?.coordinates?.length === 2 && (
                      <>
                        <button 
                          style={styles.btnBlue} 
                          onClick={() => setVisibleMapId(visibleMapId === c._id ? null : c._id)}
                        >
                          {visibleMapId === c._id ? "Hide Map" : "View Map"}
                        </button>
                        
                        {visibleMapId === c._id && (
                          <div style={{ marginTop: "10px", height: "200px", borderRadius: "12px", overflow: "hidden" }}>
                            <MapContainer center={[c.location.coordinates[1], c.location.coordinates[0]]} zoom={15} style={{ height: "100%", width: "100%" }}>
                              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                              <Marker position={[c.location.coordinates[1], c.location.coordinates[0]]} icon={RedIcon}>
                                <Popup>{c.address?.street}</Popup>
                              </Marker>
                            </MapContainer>
                          </div>
                        )}
                      </>
                    )}
                  </td>

                  <td data-label="Worker Proof" style={styles.td}>
                    {c.status === "Completed" && c.resolutionImageUrl ? (
                      <div style={{ background: "#f0fdf4", padding: "10px", borderRadius: "12px", border: "1px solid #bbfcbd" }}>
                        <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#166534" }}>✅ RESOLUTION PHOTO:</span>
                        <img 
                          src={`${BACKEND_URL}${c.resolutionImageUrl}`} 
                          alt="Resolution Proof" 
                          style={styles.evidenceThumb} 
                          onClick={() => setSelectedImage(`${BACKEND_URL}${c.resolutionImageUrl}`)} 
                        />
                        <p style={{ fontSize: "0.8rem", color: "#166534", marginTop: "8px", fontStyle: "italic" }}>
                          "{c.workerMessage}"
                        </p>
                      </div>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                         {c.worker ? "Awaiting worker completion..." : "Not assigned yet."}
                      </span>
                    )}
                  </td>

                  <td data-label="Assignment" style={styles.td}>
                    <div style={styles.badge(c.status)}>{c.status}</div>

                    {c.status !== "Completed" && (
                      <div style={{ marginTop: "15px" }}>
                        <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569" }}>Delegate to Worker:</label>
                        <select 
                          style={{ ...styles.formInput, marginTop: "5px" }}
                          value={c.worker || ""}
                          onChange={(e) => assignTaskToWorker(c._id, e.target.value)}
                        >
                          <option value="" disabled>Select a field worker...</option>
                          {workers.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                        </select>
                      </div>
                    )}

                    {c.status === "Completed" && !c.isDepartmentConfirmed && (
                      <div style={{ marginTop: "15px" }}>
                        <button style={styles.btnGreen} onClick={() => verifyWorkerWork(c._id)}>
                          ✅ Verify & Approve Work
                        </button>
                        <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "5px", lineHeight: "1.4" }}>
                          Confirming this forwards the resolution to the Admin.
                        </p>
                      </div>
                    )}

                    {c.status === "Completed" && c.isDepartmentConfirmed && (
                      <div style={{ marginTop: "15px", color: "#16a34a", fontWeight: "800", fontSize: "0.85rem" }}>
                        ✓ Verified by Department
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}  
      </div>
    </div>
  );
}