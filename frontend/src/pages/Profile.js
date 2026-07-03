import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fileInputRef = useRef(null);
  const { t } = useTranslation();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  const token = localStorage.getItem("token");

  const fetchProfile = async () => {
    if (!token) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = res.data;
      setUser(data);
      setEditName(data.name || "");
      setEditEmail(data.email || "");
      setEditPhone(data.phone || "");
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("Failed to load profile information.");
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
      const res = await axios.put(`${BACKEND_URL}/api/user/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setUser(res.data.user);
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
      const res = await axios.put(
        `${BACKEND_URL}/api/user/profile`,
        { name: editName, email: editEmail, phone: editPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.user);
      setIsEditing(false);
      setToastMessage("Profile details updated successfully!");
    } catch (err) {
      console.error("Profile Details Update Error:", err);
      setToastMessage(err.response?.data?.message || "Failed to update profile details.");
    }
  };

  const styles = {
    pageWrapper: {
      maxWidth: "800px",
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
    },
    headerBg: {
      background: "linear-gradient(135deg, #2e4d2c, #3b5f3a)",
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
      color: "#2e4d2c",
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
      backgroundColor: "#166534",
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
    userEmail: {
      margin: "4px 0 0",
      fontSize: "0.95rem",
      opacity: 0.9,
    },
    kycBadge: (verified) => ({
      background: verified ? "#dcfce7" : "#fee2e2",
      color: verified ? "#166534" : "#991b1b",
      padding: "6px 14px",
      borderRadius: "30px",
      fontSize: "0.8rem",
      fontWeight: "800",
      display: "inline-block",
      marginTop: "12px",
      border: `1px solid ${verified ? "#bbf7d0" : "#fecaca"}`,
    }),
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
      background: "#3b5f3a",
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
      background: "#166534",
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
    kycPrompt: {
      background: "#f8fafc",
      padding: "1.5rem",
      borderRadius: "16px",
      border: "1px solid #e2e8f0",
      textAlign: "center",
      marginTop: "1.5rem",
    },
    kycBtn: {
      background: "#2e4d2c",
      color: "#ffffff",
      padding: "0.75rem 1.5rem",
      borderRadius: "10px",
      fontWeight: "800",
      textDecoration: "none",
      display: "inline-block",
      marginTop: "0.75rem",
      fontSize: "0.95rem",
      transition: "background-color 0.2s",
    },
    toast: {
      padding: "1rem",
      borderRadius: "12px",
      marginBottom: "1.5rem",
      fontWeight: "700",
      fontSize: "0.95rem",
      textAlign: "center",
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    }
  };

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={{ textAlign: "center", padding: "4rem" }}>
          <h3>Loading profile details...</h3>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div style={styles.pageWrapper}>
        <div style={{ textAlign: "center", padding: "4rem", background: "#ffffff", borderRadius: "24px", border: "1px solid #e2e8f0" }}>
          <h2 style={{ color: "#ef4444" }}>Error</h2>
          <p>{error || "Could not retrieve profile."}</p>
          <Link to="/login" style={styles.kycBtn}>Log In Again</Link>
        </div>
      </div>
    );
  }

  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div style={styles.pageWrapper}>
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
              {user.profilePictureUrl ? (
                <img
                  src={`${BACKEND_URL}${user.profilePictureUrl}`}
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
          <h1 style={styles.userName}>{user.name}</h1>
          <p style={styles.userEmail}>Citizen Portal</p>
          <div style={styles.kycBadge(user.kycCompleted)}>
            {user.kycCompleted ? "✓ KYC VERIFIED" : "⚠ PENDING KYC"}
          </div>
        </div>

        {/* Profile Details */}
        <div style={styles.bodyContent}>
          {toastMessage && <div style={styles.toast}>{toastMessage}</div>}

          <div style={styles.sectionHeader}>
            <h3 style={styles.sectionTitle}>Contact Details</h3>
            {!isEditing && (
              <button style={styles.editBtn} onClick={() => setIsEditing(true)}>
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={handleSaveDetails}>
              <div style={styles.infoGrid}>
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
                <div style={styles.infoBlock}>
                  <label style={styles.label}>Aadhaar Number</label>
                  <span style={{ ...styles.value, marginTop: "10px" }}>
                    {user.aadhaarNumber ? `xxxx-xxxx-${user.aadhaarNumber.slice(-4)}` : "Not Provided"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" style={styles.saveBtn}>Save Changes</button>
                <button
                  type="button"
                  style={styles.cancelBtn}
                  onClick={() => {
                    setEditName(user.name || "");
                    setEditEmail(user.email || "");
                    setEditPhone(user.phone || "");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div style={styles.infoGrid}>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Email Address</span>
                <span style={styles.value}>{user.email}</span>
              </div>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Phone Number</span>
                <span style={styles.value}>{user.phone || "N/A"}</span>
              </div>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Aadhaar Number</span>
                <span style={styles.value}>
                  {user.aadhaarNumber ? `xxxx-xxxx-${user.aadhaarNumber.slice(-4)}` : "Not Provided"}
                </span>
              </div>
            </div>
          )}

          <h3 style={{ ...styles.sectionTitle, borderBottom: "2px solid #f1f5f9", paddingBottom: "8px", marginBottom: "1.25rem", marginTop: "2rem" }}>
            Jurisdiction Address
          </h3>
          {user.address ? (
            <div style={styles.infoGrid}>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Street / Landmark</span>
                <span style={styles.value}>{user.address.street || "N/A"}</span>
              </div>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Town / Village</span>
                <span style={styles.value}>{user.address.town || "N/A"}</span>
              </div>
              <div style={styles.infoBlock}>
                <span style={styles.label}>District</span>
                <span style={styles.value}>{user.address.district || "N/A"}</span>
              </div>
              <div style={styles.infoBlock}>
                <span style={styles.label}>State</span>
                <span style={styles.value}>{user.address.state || "N/A"}</span>
              </div>
              <div style={styles.infoBlock}>
                <span style={styles.label}>Pin Code</span>
                <span style={styles.value}>{user.address.pin || "N/A"}</span>
              </div>
            </div>
          ) : (
            <p style={{ color: "#64748b", fontSize: "0.9rem", fontStyle: "italic" }}>
              No address details supplied. Please complete your KYC verification.
            </p>
          )}

          {/* KYC Prompt if incomplete */}
          {!user.kycCompleted && (
            <div style={styles.kycPrompt}>
              <h4 style={{ margin: "0 0 4px", fontSize: "1rem", color: "#0f172a" }}>KYC Verification Required</h4>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b" }}>
                Complete your Aadhaar & Address verification to raise grievances in your Gram Panchayat.
              </p>
              <Link to="/kyc" style={styles.kycBtn}>Begin KYC Verification</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
