import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

export default function AdminDepartments() {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/admin/departments`);
      setDepartments(res.data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    try {
      await axios.post(`${BACKEND_URL}/api/admin/departments`, {
        name,
        email,
        password,
        description
      });
      
      setMessage({ type: "success", text: "Department created successfully!" });
      // Clear form
      setName("");
      setEmail("");
      setPassword("");
      setDescription("");
      // Refresh the list
      fetchDepartments();
    } catch (err) {
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "Failed to create department" 
      });
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
      gridTemplateColumns: "1fr 2fr",
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
      flexDirection: "column",
      gap: "4px"
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <h1 style={styles.header}> Manage Departments</h1>
      
      <div className="responsive-grid-container" style={styles.grid}>
        {/* CREATE DEPARTMENT FORM */}
        <div style={styles.card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", fontWeight: "800" }}>Add New Department</h2>
          
          {message.text && (
            <div style={{ 
              padding: "0.75rem", 
              borderRadius: "8px", 
              marginBottom: "1rem",
              background: message.type === "success" ? "#dcfce7" : "#fee2e2",
              color: message.type === "success" ? "#166534" : "#991b1b",
              fontSize: "0.9rem",
              fontWeight: "600"
            }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <input 
              style={styles.input} 
              placeholder="Department Name (e.g., Water Board)" 
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
            />
            <textarea 
              style={{...styles.input, resize: "vertical", minHeight: "80px"}} 
              placeholder="Description (Optional)" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
            />
            <button type="submit" style={styles.button}>Create Department</button>
          </form>
        </div>

        {/* LIST EXISTING DEPARTMENTS */}
        <div style={styles.card}>
          <h2 style={{ marginTop: 0, fontSize: "1.2rem", fontWeight: "800" }}>Active Departments</h2>
          {loading ? (
            <p>Loading departments...</p>
          ) : departments.length > 0 ? (
            <div style={{ background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
              {departments.map((dept) => (
                <div key={dept._id} style={styles.listItem}>
                  <div style={{ fontWeight: "800", color: "#0f172a" }}>{dept.name}</div>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>📧 {dept.email}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>ID: {dept._id}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "#64748b" }}>No departments created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}