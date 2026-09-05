import React, { useState, useEffect } from "react";
import {
  FaCoins,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFileAlt,
  FaCertificate,
  FaArrowLeft,
  FaColumns,
  FaReceipt,
  FaLandmark,
  FaChartLine
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../services/api";
import {
  getOfficeApplicationsFromStore,
  updateApplicationInStore,
  subscribeToAppStore
} from "../../services/applicationStore";

export default function RevenueOfficePortal() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState("pending"); // "pending", "approved", "rejected", "split", "all"
  const [remarks, setRemarks] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadRevenueQueue();

    const unsubscribe = subscribeToAppStore(() => {
      loadRevenueQueue();
    });

    return () => unsubscribe();
  }, []);

  const loadRevenueQueue = async () => {
    setLoading(true);
    try {
      const localApps = getOfficeApplicationsFromStore("Revenue");
      setQueue(localApps);

      const res = await API.get("/applications/office-queue/Revenue");
      if (res.data?.applications && res.data.applications.length > 0) {
        setQueue(res.data.applications);
      }
    } catch (err) {
      console.warn("Using offline master store for Revenue queue:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (appId, action) => {
    const note = remarks[appId] || "";
    setStatusMsg(null);

    const newStatus = action === "approve" ? "Approved" : action === "discrepancy" ? "Discrepancy Found" : "Rejected";

    updateApplicationInStore(appId, {
      action,
      status: newStatus,
      currentOffice: action === "approve" ? "Completed" : "Revenue",
      rejectionReason: action !== "approve" ? note || "Revenue discrepancy/rejection recorded." : undefined,
      officerRemarks: note || `Revenue Officer action: ${action.toUpperCase()}`,
      verifiedBy: "Revenue Inspector Officer"
    });

    setStatusMsg({
      type: "success",
      text: `Revenue Status updated to '${newStatus}' for Application ${appId}!`
    });
  };

  const servicesList = [
    "Property Tax Assessment & Mutation",
    "Land Revenue Cess Clearance & NOC",
    "Agricultural Land Holder Status",
    "Non-Agricultural (NA) Land Conversion",
    "Irrigation & Water Tax Assessment",
    "Stamp Duty Valuation Certificate",
    "Government Land Rights & Lease Renewal",
    "Mining & Mineral Royalty Permit"
  ];

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
        <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)", color: "white", padding: "28px", borderRadius: "16px", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(6, 78, 59, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#a7f3d0", color: "#064e3b", padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>
                  OFFICE 3 OF 4 — STANDALONE REVENUE PORTAL
                </span>
              </div>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", color: "#ffffff" }}>
                🌾 Revenue &amp; Land Assessment Office Portal
              </h1>
              <p style={{ margin: 0, color: "#d1fae5", fontSize: "0.95rem" }}>
                District Revenue Inspectorate &amp; Land Tax Department. Property Tax, Land Revenue Cess, NA Conversion, and Agricultural Certificates.
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

        {/* Master Scope Box */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: "800", color: "#064e3b" }}>
            Revenue Department Master Datasets:
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {servicesList.map((s) => (
              <div key={s} style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700" }}>
                • {s}
              </div>
            ))}
          </div>
        </div>

        {/* Queue Workspace Controls */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
            
            <div style={{ position: "relative", minWidth: "280px" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder="Search Revenue Applications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }}
              />
            </div>

            {/* Status Tabs */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setFilterTab("pending")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterTab === "pending" ? "#059669" : "#cbd5e1",
                  background: filterTab === "pending" ? "#d1fae5" : "#ffffff",
                  color: filterTab === "pending" ? "#047857" : "#475569",
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

          {/* SPLIT VIEW MODE */}
          {filterTab === "split" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginTop: "20px" }}>
              <div style={{ background: "#f0fdf4", borderRadius: "14px", padding: "18px", border: "1px solid #bbf7d0" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "900", color: "#15803d", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaCheckCircle /> Approved Revenue Services ({approvedList.length})
                </h4>
                {approvedList.length === 0 ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>No approved Revenue applications found.</div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {approvedList.map((app) => (
                      <RevenueCard key={app._id || app.applicationId} app={app} remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} isApprovedCard />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: "#fef2f2", borderRadius: "14px", padding: "18px", border: "1px solid #fecaca" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "900", color: "#991b1b", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaTimesCircle /> Rejected Revenue Services ({rejectedList.length})
                </h4>
                {rejectedList.length === 0 ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>No rejected Revenue applications found.</div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {rejectedList.map((app) => (
                      <RevenueCard key={app._id || app.applicationId} app={app} remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} isRejectedCard />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* STANDARD LISTING */
            loading ? (
              <div style={{ padding: "30px", color: "#64748b" }}>Loading Revenue queue...</div>
            ) : displayedQueue.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                No applications found in '{filterTab.toUpperCase()}' queue.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "18px" }}>
                {displayedQueue.map((app) => (
                  <RevenueCard key={app._id || app.applicationId} app={app} remarks={remarks} setRemarks={setRemarks} handleAction={handleAction} />
                ))}
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}

function RevenueCard({ app, remarks, setRemarks, handleAction, isApprovedCard, isRejectedCard }) {
  const isApproved = (app.status || "").toLowerCase().includes("approved") || app.currentOffice === "Completed";
  const isRejected = (app.status || "").toLowerCase().includes("reject") || (app.status || "").toLowerCase().includes("discrepancy");
  const isPaidDues = app.pendingDues && app.pendingDues.isPaid;

  const cardBorder = isApproved ? "#86efac" : isRejected ? "#fca5a5" : "#e2e8f0";
  const cardBg = isApprovedCard ? "#ffffff" : isRejectedCard ? "#ffffff" : isApproved ? "#f0fdf4" : isRejected ? "#fef2f2" : "#ffffff";

  return (
    <div style={{ background: cardBg, borderRadius: "14px", border: `2px solid ${cardBorder}`, padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
        <div>
          <span style={{ background: "#d1fae5", color: "#047857", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "800", marginRight: "8px" }}>
            {app.applicationId}
          </span>
          <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "700" }}>
            {app.serviceType || "Revenue Service"}
          </span>
          <h4 style={{ margin: "8px 0 4px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
            {app.title}
          </h4>
        </div>

        <div>
          {isApproved && (
            <span style={{ background: "#dcfce7", color: "#15803d", padding: "6px 14px", borderRadius: "20px", fontWeight: "900", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <FaCheckCircle /> REVENUE CLEARED
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "14px" }}>
        <div><strong>Landholder:</strong> {app.applicantDetails?.fullName || "Citizen"}</div>
        <div><strong>Phone:</strong> {app.applicantDetails?.phone || "N/A"}</div>
        <div><strong>Survey/Property:</strong> {app.applicantDetails?.surveyNumber || app.applicantDetails?.propertyId || "N/A"}</div>
        <div><strong>Address:</strong> {app.applicantDetails?.address || "N/A"}</div>
      </div>

      {isPaidDues && (
        <div style={{ background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "12px", borderRadius: "10px", marginBottom: "14px", fontSize: "0.85rem", color: "#065f46" }}>
          <div style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
            <FaReceipt /> Revenue Cess &amp; Dues Paid: ₹{app.pendingDues.amount} ({app.pendingDues.paymentMethod})
          </div>
          <div style={{ fontSize: "0.78rem", marginTop: "4px", color: "#047857" }}>
            Receipt No: <strong>{app.pendingDues.paymentReceiptNo}</strong> | Bank/A/c: {app.pendingDues.bankName || app.pendingDues.upiId || "SBI"} ({app.pendingDues.accountNumber || "UPI"})
          </div>
        </div>
      )}

      {isRejected && app.rejectionReason && (
        <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "12px", borderRadius: "10px", marginBottom: "14px", fontSize: "0.85rem", color: "#9f1239" }}>
          <FaExclamationTriangle style={{ marginRight: "6px" }} />
          <strong>Rejection / Discrepancy Reason:</strong> {app.rejectionReason}
        </div>
      )}

      {isApproved && app.issuedCertificate && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px", marginBottom: "14px", fontSize: "0.82rem", color: "#166534" }}>
          <FaCertificate style={{ marginRight: "6px" }} />
          <strong>Revenue Digital Seal:</strong> {app.issuedCertificate.certificateId} | {app.issuedCertificate.digitalSignature}
        </div>
      )}

      {!isApproved && !isRejected && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
          <input
            type="text"
            placeholder="Add Revenue Inspector Remarks / Audit Notes..."
            value={remarks[app._id || app.applicationId] || ""}
            onChange={(e) => setRemarks({ ...remarks, [app._id || app.applicationId]: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", marginBottom: "12px" }}
          />

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleAction(app._id || app.applicationId, "approve")}
              style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaCheckCircle /> Grant Revenue Clearance
            </button>

            <button
              onClick={() => handleAction(app._id || app.applicationId, "discrepancy")}
              style={{ background: "#d97706", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaExclamationTriangle /> Flag Revenue Discrepancy
            </button>

            <button
              onClick={() => handleAction(app._id || app.applicationId, "reject")}
              style={{ background: "#dc2626", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaTimesCircle /> Reject Revenue Request
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
