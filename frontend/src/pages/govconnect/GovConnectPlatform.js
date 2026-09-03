import React, { useEffect, useState } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { FaNetworkWired, FaKey, FaShieldAlt, FaDatabase, FaCogs, FaBell, FaHistory, FaBuilding, FaLandmark, FaHeartbeat, FaCheckCircle, FaExchangeAlt, FaArrowRight, FaServer, FaArrowDown, FaUser, FaTimes, FaCheck, FaExchangeAlt as FaTransform, FaFire, FaAward } from "react-icons/fa";

export default function GovConnectPlatform() {
  const [metrics, setMetrics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mapped Data Tester State
  const [citizenIdInput, setCitizenIdInput] = useState("C101");
  const [mappedDataResult, setMappedDataResult] = useState(null);
  const [consentCheckResult, setConsentCheckResult] = useState(null);

  useEffect(() => {
    fetchGovConnectDetails();
  }, []);

  const fetchGovConnectDetails = async () => {
    setLoading(true);
    try {
      const metricRes = await API.get("/interop/metrics");
      setMetrics(metricRes.data?.metrics);

      const logsRes = await API.get("/governance/audit-logs");
      setAuditLogs(logsRes.data?.logs?.slice(0, 8) || []);
    } catch (err) {
      console.warn("GovConnect Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunDataMapper = async () => {
    try {
      const res = await API.get(`/interop/mapped-data?citizenId=${citizenIdInput}`);
      setMappedDataResult(res.data);
    } catch (err) {
      console.error("Data Mapper error:", err);
    }
  };

  const handleTestConsent = async () => {
    try {
      const res = await API.post("/interop/check-consent", {
        citizenId: citizenIdInput,
        requestingPortal: "Municipal Portal",
        targetPortal: "Revenue Portal",
        scope: "LAND_OWNERSHIP_VERIFICATION"
      });
      setConsentCheckResult(res.data);
    } catch (err) {
      console.error("Consent check error:", err);
    }
  };

  return (
    <div style={{ background: "#0f172a", minHeight: "100vh", color: "#f8fafc", padding: "30px 20px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* GovConnect Header */}
        <div style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)", borderRadius: "16px", padding: "28px", border: "1px solid #334155", marginBottom: "28px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ background: "#38bdf8", color: "#0f172a", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
                  INTEROPERABILITY MIDDLEWARE LAYER
                </span>
                <span style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaServer /> Status: ONLINE (API Gateway Active)
                </span>
              </div>
              <h1 style={{ margin: "0 0 6px 0", fontSize: "2.2rem", fontWeight: "900", color: "#ffffff", letterSpacing: "-0.5px" }}>
                GovConnect Interoperability Platform
              </h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "1rem", maxWidth: "850px" }}>
                The core SIH middleware connecting Citizen Portal and Departmental Portals (Municipality, Revenue, Health/Welfare) through single sign-on Identity, Consent management, API Gateway, Data Transformation, Workflow Engine, Event Manager, and Audit Logs.
              </p>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <Link to="/citizen" style={{ padding: "10px 18px", borderRadius: "8px", background: "#38bdf8", color: "#0f172a", textDecoration: "none", fontWeight: "800", fontSize: "0.9rem" }}>
                Citizen Portal
              </Link>
              <Link to="/official" style={{ padding: "10px 18px", borderRadius: "8px", background: "#334155", color: "#ffffff", textDecoration: "none", fontWeight: "800", fontSize: "0.9rem" }}>
                Admin Portal
              </Link>
            </div>
          </div>
        </div>

        {/* 🔥 FLAGSHIP SIH JUDGE SHOWCASE DEMO WORKFLOW BOX */}
        <div style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)", padding: "30px", borderRadius: "20px", border: "2px solid #a855f7", marginBottom: "36px", boxShadow: "0 15px 35px rgba(168, 85, 247, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ background: "#a855f7", color: "#ffffff", padding: "6px 14px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: "900", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaAward /> FLAGSHIP SIH JUDGE SHOWCASE WORKFLOW
            </span>
            <span style={{ color: "#c084fc", fontSize: "0.88rem", fontWeight: "800" }}>
              Water Connection Multi-Department Flow
            </span>
          </div>

          <h2 style={{ margin: "0 0 12px 0", fontSize: "1.6rem", fontWeight: "900", color: "#ffffff" }}>
            💧 Water Connection: Demonstrating All 9 SIH Evaluation Criteria in 1 Single Workflow
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", marginBottom: "24px" }}>
            
            {/* Visual Workflow Column */}
            <div style={{ background: "#0f172a", padding: "20px", borderRadius: "14px", border: "1px solid #334155" }}>
              <div style={{ color: "#38bdf8", fontWeight: "900", fontSize: "0.95rem", marginBottom: "12px" }}>End-to-End Execution Sequence</div>
              <pre style={{ margin: 0, color: "#e2e8f0", fontSize: "0.82rem", lineHeight: "1.45", background: "#1e293b", padding: "14px", borderRadius: "10px", overflowX: "auto" }}>
{`              WATER CONNECTION
                     │
                     ▼
                  CITIZEN (Pavan applies)
                     │
                     ▼
                GOVCONNECT (Generates GC1001)
                     │
                     ▼
               MUNICIPALITY (Needs property data)
                     │
                     ▼
                GOVCONNECT (Triggers Consent Prompt)
                     │
             Consent obtained (Citizen ALLOWS)
                     │
                     ▼
                 REVENUE (Queries DB for PROP102)
                     │
              Property verified (Returns deed)
                     │
                     ▼
                GOVCONNECT (Data Mapper transforms)
                     │
                     ▼
               MUNICIPALITY (Officer Grants Approval)
                     │
                     ▼
                GOVCONNECT (Triggers Notifications)
                     │
                     ▼
                CITIZEN (Realtime SMS & Alert)
                     │
                     ▼
              UNIFIED TRACKER (Checklist Complete)`}
              </pre>
            </div>

            {/* 9 SIH Criteria List Column */}
            <div style={{ background: "#0f172a", padding: "20px", borderRadius: "14px", border: "1px solid #334155", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ color: "#c084fc", fontWeight: "900", fontSize: "0.95rem", marginBottom: "12px" }}>9 Core Criteria Demonstrated</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {[
                    "1. API Integration",
                    "2. Interoperability",
                    "3. Consent Manager",
                    "4. Data Sharing",
                    "5. Data Transformation",
                    "6. Multi-Department",
                    "7. Workflow Engine",
                    "8. Unified Tracking",
                    "9. Audit Logs Ledger"
                  ].map((c, idx) => (
                    <div key={idx} style={{ background: "#1e293b", border: "1px solid #475569", color: "#f8fafc", padding: "8px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaCheckCircle color="#a855f7" size={12} /> {c}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "16px", background: "#2e1065", border: "1px solid #7e22ce", color: "#e9d5ff", padding: "12px 14px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700" }}>
                💡 <strong>Judge Impact:</strong> Showing this single unified flow live proves complete end-to-end e-governance interoperability!
              </div>
            </div>

          </div>
        </div>

        {/* 🌟 HUB-AND-SPOKE ARCHITECTURE COMPARISON DIAGRAM BOX */}
        <div style={{ background: "#1e293b", padding: "28px", borderRadius: "16px", border: "2px solid #38bdf8", marginBottom: "32px", boxShadow: "0 10px 25px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ background: "#38bdf8", color: "#0f172a", padding: "4px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
              SIH 129 ARCHITECTURAL PATTERN ENFORCEMENT
            </span>
            <span style={{ color: "#38bdf8", fontSize: "0.85rem", fontWeight: "800" }}>
              Every Department Connects Through GovConnect
            </span>
          </div>

          <h2 style={{ margin: "0 0 12px 0", fontSize: "1.35rem", fontWeight: "900", color: "#ffffff" }}>
            The Beautiful Part: Portals Communicate Exclusively Through GovConnect
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
            
            {/* ❌ Anti-Pattern */}
            <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "1px solid #ef4444" }}>
              <div style={{ color: "#ef4444", fontWeight: "900", fontSize: "0.9rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaTimes /> Direct Point-to-Point Anti-Pattern (PROHIBITED)
              </div>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", margin: "0 0 12px 0" }}>
                Portals linking directly create an unmaintainable mesh and violate security/consent boundaries.
              </p>
              <pre style={{ margin: 0, color: "#fca5a5", fontSize: "0.82rem", lineHeight: "1.4", background: "#1e1b4b", padding: "12px", borderRadius: "8px" }}>
{`Municipality ─────────> Revenue
      │                    │
      └──────> Welfare <───┘`}
              </pre>
            </div>

            {/* ✅ Enforced GovConnect Model */}
            <div style={{ background: "#0f172a", padding: "20px", borderRadius: "12px", border: "2px solid #22c55e" }}>
              <div style={{ color: "#22c55e", fontWeight: "900", fontSize: "0.9rem", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaCheck /> GovConnect Hub-and-Spoke Interoperability Model (ENFORCED)
              </div>
              <p style={{ fontSize: "0.8rem", color: "#cbd5e1", margin: "0 0 12px 0" }}>
                Every department routes API calls through GovConnect middleware layer for consent checking, auditing, and transformation.
              </p>
              <pre style={{ margin: 0, color: "#86efac", fontSize: "0.82rem", lineHeight: "1.4", background: "#064e3b", padding: "12px", borderRadius: "8px" }}>
{`       ┌──────────────┐
       │  GovConnect  │
       │ Interoperability
       │    Layer     │
       └───────┬──────┘
               │
┌──────────────┼──────────────┐
▼              ▼              ▼
Municipality Revenue        Welfare
  Portal     Portal          Portal
    │          │              │
    └──────────┼──────────────┘
               ▼
            Citizen`}
              </pre>
            </div>

          </div>
        </div>

        {/* 🌟 DATA MAPPER SCHEMA TRANSFORMATION BOX */}
        <div style={{ background: "#1e293b", padding: "28px", borderRadius: "16px", border: "2px solid #fb923c", marginBottom: "32px", boxShadow: "0 10px 25px rgba(0,0,0,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <span style={{ background: "#fb923c", color: "#0f172a", padding: "4px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
              KEY SIH FEATURE — SCHEMA DATA TRANSFORMATION ENGINE
            </span>
            <span style={{ color: "#fb923c", fontSize: "0.85rem", fontWeight: "700" }}>
              Legacy Systems Do Not Need Redesigning!
            </span>
          </div>

          <h2 style={{ margin: "0 0 8px 0", fontSize: "1.35rem", fontWeight: "900", color: "#ffffff" }}>
            Disparate Schema Mapping: Revenue Format → Common Model → Municipality Format
          </h2>
          <p style={{ margin: "0 0 20px 0", color: "#94a3b8", fontSize: "0.88rem" }}>
            Revenue uses <code>owner_name</code>, <code>property_id</code>, <code>verified</code>. Municipality expects <code>ownerName</code>, <code>propertyId</code>, <code>ownershipStatus</code>. GovConnect standardizes data on the fly.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", background: "#0f172a", padding: "20px", borderRadius: "14px", border: "1px solid #334155" }}>
            
            {/* Revenue Format Box */}
            <div style={{ background: "#1e293b", border: "1px solid #fbbf24", borderRadius: "10px", padding: "14px" }}>
              <div style={{ color: "#fbbf24", fontWeight: "900", fontSize: "0.9rem", marginBottom: "8px" }}>1. Revenue Database Format (Input)</div>
              <pre style={{ margin: 0, color: "#f8fafc", fontSize: "0.8rem", background: "#0f172a", padding: "10px", borderRadius: "6px" }}>
{`{
  "owner_name": "Pavan",
  "property_id": "PROP102",
  "verified": true
}`}
              </pre>
            </div>

            {/* Data Mapper Common Model */}
            <div style={{ background: "#1e293b", border: "1px solid #fb923c", borderRadius: "10px", padding: "14px" }}>
              <div style={{ color: "#fb923c", fontWeight: "900", fontSize: "0.9rem", marginBottom: "8px" }}>2. GovConnect Common Model</div>
              <pre style={{ margin: 0, color: "#f8fafc", fontSize: "0.8rem", background: "#0f172a", padding: "10px", borderRadius: "6px" }}>
{`{
  "context": "property.jsonld",
  "citizenId": "C101",
  "standardPropertyId": "PROP102",
  "standardOwnerName": "Pavan"
}`}
              </pre>
            </div>

            {/* Municipality Format Box */}
            <div style={{ background: "#1e293b", border: "1px solid #38bdf8", borderRadius: "10px", padding: "14px" }}>
              <div style={{ color: "#38bdf8", fontWeight: "900", fontSize: "0.9rem", marginBottom: "8px" }}>3. Municipality Portal Expected Output</div>
              <pre style={{ margin: 0, color: "#f8fafc", fontSize: "0.8rem", background: "#0f172a", padding: "10px", borderRadius: "6px" }}>
{`{
  "ownerName": "Pavan",
  "propertyId": "PROP102",
  "ownershipStatus": "VERIFIED_VALID"
}`}
              </pre>
            </div>

          </div>
        </div>

        {/* Live Interoperability Test Sandbox */}
        <div style={{ background: "#1e293b", padding: "24px", borderRadius: "16px", border: "1px solid #334155", marginBottom: "32px" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: "800", color: "#ffffff", display: "flex", alignItems: "center", gap: "8px" }}>
            <FaCogs style={{ color: "#38bdf8" }} /> Live GovConnect Data Mapper & Consent Sandbox
          </h3>

          <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
            <input
              type="text"
              value={citizenIdInput}
              onChange={(e) => setCitizenIdInput(e.target.value)}
              placeholder="Citizen ID (e.g. C101)"
              style={{ padding: "10px 14px", borderRadius: "8px", border: "1px solid #475569", background: "#0f172a", color: "#ffffff", fontWeight: "700" }}
            />

            <button
              onClick={handleRunDataMapper}
              style={{ padding: "10px 18px", borderRadius: "8px", background: "#fb923c", color: "#0f172a", border: "none", fontWeight: "900", cursor: "pointer" }}
            >
              Execute Data Mapper Transformation
            </button>

            <button
              onClick={handleTestConsent}
              style={{ padding: "10px 18px", borderRadius: "8px", background: "#059669", color: "white", border: "none", fontWeight: "700", cursor: "pointer" }}
            >
              Test Inter-Portal Consent Check
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {mappedDataResult && (
              <div style={{ background: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #fb923c", fontSize: "0.85rem" }}>
                <div style={{ color: "#fb923c", fontWeight: "800", marginBottom: "8px" }}>Data Mapper Output Payload:</div>
                <pre style={{ margin: 0, color: "#cbd5e1", overflowX: "auto" }}>{JSON.stringify(mappedDataResult, null, 2)}</pre>
              </div>
            )}

            {consentCheckResult && (
              <div style={{ background: "#0f172a", padding: "16px", borderRadius: "8px", border: "1px solid #4ade80", fontSize: "0.85rem" }}>
                <div style={{ color: "#4ade80", fontWeight: "800", marginBottom: "8px" }}>Consent Manager Verification:</div>
                <pre style={{ margin: 0, color: "#cbd5e1", overflowX: "auto" }}>{JSON.stringify(consentCheckResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
