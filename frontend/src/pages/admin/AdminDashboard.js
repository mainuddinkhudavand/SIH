import { useEffect, useState } from "react";
import axios from "axios";
import { useTranslation } from "react-i18next";
import HeatmapView from "../../components/admin/HeatmapView";


export default function AdminDashboard() {
  const { t } = useTranslation();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";
  
  // 1. Initialize Default Year
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  
  // 2. Define Year Range (e.g., 2020 to Next Year)
  // This ensures previous years are available in the dropdown
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  const [monthlyStats, setMonthlyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const isAdmin = localStorage.getItem("isAdmin");

  // Fetch stats whenever the 'year' changes
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");
        // Pass the selected year as a query param
        const res = await axios.get(
          `${BACKEND_URL}/api/admin/complaints/monthly-status`,
          { params: { year } }
        );
        setMonthlyStats(res.data.stats || []);
      } catch (e) {
        console.error("Error fetching monthly stats", e);
        setErr(t("errorFetchingMonthlyStats") || "Failed to fetch monthly stats");
      } finally {
        setLoading(false);
      }
    })();
  }, [t, year]); // Dependent on 'year'

  const refreshStats = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/api/admin/complaints/monthly-status`,
        { params: { year } }
      );
      setMonthlyStats(res.data.stats || []);
    } catch (e) {
      console.error("Error refreshing monthly stats", e);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${BACKEND_URL}/api/admin/complaints/${id}`, { status });
      await refreshStats();
    } catch (e) {
      console.error("Error updating status", e);
    }
  };

  const cardBase = {
    backgroundColor: "#f9fafb",
    borderRadius: "12px",
    padding: "1rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default",
    border: "1px solid #eef2f7",
  };

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "2rem auto",
        padding: "1.5rem",
        backgroundColor: "#fff",
        borderRadius: "14px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
        fontFamily: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
      }}
    >
      {!isAdmin ? (
        <div
          style={{
            textAlign: "center",
            color: "#374151",
            fontWeight: 500,
          }}
        >
          {t("unauthorized") || "You are not authorized to view this page."}
        </div>
      ) : (
        <>
          {/* 🚀 WINNING EDGE: Interactive Public Utility Spatial GIS Heatmap */}
          <HeatmapView />

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.75rem",
              marginBottom: "1.25rem",
            }}
          >

            {/* Dynamic Heading based on Year */}
            <h2
              style={{
                fontSize: "1.9rem",
                fontWeight: 700,
                color: "#1f2937",
                letterSpacing: "0.2px",
              }}
            >
              {t("Dashboard of Year") || "Dashboard of Year"} {year}
            </h2>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {/* Year Dropdown */}
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{
                  padding: "0.5rem 2rem 0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontWeight: 600,
                  fontSize: "1rem",
                  color: "#374151",
                  backgroundColor: "#fff",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                }}
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>

              <button
                onClick={refreshStats}
                style={{
                  background: "#3b5f3a",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.5rem 0.9rem",
                  fontWeight: 600,
                  boxShadow: "0 2px 6px rgba(37,99,235,0.3)",
                  cursor: "pointer",
                }}
              >
                {t("refresh") || "Refresh"}
              </button>
            </div>
          </div>

          {loading && (
            <div
              style={{
                padding: "1rem",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              {t("loading") || "Loading..."}
            </div>
          )}

          {err && (
            <div
              style={{
                background: "#fee2e2",
                color: "#991b1b",
                padding: "0.75rem",
                borderRadius: "8px",
                marginBottom: "1rem",
                border: "1px solid #fecaca",
              }}
            >
              {err}
            </div>
          )}

          {/* Monthly cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {monthlyStats.length === 0 && !loading && !err ? (
               <div style={{gridColumn: "1 / -1", textAlign: "center", color: "#6b7280", padding: "2rem"}}>
                  No data found for the year {year}.
               </div>
            ) : (
                monthlyStats.map((monthStat, idx) => (
                <div
                    key={idx}
                    style={cardBase}
                    onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.02)";
                    e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
                    }}
                    onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
                    }}
                >
                    {/* Header */}
                    <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                    }}
                    >
                    <h3
                        style={{
                        fontSize: "1.2rem",
                        fontWeight: 700,
                        color: "#111827",
                        }}
                    >
                        {monthStat.month}
                    </h3>

                    <div
                        style={{
                        background: "#eff6ff",
                        color: "#1e3a8a",
                        border: "1px solid #dbeafe",
                        borderRadius: "999px",
                        padding: "0.25rem 0.6rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        }}
                    >
                        {(monthStat.Pending ?? 0) +
                        (monthStat.Accepted ?? 0) +
                        (monthStat.Rejected ?? 0) +
                        (monthStat.Completed ?? 0)}{" "}
                        {t("total") || "Total"}
                    </div>
                    </div>

                    {/* Status counts */}
                    <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "0.6rem",
                        marginBottom: "0.9rem",
                    }}
                    >
                    <div
                        style={{
                        background: "#fff7ed",
                        border: "1px solid #ffedd5",
                        color: "#9a3412",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        fontWeight: 600,
                        textAlign: "center",
                        }}
                    >
                        {t("pending")}: {monthStat.Pending ?? 0}
                    </div>
                    <div
                        style={{
                        background: "#ecfdf5",
                        border: "1px solid #d1fae5",
                        color: "#065f46",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        fontWeight: 600,
                        textAlign: "center",
                        }}
                    >
                        {t("accepted")}: {monthStat.Accepted ?? 0}
                    </div>
                    <div
                        style={{
                        background: "#fef2f2",
                        border: "1px solid #fee2e2",
                        color: "#7f1d1d",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        fontWeight: 600,
                        textAlign: "center",
                        }}
                    >
                        {t("rejected")}: {monthStat.Rejected ?? 0}
                    </div>
                    <div
                        style={{
                        background: "#eff6ff",
                        border: "1px solid #dbeafe",
                        color: "#1e3a8a",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        fontWeight: 600,
                        textAlign: "center",
                        }}
                    >
                        {t("completed")}: {monthStat.Completed ?? 0}
                    </div>
                    </div>

                    {/* Complaints table for this month */}
                    <div style={{ overflowX: "auto" }}>
                    <table
                        className="responsive-table"
                        style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "0.9rem",
                        }}
                    >
                        <thead>
                        <tr style={{ backgroundColor: "#f3f4f6" }}>
                            <th style={{ padding: "0.6rem", textAlign: "left", color: "#374151" }}>
                            {t("user")}
                            </th>
                            <th style={{ padding: "0.6rem", textAlign: "left", color: "#374151" }}>
                            {t("phone")}
                            </th>
                            <th style={{ padding: "0.6rem", textAlign: "left", color: "#374151" }}>
                            {t("title")}
                            </th>
                            <th style={{ padding: "0.6rem", textAlign: "left", color: "#374151" }}>
                            {t("status")}
                            </th>
                            <th style={{ padding: "0.6rem", textAlign: "left", color: "#374151" }}>
                            {t("action")}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {(monthStat.complaints || []).length === 0 ? (
                            <tr>
                            <td
                                colSpan={5}
                                style={{
                                padding: "0.8rem",
                                textAlign: "center",
                                color: "#6b7280",
                                }}
                            >
                                {t("No Complaints This Month") || "No complaints this month"}
                            </td>
                            </tr>
                        ) : (
                            monthStat.complaints.map((c) => (
                            <tr
                                key={c._id}
                                style={{
                                borderBottom: "1px solid #e5e7eb",
                                backgroundColor: "#ffffff",
                                }}
                            >
                                <td data-label={t("user")} style={{ padding: "0.6rem" }}>{c.user?.name}</td>
                                <td data-label={t("phone")} style={{ padding: "0.6rem" }}>{c.user?.phone}</td>
                                <td data-label={t("title")} style={{ padding: "0.6rem" }}>{c.title}</td>
                                <td data-label={t("status")} style={{ padding: "0.6rem" }}>
                                <span
                                    style={{
                                    display: "inline-block",
                                    padding: "0.25rem 0.55rem",
                                    borderRadius: "999px",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    border: "1px solid",
                                    color:
                                        c.status === "Pending"
                                        ? "#9a3412"
                                        : c.status === "Accepted"
                                        ? "#065f46"
                                        : c.status === "Rejected"
                                        ? "#7f1d1d"
                                        : "#1e3a8a",
                                    background:
                                        c.status === "Pending"
                                        ? "#fff7ed"
                                        : c.status === "Accepted"
                                        ? "#ecfdf5"
                                        : c.status === "Rejected"
                                        ? "#fef2f2"
                                        : "#eff6ff",
                                    borderColor:
                                        c.status === "Pending"
                                        ? "#ffedd5"
                                        : c.status === "Accepted"
                                        ? "#d1fae5"
                                        : c.status === "Rejected"
                                        ? "#fee2e2"
                                        : "#dbeafe",
                                    }}
                                >
                                    {t(c.status.toLowerCase()) || c.status}
                                </span>
                                </td>
                                <td data-label={t("action")} style={{ padding: "0.6rem" }}>
                                <select
                                    value={c.status}
                                    onChange={(e) => updateStatus(c._id, e.target.value)}
                                    style={{
                                    padding: "0.35rem 0.5rem",
                                    borderRadius: "8px",
                                    border: "1px solid #d1d5db",
                                    background: "#ffffff",
                                    }}
                                >
                                    <option value="Pending">{t("pending")}</option>
                                    <option value="Accepted">{t("accepted")}</option>
                                    <option value="Rejected">{t("rejected")}</option>
                                    <option value="Completed">{t("completed")}</option>
                                </select>
                                </td>
                            </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    </div>
                </div>
                ))
            )}
          </div>
        </>
      )}
    </div>
  );
}