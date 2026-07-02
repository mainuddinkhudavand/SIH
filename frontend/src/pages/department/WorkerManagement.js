import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function WorkerManagement() {
  const [workers, setWorkers] = useState([]);
  const [complaints, setComplaints] = useState([]); // 🚀 NEW: Needed to calculate stats
  const [loading, setLoading] = useState(true);
  
  const [newWorker, setNewWorker] = useState({ name: "", email: "", password: "", phone: "" });
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // 🚀 NEW: State to trigger the stats modal
  const [selectedWorker, setSelectedWorker] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("departmentToken");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // Fetch existing workers
  const fetchWorkers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/department/workers`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWorkers(res.data || []);
    } catch (err) {
      console.error("Worker Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // 🚀 NEW: Fetch complaints to calculate worker statistics
  const fetchMyComplaints = useCallback(async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/department/my-complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error("Complaints Fetch Error:", err);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/department/login");
      return;
    }
    fetchWorkers();
    fetchMyComplaints(); // Load complaints in the background for stats
  }, [fetchWorkers, fetchMyComplaints, token, navigate]);

  // Handle Form Submission
  const handleCreateWorker = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await axios.post(`${BACKEND_URL}/api/department/workers`, newWorker, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: "success", text: "✅ Worker created successfully!" });
      setNewWorker({ name: "", email: "", password: "", phone: "" }); 
      fetchWorkers(); 
    } catch (err) {
      setMessage({ type: "error", text: "❌ " + (err.response?.data?.message || "Error creating worker.") });
    }
  };

  // 🚀 NEW: Calculate Worker Statistics dynamically
  const getWorkerStats = (workerId) => {
    const assignedComplaints = complaints.filter(c => {
      const cWorkerId = typeof c.worker === 'object' ? c.worker?._id : c.worker;
      return cWorkerId === workerId;
    });

    const totalAssigned = assignedComplaints.length;
    const totalCompleted = assignedComplaints.filter(c => c.status === "Completed").length;
    const completionRate = totalAssigned === 0 ? 0 : Math.round((totalCompleted / totalAssigned) * 100);

    let totalRating = 0;
    let ratingCount = 0;

    assignedComplaints.forEach(c => {
      if (c.feedbacks && c.feedbacks.length > 0) {
        c.feedbacks.forEach(f => {
          totalRating += f.rating;
          ratingCount += 1;
        });
      }
    });

    const meanRating = ratingCount === 0 ? 0 : (totalRating / ratingCount).toFixed(1);

    return { totalAssigned, totalCompleted, completionRate, meanRating, ratingCount };
  };

  const styles = {
    pageWrapper: { maxWidth: "1200px", margin: "2rem auto", padding: "0 1.5rem", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1e293b" },
    headerCard: { background: "linear-gradient(135deg, #1e293b 0%, #3b5f3a 100%)", color: "white", padding: "2rem", borderRadius: "20px", marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" },
    gridContainer: { display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem", alignItems: "start" },
    card: { background: "#ffffff", borderRadius: "20px", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", padding: "2rem", border: "1px solid #f1f5f9" },
    formInput: { width: "100%", padding: "0.75rem", borderRadius: "10px", border: "2px solid #e2e8f0", marginBottom: "1rem", fontSize: "0.9rem", boxSizing: "border-box" },
    btnBlue: { background: "#3b5f3a", color: "#fff", border: "none", borderRadius: "10px", padding: "0.75rem 1.5rem", cursor: "pointer", fontWeight: "800", fontSize: "0.95rem", width: "100%", transition: "0.2s" },
    btnBack: { background: "#475569", color: "#fff", border: "none", borderRadius: "8px", padding: "0.5rem 1rem", cursor: "pointer", fontWeight: "700" },
    table: { width: "100%", borderCollapse: "collapse", marginTop: "1rem" },
    th: { background: "#f8fafc", padding: "1rem", fontSize: "0.8rem", fontWeight: "800", textTransform: "uppercase", color: "#64748b", borderBottom: "1px solid #e2e8f0", textAlign: "left" },
    td: { padding: "1rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.95rem" },
    msgBox: (type) => ({ padding: "10px", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem", fontWeight: "bold", background: type === "success" ? "#dcfce7" : "#fee2e2", color: type === "success" ? "#166534" : "#b91c1c" }),
    
    // 🚀 NEW: Hover Row & Modal Styles
    workerRow: { cursor: "pointer", transition: "background 0.2s" },
    modalOverlay: { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, padding: "20px" },
    statsModal: { background: "#fff", padding: "2.5rem", borderRadius: "16px", width: "100%", maxWidth: "500px", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" },
    statBoxRow: { display: "flex", gap: "15px", marginTop: "20px", marginBottom: "25px" },
    statBox: { flex: 1, background: "#f8fafc", padding: "20px 15px", borderRadius: "12px", textAlign: "center", border: "1px solid #e2e8f0" },
    progressBarContainer: { width: "100%", background: "#e2e8f0", borderRadius: "10px", height: "14px", marginTop: "10px", overflow: "hidden" },
    progressBarFill: (percentage) => ({ height: "100%", width: `${percentage}%`, background: percentage > 50 ? "#16a34a" : "#f59e0b", transition: "width 0.5s ease-in-out" })
  };

  return (
    <div style={styles.pageWrapper}>

      {/* 🚀 WORKER STATS MODAL */}
      {selectedWorker && (
        <div style={styles.modalOverlay} onClick={(e) => { if(e.target === e.currentTarget) setSelectedWorker(null) }}>
          <div style={styles.statsModal}>
            <button 
              style={{ position: "absolute", top: "15px", right: "20px", background: "none", border: "none", fontSize: "1.8rem", cursor: "pointer", color: "#94a3b8" }} 
              onClick={() => setSelectedWorker(null)}
            >
              ×
            </button>
            
            <h2 style={{ margin: "0 0 5px 0", color: "#0f172a", fontSize: "1.8rem" }}>👷 {selectedWorker.name}</h2>
            <p style={{ color: "#64748b", margin: 0, fontSize: "0.95rem" }}>{selectedWorker.email} | {selectedWorker.phone}</p>
            
            <div style={styles.statBoxRow}>
              <div style={styles.statBox}>
                <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#3b5f3a", lineHeight: "1" }}>{getWorkerStats(selectedWorker._id).meanRating}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#64748b", marginTop: "8px" }}>⭐ MEAN RATING</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "4px" }}>From {getWorkerStats(selectedWorker._id).ratingCount} reviews</div>
              </div>
              <div style={styles.statBox}>
                <div style={{ fontSize: "2.5rem", fontWeight: "900", color: "#16a34a", lineHeight: "1" }}>{getWorkerStats(selectedWorker._id).totalCompleted}</div>
                <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#64748b", marginTop: "8px" }}>✅ TASKS COMPLETED</div>
              </div>
            </div>

            <div style={{ background: "#f1f5f9", padding: "1.5rem", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              <h4 style={{ margin: "0 0 10px 0", color: "#334155", fontSize: "1rem" }}>Task Completion Rate</h4>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", fontWeight: "800", color: "#475569" }}>
                <span>{getWorkerStats(selectedWorker._id).totalAssigned} Assigned</span>
                <span style={{ color: getWorkerStats(selectedWorker._id).completionRate > 50 ? "#16a34a" : "#d97706" }}>
                  {getWorkerStats(selectedWorker._id).completionRate}% Done
                </span>
              </div>
              <div style={styles.progressBarContainer}>
                <div style={styles.progressBarFill(getWorkerStats(selectedWorker._id).completionRate)}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div style={styles.headerCard}>
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "900" }}>👷 Manage Field Workers</h1>
          <p style={{ margin: "0.5rem 0 0 0", color: "#cbd5e1" }}>Create accounts and view performance analytics.</p>
        </div>
        <button style={styles.btnBack} onClick={() => navigate("/department/dashboard")}>
          ⬅ Back to Dashboard
        </button>
      </div>

      <div style={styles.gridContainer}>
        {/* LEFT COLUMN: Create Form */}
        <div style={styles.card}>
          <h3 style={{ marginTop: 0, marginBottom: "1.5rem", fontSize: "1.2rem", color: "#0f172a" }}>➕ Add New Worker</h3>
          
          {message.text && <div style={styles.msgBox(message.type)}>{message.text}</div>}

          <form onSubmit={handleCreateWorker}>
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>Full Name</label>
            <input type="text" style={styles.formInput} required value={newWorker.name} onChange={e => setNewWorker({...newWorker, name: e.target.value})} placeholder="e.g., John Doe" />
            
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>Email Address (Used for Login)</label>
            <input type="email" style={styles.formInput} required value={newWorker.email} onChange={e => setNewWorker({...newWorker, email: e.target.value})} placeholder="john@department.com" />
            
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>Phone Number</label>
            <input type="text" style={styles.formInput} required value={newWorker.phone} onChange={e => setNewWorker({...newWorker, phone: e.target.value})} placeholder="10-digit number" />
            
            <label style={{ fontSize: "0.8rem", fontWeight: "700", color: "#64748b" }}>Temporary Password</label>
            <input type="password" style={styles.formInput} required value={newWorker.password} onChange={e => setNewWorker({...newWorker, password: e.target.value})} placeholder="Assign a secure password" />
            
            <button type="submit" style={styles.btnBlue}>Create Worker Account</button>
          </form>
        </div>

        {/* RIGHT COLUMN: Workers List */}
        <div style={{ ...styles.card, padding: "1rem 0 0 0", overflow: "hidden" }}>
          <h3 style={{ margin: "0 0 0 1.5rem", fontSize: "1.2rem", color: "#0f172a" }}>📋 Current Workforce</h3>
          <p style={{ margin: "5px 0 15px 1.5rem", fontSize: "0.85rem", color: "#64748b" }}>Click on any worker to view their performance stats.</p>
          
          {loading ? (
            <p style={{ padding: "2rem", textAlign: "center", color: "#64748b" }}>Loading workers...</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Worker Details</th>
                  <th style={styles.th}>Contact Information</th>
                  <th style={styles.th}>Account Created</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(w => (
                  <tr 
                    key={w._id} 
                    style={styles.workerRow}
                    onClick={() => setSelectedWorker(w)} 
                    onMouseOver={(e) => e.currentTarget.style.background = "#f8fafc"}
                    onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
                    title="Click to view analytics"
                  >
                    <td style={{ ...styles.td, fontWeight: "bold", color: "#0f172a" }}>👷 {w.name}</td>
                    <td style={styles.td}>
                      <div style={{ color: "#334155" }}>{w.email}</div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px" }}>📞 {w.phone}</div>
                    </td>
                    <td style={styles.td}>
                      {new Date(w.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {workers.length === 0 && (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
                      No field workers have been added yet.<br/>Use the form on the left to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}