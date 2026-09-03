import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaShieldAlt, FaKey, FaLock, FaCheckCircle, FaTimesCircle, FaPlus, FaIdCard, FaDatabase, FaExchangeAlt, FaExclamationCircle, FaUndo } from "react-icons/fa";

export default function ConsentManager() {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Step 5 Interactive Consent State for GC1001 Water Connection
  const [activeConsentRequest, setActiveConsentRequest] = useState({
    id: "REQ-GC1001",
    requestingDept: "Municipality Portal",
    targetDept: "Revenue Department",
    scope: "Property Ownership Information",
    purpose: "Water Connection Verification (App ID: GC1001)",
    status: "PENDING_DECISION" // PENDING_DECISION, ALLOWED, DENIED
  });

  useEffect(() => {
    fetchConsentData();
  }, []);

  const fetchConsentData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const consentRes = await API.get("/governance/consent/my-consents", { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
      setConsents(consentRes?.data?.data || consentRes?.data || []);
    } catch (err) {
      console.warn("Consent fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConsentDecision = (decision) => {
    // 1. Immediate UI state update for 100% responsiveness
    const newStatus = decision === "ALLOW" ? "ALLOWED" : "DENIED";
    setActiveConsentRequest(prev => ({
      ...prev,
      status: newStatus
    }));

    if (decision === "ALLOW") {
      setFeedbackMsg({ type: "success", text: "✓ CONSENT GRANTED! GovConnect is now fetching property details from Revenue DB for GC1001." });
    } else {
      setFeedbackMsg({ type: "error", text: "✕ CONSENT DENIED. Data sharing blocked. Municipality will request manual document upload." });
    }

    // 2. Background API notification
    API.post("/interop/check-consent", {
      citizenId: "C101",
      requestingPortal: "Municipality Portal",
      targetPortal: "Revenue Department",
      scope: "Property Ownership Information",
      decision
    }).catch(err => {
      console.warn("Background consent API logging note:", err);
    });
  };

  const handleResetConsent = () => {
    setActiveConsentRequest(prev => ({ ...prev, status: "PENDING_DECISION" }));
    setFeedbackMsg(null);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <span style={{ background: "#e0f2fe", color: "#0284c7", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", textTransform: "uppercase" }}>
            GOVCONNECT CONSENT MANAGER
          </span>
          <h2 style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "1.75rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
            <FaShieldAlt style={{ color: "#059669" }} /> Resident Data Sharing Consent Console
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
            You control when Department A (e.g., Municipality) is authorized to query Department B (e.g., Revenue) via GovConnect.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", background: feedbackMsg.type === "success" ? "#ecfdf5" : "#fef2f2", color: feedbackMsg.type === "success" ? "#065f46" : "#991b1b", border: `1px solid ${feedbackMsg.type === "success" ? "#a7f3d0" : "#fecaca"}`, fontWeight: "800", fontSize: "0.95rem" }}>
          {feedbackMsg.text}
        </div>
      )}

      {/* 🌟 STEP 5: INTERACTIVE CONSENT PROMPT CARD (Water Connection GC1001) */}
      <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "2px solid #0284c7", boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.15)", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#e0f2fe", color: "#0284c7", padding: "10px", borderRadius: "10px" }}>
              <FaExclamationCircle size={24} />
            </div>
            <div>
              <span style={{ background: "#fef3c7", color: "#78350f", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                STEP 5 — INTER-DEPARTMENT CONSENT PROMPT
              </span>
              <h3 style={{ margin: "2px 0 0 0", color: "#0f172a", fontSize: "1.25rem", fontWeight: "800" }}>
                Revenue Department Access Request
              </h3>
            </div>
          </div>

          {activeConsentRequest.status !== "PENDING_DECISION" && (
            <button
              onClick={handleResetConsent}
              style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaUndo /> Reset Prompt
            </button>
          )}
        </div>

        <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #cbd5e1", marginBottom: "20px" }}>
          <div style={{ fontSize: "1rem", color: "#0f172a", fontWeight: "800", marginBottom: "6px" }}>
            Revenue Department requests:
          </div>
          <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#0284c7", marginBottom: "12px" }}>
            Property Ownership Information
          </div>

          <div style={{ fontSize: "0.85rem", color: "#475569", fontWeight: "700" }}>
            Purpose:
          </div>
          <div style={{ fontSize: "0.95rem", color: "#334155", fontWeight: "800" }}>
            Water Connection Verification (App ID: GC1001)
          </div>
        </div>

        {activeConsentRequest.status === "PENDING_DECISION" ? (
          <div style={{ display: "flex", gap: "14px" }}>
            <button
              type="button"
              onClick={() => handleConsentDecision("ALLOW")}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                padding: "14px 32px",
                borderRadius: "10px",
                fontWeight: "900",
                fontSize: "1.05rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(22, 163, 74, 0.4)",
                transition: "transform 0.1s ease"
              }}
            >
              [ ALLOW ]
            </button>

            <button
              type="button"
              onClick={() => handleConsentDecision("DENY")}
              style={{
                background: "#dc2626",
                color: "#ffffff",
                border: "none",
                padding: "14px 32px",
                borderRadius: "10px",
                fontWeight: "900",
                fontSize: "1.05rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
                transition: "transform 0.1s ease"
              }}
            >
              [ DENY ]
            </button>
          </div>
        ) : activeConsentRequest.status === "ALLOWED" ? (
          <div style={{ background: "#f0fdf4", color: "#166534", padding: "16px 20px", borderRadius: "10px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #86efac" }}>
            <FaCheckCircle size={22} color="#16a34a" /> CONSENT GRANTED! GovConnect is now fetching property details from Revenue DB for GC1001.
          </div>
        ) : (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "16px 20px", borderRadius: "10px", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #fca5a5" }}>
            <FaTimesCircle size={22} color="#dc2626" /> CONSENT DENIED. Data sharing blocked. Municipality will request manual document upload.
          </div>
        )}
      </div>

      {/* Active Granted Consents List */}
      <h3 style={{ color: "#334155", marginBottom: "16px" }}>Historical Consent Tokens Ledger</h3>
      <div style={{ background: "#ffffff", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
          <div>
            <span style={{ fontSize: "0.75rem", background: "#ecfdf5", color: "#065f46", padding: "2px 8px", borderRadius: "4px", fontWeight: "700" }}>
              ACTIVE TOKEN
            </span>
            <h4 style={{ margin: "4px 0 2px 0", color: "#0f172a" }}>Municipality → Revenue Gateway Data Token</h4>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontFamily: "monospace" }}>Token: CONSENT-GC1001-WATER</span>
          </div>
        </div>

        <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", color: "#475569" }}>
          <div><strong>Authorized Scope:</strong> Property Ownership Information</div>
          <div><strong>Purpose:</strong> Water Connection Verification</div>
          <div><strong>Security Layer:</strong> GovConnect Interoperability Tokenizer</div>
        </div>
      </div>

    </div>
  );
}
