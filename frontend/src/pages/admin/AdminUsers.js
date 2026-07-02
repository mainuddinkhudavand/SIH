import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
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
    kycStatus: "all", // all, pending, accepted, rejected, completed
    minComplaints: "",
    maxComplaints: "",
  };

  const [filters, setFilters] = useState(initialFilters);

  // --- API Functions ---
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/admin/users");
      setUsers(res.data);
      setFilteredUsers(res.data);

      const countsMap = {};
      await Promise.all(
        res.data.map(async (u) => {
          try {
            const countRes = await axios.get(
              `http://localhost:5000/api/admin/users/${u._id}/complaints-count`
            );
            countsMap[u._id] = countRes.data.count ?? 0;
          } catch {
            countsMap[u._id] = 0;
          }
        })
      );
      setUserComplaintCounts(countsMap);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSingleComplaintCount = async (userId) => {
    setComplaintCount(null);
    try {
      const res = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}/complaints-count`
      );
      setComplaintCount(res.data.count);
    } catch (err) {
      setComplaintCount(0);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // --- KYC Status Logic (Fixed Priority) ---
  const getKycStatus = (u) => {
    // 1. Check for explicit rejection first
   {/* if (u.kycRejected === true) return "rejected";
    
    // 2. Check for explicit acceptance
    if (u.kycAccepted === true) return "accepted"; */}

    // 3. If it's completed but not explicitly accepted/rejected yet
    if (u.kycCompleted === true) return "completed";

    // 4. Default state
    return "pending";
  };

  const applyFilters = () => {
    let temp = users.filter((u) => {
      const currentStatus = getKycStatus(u);

      const matchesName = (u.name || "").toLowerCase().includes(filters.name.toLowerCase());
      const matchesEmail = (u.email || "").toLowerCase().includes(filters.email.toLowerCase());
      const matchesPhone = (u.phone || "").toLowerCase().includes(filters.phone.toLowerCase());
      
      // Fixed: Matches the calculated status against the dropdown value
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
    container: { maxWidth: "1300px", margin: "2rem auto", padding: "0 1.5rem", fontFamily: "'Inter', sans-serif", color: "#1e293b" },
    header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" },
    filterCard: { background: "#ffffff", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9", marginBottom: "2rem" },
    inputGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" },
    input: { padding: "0.7rem", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.9rem", outlineColor: "#3b82f6" },
    btnPrimary: { background: "#3b5f3a", color: "#fff", border: "none", padding: "0.7rem 1.4rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
    btnSecondary: { background: "#f1f5f9", color: "#475569", border: "1px solid #e2e8f0", padding: "0.7rem 1.4rem", borderRadius: "8px", fontWeight: "600", cursor: "pointer" },
    table: { width: "100%", borderCollapse: "separate", borderSpacing: "0 12px" },
    th: { padding: "0.75rem 1rem", textAlign: "left", color: "#64748b", fontWeight: "600", fontSize: "0.85rem" },
    tr: { backgroundColor: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" },
    td: { padding: "1.2rem 1rem" },
    badge: (status) => {
      const config = {
        pending: { bg: "#fef9c3", text: "#854d0e" },
        accepted: { bg: "#e0f2fe", text: "#0369a1" },
        rejected: { bg: "#fee2e2", text: "#991b1b" },
        completed: { bg: "#dcfce7", text: "#166534" },
      };
      const s = config[status] || config.pending;
      return { backgroundColor: s.bg, color: s.text, padding: "0.4rem 0.8rem", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase" };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontWeight: 800 }}>{t("User Management")}</h1>
        <button style={styles.btnPrimary} onClick={fetchUsers}>🔄 {t("Refresh List")}</button>
      </div>

      {/* Filters Area */}
      <div style={styles.filterCard}>
        <div style={styles.inputGrid}>
          <input style={styles.input} placeholder="Name" value={filters.name} onChange={(e) => setFilters({...filters, name: e.target.value})} />
          <input style={styles.input} placeholder="Email" value={filters.email} onChange={(e) => setFilters({...filters, email: e.target.value})} />
          <select 
            style={styles.input} 
            value={filters.kycStatus} 
            onChange={(e) => setFilters({ ...filters, kycStatus: e.target.value })}
          >
            <option value="all">All Statuses</option>
            <option value="pending">⏳ Pending</option>
           {/* <option value="accepted">🔵 Accepted</option>
            <option value="rejected">❌ Rejected</option> */}
            <option value="completed">✅ Completed</option>
          </select>
         {/* <input style={styles.input} type="number" placeholder="Min Complaints" value={filters.minComplaints} onChange={(e) => setFilters({...filters, minComplaints: e.target.value})} />
          <input style={styles.input} type="number" placeholder="Max Complaints" value={filters.maxComplaints} onChange={(e) => setFilters({...filters, maxComplaints: e.target.value})} /> */}
        </div>
        <div style={{ marginTop: "1.2rem", display: "flex", gap: "10px" }}>
          <button style={styles.btnPrimary} onClick={applyFilters}>{t("Apply Filters")}</button>
          <button style={styles.btnSecondary} onClick={handleReset}>{t("Reset")}</button>
        </div>
      </div>

      {/* Table Area */}
      <div style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>User Info</th>
              <th style={styles.th}>Contact</th>
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
                  <td style={{...styles.td, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px'}}>
                    <div style={{fontWeight: 700}}>{u.name}</div>
                    <div style={{fontSize: '0.8rem', color: '#64748b'}}>{u.email}</div>
                  </td>
                  <td style={styles.td}>{u.phone || "N/A"}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(status)}>{status}</span>
                  </td>
                  <td style={styles.td}>
                    <div style={{background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', display: 'inline-block', fontWeight: '600'}}>
                        {userComplaintCounts[u._id] || 0}
                    </div>
                  </td>
                  <td style={{...styles.td, borderTopRightRadius: '12px', borderBottomRightRadius: '12px'}}>
                    <button style={{...styles.btnSecondary, padding: '0.5rem 1rem'}} onClick={() => handleUserClick(u)}>View</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, backdropFilter: "blur(4px)" }} onClick={closeModal}>
          <div style={{ background: "#fff", width: "450px", borderRadius: "20px", padding: "2rem", boxShadow: "0 20px 50px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 1rem 0", color: "#1e293b" }}>{selectedUser.name}</h2>
            <div style={{ color: "#475569", lineHeight: "1.8" }}>
              <p><strong>Email:</strong> {selectedUser.email}</p>
              <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
              <p><strong>Status:</strong> <span style={styles.badge(getKycStatus(selectedUser))}>{getKycStatus(selectedUser)}</span></p>
              <p><strong>Total Complaints:</strong> {complaintCount ?? "..."}</p>
            </div>
            <button style={{ ...styles.btnPrimary, width: "100%", marginTop: "1.5rem" }} onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {loading && <div style={{textAlign: 'center', padding: '2rem'}}>Loading Data...</div>}
    </div>
  );
}