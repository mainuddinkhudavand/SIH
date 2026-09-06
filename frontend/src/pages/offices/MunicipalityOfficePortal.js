import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFileAlt,
  FaCertificate,
  FaArrowLeft,
  FaColumns,
  FaList,
  FaReceipt,
  FaUniversity,
  FaUserCheck,
  FaCalendarAlt,
  FaPrint
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../services/api";
import {
  getOfficeApplicationsFromStore,
  updateApplicationInStore,
  subscribeToAppStore
} from "../../services/applicationStore";

export default function MunicipalityOfficePortal() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("pending"); // "pending", "approved", "rejected", "split", "all"
  const [remarks, setRemarks] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadMunicipalityQueue();

    // Subscribe to real-time application updates from store
    const unsubscribe = subscribeToAppStore(() => {
      loadMunicipalityQueue();
    });

    return () => unsubscribe();
  }, []);

  const loadMunicipalityQueue = async () => {
    setLoading(true);
    try {
      // Load local persistent store applications first for instant sync
      const localApps = getOfficeApplicationsFromStore("Municipality");
      setQueue(localApps);

      // Attempt background backend fetch
      const res = await API.get("/applications/office-queue/Municipality");
      if (res.data?.applications && res.data.applications.length > 0) {
        setQueue(res.data.applications);
      }
    } catch (err) {
      console.warn("Using offline master store for Municipality queue:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (target, action) => {
    const appId = typeof target === "object" ? (target.applicationId || target._id) : target;
    const note = remarks[appId] || (typeof target === "object" ? remarks[target._id] : "") || "";
    setStatusMsg(null);

    const verifiedBy = "Municipal Executive Officer";
    const officerRemarks = note || `Municipal Officer action: ${action.toUpperCase()}`;

    // 1. Update central application store
    const updated = updateApplicationInStore(appId, {
      action,
      officerRemarks,
      verifiedBy,
      officeName: "Municipality"
    });

    // 2. Call backend API for real-time database update
    try {
      await API.put(`/applications/${appId}/verify-stage`, {
        action,
        officerRemarks,
        verifiedBy
      });
    } catch (err) {
      console.warn("Backend stage verification sync notice:", err.message);
    }

    // 3. Reload queue to reflect live backend status
    await loadMunicipalityQueue();

    const statusText = action === "approve" 
      ? (updated?.status === "Approved" ? "Approved & License/Cert Issued" : `Stage Cleared → Moved to ${updated?.currentOffice || "Next Office"}`)
      : action === "discrepancy" ? "Discrepancy Flagged" : "Service Request Rejected";

    setStatusMsg({
      type: "success",
      text: `Municipal Action Executed! Application ${appId} status updated to '${statusText}'.`
    });
  };

  const servicesList = [
    "Birth / Death Certificate",
    "Marriage Certificate",
    "Property Tax Assessment & Mutation",
    "Water Connection",
    "Streetlight Repair",
    "Trade & Business License",
    "Building Plan Sanction",
    "Sanitation & Waste Management",
    "Hoarding & Vendor NOC"
  ];

  // Filtering applications by search and status
  const filteredSearch = queue.filter((item) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.applicationId || "").toLowerCase().includes(term) ||
      (item.title || "").toLowerCase().includes(term) ||
      (item.applicantDetails?.fullName || "").toLowerCase().includes(term) ||
      (item.status || "").toLowerCase().includes(term)
    );
  });

  const pendingList = filteredSearch.filter((a) => {
    const s = (a.status || "").toLowerCase();
    return !s.includes("approved") && !s.includes("reject") && !s.includes("discrepancy") && a.currentOffice !== "Completed";
  });

  const approvedList = filteredSearch.filter((a) => {
    const s = (a.status || "").toLowerCase();
    return s.includes("approved") || s.includes("issued") || a.currentOffice === "Completed";
  });

  const rejectedList = filteredSearch.filter((a) => {
    const s = (a.status || "").toLowerCase();
    return s.includes("reject") || s.includes("discrepancy");
  });

  const displayedQueue =
    filterTab === "approved"
      ? approvedList
      : filterTab === "rejected"
      ? rejectedList
      : filterTab === "pending"
      ? pendingList
      : filteredSearch;

  return (
    <div style={{ background: "#f8fafc", minHeight: "92vh", padding: "24px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)", color: "white", padding: "28px", borderRadius: "16px", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(12, 74, 110, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#7dd3fc", color: "#0c4a6e", padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>
                  OFFICE 1 OF 4 — STANDALONE MUNICIPAL PORTAL
                </span>
              </div>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", color: "#ffffff" }}>
                🏢 Municipality Office Portal
              </h1>
              <p style={{ margin: 0, color: "#e0f2fe", fontSize: "0.95rem" }}>
                Municipal Corporation &amp; Public Works Administration Workspace. Real-time queue, separated approved &amp; rejected services.
              </p>
            </div>

            <Link to="/official" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaArrowLeft /> Switch All Offices View
            </Link>
          </div>
        </div>

        {statusMsg && (
          <div style={{ padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaCheckCircle style={{ fontSize: "1.2rem" }} /> {statusMsg.text}
          </div>
        )}

        {/* Master Dataset Scope Box */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0c4a6e" }}>
            Municipality Master Datasets &amp; Scope:
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {servicesList.map((s) => (
              <div key={s} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700" }}>
                • {s}
              </div>
            ))}
          </div>
        </div>

        {/* Main Workspaces View Controls */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          
          {/* Top Bar with Search & Nav Tabs */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
            
            {/* Search Input */}
            <div style={{ position: "relative", minWidth: "280px" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search Application ID, Citizen, Title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }}
              />
            </div>

            {/* Separated Status Tabs */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setFilterTab("pending")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterTab === "pending" ? "#0284c7" : "#cbd5e1",
                  background: filterTab === "pending" ? "#e0f2fe" : "#ffffff",
                  color: filterTab === "pending" ? "#0369a1" : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                ⏳ Pending ({pendingList.length})
              </button>

              <button
                onClick={() => setFilterTab("approved")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterTab === "approved" ? "#16a34a" : "#cbd5e1",
                  background: filterTab === "approved" ? "#dcfce7" : "#ffffff",
                  color: filterTab === "approved" ? "#15803d" : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                ✅ Approved Services ({approvedList.length})
              </button>

              <button
                onClick={() => setFilterTab("rejected")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterTab === "rejected" ? "#dc2626" : "#cbd5e1",
                  background: filterTab === "rejected" ? "#fee2e2" : "#ffffff",
                  color: filterTab === "rejected" ? "#991b1b" : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                ❌ Rejected Services ({rejectedList.length})
              </button>

              <button
                onClick={() => setFilterTab("split")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterTab === "split" ? "#7c3aed" : "#cbd5e1",
                  background: filterTab === "split" ? "#f3e8ff" : "#ffffff",
                  color: filterTab === "split" ? "#6d28d9" : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                <FaColumns /> Split View (Approved vs Rejected)
              </button>

              <button
                onClick={() => setFilterTab("all")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterTab === "all" ? "#475569" : "#cbd5e1",
                  background: filterTab === "all" ? "#f1f5f9" : "#ffffff",
                  color: filterTab === "all" ? "#0f172a" : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                🌐 All ({filteredSearch.length})
              </button>
            </div>
          </div>

          {/* SPLIT VIEW MODE: Approved vs Rejected side-by-side */}
          {filterTab === "split" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginTop: "20px" }}>
              
              {/* Left Column: Approved Services */}
              <div style={{ background: "#f0fdf4", borderRadius: "14px", padding: "18px", border: "1px solid #bbf7d0" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "900", color: "#15803d", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaCheckCircle /> Approved Municipal Services ({approvedList.length})
                </h4>
                {approvedList.length === 0 ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>No approved municipal services found.</div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {approvedList.map((app) => (
                      <MunicipalityCard key={app._id || app.applicationId} app={app} remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} isApprovedCard />
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Rejected Services */}
              <div style={{ background: "#fef2f2", borderRadius: "14px", padding: "18px", border: "1px solid #fecaca" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "900", color: "#991b1b", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaTimesCircle /> Rejected Municipal Services &amp; Discrepancies ({rejectedList.length})
                </h4>
                {rejectedList.length === 0 ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>No rejected municipal services found.</div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {rejectedList.map((app) => (
                      <MunicipalityCard key={app._id || app.applicationId} app={app} remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} isRejectedCard />
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* STANDARD TAB QUEUE LISTING */
            loading ? (
              <div style={{ padding: "30px", color: "#64748b" }}>Loading Municipal queue...</div>
            ) : displayedQueue.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                No applications found in '{filterTab.toUpperCase()}' queue.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "18px" }}>
                {displayedQueue.map((app) => (
                  <MunicipalityCard key={app._id || app.applicationId} app={app} remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} />
                ))}
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}

// 📦 Reusable Municipality Card Component with dynamic payment details & status styling
function MunicipalityCard({ app, remarks, setRemarks, handleAction, isApprovedCard, isRejectedCard }) {
  const isApproved = (app.status || "").toLowerCase().includes("approved") || app.currentOffice === "Completed";
  const isRejected = (app.status || "").toLowerCase().includes("reject") || (app.status || "").toLowerCase().includes("discrepancy");
  const isPendingDues = app.pendingDues && Number(app.pendingDues.amount) > 0 && !app.pendingDues.isPaid;
  const isPaidDues = app.pendingDues && Number(app.pendingDues.amount) > 0 && app.pendingDues.isPaid;

  const cardBorder = isApproved ? "#86efac" : isRejected ? "#fca5a5" : isPendingDues ? "#fde047" : "#e2e8f0";
  const cardBg = isApprovedCard ? "#ffffff" : isRejectedCard ? "#ffffff" : isApproved ? "#f0fdf4" : isRejected ? "#fef2f2" : "#ffffff";

  return (
    <div style={{ background: cardBg, borderRadius: "14px", border: `2px solid ${cardBorder}`, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
        <div>
          <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "800", marginRight: "8px" }}>
            {app.applicationId}
          </span>
          <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "700" }}>
            {app.serviceType || "Municipal Service"}
          </span>
          <h4 style={{ margin: "8px 0 4px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
            {app.title}
          </h4>
        </div>

        {/* Status Badge */}
        <div>
          {isApproved && (
            <span style={{ background: "#dcfce7", color: "#15803d", padding: "6px 14px", borderRadius: "20px", fontWeight: "900", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <FaCheckCircle /> APPROVED &amp; ISSUED
            </span>
          )}
          {isRejected && (
            <span style={{ background: "#fee2e2", color: "#991b1b", padding: "6px 14px", borderRadius: "20px", fontWeight: "900", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <FaTimesCircle /> {app.status || "REJECTED"}
            </span>
          )}
          {!isApproved && !isRejected && (
            <span style={{ background: "#fef9c3", color: "#854d0e", padding: "6px 14px", borderRadius: "20px", fontWeight: "900", fontSize: "0.85rem" }}>
              ⏳ {app.status}
            </span>
          )}
        </div>
      </div>

      {/* Applicant & Details Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "14px" }}>
        <div><strong>Applicant:</strong> {app.applicantDetails?.fullName || "Citizen"}</div>
        <div><strong>Phone:</strong> {app.applicantDetails?.phone || "N/A"}</div>
        <div><strong>Aadhaar ID:</strong> {app.applicantDetails?.aadhaarId || "N/A"}</div>
        <div><strong>Address/Ward:</strong> {app.applicantDetails?.address || app.applicantDetails?.wardCode || "N/A"}</div>
        <div><strong>Official Govt Fee:</strong> <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>₹{app.governmentFee?.amount || 50}</span></div>
      </div>

      {/* Payment Details Notification Box */}
      {isPaidDues && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px", borderRadius: "10px", marginBottom: "14px", fontSize: "0.85rem", color: "#065f46" }}>
          <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaReceipt /> Dues Paid Online: ₹{app.pendingDues.amount} ({app.pendingDues.paymentMethod})
          </div>
          <div style={{ fontSize: "0.78rem", marginTop: "4px", color: "#047857" }}>
            Receipt No: <strong>{app.pendingDues.paymentReceiptNo}</strong> | Bank/A/c: {app.pendingDues.bankName || app.pendingDues.upiId || "SBI"} ({app.pendingDues.accountNumber || "UPI"})
          </div>
        </div>
      )}

      {/* Rejection / Discrepancy Note Box */}
      {isRejected && app.rejectionReason && (
        <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "12px", borderRadius: "10px", marginBottom: "14px", fontSize: "0.85rem", color: "#9f1239" }}>
          <FaExclamationTriangle style={{ marginRight: "6px" }} />
          <strong>Rejection / Discrepancy Reason:</strong> {app.rejectionReason}
        </div>
      )}

      {/* Certificate Issued Info */}
      {isApproved && app.issuedCertificate && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px", marginBottom: "14px", fontSize: "0.82rem", color: "#166534" }}>
          <FaCertificate style={{ marginRight: "6px" }} />
          <strong>Issued Certificate Ref:</strong> {app.issuedCertificate.certificateId} | QR Signed: {app.issuedCertificate.digitalSignature}
        </div>
      )}

      {/* Officer Remarks & Action Buttons (Only for Pending items) */}
      {!isApproved && !isRejected && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
          <input
            type="text"
            placeholder="Add Municipal Officer Remarks / Rejection details..."
            value={remarks[app.applicationId || app._id] || remarks[app._id] || ""}
            onChange={(e) => setRemarks({ ...remarks, [app.applicationId || app._id]: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", marginBottom: "12px" }}
          />

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleAction(app.applicationId || app._id, "approve")}
              style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaCheckCircle /> Approve &amp; Issue License/Cert
            </button>

            <button
              onClick={() => handleAction(app.applicationId || app._id, "discrepancy")}
              style={{ background: "#d97706", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaExclamationTriangle /> Flag Discrepancy
            </button>

            <button
              onClick={() => handleAction(app.applicationId || app._id, "reject")}
              style={{ background: "#dc2626", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaTimesCircle /> Reject Service Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
