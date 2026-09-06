import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaLandmark,
  FaFileInvoiceDollar,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSearch,
  FaColumns,
  FaReceipt,
  FaCertificate,
  FaExternalLinkAlt
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../services/api";
import {
  getOfficeApplicationsFromStore,
  updateApplicationInStore,
  subscribeToAppStore
} from "../../services/applicationStore";

export default function OfficeWorkspacesView() {
  const [activeOffice, setActiveOffice] = useState("Municipality"); // "Municipality", "Tehsildar", "Revenue", "Talati"
  const [filterStatusTab, setFilterStatusTab] = useState("pending"); // "pending", "approved", "rejected", "split", "all"
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discrepancyNote, setDiscrepancyNote] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadOfficeQueue(activeOffice);

    const unsubscribe = subscribeToAppStore(() => {
      loadOfficeQueue(activeOffice);
    });

    return () => unsubscribe();
  }, [activeOffice]);

  const loadOfficeQueue = async (officeName) => {
    setLoading(true);
    try {
      const localApps = getOfficeApplicationsFromStore(officeName);
      setQueue(localApps);

      const res = await API.get(`/applications/office-queue/${officeName}`);
      if (res.data?.applications && res.data.applications.length > 0) {
        setQueue(res.data.applications);
      }
    } catch (err) {
      console.warn(`Using master store for ${officeName} workspace view:`, err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAction = async (appId, action) => {
    const note = discrepancyNote[appId] || "";
    setStatusMsg(null);

    const updated = updateApplicationInStore(appId, {
      action,
      officerRemarks: note || `Officer Action (${activeOffice}): ${action.toUpperCase()}`,
      verifiedBy: `${activeOffice} Senior Officer`,
      officeName: activeOffice
    });

    const statusText = action === "approve"
      ? (updated?.status === "Approved" ? "Approved & Issued" : `Stage Cleared → Advanced to ${updated?.currentOffice}`)
      : action === "discrepancy" ? "Discrepancy Flagged" : "Application Rejected";

    setStatusMsg({ type: "success", text: `Action Executed! Application ${appId} status updated to '${statusText}'.` });
  };

  const offices = [
    { id: "Municipality", label: "Municipality Office", portalUrl: "/officer/municipality", icon: <FaBuilding />, color: "#0284c7" },
    { id: "Tehsildar", label: "Tehsildar Office", portalUrl: "/officer/tehsildar", icon: <FaLandmark />, color: "#4338ca" },
    { id: "Revenue", label: "Revenue Office", portalUrl: "/officer/revenue", icon: <FaFileInvoiceDollar />, color: "#047857" },
    { id: "Talati", label: "Talati Office", portalUrl: "/officer/talati", icon: <FaHome />, color: "#b45309" }
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
    filterStatusTab === "approved"
      ? approvedList
      : filterStatusTab === "rejected"
      ? rejectedList
      : filterStatusTab === "pending"
      ? pendingList
      : filteredSearch;

  const currentOfficeObj = offices.find((o) => o.id === activeOffice) || offices[0];

  return (
    <div style={{ background: "#f8fafc", minHeight: "92vh", padding: "24px" }}>
      <div style={{ maxWidth: "1350px", margin: "0 auto" }}>
        
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #334155 100%)", color: "white", padding: "28px", borderRadius: "16px", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ background: "#38bdf8", color: "#0f172a", padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>
                OFFICIAL ADMINISTRATIVE WORKSPACES DASHBOARD
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", color: "#ffffff" }}>
                🏛️ Combined 4 Offices Official View
              </h1>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.95rem" }}>
                Multi-office workflow verification for Municipality, Tehsildar, Revenue, and Talati portals with real-time status updates.
              </p>
            </div>

            <Link
              to={currentOfficeObj.portalUrl}
              style={{ background: currentOfficeObj.color, color: "white", padding: "12px 20px", borderRadius: "10px", textDecoration: "none", fontWeight: "800", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "8px" }}
            >
              Open Standalone {currentOfficeObj.id} Portal <FaExternalLinkAlt />
            </Link>
          </div>
        </div>

        {statusMsg && (
          <div style={{ padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaCheckCircle style={{ fontSize: "1.2rem" }} /> {statusMsg.text}
          </div>
        )}

        {/* Office Selection Tabs (Sections 2, 3, 4, 5) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px", marginBottom: "24px" }}>
          {offices.map((off) => {
            const isSelected = activeOffice === off.id;
            return (
              <button
                key={off.id}
                onClick={() => {
                  setActiveOffice(off.id);
                  setFilterStatusTab("pending");
                }}
                style={{
                  background: isSelected ? off.color : "#ffffff",
                  color: isSelected ? "#ffffff" : "#334155",
                  border: isSelected ? "2px solid transparent" : "2px solid #cbd5e1",
                  borderRadius: "14px",
                  padding: "18px",
                  textAlign: "left",
                  cursor: "pointer",
                  fontWeight: "800",
                  boxShadow: isSelected ? "0 8px 20px -4px rgba(0,0,0,0.15)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "1.2rem", marginBottom: "6px" }}>
                  {off.icon} {off.id} Office
                </div>
                <div style={{ fontSize: "0.8rem", opacity: isSelected ? 0.9 : 0.7 }}>
                  Workspace Queue &amp; Verifications
                </div>
              </button>
            );
          })}
        </div>

        {/* Office Work Queue Area */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #cbd5e1" }}>
          
          {/* Controls Bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "14px" }}>
            
            <div style={{ position: "relative", minWidth: "280px" }}>
              <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
              <input
                type="text"
                placeholder={`Search in ${activeOffice} Queue...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none" }}
              />
            </div>

            {/* Separated Status Tabs */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setFilterStatusTab("pending")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterStatusTab === "pending" ? currentOfficeObj.color : "#cbd5e1",
                  background: filterStatusTab === "pending" ? "#f1f5f9" : "#ffffff",
                  color: filterStatusTab === "pending" ? currentOfficeObj.color : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                ⏳ Pending ({pendingList.length})
              </button>

              <button
                onClick={() => setFilterStatusTab("approved")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterStatusTab === "approved" ? "#16a34a" : "#cbd5e1",
                  background: filterStatusTab === "approved" ? "#dcfce7" : "#ffffff",
                  color: filterStatusTab === "approved" ? "#15803d" : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                ✅ Approved Services ({approvedList.length})
              </button>

              <button
                onClick={() => setFilterStatusTab("rejected")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterStatusTab === "rejected" ? "#dc2626" : "#cbd5e1",
                  background: filterStatusTab === "rejected" ? "#fee2e2" : "#ffffff",
                  color: filterStatusTab === "rejected" ? "#991b1b" : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                ❌ Rejected Services ({rejectedList.length})
              </button>

              <button
                onClick={() => setFilterStatusTab("split")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterStatusTab === "split" ? "#7c3aed" : "#cbd5e1",
                  background: filterStatusTab === "split" ? "#f3e8ff" : "#ffffff",
                  color: filterStatusTab === "split" ? "#6d28d9" : "#475569",
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
                onClick={() => setFilterStatusTab("all")}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "2px solid",
                  borderColor: filterStatusTab === "all" ? "#475569" : "#cbd5e1",
                  background: filterStatusTab === "all" ? "#f1f5f9" : "#ffffff",
                  color: filterStatusTab === "all" ? "#0f172a" : "#475569",
                  fontWeight: "800",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                🌐 All ({filteredSearch.length})
              </button>
            </div>
          </div>

          {/* SPLIT VIEW MODE: Side-by-side Approved vs Rejected */}
          {filterStatusTab === "split" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginTop: "20px" }}>
              <div style={{ background: "#f0fdf4", borderRadius: "14px", padding: "18px", border: "1px solid #bbf7d0" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "900", color: "#15803d", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaCheckCircle /> Approved {activeOffice} Services ({approvedList.length})
                </h4>
                {approvedList.length === 0 ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>No approved services found in {activeOffice}.</div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {approvedList.map((app) => (
                      <WorkspaceCard key={app._id || app.applicationId} app={app} discrepancyNote={discrepancyNote} setDiscrepancyNote={setDiscrepancyNote} handleVerifyAction={handleVerifyAction} activeOffice={activeOffice} isApprovedCard />
                    ))}
                  </div>
                )}
              </div>

              <div style={{ background: "#fef2f2", borderRadius: "14px", padding: "18px", border: "1px solid #fecaca" }}>
                <h4 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "900", color: "#991b1b", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaTimesCircle /> Rejected {activeOffice} Services ({rejectedList.length})
                </h4>
                {rejectedList.length === 0 ? (
                  <div style={{ padding: "20px", color: "#64748b", textAlign: "center" }}>No rejected services found in {activeOffice}.</div>
                ) : (
                  <div style={{ display: "grid", gap: "14px" }}>
                    {rejectedList.map((app) => (
                      <WorkspaceCard key={app._id || app.applicationId} app={app} discrepancyNote={discrepancyNote} setDiscrepancyNote={setDiscrepancyNote} handleVerifyAction={handleVerifyAction} activeOffice={activeOffice} isRejectedCard />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* STANDARD LISTING */
            loading ? (
              <div style={{ padding: "30px", color: "#64748b" }}>Loading {activeOffice} queue...</div>
            ) : displayedQueue.length === 0 ? (
              <div style={{ padding: "32px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
                No applications in '{filterStatusTab.toUpperCase()}' queue for {activeOffice}.
              </div>
            ) : (
              <div style={{ display: "grid", gap: "18px" }}>
                {displayedQueue.map((app) => (
                  <WorkspaceCard key={app._id || app.applicationId} app={app} discrepancyNote={discrepancyNote} setDiscrepancyNote={setDiscrepancyNote} handleVerifyAction={handleVerifyAction} activeOffice={activeOffice} />
                ))}
              </div>
            )
          )}

        </div>
      </div>
    </div>
  );
}

function WorkspaceCard({ app, discrepancyNote, setDiscrepancyNote, handleVerifyAction, activeOffice, isApprovedCard, isRejectedCard }) {
  const isApproved = (app.status || "").toLowerCase().includes("approved") || app.currentOffice === "Completed";
  const isRejected = (app.status || "").toLowerCase().includes("reject") || (app.status || "").toLowerCase().includes("discrepancy");
  const isPaidDues = app.pendingDues && Number(app.pendingDues.amount) > 0 && app.pendingDues.isPaid;

  const cardBorder = isApproved ? "#86efac" : isRejected ? "#fca5a5" : "#cbd5e1";
  const cardBg = isApprovedCard ? "#ffffff" : isRejectedCard ? "#ffffff" : isApproved ? "#f0fdf4" : isRejected ? "#fef2f2" : "#ffffff";

  return (
    <div style={{ background: cardBg, borderRadius: "14px", border: `2px solid ${cardBorder}`, padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
        <div>
          <span style={{ background: "#e2e8f0", color: "#1e293b", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "800", marginRight: "8px" }}>
            {app.applicationId}
          </span>
          <span style={{ background: "#f1f5f9", color: "#475569", padding: "4px 10px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "700" }}>
            {app.serviceType || "Gov Service"}
          </span>
          <h4 style={{ margin: "8px 0 4px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
            {app.title}
          </h4>
        </div>

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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", background: "#f8fafc", padding: "12px", borderRadius: "10px", fontSize: "0.85rem", marginBottom: "14px" }}>
        <div><strong>Applicant:</strong> {app.applicantDetails?.fullName || "Citizen"}</div>
        <div><strong>Phone:</strong> {app.applicantDetails?.phone || "N/A"}</div>
        <div><strong>Aadhaar ID:</strong> {app.applicantDetails?.aadhaarId || "N/A"}</div>
        <div><strong>Current Stage:</strong> {app.currentOffice || activeOffice}</div>
        <div><strong>Official Govt Fee:</strong> <span style={{ background: "#e2e8f0", color: "#1e293b", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>₹{typeof app.governmentFee === "object" ? (typeof app.governmentFee.amount === "object" ? app.governmentFee.amount?.amount || 50 : app.governmentFee.amount || 50) : (app.governmentFee || 50)}</span></div>
      </div>

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

      {isRejected && app.rejectionReason && (
        <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", padding: "12px", borderRadius: "10px", marginBottom: "14px", fontSize: "0.85rem", color: "#9f1239" }}>
          <FaExclamationTriangle style={{ marginRight: "6px" }} />
          <strong>Rejection / Discrepancy Reason:</strong> {app.rejectionReason}
        </div>
      )}

      {isApproved && app.issuedCertificate && (
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "12px", borderRadius: "10px", marginBottom: "14px", fontSize: "0.82rem", color: "#166534" }}>
          <FaCertificate style={{ marginRight: "6px" }} />
          <strong>Issued Certificate Ref:</strong> {app.issuedCertificate.certificateId} | {app.issuedCertificate.digitalSignature}
        </div>
      )}

      {!isApproved && !isRejected && (
        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e2e8f0" }}>
          <input
            type="text"
            placeholder={`Add ${activeOffice} Officer Remarks / Rejection details...`}
            value={discrepancyNote[app._id || app.applicationId] || ""}
            onChange={(e) => setDiscrepancyNote({ ...discrepancyNote, [app._id || app.applicationId]: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", marginBottom: "12px" }}
          />

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => handleVerifyAction(app._id || app.applicationId, "approve")}
              style={{ background: "#16a34a", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaCheckCircle /> Approve &amp; Clear Stage
            </button>

            <button
              onClick={() => handleVerifyAction(app._id || app.applicationId, "discrepancy")}
              style={{ background: "#d97706", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaExclamationTriangle /> Flag Discrepancy
            </button>

            <button
              onClick={() => handleVerifyAction(app._id || app.applicationId, "reject")}
              style={{ background: "#dc2626", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <FaTimesCircle /> Reject Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
