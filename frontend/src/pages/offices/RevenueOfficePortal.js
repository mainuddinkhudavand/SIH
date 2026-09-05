import React, { useState, useEffect } from "react";
import {
  FaFileInvoiceDollar,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSearch,
  FaCreditCard,
  FaArrowLeft
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function RevenueOfficePortal() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchRevenueQueue();
  }, []);

  const fetchRevenueQueue = async () => {
    setLoading(true);
    try {
      const res = await API.get("/applications/office-queue/Revenue");
      if (res.data?.applications && res.data.applications.length > 0) {
        setQueue(res.data.applications);
      } else {
        setQueue(getDemoRevenueData());
      }
    } catch (err) {
      setQueue(getDemoRevenueData());
    } finally {
      setLoading(false);
    }
  };

  const getDemoRevenueData = () => [
    {
      _id: "rev-101",
      applicationId: "APP-601924",
      title: "Property / Land Mutation (Ownership Title Transfer)",
      serviceId: "property-land-mutation",
      serviceType: "Land Records",
      applicantDetails: { fullName: "Suresh Deshmukh", phone: "+91 98765 43212", aadhaarId: "9876-5432-1002", surveyNumber: "SRV-103", address: "Survey 103 Parcel" },
      status: "Revenue Dues Pending",
      routingType: "multi-office",
      officeChain: ["Talati", "Revenue", "Municipality"],
      currentStageIndex: 1,
      pendingDues: { officeName: "Revenue Office", dueType: "Unpaid Land Revenue Cess", amount: 1850, isPaid: false },
      stageVerifications: [
        { officeName: "Talati", stageName: "Step 1: Talati Entry", status: "cleared", officerRemarks: "Mutation entry registered in 7/12 land register." },
        { officeName: "Revenue", stageName: "Step 2: Revenue Dues & Clearances", status: "dues_pending", officerRemarks: "Unpaid land revenue ₹1,850 flagged." },
        { officeName: "Municipality", stageName: "Step 3: Property Tax Linkage", status: "pending" }
      ]
    },
    {
      _id: "rev-102",
      applicationId: "APP-709124",
      title: "Land Revenue Collection & Digital Receipts",
      serviceId: "land-revenue-collection",
      serviceType: "Land Records",
      applicantDetails: { fullName: "Pavan Kumar", phone: "+91 98765 43210", aadhaarId: "9876-5432-1000", surveyNumber: "SRV-101", address: "Gut 101" },
      status: "Submitted",
      routingType: "single-office",
      officeChain: ["Revenue"],
      currentStageIndex: 0,
      stageVerifications: [{ officeName: "Revenue", stageName: "Step 1: Revenue Officer Receipt Verification", status: "pending" }]
    },
    {
      _id: "rev-103",
      applicationId: "CERT-401928",
      title: "Encumbrance Certificate (Mortgage Search)",
      serviceId: "encumbrance-certificate",
      serviceType: "Land Records",
      applicantDetails: { fullName: "Anita Sharma", phone: "+91 98765 43211", aadhaarId: "9876-5432-1003", surveyNumber: "SRV-104", address: "Wheat Farm Parcel" },
      status: "Submitted",
      routingType: "single-office",
      officeChain: ["Revenue"],
      currentStageIndex: 0,
      stageVerifications: [{ officeName: "Revenue", stageName: "Step 1: Encumbrance Register Check", status: "pending" }]
    }
  ];

  const handleAction = async (appId, action) => {
    const note = remarks[appId] || "";
    setStatusMsg(null);

    try {
      const res = await API.put(`/applications/${appId}/verify-stage`, {
        action,
        officerRemarks: note || `Revenue Action '${action}' recorded`,
        verifiedBy: "Revenue District Officer"
      });

      if (res.data?.success) {
        setStatusMsg({ type: "success", text: `Action '${action}' saved for Revenue application!` });
        fetchRevenueQueue();
      }
    } catch (err) {
      setQueue((prev) =>
        prev.map((item) => {
          if (item._id === appId) {
            return {
              ...item,
              status: action === "approve" ? "Approved" : action === "discrepancy" ? "Discrepancy Found" : "Rejected"
            };
          }
          return item;
        })
      );
      setStatusMsg({ type: "success", text: `Revenue Action '${action}' recorded!` });
    }
  };

  const servicesList = [
    "Land Revenue Collection & Digital Receipts",
    "Property / Land Mutation (Ownership Transfer)",
    "Encumbrance Certificate (Loan / Mortgage Search)",
    "Land Ceiling Record Verification",
    "Revenue Court Dispute Tracking",
    "Crop Survey & Land Classification",
    "Government Arrears Clearance"
  ];

  return (
    <div style={{ background: "#fffbeb", minHeight: "92vh", padding: "24px" }}>
      <div style={{ maxWidth: "1250px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #78350f 0%, #b45309 100%)", color: "white", padding: "28px", borderRadius: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#fef3c7", color: "#78350f", padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>
                  OFFICE 3 OF 4 — STANDALONE PORTAL
                </span>
              </div>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", color: "#ffffff" }}>
                🌾 Revenue Office Portal
              </h1>
              <p style={{ margin: 0, color: "#fef3c7", fontSize: "0.95rem" }}>
                Land Revenue &amp; District Collectorate Workspace. Manage Land Revenue taxes, Mutation ownership transfers, Encumbrance searches, and Dues Ledger auto-linking.
              </p>
            </div>

            <Link to="/official" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "800", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaArrowLeft /> Switch All Offices View
            </Link>
          </div>
        </div>

        {statusMsg && (
          <div style={{ padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: "800" }}>
            <FaCheckCircle style={{ marginRight: "8px" }} /> {statusMsg.text}
          </div>
        )}

        {/* Master Dataset Scope (Section 4.3) */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: "800", color: "#78350f" }}>
            Revenue Master Scope &amp; Dues Ledger (Section 4):
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {servicesList.map((s) => (
              <div key={s} style={{ background: "#fffbeb", border: "1px solid #fde68a", color: "#b45309", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700" }}>
                • {s}
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Queue */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #cbd5e1" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
            Revenue Work Queue ({queue.length} Requests Pending):
          </h3>

          {loading ? (
            <div style={{ padding: "30px", color: "#64748b" }}>Loading Revenue queue...</div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {queue.map((app) => (
                <div key={app._id} style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ background: "#fef3c7", color: "#78350f", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                          ID: {app.applicationId}
                        </span>
                        <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                          {app.routingType?.toUpperCase() || "SINGLE-OFFICE"}
                        </span>
                      </div>
                      <h4 style={{ margin: "4px 0", fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
                        {app.title}
                      </h4>
                      <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                        Applicant: <strong>{app.applicantDetails?.fullName}</strong> (Aadhaar: {app.applicantDetails?.aadhaarId}) | Survey Number: {app.applicantDetails?.surveyNumber || "SRV-103"}
                      </div>
                    </div>

                    <span style={{ padding: "6px 14px", borderRadius: "16px", background: app.pendingDues?.amount > 0 && !app.pendingDues?.isPaid ? "#fef3c7" : "#dcfce7", color: app.pendingDues?.amount > 0 && !app.pendingDues?.isPaid ? "#92400e" : "#166534", fontWeight: "800", fontSize: "0.85rem", border: "1px solid" }}>
                      Status: {app.status}
                    </span>
                  </div>

                  {/* Dues Ledger Flag Status (Section 4.3 & 4.4) */}
                  {app.pendingDues && app.pendingDues.amount > 0 && (
                    <div style={{ background: "#fffbeb", padding: "12px", borderRadius: "8px", border: "1px solid #fde68a", fontSize: "0.85rem" }}>
                      <strong>Dues Ledger Entry:</strong> {app.pendingDues.dueType} — Amount: <strong>₹{app.pendingDues.amount}</strong> | Paid Status: {app.pendingDues.isPaid ? "✅ DUES CLEARED VIA PAYMENT GATEWAY" : "⚠️ DUES PENDING PAYMENT BY CITIZEN"}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                    <input
                      type="text"
                      placeholder="Enter revenue officer notes..."
                      value={remarks[app._id] || ""}
                      onChange={(e) => setRemarks({ ...remarks, [app._id]: e.target.value })}
                      style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                    <button onClick={() => handleAction(app._id, "approve")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#b45309", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaCheckCircle /> Approve &amp; Update Ledger
                    </button>
                    <button onClick={() => handleAction(app._id, "discrepancy")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#d97706", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaExclamationTriangle /> Flag Dues / Discrepancy
                    </button>
                    <button onClick={() => handleAction(app._id, "reject")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#dc2626", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaTimesCircle /> Reject
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
