import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaBullhorn, FaPlus, FaTrash, FaCalendarAlt, FaPin, FaCheckCircle } from "react-icons/fa";

export default function NoticePublisher() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "Notice",
    content: "",
    publishedBy: "Municipal Administration",
    eventDate: "",
    isPinned: false
  });

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await API.post("/official/notices", formData);
      setMessage({ type: "success", text: "Notice / Public Event published successfully!" });
      setFormData({ title: "", category: "Notice", content: "", publishedBy: "Municipal Administration", eventDate: "", isPinned: false });
      fetchNotices();
    } catch (err) {
      setMessage({ type: "error", text: "Failed to publish notice." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this notice?")) return;
    try {
      await API.delete(`/official/notices/${id}`);
      fetchNotices();
    } catch (err) {
      alert("Failed to delete notice.");
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.75rem", fontWeight: "700" }}>
          📢 Publish Public Notices & Community Events
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Broadcast municipal announcements, public event schedules, and urgent civic alerts to citizens.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
        {/* Publish Form */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#0f172a" }}>Publish Announcement</h3>

          {message && (
            <div style={{ padding: "12px", borderRadius: "8px", marginBottom: "16px", background: message.type === "success" ? "#ecfdf5" : "#fef2f2", color: message.type === "success" ? "#065f46" : "#991b1b" }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              >
                <option value="Notice">Public Notice</option>
                <option value="Public Event">Community / Public Event</option>
                <option value="Urgent Alert">Urgent Civic Alert</option>
                <option value="Civic Announcement">Civic Announcement</option>
              </select>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Title / Headline</label>
              <input
                type="text"
                placeholder="e.g. Annual Gram Sabha Meeting & Water Drive"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Event Date (Optional)</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "4px" }}>Notice Details / Content</label>
              <textarea
                rows="4"
                placeholder="Write full public announcement details here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="isPinned"
                checked={formData.isPinned}
                onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
              />
              <label htmlFor="isPinned" style={{ fontSize: "0.85rem", fontWeight: "600", color: "#475569" }}>Pin to top of citizen portal homepage</label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: "#0f172a",
                color: "white",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {submitting ? "Publishing..." : <><FaBullhorn /> Publish Notice</>}
            </button>
          </form>
        </div>

        {/* Published Notices Feed */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#0f172a" }}>Active Published Announcements</h3>
          {loading ? (
            <p style={{ color: "#64748b" }}>Loading notices...</p>
          ) : notices.length === 0 ? (
            <p style={{ color: "#64748b" }}>No notices published yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {notices.map((n) => (
                <div key={n._id} style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div>
                      <span style={{ fontSize: "0.75rem", background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "6px", fontWeight: "700" }}>
                        {n.category}
                      </span>
                      <h4 style={{ margin: "4px 0 2px 0", color: "#0f172a" }}>{n.title}</h4>
                    </div>
                    <button
                      onClick={() => handleDelete(n._id)}
                      style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem" }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                  <p style={{ margin: "6px 0 10px 0", fontSize: "0.85rem", color: "#475569", lineHeight: "1.4" }}>{n.content}</p>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", display: "flex", gap: "12px" }}>
                    <span>Published: {new Date(n.createdAt).toLocaleDateString()}</span>
                    {n.eventDate && <span><FaCalendarAlt /> Event: {new Date(n.eventDate).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
