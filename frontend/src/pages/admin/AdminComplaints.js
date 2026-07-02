import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function AdminComplaints() {
  const { t } = useTranslation();

  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [visibleMapId, setVisibleMapId] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); 
  
  const year = new Date().getFullYear();
  const BACKEND_URL = "http://localhost:5000"; 

  // Ensure Admin Token is passed
  const token = localStorage.getItem("token"); 
  const authHeaders = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/admin/complaints?year=${year}`, authHeaders);
      setComplaints(res.data.complaints || res.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  }, [year, token]);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/admin/departments`, authHeaders);
      setDepartments(res.data);
    } catch (err) {
      console.error("Department Fetch Error:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchComplaints();
    fetchDepartments();
  }, [fetchComplaints, fetchDepartments]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/complaints/${id}`, { status }, authHeaders);
      fetchComplaints();
    } catch (err) {
      console.error("Update Error:", err);
    }
  };

  const assignDepartment = async (id, departmentId) => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/complaints/${id}/assign`, { departmentId }, authHeaders);
      fetchComplaints();
    } catch (err) {
      console.error("Assign Error:", err);
    }
  };

  const confirmCompletion = async (id) => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/complaints/${id}/confirm`, {}, authHeaders);
      fetchComplaints(); 
    } catch (err) {
      console.error("Confirm Error:", err);
      alert("Failed to confirm completion. Check backend console.");
    }
  };

  const toggleExpand = (id) => setExpandedId(expandedId === id ? null : id);

  const styles = {
    pageWrapper: { maxWidth: "1600px", margin: "2rem auto", padding: "0 1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1e293b" },
    headerSection: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", padding: "1.5rem 2.5rem", borderRadius: "24px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", border: "1px solid #ffffff" },
    refreshBtn: { background: "#3b5f3a", color: "#ffffff", border: "none", padding: "0.75rem 1.5rem", borderRadius: "12px", fontWeight: "700", cursor: "pointer" },
    tableContainer: { background: "#ffffff", borderRadius: "24px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.04)", overflow: "hidden", border: "1px solid #f1f5f9" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { background: "#f8fafc", padding: "1.25rem 1.5rem", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: "left" },
    td: { padding: "1.5rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.95rem", verticalAlign: "top" },
    statusSelect: { width: "100%", padding: "0.65rem", borderRadius: "10px", border: "2px solid #e2e8f0", background: "#fff", fontSize: "0.85rem", fontWeight: "700" },
    badge: (status) => ({ background: status === "Completed" ? "#dcfce7" : "#fff7ed", color: status === "Completed" ? "#166534" : "#c2410c", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", display: "inline-block", marginBottom: "8px" }),
    evidenceThumb: { width: "100px", height: "70px", borderRadius: "10px", objectFit: "cover", cursor: "pointer", border: "2px solid #e2e8f0", marginTop: "10px", transition: "0.2s" },
    modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000 }
  };

  return (
    <div style={styles.pageWrapper}>
      {selectedImage && (
        <div style={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Evidence" style={{ maxWidth: "90%", maxHeight: "80vh", borderRadius: "15px", border: "5px solid white" }} />
          <p style={{ position: "absolute", bottom: "20px", color: "white", fontWeight: "bold" }}>Click anywhere to close</p>
        </div>
      )}

      <div style={styles.headerSection}>
        <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: "900", color: "#0f172a" }}>Super Admin Dashboard</h1>
        <button style={styles.refreshBtn} onClick={fetchComplaints}>🔄 Refresh</button>
      </div>

      <div style={styles.tableContainer}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "6rem 2rem", fontWeight: "bold", color: "#64748b" }}>Loading system records...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Issue Details & Evidence</th>
                  <th style={styles.th}>Location</th>
                  <th style={styles.th}>Worker Resolution</th>
                  <th style={styles.th}>Admin Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length > 0 ? (
                  complaints.map((c) => (
                    <tr key={c._id}>
                      {/* COLUMN 1: Initial Evidence */}
                      <td style={{ ...styles.td, maxWidth: "300px" }}>
                        <div style={{ fontWeight: "800", color: "#0f172a" }}>{c.title}</div>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "4px" }}>👤 {c.user?.name} | 📅 {new Date(c.createdAt).toLocaleDateString()}</div>
                        
                        {c.imageUrl ? (
                          <div style={{ margin: "10px 0" }}>
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "800" }}>CITIZEN PHOTO:</span><br/>
                            <img src={`${BACKEND_URL}${c.imageUrl}`} alt="Captured" style={styles.evidenceThumb} onClick={() => setSelectedImage(`${BACKEND_URL}${c.imageUrl}`)} />
                          </div>
                        ) : (
                          <div style={{ marginTop: "10px", fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }}>No photo evidence.</div>
                        )}
                        <p style={{ fontSize: "0.85rem", color: "#475569" }}>{c.description}</p>
                      </td>

                      {/* COLUMN 2: Location */}
                      <td style={styles.td}>
                        <div style={{ background: "#f1f5f9", padding: "8px 12px", borderRadius: "12px", fontSize: "0.85rem", marginBottom: "8px" }}>
                          📍 {c.address ? `${c.address.street}, ${c.address.town}` : "N/A"}
                        </div>
                        {c.location?.coordinates && (
                          <button style={{ background: "#3b5f3a", color: "#fff", border: "none", borderRadius: "8px", padding: "0.4rem 0.8rem", cursor: "pointer", fontSize: "0.8rem", fontWeight: "700" }} onClick={() => setVisibleMapId(visibleMapId === c._id ? null : c._id)}>
                            {visibleMapId === c._id ? "Hide Map" : "View Map"}
                          </button>
                        )}
                        {visibleMapId === c._id && c.location?.coordinates && (
                           <div style={{ marginTop: "10px", height: "150px", borderRadius: "12px", overflow: "hidden" }}>
                              <MapContainer center={[c.location.coordinates[1], c.location.coordinates[0]]} zoom={15} style={{ height: "100%", width: "100%" }}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[c.location.coordinates[1], c.location.coordinates[0]]} />
                              </MapContainer>
                           </div>
                        )}
                      </td>

                      {/* 🚀 COLUMN 3: Worker's Resolution Proof */}
                      <td style={{ ...styles.td, minWidth: "200px" }}>
                        {c.status === "Completed" && c.resolutionImageUrl ? (
                          <div style={{ background: "#f0fdf4", padding: "10px", borderRadius: "12px", border: "1px solid #bbfcbd" }}>
                            <span style={{ fontSize: "0.7rem", fontWeight: "800", color: "#166534" }}>WORKER PROOF:</span><br/>
                            <img src={`${BACKEND_URL}${c.resolutionImageUrl}`} alt="Resolution" style={styles.evidenceThumb} onClick={() => setSelectedImage(`${BACKEND_URL}${c.resolutionImageUrl}`)} />
                            <p style={{ fontSize: "0.8rem", color: "#166534", marginTop: "8px", fontStyle: "italic" }}>"{c.workerMessage}"</p>
                            
                            {/* Department Verification Badge */}
                            {c.isDepartmentConfirmed ? (
                              <div style={{ background: "#166534", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "bold", marginTop: "8px", textAlign: "center" }}>
                                ✓ Verified by Dept
                              </div>
                            ) : (
                              <div style={{ background: "#fef08a", color: "#854d0e", padding: "4px 8px", borderRadius: "6px", fontSize: "0.7rem", fontWeight: "bold", marginTop: "8px", textAlign: "center" }}>
                                ⏳ Pending Dept Verification
                              </div>
                            )}
                          </div>
                        ) : (
                          <span style={{ color: "#cbd5e1", fontStyle: "italic", fontSize: "0.85rem" }}>Work not completed yet.</span>
                        )}
                      </td>

                      {/* 🚀 COLUMN 4: Admin Actions */}
                      <td style={{ ...styles.td, minWidth: "220px" }}>
                        <div style={styles.badge(c.status)}>{c.status}</div>

                        {/* Status Assignment */}
                        <select style={styles.statusSelect} value={c.status} onChange={(e) => updateStatus(c._id, e.target.value)}>
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                          <option value="Assigned">Assigned</option>
                          <option value="Completed">Completed</option>
                        </select>

                        {/* Department Assignment */}
                        {c.status === "Accepted" && (
                          <select style={{ ...styles.statusSelect, marginTop: "8px" }} onChange={(e) => assignDepartment(c._id, e.target.value)} defaultValue="">
                            <option value="" disabled>Assign Department</option>
                            {departments.map((dept) => <option key={dept._id} value={dept._id}>{dept.name}</option>)}
                          </select>
                        )}

                        {(c.status === "Assigned" || c.status === "Completed") && c.department && (
                          <div style={{ marginTop: "8px", fontSize: "0.8rem", color: "#475569", fontWeight: "700" }}> Dept: {c.department.name}</div>
                        )}

                        {/* FINAL ADMIN CONFIRMATION */}
                        {c.status === "Completed" && (
                          <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "2px dashed #e2e8f0" }}>
                            {!c.isAdminConfirmed ? (
                              <button 
                                style={{ background: c.isDepartmentConfirmed ? "#3b5f3a" : "#cbd5e1", color: "#fff", border: "none", borderRadius: "8px", padding: "0.6rem 1rem", cursor: c.isDepartmentConfirmed ? "pointer" : "not-allowed", fontSize: "0.85rem", fontWeight: "800", width: "100%" }} 
                                onClick={() => confirmCompletion(c._id)}
                                disabled={!c.isDepartmentConfirmed}
                              >
                                {c.isDepartmentConfirmed ? " Final Confirm & Close" : "Waiting for Dept"}
                              </button>
                            ) : (
                              <div style={{ background: "#0f172a", color: "white", padding: "10px", borderRadius: "8px", textAlign: "center", fontWeight: "800", fontSize: "0.85rem" }}>
                                🔒 Officially Closed
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} style={{ textAlign: "center", padding: "5rem", color: "#94a3b8" }}>No complaints found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}