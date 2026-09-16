import React, { useState } from "react";
import { FaPlay, FaCheckCircle, FaExclamationTriangle, FaTimes, FaLayerGroup, FaExchangeAlt, FaShieldAlt } from "react-icons/fa";
import { createNewApplicationInStore, updateApplicationInStore } from "../services/applicationStore";

export default function SihDemoControlBar({ onTriggerScenario }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeNote, setActiveNote] = useState("");

  const runScenario1 = () => {
    setActiveNote("🎯 Scenario 1 Triggered: Happy Path Income Certificate submission for Pavan Kumar");
    const app = createNewApplicationInStore({
      serviceId: "income-certificate",
      serviceType: "Certificates",
      title: "Income Certificate Application (Pavan Kumar)",
      governmentFee: 30,
      applicantDetails: {
        fullName: "Pavan Kumar",
        phone: "+91 98765 43210",
        email: "citizen@example.com",
        aadhaarId: "9876-5432-1000",
        annualIncome: "85000",
        address: "14 Station Road, Green Valley"
      }
    });
    if (onTriggerScenario) onTriggerScenario(app);
  };

  const runScenario2 = () => {
    setActiveNote("🛑 Scenario 2 Triggered: Dues Blocking Logic! Unpaid ₹1,850 Land Tax halts workflow.");
    const app = createNewApplicationInStore({
      serviceId: "income-certificate",
      serviceType: "Certificates",
      title: "Annual Family Income Certificate (Suresh Deshmukh)",
      governmentFee: 30,
      applicantDetails: {
        fullName: "Suresh Deshmukh",
        phone: "+91 98765 43212",
        email: "suresh@example.com",
        aadhaarId: "9876-5432-1002",
        surveyNumber: "SRV-103",
        annualIncome: "60000",
        address: "Survey 103 Sector, Green Valley"
      },
      pendingDues: {
        officeName: "Revenue",
        dueType: "Unpaid Land Revenue Cess & Tax",
        amount: 1850,
        surveyOrPropertyId: "SRV-103",
        isPaid: false
      }
    });
    if (onTriggerScenario) onTriggerScenario(app);
  };

  const runScenario3 = () => {
    setActiveNote("🌾 Scenario 3 Triggered: New Unverified Agricultural Land Declaration");
    const app = createNewApplicationInStore({
      serviceId: "property-land-mutation",
      serviceType: "Land Records",
      title: "New 4.5 Acre Agricultural Land Declaration",
      governmentFee: 150,
      applicantDetails: {
        fullName: "Anita Sharma",
        phone: "+91 98765 43211",
        email: "anita@example.com",
        aadhaarId: "9876-5432-1003",
        surveyNumber: "SRV-1004",
        builtUpArea: "4.5 Acres",
        address: "Green Valley Gram Panchayat Ward 5"
      }
    });
    if (onTriggerScenario) onTriggerScenario(app);
  };

  const runScenario4 = () => {
    setActiveNote("⚠️ Scenario 4 Triggered: AI OCR Identity Mismatch Warning");
    const app = createNewApplicationInStore({
      serviceId: "domicile-certificate",
      serviceType: "Certificates",
      title: "Domicile Certificate (Name Mismatch Test)",
      governmentFee: 50,
      applicantDetails: {
        fullName: "Pavan M. Kumar", // Slight mismatch from master 'Pavan Kumar'
        phone: "+91 98765 43210",
        email: "citizen@example.com",
        aadhaarId: "9876-5432-1000",
        address: "Plot 14 Main Road"
      }
    });
    if (onTriggerScenario) onTriggerScenario(app);
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9998, fontFamily: "'Inter', sans-serif" }}>
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          style={{ background: "#0f172a", color: "#38bdf8", border: "2px solid #38bdf8", padding: "12px 20px", borderRadius: "30px", fontWeight: "900", cursor: "pointer", boxShadow: "0 10px 25px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: "8px", fontSize: "0.9rem" }}
        >
          <FaPlay /> 🎯 Open SIH Evaluator Demo Bar
        </button>
      ) : (
        <div style={{ background: "#0f172a", color: "white", borderRadius: "20px", padding: "20px", border: "2px solid #38bdf8", boxShadow: "0 20px 40px rgba(0,0,0,0.4)", maxWidth: "420px", width: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ background: "#38bdf8", color: "#0f172a", padding: "4px 10px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "900" }}>
              SIH JUDGE EVALUATOR DEMO CONTROLLER
            </span>
            <button onClick={() => setCollapsed(true)} style={{ background: "transparent", color: "#94a3b8", border: "none", cursor: "pointer", fontSize: "1rem" }}>
              <FaTimes />
            </button>
          </div>

          <p style={{ margin: "0 0 14px 0", fontSize: "0.82rem", color: "#cbd5e1" }}>
            1-Click scenario triggers to demonstrate live multi-office workflow logic during hackathon judging:
          </p>

          <div style={{ display: "grid", gap: "8px", marginBottom: "12px" }}>
            <button
              onClick={runScenario1}
              style={{ background: "#15803d", color: "white", border: "none", padding: "10px 14px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", textAlign: "left", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaCheckCircle style={{ color: "#86efac" }} /> Demo 1: Happy Path Income Approval
            </button>

            <button
              onClick={runScenario2}
              style={{ background: "#b45309", color: "white", border: "none", padding: "10px 14px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", textAlign: "left", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaExclamationTriangle style={{ color: "#fef08a" }} /> Demo 2: Revenue Dues Halting (₹1,850)
            </button>

            <button
              onClick={runScenario3}
              style={{ background: "#0284c7", color: "white", border: "none", padding: "10px 14px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", textAlign: "left", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaLayerGroup style={{ color: "#bae6fd" }} /> Demo 3: New Agricultural Land Declaration
            </button>

            <button
              onClick={runScenario4}
              style={{ background: "#7c3aed", color: "white", border: "none", padding: "10px 14px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", textAlign: "left", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "8px" }}
            >
              <FaShieldAlt style={{ color: "#ddd6fe" }} /> Demo 4: AI OCR Identity Mismatch Test
            </button>
          </div>

          {activeNote && (
            <div style={{ background: "#1e293b", padding: "10px 12px", borderRadius: "8px", fontSize: "0.78rem", color: "#38bdf8", border: "1px solid #334155", fontWeight: "700" }}>
              {activeNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
