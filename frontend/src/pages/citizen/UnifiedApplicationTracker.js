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

  const handleDownloadPDF = (appToDownload) => {
    const targetApp = appToDownload || application;
    if (!targetApp) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Please allow popups in your browser to download your official PDF certificate.");
      return;
    }

    const certTitle = targetApp?.title || targetApp?.serviceType || "Official E-Gov Certificate";
    const certId = targetApp?.issuedCertificate?.certificateId || targetApp?.applicationId || "CERT-2026-GOV";
    const name = targetApp?.applicantDetails?.fullName || targetApp?.user?.name || "Pavan Kumar";
    const date = targetApp?.createdAt ? new Date(targetApp.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
    const sig = targetApp?.issuedCertificate?.digitalSignature || "CRYPT-SIG-MAHA-EGRAM-2026";
    const city = targetApp?.location?.city || targetApp?.applicantDetails?.city || "Hubli";
    const district = targetApp?.location?.district || targetApp?.applicantDetails?.district || "Dharwad";
    const state = targetApp?.location?.state || targetApp?.applicantDetails?.state || "Karnataka";

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${certTitle} - ${certId}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700&family=Inter:wght@400;600;800&display=swap');
            body {
              font-family: 'Inter', sans-serif;
              padding: 40px;
              color: #0f172a;
              background: #ffffff;
            }
            .cert-box {
              border: 10px double #15803d;
              padding: 40px;
              border-radius: 16px;
              max-width: 800px;
              margin: 0 auto;
              text-align: center;
              background: #ffffff;
              box-sizing: border-box;
              position: relative;
            }
            .emblem {
              font-size: 40px;
              margin-bottom: 10px;
            }
            .gov-title {
              font-family: 'Cinzel', serif;
              font-size: 24px;
              font-weight: 700;
              color: #14532d;
              letter-spacing: 2px;
              text-transform: uppercase;
            }
            .gov-sub {
              font-size: 14px;
              font-weight: 800;
              color: #166534;
              margin-top: 4px;
              text-transform: uppercase;
              letter-spacing: 1px;
              border-bottom: 2px solid #86efac;
              padding-bottom: 14px;
              margin-bottom: 24px;
            }
            .cert-heading {
              font-size: 26px;
              font-weight: 900;
              color: #065f46;
              margin: 20px 0 10px 0;
              text-transform: uppercase;
            }
            .cert-id {
              font-size: 14px;
              font-weight: 800;
              color: #0369a1;
              background: #e0f2fe;
              display: inline-block;
              padding: 4px 14px;
              border-radius: 20px;
              margin-bottom: 24px;
            }
            .content {
              font-size: 16px;
              line-height: 1.8;
              color: #334155;
              margin-bottom: 30px;
            }
            .data-grid {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
              text-align: left;
            }
            .data-grid td {
              padding: 10px 14px;
              border: 1px solid #cbd5e1;
              font-size: 14px;
            }
            .data-grid td.label {
              font-weight: bold;
              background: #f8fafc;
              width: 40%;
              color: #1e293b;
            }
            .footer-row {
              margin-top: 35px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-top: 2px dashed #cbd5e1;
              padding-top: 20px;
            }
            .qr-seal {
              border: 2px solid #15803d;
              padding: 8px 14px;
              border-radius: 8px;
              color: #15803d;
              font-weight: 800;
              font-size: 12px;
              text-align: center;
              background: #f0fdf4;
            }
            .sig-seal {
              text-align: right;
            }
            .sig-title {
              font-weight: 800;
              color: #14532d;
              font-size: 15px;
            }
            .sig-sub {
              font-size: 13px;
              color: #64748b;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="cert-box">
            <div class="emblem">🏛️</div>
            <div class="gov-title">Government of India / State e-Governance</div>
            <div class="gov-sub">GovConnect Federated Interoperability Platform</div>

            <div class="cert-heading">${certTitle}</div>
            <div class="cert-id">REF NO: ${certId}</div>

            <div class="content">
              This is to certify that <strong>${name}</strong>, resident of <strong>${city}, ${district}, ${state}</strong>, 
              has successfully fulfilled all verification checks across local Municipal, Tehsildar, Revenue, and Talati Office authorities. 
              This official certificate is granted under statutory provisions and recorded in the State Interoperability Registry.
            </div>

            <table class="data-grid">
              <tr>
                <td class="label">Certificate Title</td>
                <td>${certTitle}</td>
              </tr>
              <tr>
                <td class="label">Beneficiary Name</td>
                <td>${name}</td>
              </tr>
              <tr>
                <td class="label">Jurisdiction &amp; City</td>
                <td>${city}, ${district}, ${state}</td>
              </tr>
              <tr>
                <td class="label">Date of Issuance</td>
                <td>${date}</td>
              </tr>
              <tr>
                <td class="label">PKI Digital Signature Hash</td>
                <td><code style="font-size: 12px; color: #0284c7;">${sig}</code></td>
              </tr>
            </table>

            <div class="footer-row">
              <div class="qr-seal">
                <div>[QR CODE VERIFIED]</div>
                <div>AUTHENTIC GOV CERTIFICATE</div>
              </div>
              <div class="sig-seal">
                <div class="sig-title">Digitally Signed By Authority</div>
                <div class="sig-sub">Executive Verifying Officer</div>
                <div class="sig-sub" style="font-size: 11px;">GovConnect Gateway</div>
              </div>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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
                  ₹{typeof application.governmentFee === "object" ? (typeof application.governmentFee.amount === "object" ? application.governmentFee.amount?.amount || 50 : application.governmentFee.amount || 50) : (application.governmentFee || 50)} (Paid &amp; Verified)
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

        {/* DUES CLEARANCE SIMULATION MODAL */}
        {showPayModal && application && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
            <div style={{ background: "#ffffff", borderRadius: "20px", maxWidth: "520px", width: "100%", padding: "28px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", border: "2px solid #0284c7" }}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h3 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "900", color: "#0c4a6e" }}>
                  🏛️ Government e-Challan Dues Clearance
                </h3>
                <button onClick={() => setShowPayModal(false)} style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#64748b" }}>✕</button>
              </div>

              <div style={{ background: "#f0f9ff", padding: "16px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #bae6fd", fontSize: "0.9rem" }}>
                <div><strong>Application Ref:</strong> {application.title} ({application.applicationId})</div>
                <div><strong>Jurisdiction:</strong> {application.location?.city || "Hubli"}, {application.location?.district || "Dharwad"}</div>
                <div style={{ color: "#0369a1", fontWeight: "900", marginTop: "8px", fontSize: "1.1rem" }}>
                  Total Dues Payable: ₹{application.pendingDues?.amount}
                </div>
              </div>

              <p style={{ fontSize: "0.85rem", color: "#475569", lineHeight: "1.5", marginBottom: "20px" }}>
                Authorized e-Challan simulation for municipal &amp; land revenue tax clearance. Click below to unblock stage verification.
              </p>

              <button
                onClick={handleProcessDuesPayment}
                disabled={processingPay}
                style={{ width: "100%", background: "#16a34a", color: "white", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "900", cursor: "pointer", fontSize: "1rem" }}
              >
                {processingPay ? "Authorizing e-Challan Clearance..." : `Confirm & Clear Dues (₹${application.pendingDues?.amount})`}
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
                  onClick={() => handleDownloadPDF(application)}
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
