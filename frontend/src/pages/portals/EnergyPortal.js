import React, { useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { FaSun, FaNetworkWired, FaCheckCircle, FaExchangeAlt, FaCalculator, FaBolt, FaAward, FaSearch } from "react-icons/fa";

export default function EnergyPortal() {
  const [applications, setApplications] = useState([
    { _id: "SOLAR-101", applicationId: "GC-SOLAR-3003", serviceType: "Rooftop Solar Subsidy", applicantDetails: { fullName: "Pavan", phone: "+91 98765 43210", address: "Plot #14, Solar Grid Ward A" }, plantSizeKw: "3.0 kW", propertyVerificationStatus: "VERIFIED (via Revenue Interop)", status: "Approved", remarks: "Approved for 40% MNRE Subsidy rebate (₹54,000 grant)" },
    { _id: "SOLAR-102", applicationId: "GC-SOLAR-3008", serviceType: "Rooftop Solar Subsidy", applicantDetails: { fullName: "Anita Sharma", phone: "+91 98123 45678", address: "Plot #88, Sector 12" }, plantSizeKw: "5.0 kW", propertyVerificationStatus: "VERIFIED (via Revenue Interop)", status: "Pending", remarks: "Field Roof Structural Inspection Scheduled" }
  ]);

  // Solar Calculator State
  const [plantKw, setPlantKw] = useState("3.0");
  const [revenueQueryResult, setRevenueQueryResult] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const handleUpdateStatus = (id, newStatus) => {
    setApplications(apps => apps.map(a => a._id === id ? { ...a, status: newStatus } : a));
    setToastMsg(`Rooftop Solar request ${id} updated to ${newStatus}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleQueryRevenueForRoofOwnership = async () => {
    try {
      const res = await API.get(`/interop/mapped-data?citizenId=C101&queryType=SOLAR_ROOF_OWNERSHIP_VERIFY`);
      setRevenueQueryResult(res.data?.data || res.data);
      setToastMsg(`Verified roof & plot title deed with Revenue DB via GovConnect!`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: "#fffbeb", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #d97706 0%, #78350f 100%)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ background: "#fbbf24", color: "#78350f", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
                DEPARTMENTAL PORTAL PROVIDER (RENEWABLE ENERGY) 🔵
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaSun /> Renewable Energy Department
              </h1>
              <p style={{ margin: 0, color: "#fef3c7", fontSize: "0.95rem" }}>
                Rooftop Solar Subsidy Processing, Solar Plant Grants &amp; GovConnect Revenue Land Clearance.
              </p>
            </div>

            <Link to="/govconnect" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaNetworkWired /> GovConnect Interop Core
            </Link>
          </div>
        </div>

        {toastMsg && (
          <div style={{ background: "#fef3c7", color: "#78350f", border: "1px solid #fde68a", padding: "14px 18px", borderRadius: "10px", fontWeight: "800", marginBottom: "20px" }}>
            {toastMsg}
          </div>
        )}

        {/* ⚡ GOVCONNECT INTEROP HIGHLIGHT CARD */}
        <div style={{ background: "#78350f", color: "#fef3c7", padding: "20px 24px", borderRadius: "14px", border: "2px solid #fbbf24", marginBottom: "28px", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ background: "#fbbf24", color: "#78350f", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "900" }}>
                ENERGY → REVENUE INTEROPERABILITY FEATURE
              </span>
              <h3 style={{ margin: "4px 0 2px 0", color: "#ffffff", fontSize: "1.15rem", fontWeight: "800" }}>
                Energy Portal Verifies Roof Ownership from Revenue DB
              </h3>
              <p style={{ margin: 0, color: "#fde68a", fontSize: "0.85rem" }}>
                Before disbursing ₹54,000 solar subsidy, Energy Portal queries Revenue DB via GovConnect to verify land &amp; building ownership.
              </p>
            </div>

            <button
              onClick={handleQueryRevenueForRoofOwnership}
              style={{ background: "#fbbf24", color: "#78350f", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaBolt /> Query Revenue DB for Roof Title
            </button>
          </div>

          {revenueQueryResult && (
            <div style={{ marginTop: "16px", background: "#451a03", padding: "14px", borderRadius: "8px", fontSize: "0.85rem", border: "1px solid #fbbf24" }}>
              <div style={{ color: "#fbbf24", fontWeight: "800", marginBottom: "6px" }}>✓ Verified Roof Ownership Deed Data (GovConnect Interop):</div>
              <pre style={{ margin: 0, color: "#fef3c7", overflowX: "auto" }}>{JSON.stringify(revenueQueryResult, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* SOLAR CALCULATOR & INTAKE QUEUE GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
          
          {/* Solar Subsidy Calculator */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #fef3c7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 14px 0", color: "#78350f", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaCalculator color="#d97706" /> MNRE Solar Subsidy Grant Calculator
            </h3>
            
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Proposed Solar Capacity (kW)</label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                value={plantKw}
                onChange={e => setPlantKw(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}
              />
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "16px", borderRadius: "10px" }}>
              <div style={{ fontSize: "0.82rem", color: "#78350f", fontWeight: "700" }}>Rooftop Area Required:</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#d97706" }}>~{(parseFloat(plantKw || 0) * 100).toLocaleString()} Sq. Ft.</div>

              <div style={{ fontSize: "0.82rem", color: "#78350f", fontWeight: "700", marginTop: "8px" }}>Estimated Project Cost:</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#d97706" }}>₹{(parseFloat(plantKw || 0) * 45000).toLocaleString()}</div>

              <div style={{ borderTop: "1px dashed #fbbf24", paddingTop: "8px", marginTop: "8px" }}>
                <div style={{ fontSize: "0.82rem", color: "#78350f", fontWeight: "800" }}>Government MNRE Subsidy Grant (40%):</div>
                <div style={{ fontSize: "1.6rem", fontWeight: "900", color: "#166534" }}>₹{(parseFloat(plantKw || 0) * 45000 * 0.4).toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Vendors & Grid Connection */}
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #fef3c7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 14px 0", color: "#78350f", fontWeight: "800" }}>Empanelled Solar Vendors &amp; Net-Metering</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.85rem" }}>
              <div style={{ background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>Empanelled Solar Vendor A</span>
                <strong style={{ color: "#166534" }}>Certified (MNRE Grade I)</strong>
              </div>
              <div style={{ background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>Empanelled Solar Vendor B</span>
                <strong style={{ color: "#166534" }}>Certified (MNRE Grade I)</strong>
              </div>
              <div style={{ background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                <span>Bi-Directional Net-Meter Status</span>
                <strong style={{ color: "#d97706" }}>Ready for Grid Sync</strong>
              </div>
            </div>
          </div>

        </div>

        {/* PROCESSING QUEUE TABLE */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #fef3c7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#78350f", fontWeight: "800", fontSize: "1.2rem" }}>
            Rooftop Solar Subsidy Applications Queue
          </h3>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ background: "#fffbeb", borderBottom: "2px solid #fef3c7", color: "#78350f", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>App ID</th>
                <th style={{ padding: "12px" }}>Applicant</th>
                <th style={{ padding: "12px" }}>Capacity</th>
                <th style={{ padding: "12px" }}>Revenue Interop Status</th>
                <th style={{ padding: "12px" }}>Status</th>
                <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app._id} style={{ borderBottom: "1px solid #fef3c7" }}>
                  <td style={{ padding: "12px", fontWeight: "900", color: "#d97706" }}>{app.applicationId}</td>
                  <td style={{ padding: "12px", fontWeight: "800" }}>{app.applicantDetails.fullName}</td>
                  <td style={{ padding: "12px", fontWeight: "800", color: "#78350f" }}>{app.plantSizeKw}</td>
                  <td style={{ padding: "12px", color: "#166534", fontSize: "0.82rem", fontWeight: "800" }}>{app.propertyVerificationStatus}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: app.status === "Approved" ? "#dcfce7" : "#fef3c7", color: app.status === "Approved" ? "#166534" : "#854d0e" }}>
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    {app.status !== "Approved" && (
                      <button onClick={() => handleUpdateStatus(app._id, "Approved")} style={{ background: "#16a34a", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                        Approve Subsidy
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
