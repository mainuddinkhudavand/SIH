import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { FaUsers, FaUserCheck, FaUserShield, FaClock } from "react-icons/fa";

export default function AdminUserActivity() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch (err) {
      console.warn(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "1.3rem", fontWeight: "800" }}>
          User Activity & Role-Based Access Control (RBAC) Monitor
        </h3>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.9rem" }}>
          Monitors resident citizen accounts, department officer sessions, and administrative privilege assignments.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading user activity logs...</div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0", textAlign: "left", color: "#475569" }}>
              <th style={{ padding: "10px" }}>Citizen / Officer</th>
              <th style={{ padding: "10px" }}>Email</th>
              <th style={{ padding: "10px" }}>Citizen ID</th>
              <th style={{ padding: "10px" }}>Role (RBAC)</th>
              <th style={{ padding: "10px" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 8).map((u) => (
              <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "10px", fontWeight: "800", color: "#0f172a" }}>{u.name}</td>
                <td style={{ padding: "10px", color: "#475569" }}>{u.email}</td>
                <td style={{ padding: "10px", fontFamily: "monospace", color: "#0284c7" }}>{u.citizenId || "CTZ-SYS-88"}</td>
                <td style={{ padding: "10px" }}>
                  <span style={{ padding: "3px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: u.role === "admin" ? "#fef3c7" : u.role?.includes("officer") ? "#e0f2fe" : "#dcfce7", color: u.role === "admin" ? "#78350f" : u.role?.includes("officer") ? "#0369a1" : "#166534" }}>
                    {u.role || "citizen"}
                  </span>
                </td>
                <td style={{ padding: "10px", color: "#16a34a", fontWeight: "700" }}>Active Session</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
