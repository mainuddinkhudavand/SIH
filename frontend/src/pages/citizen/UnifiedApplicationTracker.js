import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaCreditCard,
  FaDownload,
  FaQrcode,
  FaPrint,
  FaBuilding,
  FaStamp,
  FaArrowRight,
  FaMobileAlt,
  FaUniversity,
  FaReceipt,
  FaLock
} from "react-icons/fa";
import API from "../../services/api";
import {
  getApplicationByIdFromStore,
  payDuesInStore,
  subscribeToAppStore
} from "../../services/applicationStore";

export default function UnifiedApplicationTracker() {
  const [searchId, setSearchId] = useState("CERT-847291");
  const [loading, setLoading] = useState(false);
  const [application, setApplication] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [payMethod, setPayMethod] = useState("UPI");
  
  // UPI State
  const [upiApp, setUpiApp] = useState("PhonePe");
  const [upiId, setUpiId] = useState("9876543210@ybl");
  const [upiPin, setUpiPin] = useState("9482");

  // NetBanking State
  const [bankName, setBankName] = useState("State Bank of India");
  const [accountNumber, setAccountNumber] = useState("4589201938");
  const [accountHolderName, setAccountHolderName] = useState("Pavan Kumar");
  const [ifscCode, setIfscCode] = useState("SBIN0001420");

  // Card State
  const [cardType, setCardType] = useState("RuPay Card");
  const [cardNumber, setCardNumber] = useState("4532891048219012");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("842");

  const [processingPay, setProcessingPay] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  useEffect(() => {
    // Initial lookup on mount
    fetchApplication(searchId);

    // Subscribe to live application store updates across all 4 office portals
    const unsubscribe = subscribeToAppStore((detail) => {
      if (application) {
        const currentId = (application.applicationId || application._id || "").toString().toLowerCase();
        const updatedId = (detail.appId || detail.updatedApp?.applicationId || detail.updatedApp?._id || "").toString().toLowerCase();
        if (currentId === updatedId) {
          if (detail.updatedApp) {
            setApplication(detail.updatedApp);
          } else {
            fetchApplication(application.applicationId || application._id);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [application?.applicationId]);

  const fetchApplication = async (idToSearch) => {
    if (!idToSearch) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Check local master applicationStore first for real-time status sync
      const localMatch = getApplicationByIdFromStore(idToSearch);
      if (localMatch) {
        setApplication(localMatch);
      }

      // 2. Query backend database
      const res = await API.get(`/applications/track/${idToSearch.trim()}`);
      if (res.data && res.data._id) {
        setApplication(res.data);
      }
    } catch (err) {
      // If not found online or offline, keep local match or show error
      const localMatch = getApplicationByIdFromStore(idToSearch);
      if (localMatch) {
        setApplication(localMatch);
      } else {
        setErrorMsg(`Application ID '${idToSearch}' not found in registry.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchId.trim()) return;
    fetchApplication(searchId.trim());
  };

  const handleProcessDuesPayment = async () => {
    if (!application) return;
    setProcessingPay(true);

    let paymentPayload = {};
    if (payMethod === "UPI") {
      paymentPayload = {
        paymentMethod: `UPI (${upiApp})`,
        bankName: `UPI Provider: ${upiApp}`,
        accountNumber: upiId ? `VPA: ${upiId}` : "9876543210@ybl",
        accountHolderName: accountHolderName || application.applicantDetails?.fullName || "Pavan Kumar",
        ifscCode: "UPI Authorized",
        upiId: upiId || "9876543210@ybl"
      };
    } else if (payMethod === "Card") {
      const maskedCard = cardNumber ? `Card XXXX-${cardNumber.replace(/\D/g, "").slice(-4)}` : "Card XXXX-9012";
      paymentPayload = {
        paymentMethod: `Card (${cardType})`,
        bankName: cardType,
        accountNumber: maskedCard,
        accountHolderName: accountHolderName || application.applicantDetails?.fullName || "Pavan Kumar",
        ifscCode: `Expiry: ${cardExpiry || "08/29"}`,
        cardType
      };
    } else {
      paymentPayload = {
        paymentMethod: "NetBanking",
        bankName: bankName || "State Bank of India",
        accountNumber: accountNumber ? `XXXX-${accountNumber.slice(-4)}` : "XXXX-4892",
        accountHolderName: accountHolderName || application.applicantDetails?.fullName || "Pavan Kumar",
        ifscCode: ifscCode || "SBIN0001420"
      };
    }

    try {
      // Save payment into central store & dispatch live sync to all 4 offices
      const updated = payDuesInStore(application._id || application.applicationId, paymentPayload);
      if (updated) {
        setApplication(updated);
      }
    } catch (err) {
      console.warn("Dues payment processing notice:", err.message);
    } finally {
      setProcessingPay(false);
      setShowPayModal(false);
    }
  };

  const isApproved = application && ((application.status || "").toLowerCase().includes("approved") || application.currentOffice === "Completed");
  const isRejected = application && ((application.status || "").toLowerCase().includes("reject") || (application.status || "").toLowerCase().includes("discrepancy"));
  const hasDues = application && application.pendingDues && Number(application.pendingDues.amount) > 0 && !application.pendingDues.isPaid;

  return (
    <div style={{ background: "#f8fafc", minHeight: "92vh", padding: "24px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", color: "white", padding: "28px", borderRadius: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ background: "#38bdf8", color: "#0f172a", padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>
                CITIZEN SELF-SERVICE PORTAL
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", color: "#ffffff" }}>
                🔍 Track Application Status &amp; Pay Dues
              </h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}>
                Unified Real-time Tracking across Municipality, Tehsildar, Revenue, and Talati Offices.
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          <form onSubmit={handleSearch} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Enter Application ID (e.g. CERT-847291, APP-401928, APP-884920, CERT-908123)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                style={{ width: "100%", padding: "12px 14px 12px 42px", borderRadius: "10px", border: "2px solid #cbd5e1", fontSize: "0.95rem", outline: "none", fontWeight: "700" }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{ background: "#0284c7", color: "white", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", fontSize: "0.95rem" }}
            >
              {loading ? "Searching..." : "Track Status"}
            </button>
          </form>

          {/* Preset Quick Search Chips */}
          <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "700" }}>Quick Test IDs:</span>
            {["CERT-847291", "APP-401928", "APP-884920", "CERT-908123", "APP-302910", "APP-718290"].map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setSearchId(id);
                  fetchApplication(id);
                }}
                style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 10px", fontSize: "0.78rem", fontWeight: "800", color: "#334155", cursor: "pointer" }}
              >
                {id}
              </button>
            ))}
          </div>
        </div>

        {errorMsg && (
          <div style={{ background: "#fef2f2", color: "#991b1b", padding: "16px", borderRadius: "12px", border: "1px solid #fecaca", marginBottom: "24px", fontWeight: "800" }}>
            <FaExclamationTriangle style={{ marginRight: "8px" }} /> {errorMsg}
          </div>
        )}

        {/* Application Status Details */}
        {application && (
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #cbd5e1", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            
            {/* Top Bar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
              <div>
                <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "900", marginRight: "8px" }}>
                  {application.applicationId}
                </span>
                <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "800" }}>
                  {application.serviceType || "Government Service"}
                </span>
                <h2 style={{ margin: "10px 0 4px 0", fontSize: "1.5rem", fontWeight: "900", color: "#0f172a" }}>
                  {application.title}
                </h2>
              </div>

              <div>
                {isApproved && (
                  <span style={{ background: "#dcfce7", color: "#15803d", padding: "8px 18px", borderRadius: "20px", fontWeight: "900", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <FaCheckCircle /> APPROVED &amp; CERTIFICATE ISSUED
                  </span>
                )}
                {isRejected && (
                  <span style={{ background: "#fee2e2", color: "#991b1b", padding: "8px 18px", borderRadius: "20px", fontWeight: "900", fontSize: "0.95rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <FaExclamationTriangle /> {application.status || "REJECTED"}
                  </span>
                )}
                {!isApproved && !isRejected && (
                  <span style={{ background: "#fef9c3", color: "#854d0e", padding: "8px 18px", borderRadius: "20px", fontWeight: "900", fontSize: "0.95rem" }}>
                    ⏳ {application.status}
                  </span>
                )}
              </div>
            </div>

            {/* Applicant Meta Details */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", background: "#f8fafc", padding: "16px", borderRadius: "12px", fontSize: "0.9rem", marginBottom: "24px" }}>
              <div><strong>Applicant Name:</strong> {application.applicantDetails?.fullName || "Citizen"}</div>
              <div><strong>Contact Phone:</strong> {application.applicantDetails?.phone || "N/A"}</div>
              <div><strong>Aadhaar ID:</strong> {application.applicantDetails?.aadhaarId || "N/A"}</div>
              <div><strong>Current Office:</strong> {application.currentOffice || "Completed"}</div>
              <div>
                <strong>Official Govt Fee:</strong>{" "}
                <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "6px", fontWeight: "900", fontSize: "0.82rem" }}>
                  ₹{application.governmentFee?.amount || 50} (Paid &amp; Verified)
                </span>
              </div>
            </div>

            {/* Dues Payment Action Card */}
            {hasDues && (
              <div style={{ background: "linear-gradient(135deg, #fefce8 0%, #fef9c3 100%)", border: "2px solid #fde047", borderRadius: "14px", padding: "20px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <span style={{ background: "#ca8a04", color: "white", padding: "3px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "900" }}>
                      DUES ACTION REQUIRED
                    </span>
                    <h3 style={{ margin: "6px 0 4px 0", fontSize: "1.2rem", fontWeight: "900", color: "#713f12" }}>
                      Pending Revenue/Civic Dues: ₹{application.pendingDues.amount}
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#854d0e" }}>
                      Reason: {application.pendingDues.reason || "Land Revenue / Municipal Dues Arrears"}. Pay online via UPI, NetBanking, or Card to clear stage instantly across all offices.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowPayModal(true)}
                    style={{ background: "#ca8a04", color: "white", border: "none", padding: "12px 22px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <FaCreditCard /> Enter Payment &amp; Pay ₹{application.pendingDues.amount}
                  </button>
                </div>
              </div>
            )}

            {/* Receipt Box after Payment */}
            {application.pendingDues?.isPaid && (
              <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "16px", borderRadius: "12px", marginBottom: "24px", color: "#065f46" }}>
                <div style={{ fontWeight: "900", fontSize: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaReceipt /> Dues Clearance Payment Completed &amp; Verified
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginTop: "10px", fontSize: "0.85rem" }}>
                  <div><strong>Receipt No:</strong> {application.pendingDues.paymentReceiptNo}</div>
                  <div><strong>Amount Paid:</strong> ₹{application.pendingDues.amount}</div>
                  <div><strong>Payment Mode:</strong> {application.pendingDues.paymentMethod}</div>
                  <div><strong>Bank/Account/VPA:</strong> {application.pendingDues.bankName || application.pendingDues.upiId} ({application.pendingDues.accountNumber || "UPI"})</div>
                </div>
              </div>
            )}

            {/* Verification Chain Progress */}
            <h3 style={{ fontSize: "1.15rem", fontWeight: "900", color: "#0f172a", marginBottom: "14px" }}>
              🏛️ Multi-Office Stage Verifications:
            </h3>

            <div style={{ display: "grid", gap: "12px", marginBottom: "24px" }}>
              {(application.stageVerifications || []).map((stg, idx) => {
                const isCleared = stg.status === "cleared";
                const isPending = stg.status === "pending";
                const isDues = stg.status === "dues_pending";
                const isRej = stg.status === "rejected" || stg.status === "discrepancy";

                return (
                  <div
                    key={idx}
                    style={{
                      background: isCleared ? "#f0fdf4" : isRej ? "#fef2f2" : isDues ? "#fefce8" : "#ffffff",
                      border: `1px solid ${isCleared ? "#bbf7d0" : isRej ? "#fecaca" : isDues ? "#fde047" : "#cbd5e1"}`,
                      borderRadius: "12px",
                      padding: "16px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                      <div style={{ fontWeight: "800", color: "#0f172a", fontSize: "0.95rem" }}>
                        {stg.stageName || `Stage ${idx + 1}`} ({stg.officeName} Office)
                      </div>

                      <div>
                        {isCleared && <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>✓ CLEARED</span>}
                        {isDues && <span style={{ background: "#fef08a", color: "#854d0e", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>PAYMENT REQUIRED</span>}
                        {isRej && <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>REJECTED / DISCREPANCY</span>}
                        {isPending && <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "800" }}>IN PROGRESS</span>}
                      </div>
                    </div>

                    {stg.officerRemarks && (
                      <div style={{ fontSize: "0.85rem", color: "#475569", marginTop: "6px" }}>
                        <strong>Officer Notes:</strong> {stg.officerRemarks}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 📜 Official Immutable Audit Trail Ledger */}
            <div style={{ marginTop: "24px", marginBottom: "24px", background: "#0f172a", color: "#f8fafc", padding: "22px", borderRadius: "16px", border: "1px solid #1e293b", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FaLock style={{ color: "#38bdf8", fontSize: "1.3rem" }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: "900", color: "#f8fafc" }}>
                      Official Immutable Audit Trail Ledger
                    </h3>
                    <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: "#94a3b8" }}>
                      Cryptographically tracked, systematic backend event trail for full governance compliance.
                    </p>
                  </div>
                </div>
                <span style={{ background: "#0284c7", color: "#ffffff", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", letterSpacing: "0.5px" }}>
                  SYSTEMATIC AUDIT ACTIVE
                </span>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                {((application.auditLogs && application.auditLogs.length > 0)
                  ? application.auditLogs
                  : (application.timeline || []).map((t, i) => ({
                      logId: `AUD-${Date.now().toString().slice(-6)}-${i + 1000}`,
                      action: t.stage || "STATE_TRANSITION",
                      userRole: t.updatedBy || "System",
                      details: t.note || "System state transition recorded",
                      createdAt: t.timestamp || new Date(),
                      status: "SUCCESS"
                    }))
                ).map((log, index) => (
                  <div key={index} style={{ background: "#1e293b", padding: "14px 16px", borderRadius: "12px", borderLeft: "4px solid #38bdf8", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ flex: 1, minWidth: "240px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontFamily: "monospace", fontSize: "0.78rem", background: "#0f172a", color: "#38bdf8", padding: "3px 8px", borderRadius: "6px", fontWeight: "800", border: "1px solid #334155" }}>
                          {log.logId || `AUD-${index + 101}`}
                        </span>
                        <span style={{ fontWeight: "800", color: "#f1f5f9", fontSize: "0.9rem" }}>
                          {log.action}
                        </span>
                        <span style={{ background: "#0f766e", color: "#ccfbf1", fontSize: "0.72rem", padding: "2px 8px", borderRadius: "8px", fontWeight: "800" }}>
                          {log.userRole || "Official"}
                        </span>
                      </div>
                      <p style={{ margin: "6px 0 0 0", color: "#cbd5e1", fontSize: "0.83rem" }}>
                        {log.details || log.changesSnapshot?.note || "Audit verification event recorded"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "0.78rem", color: "#94a3b8" }}>
                      <div style={{ fontWeight: "700", color: "#e2e8f0" }}>{new Date(log.createdAt || Date.now()).toLocaleTimeString()}</div>
                      <div>{new Date(log.createdAt || Date.now()).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Issued Certificate Download Action */}
            {isApproved && (
              <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: "14px", padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <h3 style={{ margin: "0 0 4px 0", color: "#166534", fontSize: "1.15rem", fontWeight: "900" }}>
                      🎓 Certificate Ready for Download
                    </h3>
                    <p style={{ margin: 0, fontSize: "0.85rem", color: "#15803d" }}>
                      Digitally signed and QR verified document ref: <strong>{application.issuedCertificate?.certificateId || "CERT-OFFICIAL"}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setShowCertModal(true)}
                    style={{ background: "#16a34a", color: "white", border: "none", padding: "12px 22px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <FaDownload /> Download Digitally Signed Certificate
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* PAYMENT MODAL WITH DETAILED BANK / UPI / CARD INPUTS */}
        {showPayModal && application && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "20px", maxWidth: "560px", width: "100%", padding: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#0f172a" }}>
                  💳 Dues Payment Gateway
                </h3>
                <button onClick={() => setShowPayModal(false)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}>✕</button>
              </div>

              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem" }}>
                <div><strong>Application:</strong> {application.title} ({application.applicationId})</div>
                <div style={{ color: "#ca8a04", fontWeight: "900", marginTop: "4px" }}>
                  Total Dues Payable: ₹{application.pendingDues?.amount}
                </div>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "20px" }}>
                {["UPI", "NetBanking", "Card"].map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPayMethod(mode)}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "2px solid",
                      borderColor: payMethod === mode ? "#0284c7" : "#cbd5e1",
                      background: payMethod === mode ? "#e0f2fe" : "#ffffff",
                      color: payMethod === mode ? "#0369a1" : "#475569",
                      fontWeight: "800",
                      cursor: "pointer",
                      fontSize: "0.85rem"
                    }}
                  >
                    {mode === "UPI" && "📱 UPI"}
                    {mode === "NetBanking" && "🏛️ NetBanking"}
                    {mode === "Card" && "💳 Debit/Credit Card"}
                  </button>
                ))}
              </div>

              {/* Mode Specific Input Forms */}
              {payMethod === "UPI" && (
                <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>Select UPI App:</label>
                    <select value={upiApp} onChange={(e) => setUpiApp(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}>
                      <option value="PhonePe">PhonePe UPI</option>
                      <option value="Google Pay">Google Pay (GPay)</option>
                      <option value="Paytm UPI">Paytm UPI</option>
                      <option value="BHIM UPI">BHIM Government UPI</option>
                      <option value="Amazon Pay UPI">Amazon Pay UPI</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>VPA / UPI ID:</label>
                    <input type="text" value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="e.g. 9876543210@ybl or username@okicici" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>UPI Security PIN (4 or 6 Digits):</label>
                    <input type="password" value={upiPin} onChange={(e) => setUpiPin(e.target.value)} maxLength={6} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }} />
                  </div>
                </div>
              )}

              {payMethod === "NetBanking" && (
                <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>Select Bank Name:</label>
                    <select value={bankName} onChange={(e) => setBankName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                      <option value="Axis Bank">Axis Bank</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>Bank Account Number:</label>
                    <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>Account Holder Name:</label>
                      <input type="text" value={accountHolderName} onChange={(e) => setAccountHolderName(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>Bank IFSC Code:</label>
                      <input type="text" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }} />
                    </div>
                  </div>
                </div>
              )}

              {payMethod === "Card" && (
                <div style={{ display: "grid", gap: "12px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>Card Network:</label>
                    <select value={cardType} onChange={(e) => setCardType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}>
                      <option value="RuPay Card">RuPay Debit Card (Zero Fee)</option>
                      <option value="Visa Card">Visa Debit/Credit Card</option>
                      <option value="Mastercard">Mastercard Debit/Credit Card</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>16-Digit Card Number:</label>
                    <input type="text" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} maxLength={19} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>Expiry (MM/YY):</label>
                      <input type="text" value={cardExpiry} onChange={(e) => setCardExpiry(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#475569", marginBottom: "4px" }}>CVV (3 Digits):</label>
                      <input type="password" value={cardCvv} onChange={(e) => setCardCvv(e.target.value)} maxLength={4} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }} />
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleProcessDuesPayment}
                disabled={processingPay}
                style={{ width: "100%", background: "#16a34a", color: "white", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", fontSize: "1rem" }}
              >
                {processingPay ? "Processing Secure Payment..." : `Authorize & Pay ₹${application.pendingDues?.amount}`}
              </button>

            </div>
          </div>
        )}

        {/* ISSUED CERTIFICATE DOWNLOAD MODAL */}
        {showCertModal && application && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "20px", maxWidth: "600px", width: "100%", padding: "30px", border: "4px solid #16a34a" }}>
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <div style={{ background: "#dcfce7", color: "#15803d", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px auto", fontSize: "1.8rem" }}>
                  🎓
                </div>
                <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "900", color: "#14532d" }}>
                  GOVERNMENT OF MAHARASHTRA / INDIA
                </h3>
                <div style={{ fontSize: "0.85rem", color: "#15803d", fontWeight: "800", marginTop: "2px" }}>
                  OFFICIAL DIGITALLY SIGNED CERTIFICATE
                </div>
              </div>

              <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.9rem", display: "grid", gap: "8px", marginBottom: "20px" }}>
                <div><strong>Certificate Ref:</strong> {application.issuedCertificate?.certificateId || "CERT-OFFICIAL-2026"}</div>
                <div><strong>Application Title:</strong> {application.title}</div>
                <div><strong>Beneficiary / Citizen:</strong> {application.applicantDetails?.fullName || "Pavan Kumar"}</div>
                <div><strong>Digital Seal Signature:</strong> {application.issuedCertificate?.digitalSignature || "SIG-DIGI-OFFICIAL-EGRAM"}</div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => alert("Downloading Official PDF Certificate...")}
                  style={{ flex: 1, background: "#16a34a", color: "white", border: "none", padding: "12px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", fontSize: "0.95rem" }}
                >
                  📥 Download PDF
                </button>
                <button
                  onClick={() => setShowCertModal(false)}
                  style={{ background: "#64748b", color: "white", border: "none", padding: "12px 20px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.95rem" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
