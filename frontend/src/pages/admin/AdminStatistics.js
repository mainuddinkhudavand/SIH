// frontend/src/pages/admin/AdminMonthlyStatistics.jsx
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { useTranslation } from "react-i18next"; // Keeping import for context

ChartJS.register(ArcElement, Tooltip, Legend);

export default function AdminMonthlyStatistics() {
  const { t } = useTranslation();
  
  // State for year selection
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear); 
  
  // Define Year Range (e.g., 2020 to Next Year)
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026];

  const [stats, setStats] = useState([]);
  const [monthlyCounts, setMonthlyCounts] = useState(new Array(12).fill(0));
  const [statusCounts, setStatusCounts] = useState({
    Pending: 0,
    Accepted: 0,
    Rejected: 0,
    Completed: 0
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const monthLabels = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Function to fetch and process stats, dependent on 'year'
  const fetchStats = useCallback(async () => {
    try {
        setLoading(true);
        setErr("");
        
        // Pass the selected year as a query parameter
        const res = await axios.get(
            "http://localhost:5000/api/admin/complaints/monthly-status",
            { params: { year } }
        );
        const incoming = res.data.stats || [];
        setStats(incoming);

        // Build monthlyCounts (ensure length 12)
        const counts = new Array(12).fill(0);
        incoming.forEach((m, idx) => {
            if (typeof m.month === "string") {
                const i = monthLabels.findIndex((lab) => lab.toLowerCase() === m.month.toLowerCase());
                if (i >= 0) {
                    counts[i] = (m.Pending ?? 0) + (m.Accepted ?? 0) + (m.Rejected ?? 0) + (m.Completed ?? 0);
                }
            } else {
                counts[idx] = (m.Pending ?? 0) + (m.Accepted ?? 0) + (m.Rejected ?? 0) + (m.Completed ?? 0);
            }
        });

        setMonthlyCounts(counts);

        // Aggregate status counts across months
        const agg = { Pending: 0, Accepted: 0, Rejected: 0, Completed: 0 };
        incoming.forEach((m) => {
            agg.Pending += m.Pending ?? 0;
            agg.Accepted += m.Accepted ?? 0;
            agg.Rejected += m.Rejected ?? 0;
            agg.Completed += m.Completed ?? 0;
        });
        setStatusCounts(agg);

        setTotal(counts.reduce((s, v) => s + v, 0));
    } catch (error) {
        console.error("Failed to fetch monthly stats:", error);
        setErr("Failed to load statistics");
    } finally {
        setLoading(false);
    }
  }, [year]); 

  // Run the fetch function on mount and when year changes
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);


  const doughnutData = {
    labels: monthLabels,
    datasets: [
      {
        label: `Complaints Raised in ${year}`,
        data: monthlyCounts,
        backgroundColor: [
          "#facc15", "#fde047", "#bef264", "#86efac", "#5eead4", "#38bdf8",
          "#60a5fa", "#818cf8", "#a78bfa", "#f472b6", "#fb7185", "#f87171"
        ],
        borderWidth: 2
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          font: { family: "Poppins, sans-serif", size: 12 },
          color: "#374151"
        }
      },
      tooltip: {
        bodyFont: { family: "Poppins, sans-serif" }
      }
    }
  };

  // Responsive Styles
  const containerStyle = {
    maxWidth: "1100px",
    width: "95%", // Responsive width
    margin: "2rem auto",
    padding: "1.5rem",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    boxShadow: "0 8px 24px rgba(15,23,42,0.06)",
    fontFamily: "Poppins, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  };

  const titleStyle = {
    fontSize: "1.6rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "0.25rem",
    flexGrow: 1,
    textAlign: "left"
  };

  const subtitleStyle = {
    color: "#6b7280",
    fontSize: "0.95rem",
    marginBottom: "0",
    textAlign: "left"
  };

  const headerContainerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
    flexWrap: "wrap", // crucial for mobile responsiveness
    gap: "1rem"
  };

  const chartAreaStyle = {
    display: "flex",
    gap: "1.25rem",
    alignItems: "stretch",
    justifyContent: "center",
    flexWrap: "wrap", // crucial for mobile responsiveness
  };

  const chartCardStyle = {
    flex: "1 1 360px", // Allows flexibility, minimum width of 360px before stacking
    minWidth: "260px",
    height: "320px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "0.75rem",
    border: "1px solid #eef2f7",
    boxShadow: "0 4px 12px rgba(2,6,23,0.04)"
  };

  const summaryCardStyle = {
    flex: "1 1 320px",
    minWidth: "260px",
    background: "#ffffff",
    borderRadius: "12px",
    padding: "0.75rem",
    border: "1px solid #eef2f7",
    boxShadow: "0 4px 12px rgba(2,6,23,0.04)",
    height: "100%"
  };

  const gridStyle = {
    marginTop: "1.75rem",
    display: "grid",
    // Responsive grid: auto-fit ensures items fill the width and stack on small screens
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", 
    gap: "0.9rem"
  };

  const monthCardStyle = {
    backgroundColor: "#f8fafc",
    borderRadius: "10px",
    padding: "0.6rem",
    textAlign: "center",
    boxShadow: "0 1px 6px rgba(2,6,23,0.04)",
    transition: "transform 0.18s ease"
  };

  const statusGridStyle = {
    marginTop: "1.75rem",
    display: "grid",
    // Responsive grid
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", 
    gap: "0.9rem"
  };

  const statusCardStyle = {
    backgroundColor: "#f1f5f9",
    borderRadius: "10px",
    padding: "0.9rem",
    textAlign: "center",
    boxShadow: "0 2px 8px rgba(2,6,23,0.04)"
  };

  return (
    <div style={containerStyle}>
      <div style={headerContainerStyle}>
        <div style={{ flex: "1 1 100%" }}>
            <h2 style={{...titleStyle, textAlign: 'left', marginBottom: '0.25rem'}}>
                Complaints Statistics Dashboard
            </h2>
            <p style={{...subtitleStyle, textAlign: 'left', marginBottom: '0'}}>
                Showing monthly breakdown for Year **{year}**
            </p>
        </div>
        
        {/* Year Dropdown */}
        <div style={{display: 'flex', alignItems: 'center', minWidth: '150px', flexShrink: 0}}>
            <label htmlFor="year-select" style={{fontSize: '0.9rem', marginRight: '0.5rem', color: '#475569', fontWeight: 500}}>
                Select Year:
            </label>
            <select
                id="year-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                style={{
                    padding: "0.4rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid #d1d5db",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#0f172a",
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
        </div>
      </div>
      
      <hr style={{ border: 'none', borderBottom: '1px solid #eef2f7', margin: '0 0 1.5rem 0' }}/>

      {loading ? (
        <div style={{ textAlign: "center", color: "#6b7280", padding: "1rem" }}>Loading statistics for {year}…</div>
      ) : err ? (
        <div style={{ textAlign: "center", color: "#b91c1c", padding: "1rem" }}>{err}</div>
      ) : (
        <>
          <div style={chartAreaStyle}>
            <div style={chartCardStyle}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a", fontWeight: 700, textAlign: 'center' }}>
                    Monthly Distribution
                </h3>
                {/*  */}
                <div style={{ height: "90%", position: "relative" }}>
                    <Doughnut data={doughnutData} options={options} />
                </div>
            </div>

            <div style={summaryCardStyle}>
                <h3 style={{ margin: 0, fontSize: "1.05rem", color: "#0f172a", fontWeight: 700 }}>Overall Status Summary</h3>
                <div style={{ marginTop: "0.75rem", display: "grid", gap: "0.5rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#374151" }}>
                    <span>Pending</span>
                    <strong style={{ color: "#92400e" }}>{statusCounts.Pending}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#374151" }}>
                    <span>Accepted</span>
                    <strong style={{ color: "#065f46" }}>{statusCounts.Accepted}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#374151" }}>
                    <span>Rejected</span>
                    <strong style={{ color: "#7f1d1d" }}>{statusCounts.Rejected}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#374151" }}>
                    <span>Completed</span>
                    <strong style={{ color: "#1e3a8a" }}>{statusCounts.Completed}</strong>
                  </div>
                  <div style={{ height: "1px", background: "#eef2f7", margin: "0.5rem 0" }} />
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#0f172a", fontWeight: 700 }}>
                    <span>Total Complaints ({year})</span>
                    <span>{total}</span>
                  </div>
                </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderBottom: '1px solid #eef2f7', margin: '2rem 0 1.75rem 0' }}/>
          
          <h3 style={{ margin: '0 0 1rem 0', fontSize: "1.2rem", color: "#0f172a", fontWeight: 700 }}>
            Monthly Complaint Counts
          </h3>

          {/* Month small cards - Responsive Grid */}
          <div style={gridStyle}>
            {monthLabels.map((month, idx) => (
              <div
                key={month}
                style={monthCardStyle}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>{month}</div>
                <div style={{ color: "#475569", fontSize: "0.85rem", marginTop: "6px" }}>
                  {monthlyCounts[idx] || 0} complaints
                </div>
              </div>
            ))}
          </div>
          
          <hr style={{ border: 'none', borderBottom: '1px solid #eef2f7', margin: '2rem 0 1.75rem 0' }}/>

          <h3 style={{ margin: '0 0 1rem 0', fontSize: "1.2rem", color: "#0f172a", fontWeight: 700 }}>
            Status Breakdown
          </h3>

          {/* Status cards - Responsive Grid */}
          <div style={statusGridStyle}>
            {["Pending", "Accepted", "Rejected", "Completed"].map((status) => (
              <div key={status} style={statusCardStyle}>
                <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>{status}</div>
                <div style={{ fontSize: "0.95rem", color: "#475569", marginTop: "6px" }}>
                  {statusCounts[status] || 0} total
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}