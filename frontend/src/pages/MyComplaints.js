import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [ratings, setRatings] = useState({});
  const [showFeedback, setShowFeedback] = useState({});
  const [loading, setLoading] = useState({});
  const [filter, setFilter] = useState("All"); 
  const [selectedImage, setSelectedImage] = useState(null); // 🚀 NEW: For Image Lightbox

  const { t } = useTranslation();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000"; // 🚀 Added to resolve image paths

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get('/complaints/mine', {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        setComplaints(res.data.complaints);
      } catch (err) {
        console.error(err);
        toast.error("❌ Failed to load complaints.");
      }
    })();
  }, []);

  const handleFeedbackChange = (id, value) => {
    setFeedbacks(prev => ({ ...prev, [id]: value }));
  };

  const handleRatingChange = (id, value) => {
    setRatings(prev => ({ ...prev, [id]: value }));
  };

  const submitFeedback = async (id) => {
    try {
      setLoading(prev => ({ ...prev, [id]: true }));
      await API.post(`/complaints/${id}/feedback`, {
        feedback: feedbacks[id],
        rating: ratings[id]
      });
      toast.success("✅ Thank you! Your feedback has been recorded.");
      setShowFeedback(prev => ({ ...prev, [id]: false }));
    } catch (err) {
      console.error(err);
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(prev => ({ ...prev, [id]: false }));
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Pending": return "🟡 Pending";
      case "Accepted": return "🟢 Accepted";
      case "Rejected": return "🔴 Rejected";
      case "Completed": return "🔵 Completed";
      case "Assigned": return "👷 Assigned"; // Added assigned badge
      default: return status;
    }
  };

  const filteredComplaints = filter === "All"
    ? complaints
    : complaints.filter(c => c.status === filter);

  // 🚀 Lightbox Overlay Style
  const modalOverlayStyle = {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(0,0,0,0.85)", display: "flex", flexDirection: "column",
    justifyContent: "center", alignItems: "center", zIndex: 9999, padding: "20px"
  };

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', fontFamily: 'Poppins, sans-serif', padding: '0 15px' }}>
      
      {/* 🚀 IMAGE MODAL (Lightbox) */}
      {selectedImage && (
        <div style={modalOverlayStyle} onClick={() => setSelectedImage(null)}>
          <img 
            src={selectedImage} 
            alt="Evidence" 
            style={{ maxWidth: "100%", maxHeight: "80vh", borderRadius: "12px", border: "4px solid white" }} 
          />
          <p style={{ color: "white", marginTop: "15px", fontWeight: "bold" }}>Click anywhere to close</p>
        </div>
      )}

      <h2 style={{ textAlign: 'center', color: '#2e4d2c', marginBottom: '1.5rem' }}>
        {t("myComplaints")}
      </h2>

      {/* ✅ Filter Bar */}
      <div style={{ textAlign: "center", marginBottom: "1rem", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
        {["All", "Pending", "Accepted", "Rejected", "Completed"].map(status => (
          <button
            key={status}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: filter === status ? "2px solid #2563eb" : "1px solid #ccc",
              backgroundColor: filter === status ? "#2563eb" : "#f9fafb",
              color: filter === status ? "#fff" : "#374151",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: filter === status ? "600" : "400"
            }}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredComplaints.length === 0 && (
        <p style={{ textAlign: 'center', color: '#6b7280', padding: "2rem" }}>{t("noComplaintsYet")}</p>
      )}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filteredComplaints.map(c => (
          <li key={c._id} style={{
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            padding: '20px',
            marginBottom: '20px',
            backgroundColor: '#ffffff',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
              <h3 style={{ fontSize: '1.2rem', color: '#1f2937', margin: "0 0 10px 0" }}>
                 {c.title}
              </h3>
              <p style={{ fontSize: '0.9rem', margin: '0 0 10px 0', fontWeight: "bold" }}>
                {getStatusBadge(c.status)}
              </p>
            </div>

            <p style={{ margin: '4px 0', color: '#4b5563', lineHeight: "1.5" }}>{c.description}</p>

            {/* 🚀 NEW: Before & After Evidence Images */}
            <div style={{ display: "flex", gap: "15px", flexWrap: "wrap", margin: "15px 0" }}>
              {/* Before Photo */}
              {c.imageUrl && (
                <div style={{ background: "#f3f4f6", padding: "8px", borderRadius: "10px" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#6b7280", margin: "0 0 5px 0" }}>📸 REPORTED ISSUE</p>
                  <img 
                    src={`${BACKEND_URL}${c.imageUrl}`} 
                    alt="Citizen Evidence" 
                    style={{ width: "130px", height: "90px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", border: "1px solid #d1d5db" }} 
                    onClick={() => setSelectedImage(`${BACKEND_URL}${c.imageUrl}`)}
                  />
                </div>
              )}

              {/* After Photo (Worker's Proof) */}
              {c.status === "Completed" && c.resolutionImageUrl && (
                <div style={{ background: "#f0fdf4", padding: "8px", borderRadius: "10px", border: "1px solid #bbfcbd" }}>
                  <p style={{ fontSize: "0.75rem", fontWeight: "bold", color: "#16a34a", margin: "0 0 5px 0" }}>✅ COMPLETED WORK</p>
                  <img 
                    src={`${BACKEND_URL}${c.resolutionImageUrl}`} 
                    alt="Resolution Evidence" 
                    style={{ width: "130px", height: "90px", objectFit: "cover", borderRadius: "8px", cursor: "pointer", border: "2px solid #16a34a" }} 
                    onClick={() => setSelectedImage(`${BACKEND_URL}${c.resolutionImageUrl}`)}
                  />
                </div>
              )}
            </div>

            {/* 🚀 NEW: Resolution Message from Worker/Department */}
            {c.status === "Completed" && (c.workerMessage || c.departmentMessage) && (
              <div style={{ backgroundColor: "#f8fafc", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #16a34a", marginBottom: "15px" }}>
                <p style={{ fontSize: "0.85rem", color: "#334155", margin: 0 }}>
                  <strong>Resolution Notes:</strong> {c.workerMessage || c.departmentMessage}
                </p>
              </div>
            )}

            <div style={{ background: "#f9fafb", padding: "10px", borderRadius: "8px", marginTop: "10px" }}>
              {c.address && (
                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '4px 0' }}>
                  <strong> Address:</strong> {c.address.street}, {c.address.town}, {c.address.district}, {c.address.state} - {c.address.pin}
                </p>
              )}

              {c.grievance && (
                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '4px 0' }}>
                  <strong> Category:</strong> {c.grievance}
                </p>
              )}

              {c.location?.coordinates && (
                <p style={{ fontSize: '0.85rem', color: '#4b5563', margin: '4px 0' }}>
                  <strong>📍 GPS:</strong> {c.location.coordinates[1].toFixed(4)}, {c.location.coordinates[0].toFixed(4)}
                </p>
              )}

              <p style={{ fontSize: '0.8rem', color: '#9ca3af', marginTop: 8, marginBottom: 0 }}>
                 {t("raised")}: {new Date(c.createdAt).toLocaleString()}
              </p>
            </div>

            {/* ✅ Feedback Section */}
            {c.status === "Completed" && (
              <div style={{ marginTop: "15px", borderTop: "1px solid #e5e7eb", paddingTop: "15px" }}>
                <button
                  style={{
                    backgroundColor: showFeedback[c._id] ? '#4b5563' : '#2e4d2c',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: "600",
                    transition: "0.2s"
                  }}
                  onClick={() => setShowFeedback(prev => ({ ...prev, [c._id]: !prev[c._id] }))}
                >
                  {showFeedback[c._id] ? "Cancel Feedback" : t("giveFeedback")}
                </button>

                {showFeedback[c._id] && (
                  <div style={{ marginTop: 15, background: "#f3f4f6", padding: "15px", borderRadius: "10px" }}>
                    <div style={{ marginBottom: 10 }}>
                      <p style={{ margin: "0 0 5px 0", fontSize: "0.85rem", fontWeight: "bold", color: "#4b5563" }}>Rate the resolution:</p>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          style={{
                            cursor: "pointer",
                            fontSize: "26px",
                            marginRight: 6,
                            color: ratings[c._id] >= star ? "#facc15" : "#d1d5db",
                            transition: "color 0.2s"
                          }}
                          onClick={() => handleRatingChange(c._id, star)}
                        >
                          ★
                        </span>
                      ))}
                    </div>

                    <textarea
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: 8,
                        border: "1px solid #cbd5e1",
                        marginBottom: 10,
                        fontFamily: "inherit",
                        boxSizing: "border-box"
                      }}
                      placeholder={t("enterFeedback")}
                      value={feedbacks[c._id] || ""}
                      onChange={(e) => handleFeedbackChange(c._id, e.target.value)}
                    />

                    <button
                      style={{
                        backgroundColor: "#2563eb",
                        color: "#fff",
                        border: "none",
                        padding: "10px 16px",
                        borderRadius: 8,
                        cursor: loading[c._id] ? "not-allowed" : "pointer",
                        fontSize: "0.9rem",
                        fontWeight: "600",
                        opacity: loading[c._id] ? 0.7 : 1,
                        width: "100%"
                      }}
                      onClick={() => submitFeedback(c._id)}
                      disabled={loading[c._id]}
                    >
                      {loading[c._id] ? "Submitting..." : t("submitFeedback")}
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
    </div>
  );
}