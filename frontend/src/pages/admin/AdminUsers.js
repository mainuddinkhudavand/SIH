import React, { useEffect, useState, useCallback } from "react";
import API from "../../services/api";
import { useTranslation } from "react-i18next";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [complaintCount, setComplaintCount] = useState(null);
  const [userComplaintCounts, setUserComplaintCounts] = useState({});

  const { t } = useTranslation();

  const initialFilters = {
    name: "",
    email: "",
    phone: "",
    kycStatus: "all",
    minComplaints: "",
    maxComplaints: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  // --- Fetch Registered Users ---
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/admin/users");
      const list = Array.isArray(res.data) ? res.data : (res.data?.users || res.data?.data || []);
      setUsers(list);
      setFilteredUsers(list);

      const countsMap = {};
      await Promise.all(
        list.map(async (u) => {
          try {
            const countRes = await API.get(`/admin/users/${u._id}/complaints-count`);
            countsMap[u._id] = countRes.data.count ?? 0;
          } catch {
            countsMap[u._id] = 0;
          }
        })
      );
      setUserComplaintCounts(countsMap);
    } catch (err) {
      console.error("Fetch Registered Users Error:", err);
      setUsers([]);
      setFilteredUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSingleComplaintCount = async (userId) => {
    setComplaintCount(null);
    try {
      const res = await API.get(`/admin/users/${userId}/complaints-count`);
      setComplaintCount(res.data.count);
    } catch (err) {
      setComplaintCount(0);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getKycStatus = (u) => {
    if (u.kycCompleted === true) return "completed";
    return "pending";
  };

  const applyFilters = () => {
    let temp = users.filter((u) => {
      const currentStatus = getKycStatus(u);

      const matchesName = (u.name || "").toLowerCase().includes(filters.name.toLowerCase());
      const matchesEmail = (u.email || "").toLowerCase().includes(filters.email.toLowerCase());
      const matchesPhone = (u.phone || "").toLowerCase().includes(filters.phone.toLowerCase());
      const matchesKyc = filters.kycStatus === "all" || currentStatus === filters.kycStatus;

      const count = userComplaintCounts[u._id] || 0;
      const matchesMin = !filters.minComplaints || count >= parseInt(filters.minComplaints);
      const matchesMax = !filters.maxComplaints || count <= parseInt(filters.maxComplaints);

      return matchesName && matchesEmail && matchesPhone && matchesKyc && matchesMin && matchesMax;
    });
    setFilteredUsers(temp);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setFilteredUsers(users);
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    fetchSingleComplaintCount(user._id);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setComplaintCount(null);
  };

  // --- Styles ---
  const styles = {
    container: { maxWidth: "1300px", margin: "1rem auto", padding: "0 1rem", fontFamily: "'Inter', sans-serif", color: "#1e293b" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" },
    filterCard: { background: "#ffffff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)", border: "1px solid #d8f3dc", marginBottom: "1.5rem" },
    inputGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" },
    input: { padding: "0.7rem", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", outlineColor: "#2d6a4f" },
    btnPrimary: { background: "linear-gradient(135deg, #2d6a4f, #1b4332)", color: "#fff", border: "none", padding: "0.7rem 1.4rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
    btnSecondary: { background: "#f4f9f4", color: "#2d6a4f", border: "1px solid #d8f3dc", padding: "0.7rem 1.4rem", borderRadius: "8px", fontWeight: "700", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 10px" },
    th: { padding: "0.75rem 1rem", textAlign: "left", color: "#1b4332", fontWeight: "700", fontSize: "0.85rem" },
    tr: { backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
    td: { padding: "1.2rem 1rem" },
    badge: (status) => {
      const config = {
        pending: { bg: "#fef9c3", text: "#854d0e" },
        completed: { bg: "#dcfce7", text: "#166534" },
      };
      const s = config[status] || config.pending;
      return { backgroundColor: s.bg, color: s.text, padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase" };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={{ fontWeight: 800, color: "#1b4332", margin: 0 }}>👥 Registered Citizens Directory ({filteredUsers.length})</h2>
        <button style={styles.btnPrimary} onClick={fetchUsers}>🔄 {t("Refresh List")}</button>
      </div>

      {/* Filters Area */}
      <div style={styles.filterCard}>
        <div style={styles.inputGrid}>
          <input style={styles.input} placeholder="Filter Name..." value={filters.name} onChange={(e) => setFilters({...filters, name: e.target.value})} />
          <input style={styles.input} placeholder="Filter Email..." value={filters.email} onChange={(e) => setFilters({...filters, email: e.target.value})} />
          <select 
            style={styles.input} 
            value={filters.kycStatus} 
            onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value })}
          >
            <option value="all">All KYC Statuses</option>
            <option value="pending">⏳ Pending KYC</option>
            <option value="completed">✅ KYC Completed</option>
          </select>
        </div>
        <div style={{ marginTop: "1.2rem", display: "flex", gap: "10px" }}>
          <button style={styles.btnPrimary} onClick={applyFilters}>{t("Apply Filters")}</button>
          <button style={styles.btnSecondary} onClick={handleReset}>{t("Reset")}</button>
        </div>
      </div>

      {/* Table Area */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>Loading registered citizens...</div>
      ) : filteredUsers.length === 0 ? (
        <div style={{ background: "#ffffff", padding: "2rem", borderRadius: "12px", textAlign: "center", color: "#64748b", border: "1px solid #d8f3dc" }}>
          No registered citizens found matching filters.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="responsive-table" style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Citizen Info</th>
                <th style={styles.th}>Contact Number</th>
                <th style={styles.th}>KYC Status</th>
                <th style={styles.th}>Complaints</th>
                <th style={styles.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const status = getKycStatus(u);
                return (
                  <tr key={u._id} style={styles.tr}>
                    <td data-label="User Info" style={{...styles.td, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px'}}>
                      <div style={{fontWeight: 700, color: "#1b4332"}}>{u.name || "Registered Resident"}</div>
                      <div style={{fontSize: '0.8rem', color: '#64748b'}}>{u.email}</div>
                    </td>
                    <td data-label="Contact" style={styles.td}>{u.phone || "N/A"}</td>
                    <td data-label="KYC Status" style={styles.td}>
                      <span style={styles.badge(status)}>{status}</span>
                    </td>
                    <td data-label="Complaints" style={styles.td}>
                      <div style={{background: '#ecfdf5', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', fontWeight: '700', color: "#065f46"}}>
                          {userComplaintCounts[u._id] || 0}
                      </div>
                    </td>
                    <td data-label="Action" style={{...styles.td, borderTopRightRadius: '12px', borderBottomRightRadius: '12px'}}>
                      <button style={{...styles.btnSecondary, padding: '0.5rem 1rem'}} onClick={() => handleUserClick(u)}>View Profile</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail Modal */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }} onClick={closeModal}>
          <div style={{ background: "#fff", width: "450px", borderRadius: "20px", padding: "2rem", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 1rem 0", color: "#1b4332" }}>{selectedUser.name}</h2>
            <div style={{ color: "#475569", lineHeight: "1.8" }}>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>KYC Status:</strong> <span style={styles.badge(getKycStatus(selectedUser))}>{getKycStatus(selectedUser)}</span></p>
              <p><strong>Aadhaar Number:</strong> {selectedUser.aadhaarNumber || 'Not Uploaded'}</p>
              <p><strong>Total Complaints:</strong> {complaintCount ?? "..."}</p>
            </div>
            <button style={{ ...styles.btnPrimary, width: "100%", marginTop: "1.5rem" }} onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}