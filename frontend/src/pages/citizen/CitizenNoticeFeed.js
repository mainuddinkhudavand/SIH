import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaBullhorn, FaCalendarAlt, FaThumbtack } from "react-icons/fa";

export default function CitizenNoticeFeed() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const res = await API.get("/official/notices");
      setNotices(res.data || []);
    } catch (err) {
      console.error("Failed to load notices:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || notices.length === 0) return null;

  return (
    <div style={{ background: "#ffffff", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", marginBottom: "24px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
        <FaBullhorn style={{ color: "#2563eb", fontSize: "1.2rem" }} />
        <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.1rem" }}>Public Announcements & Community Events</h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
        {notices.map((n) => (
          <div
            key={n._id}
            style={{
              background: n.isPinned ? "#eff6ff" : "#f8fafc",
              border: n.isPinned ? "1px solid #93c5fd" : "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "14px",
              position: "relative"
            }}
          >
            {n.isPinned && (
              <span style={{ position: "absolute", top: "10px", right: "10px", color: "#2563eb", fontSize: "0.8rem", fontWeight: "700" }}>
                <FaThumbtack /> Pinned
              </span>
            )}
            <span style={{ fontSize: "0.75rem", background: n.category === "Public Event" ? "#d1fae5" : "#dbeafe", color: n.category === "Public Event" ? "#065f46" : "#1d4ed8", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
              {n.category}
            </span>
            <h4 style={{ margin: "6px 0 4px 0", color: "#0f172a", fontSize: "0.95rem" }}>{n.title}</h4>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569", lineHeight: "1.4" }}>{n.content}</p>
            {n.eventDate && (
              <div style={{ marginTop: "8px", fontSize: "0.75rem", color: "#2563eb", fontWeight: "600" }}>
                <FaCalendarAlt /> Event Scheduled: {new Date(n.eventDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
