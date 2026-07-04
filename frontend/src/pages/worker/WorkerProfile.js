import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function WorkerProfile() {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const token = localStorage.getItem("workerToken");

  const fetchProfile = async () => {
    if (!token) {
      setError("Worker not authenticated.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}/api/worker/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setWorker(data);
      setEditName(data.name || "");
      setEditEmail(data.email || "");
      setEditPhone(data.phone || "");
    } catch (err) {
      console.error("Error fetching worker profile:", err);
      setError("Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [BACKEND_URL, token]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setToastMessage("");
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const res = await axios.put(`${BACKEND_URL}/api/worker/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      // Fetch latest profile to sync stats and updated image
      await fetchProfile();
      setToastMessage("Profile picture updated successfully!");
    } catch (err) {
      console.error("Image Upload Error:", err);
      setToastMessage(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setToastMessage("");
    try {
      await axios.put(
        `${BACKEND_URL}/api/worker/profile`,
        { name: editName, email: editEmail, phone: editPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchProfile();
      setIsEditing(false);
      setToastMessage("Profile details updated successfully!");
    } catch (err) {
      console.error("Profile Update Error:", err);
      setToastMessage(err.response?.data?.message || "Failed to update profile.");
    }
  };

  const styles = {
    pageWrapper: {
      maxWidth: "850px",
      margin: "3rem auto",
      padding: "0 1.5rem",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: "#1e293b",
    },
    card: {
      background: "#ffffff",
      borderRadius: "24px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05)",
      overflow: "hidden",
      marginBottom: "2rem"
    },
    headerBg: {
      background: "linear-gradient(135deg, #1a5f24, #2e7d32)",
      color: "#ffffff",
      padding: "3rem 2.5rem",
      textAlign: "center",
      position: "relative",
    },
    avatarWrapper: {
      position: "relative",
      width: "90px",
      height: "90px",
      margin: "0 auto 1rem",
      cursor: "pointer",
    },
    avatar: {
      width: "100%",
      height: "100%",
      borderRadius: "50%",
      backgroundColor: "#ffffff",
      color: "#1a5f24",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "2.5rem",
      fontWeight: "bold",
      boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
      overflow: "hidden",
    },
    cameraIconOverlay: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: "#1b5e20",
      color: "white",
      borderRadius: "50%",
      width: "28px",
      height: "28px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "0.85rem",
      border: "2px solid white",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
    },
    userName: {
      margin: 0,
      fontSize: "1.8rem",
      fontWeight: "800",
    },
    deptLabel: {
      margin: "4px 0 0",
      fontSize: "0.95rem",
      opacity: 0.9,
      fontWeight: "600"
    },
    badge: {
      background: "#e8f5e9",
      color: "#2e7d32",
      padding: "6px 14px",
      borderRadius: "30px",
      fontSize: "0.8rem",
      fontWeight: "800",
      display: "inline-block",
      marginTop: "12px",
      border: "1px solid #c8e6c9"
    },
    bodyContent: {
      padding: "2.5rem",
    },
    sectionHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: "2px solid #f1f5f9",
      paddingBottom: "8px",
      marginBottom: "1.25rem",
    },
    sectionTitle: {
      fontSize: "1.1rem",
      fontWeight: "800",
      margin: 0,
      color: "#0f172a",
    },
    editBtn: {
      background: "#2e7d32",
      color: "#ffffff",
      border: "none",
      padding: "6px 14px",
      borderRadius: "8px",
      fontSize: "0.85rem",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.2s",
    },
    infoGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
    infoBlock: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontSize: "0.8rem",
      fontWeight: "bold",
      color: "#64748b",
      textTransform: "uppercase",
      marginBottom: "4px",
    },
    value: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#0f172a",
    },
    input: {
      padding: "0.75rem",
      borderRadius: "10px",
      border: "2px solid #cbd5e1",
      fontSize: "0.95rem",
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      backgroundColor: "#f8fafc",
      color: "#0f172a",
      fontWeight: "600",
    },
    saveBtn: {
      background: "#2e7d32",
      color: "#ffffff",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "10px",
      fontWeight: "800",
      cursor: "pointer",
      fontSize: "0.95rem",
    },
    cancelBtn: {
      background: "#e2e8f0",
      color: "#475569",
      border: "none",
      padding: "0.75rem 1.5rem",
      borderRadius: "10px",
      fontWeight: "800",
      cursor: "pointer",
      fontSize: "0.95rem",
    },
    toast: {
      padding: "1rem",
      borderRadius: "12px",
      marginBottom: "1.5rem",
      fontWeight: "700",
      fontSize: "0.95rem",
      textAlign: "center",
      background: "#e8f5e9",
      color: "#2e7d32",
      border: "1px solid #c8e6c9",
    },
    backBtn: {
      background: "#f1f5f9",
      color: "#334155",
      border: "1px solid #cbd5e1",
      padding: "8px 16px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "800",
      fontSize: "0.9rem",
      marginBottom: "1rem",
      display: "inline-block",
      textDecoration: "none"
    },
    // Ratings Dashboard Styles
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "1fr 2fr",
      gap: "2rem",
      marginTop: "1.5rem"
    },
    ratingSummaryCard: {
      background: "#f8fafc",
      borderRadius: "16px",
      padding: "1.5rem",
      border: "1px solid #e2e8f0",
      textAlign: "center",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center"
    },
    ratingNum: {
      fontSize: "3.5rem",
      fontWeight: "850",
      color: "#0f172a",
      margin: 0,
      lineHeight: 1
    },
    ratingStars: {
      color: "#eab308",
      fontSize: "1.5rem",
      margin: "10px 0"
    },
    ratingDesc: {
      fontSize: "0.85rem",
      color: "#64748b",
      fontWeight: "700"
    },
    chartContainer: {
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      gap: "10px"
    },
    chartRow: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      fontSize: "0.9rem"
    },
    chartStarLabel: {
      width: "50px",
      fontWeight: "bold",
      color: "#475569"
    },
    chartBarTrack: {
      flex: 1,
      height: "12px",
      backgroundColor: "#e2e8f0",
      borderRadius: "6px",
      overflow: "hidden"
    },
    chartBarFill: (percentage) => ({
      width: `${percentage}%`,
      height: "100%",
      backgroundColor: "#eab308",
      borderRadius: "6px",
      transition: "width 0.5s ease"
    }),
    chartCountLabel: {
      width: "30px",
      textAlign: "right",
      fontWeight: "bold",
      color: "#475569"
    },
    feedbackItem: {
      background: "#f8fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      padding: "1rem",
      marginBottom: "10px"
    }
  };

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h3>Loading worker profile...</h3>
        </div>
      </div>
    );
  }

  if (error || !worker) {
    return (
      <div style={styles.pageWrapper}>
        <div style={{ textAlign: "center", padding: "4rem", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ color: "#ef4444" }}>Error</h2>
          <p>{error || "Could not retrieve profile."}</p>
          <Link to="/worker/login" style={styles.cancelBtn}>Log In Again</Link>
        </div>
      </div>
    );
  }

  const nameInitial = worker.name ? worker.name.charAt(0).toUpperCase() : "W";
  const { performance } = worker;
  const ratingDistribution = performance?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const totalRatings = performance?.ratingCount || 0;

  return (
    <div style={styles.pageWrapper}>
      <button onClick={() => navigate("/worker/dashboard")} style={styles.backBtn}>
        ← Back to Tasks
      </button>

      <div style={styles.card}>
        {/* Banner Header */}
        <div style={styles.headerBg}>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageUpload}
          />
          <div style={styles.avatarWrapper} onClick={() => fileInputRef.current?.click()}>
            <div style={styles.avatar}>
              {worker.profilePictureUrl ? (
                <img
                  src={`${BACKEND_URL}${worker.profilePictureUrl}`}
                  alt="Profile"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                nameInitial
              )}
            </div>
            <div style={styles.cameraIconOverlay}>
              {uploading ? "⏳" : "📷"}
            </div>
          </div>
          <h1 style={styles.userName}>{worker.name}</h1>
          <p style={styles.deptLabel}>{worker.department} Department</p>
          <div style={styles.badge}>
            Field Worker
          </div>
        </div>

        {/* Profile details editor */}
        <div style={styles.bodyContent}>
          {toastMessage && <div style={styles.toast}>{toastMessage}</div>}

          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Account Details</h3>
            {!isEditing && (
              <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                ✏️ Edit Details
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveDetails}>
              <div className="responsive-grid-container" style={styles.infoGrid}>
                <div style={styles.infoBlock}>
                  <label style={styles.label}>Full Name</label>
                  <input
                    style={styles.input}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.infoBlock}>
                  <label style={styles.label}>Email Address</label>
                  <input
                    type="email"
                    style={styles.input}
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    required
                  />
                </div>
                <div style={styles.infoBlock}>
                  <label style={styles.label}>Phone Number</label>
                  <input
                    style={styles.input}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={styles.saveBtn}>Save Changes</button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => {
                    setEditName(worker.name || "");
                    setEditEmail(worker.email || "");
                    setEditPhone(worker.phone || "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="responsive-grid-container" style={styles.infoGrid}>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Email Address</span>
                <span style={styles.value}>{worker.email}</span>
              </div>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Phone Number</span>
                <span style={styles.value}>{worker.phone || "Not Provided"}</span>
              </div>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Tasks Completed</span>
                <span style={styles.value}>{performance?.completedTasks} / {performance?.totalTasks}</span>
              </div>
            </div>
          )}

          {/* Performance & Ratings Dashboard */}
          <h3 style={{ ...styles.sectionTitle, borderBottom: "2px solid #f1f5f9", paddingBottom: "8px", marginBottom: "1rem", marginTop: "2.5rem" }}>
            ⭐ Performance Rating
          </h3>

          <div className="responsive-grid-container" style={styles.statsGrid}>
            {/* Rating Summary Card */}
            <div style={styles.ratingSummaryCard}>
              <h2 style={styles.ratingNum}>{performance?.averageRating}</h2>
              <div style={styles.ratingStars}>
                {"★".repeat(Math.round(performance?.averageRating || 0))}
                {"☆".repeat(5 - Math.round(performance?.averageRating || 0))}
              </div>
              <span style={styles.ratingDesc}>{totalRatings} citizen ratings</span>
            </div>

            {/* Performance Chart */}
            <div style={styles.chartContainer}>
              {[5, 4, 3, 2, 1].map(stars => {
                const count = ratingDistribution[stars] || 0;
                const percentage = totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;
                return (
                  <div key={stars} style={styles.chartRow}>
                    <span style={styles.chartStarLabel}>{stars} Stars</span>
                    <div style={styles.chartBarTrack}>
                      <div style={styles.chartBarFill(percentage)} />
                    </div>
                    <span style={styles.chartCountLabel}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Citizen Feedback */}
          <h3 style={{ ...styles.sectionTitle, borderBottom: "2px solid #f1f5f9", paddingBottom: "8px", marginBottom: "1.25rem", marginTop: "3rem" }}>
            💬 Recent Citizen Feedback
          </h3>

          {performance?.recentFeedbacks && performance.recentFeedbacks.length > 0 ? (
            performance.recentFeedbacks.map((fb, idx) => (
              <div key={idx} style={styles.feedbackItem}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontWeight: "800", color: "#1e293b", fontSize: "0.9rem" }}>{fb.complaintTitle}</span>
                  <span style={{ color: "#eab308", fontWeight: "bold" }}>{"★".repeat(fb.rating)}</span>
                </div>
                <p style={{ margin: "8px 0 0 0", color: "#475569", fontStyle: "italic", fontSize: "0.9rem" }}>
                  "{fb.text}"
                </p>
              </div>
            ))
          ) : (
            <p style={{ color: "#64748b", fontStyle: "italic", fontSize: "0.9rem" }}>
              No feedback comments submitted yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
