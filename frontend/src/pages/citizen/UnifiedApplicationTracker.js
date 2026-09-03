import React, { useState } from "react";
import { FaSearch, FaCheckCircle, FaHourglassHalf, FaBell, FaTint, FaArrowDown, FaStore, FaSun, FaUserCheck, FaFileContract } from "react-icons/fa";

export default function UnifiedApplicationTracker() {
  const [selectedServiceTrack, setSelectedServiceTrack] = useState("water");

  const tracks = {
    water: {
      id: "GC-WATER-1001",
      title: "Water Connection",
      icon: <FaTint color="#0284c7" size={24} />,
      dept: "Municipality Portal",
      steps: [
        { name: "✓ Application Submitted", dept: "Citizen → GovConnect Gateway", done: true },
        { name: "✓ Property Verified", dept: "Auto-verified via Revenue Portal (PROP102)", done: true },
        { name: "✓ Documents Verified", dept: "Automated Rules Engine", done: true },
        { name: "✓ Municipal Officer Approved", dept: "Municipality Portal", done: true },
        { name: "⏳ Connection Installation", dept: "Pending Field Installation", done: false, pending: true }
      ]
    },
    trade: {
      id: "GC-TRADE-2002",
      title: "Commercial Trade License",
      icon: <FaStore color="#9333ea" size={24} />,
      dept: "Municipality Portal",
      steps: [
        { name: "✓ Citizen Portal Apply", dept: "Citizen Portal", done: true },
        { name: "✓ GovConnect API Gateway", dept: "GovConnect Gateway", done: true },
        { name: "✓ Municipality Portal Intake", dept: "Municipality Portal", done: true },
        { name: "✓ Business Verification", dept: "Commerce Registry", done: true },
        { name: "✓ Property Verification", dept: "Revenue DB via GovConnect Interop", done: true },
        { name: "✓ Officer Approval", dept: "Municipal Officer", done: true },
        { name: "✓ License Generated", dept: "Cryptographic Certificate Issued", done: true }
      ]
    },
    solar: {
      id: "GC-SOLAR-3003",
      title: "Rooftop Solar Subsidy",
      icon: <FaSun color="#d97706" size={24} />,
      dept: "Renewable Energy Portal",
      interopHighlight: "⚡ Interoperability Highlight: Energy Portal requested land & property info from Revenue DB through GovConnect!",
      steps: [
        { name: "✓ Solar Subsidy Application", dept: "Citizen Portal", done: true },
        { name: "✓ GovConnect Gateway Route", dept: "GovConnect Gateway", done: true },
        { name: "✓ Energy Portal Intake", dept: "Renewable Energy Portal", done: true },
        { name: "✓ Property Verification", dept: "Fetched from Revenue DB via GovConnect Interop", done: true },
        { name: "✓ Eligibility Check", dept: "MNRE Solar Guidelines Engine", done: true },
        { name: "✓ Installation Verification", dept: "Field Engineer Sign-Off", done: true },
        { name: "✓ Subsidy Approved & Disbursed", dept: "Direct Benefit Transfer (DBT)", done: true }
      ]
    },
    pension: {
      id: "GC-PENSION-4004",
      title: "Senior / Widow Pension",
      icon: <FaUserCheck color="#16a34a" size={24} />,
      dept: "Welfare / Health Portal",
      steps: [
        { name: "✓ Pension Application", dept: "Citizen Portal", done: true },
        { name: "✓ GovConnect Gateway Route", dept: "GovConnect Gateway", done: true },
        { name: "✓ Welfare Portal Intake", dept: "Social Welfare Portal", done: true },
        { name: "✓ Identity Verification", dept: "Aadhaar e-KYC Vault via GovConnect", done: true },
        { name: "✓ Eligibility Verification", dept: "Income & Age Ledger", done: true },
        { name: "✓ Approval Granted", dept: "Welfare Officer", done: true },
        { name: "✓ Benefit Processing", dept: "Direct Bank Transfer Active", done: true }
      ]
    },
    property: {
      id: "GC-PROPERTY-5005",
      title: "Property Ownership Transfer",
      icon: <FaFileContract color="#d97706" size={24} />,
      dept: "Revenue Portal",
      interopHighlight: "⚡ Reverse Direction Flow: Resident requests title transfer directly in Revenue DB via GovConnect!",
      steps: [
        { name: "✓ Property Transfer Application", dept: "Citizen Portal", done: true },
        { name: "✓ GovConnect Gateway Route", dept: "GovConnect Gateway", done: true },
        { name: "✓ Revenue Portal Intake", dept: "Revenue Department", done: true },
        { name: "✓ Property Record Verification", dept: "Land Survey Registry", done: true },
        { name: "✓ Tax Clearances Verification", dept: "Municipal Tax Interop Check", done: true },
        { name: "✓ Ownership Ledger Update", dept: "State Mutation Register", done: true },
        { name: "✓ Digital Title Certificate Issued", dept: "Cryptographic Title Deed", done: true }
      ]
    }
  };

  const currentTrack = tracks[selectedServiceTrack];

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <span style={{ background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase" }}>
          UNIFIED APPLICATION TRACKER
        </span>
        <h2 style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "1.75rem", fontWeight: "800" }}>
          Multi-Departmental Interoperability Service Tracker
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
          Track real-time status across Municipal, Revenue, Energy, and Welfare portals without visiting individual department offices!
        </p>
      </div>

      {/* Service Selector Tabs */}
      <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "24px", paddingBottom: "4px" }}>
        {[
          { key: "water", label: "🚰 Water Connection" },
          { key: "trade", label: "🏪 Trade License" },
          { key: "solar", label: "☀️ Solar Subsidy" },
          { key: "pension", label: "👴 Pension Application" },
          { key: "property", label: "📄 Property Transfer" }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setSelectedServiceTrack(tab.key)}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: selectedServiceTrack === tab.key ? "2px solid #0284c7" : "1px solid #cbd5e1",
              background: selectedServiceTrack === tab.key ? "#e0f2fe" : "#ffffff",
              color: selectedServiceTrack === tab.key ? "#0c4a6e" : "#475569",
              fontWeight: "800",
              fontSize: "0.85rem",
              cursor: "pointer",
              whiteSpace: "nowrap"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 🌟 UNIFIED TRACKING CARD FOR SELECTED SERVICE */}
      <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "2px solid #0284c7", boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.15)", marginBottom: "32px" }}>
        
        {/* Card Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <span style={{ background: "#e0f2fe", color: "#0284c7", fontSize: "0.85rem", fontWeight: "900", padding: "4px 10px", borderRadius: "6px" }}>
              Application ID: {currentTrack.id}
            </span>
            <h3 style={{ margin: "6px 0 2px 0", fontSize: "1.4rem", fontWeight: "900", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
              {currentTrack.icon} {currentTrack.title}
            </h3>
            <span style={{ fontSize: "0.85rem", color: "#64748b" }}>
              Primary Processing Department: <strong>{currentTrack.dept}</strong>
            </span>
          </div>

          <span style={{ background: "#dcfce7", color: "#166534", padding: "6px 14px", borderRadius: "12px", fontWeight: "800", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaCheckCircle /> Processed &amp; Synchronized
          </span>
        </div>

        {/* Interop Callout Highlight if Present */}
        {currentTrack.interopHighlight && (
          <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", color: "#78350f", padding: "12px 16px", borderRadius: "10px", fontWeight: "800", fontSize: "0.85rem", marginBottom: "18px" }}>
            {currentTrack.interopHighlight}
          </div>
        )}

        {/* 📋 Milestone Vertical Checklist Flow */}
        <div style={{ background: "#f8fafc", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
          <h4 style={{ margin: "0 0 18px 0", color: "#334155", fontSize: "1.05rem", fontWeight: "800" }}>
            Step-by-Step Interoperability Workflow Pathway
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxWidth: "650px" }}>
            {currentTrack.steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div style={{ background: step.pending ? "#fffbeb" : "#f0fdf4", border: `1px solid ${step.pending ? "#fef3c7" : "#bbf7d0"}`, padding: "12px 16px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <span style={{ fontWeight: "800", color: step.pending ? "#92400e" : "#166534", fontSize: "0.95rem" }}>
                      {step.name}
                    </span>
                    <small style={{ color: "#64748b", display: "block", fontWeight: "700", marginTop: "2px" }}>{step.dept}</small>
                  </div>
                  <span style={{ fontSize: "0.75rem", background: step.pending ? "#fef3c7" : "#dcfce7", color: step.pending ? "#78350f" : "#166534", padding: "4px 10px", borderRadius: "6px", fontWeight: "800" }}>
                    {step.pending ? "Pending" : "✓ Verified"}
                  </span>
                </div>
                {idx < currentTrack.steps.length - 1 && (
                  <div style={{ textAlign: "center", color: "#0284c7", fontSize: "0.9rem" }}><FaArrowDown /></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Callout Banner */}
        <div style={{ marginTop: "16px", background: "#e0f2fe", border: "1px solid #38bdf8", padding: "14px 18px", borderRadius: "10px", color: "#0c4a6e", fontSize: "0.9rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaBell style={{ color: "#0284c7" }} /> The citizen doesn't have to visit department offices. Unified real-time updates are pushed directly to the Citizen Portal via GovConnect!
        </div>

      </div>

    </div>
  );
}
