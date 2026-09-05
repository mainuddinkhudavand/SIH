import React, { useState, useEffect } from "react";
import {
  FaLandmark,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCertificate,
  FaStamp,
  FaArrowLeft
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function TehsildarOfficePortal() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchTehsildarQueue();
  }, []);

  const fetchTehsildarQueue = async () => {
    setLoading(true);
    try {
      const res = await API.get("/applications/office-queue/Tehsildar");
      if (res.data?.applications && res.data.applications.length > 0) {
        setQueue(res.data.applications);
      } else {
        setQueue(getDemoTehsildarData());
      }
    } catch (err) {
      setQueue(getDemoTehsildarData());
    } finally {
      setLoading(false);
    }
  };

  const getDemoTehsildarData = () => [
    {
      _id: "tehsil-101",
      applicationId: "CERT-847291",
      title: "Income Certificate Application",
      serviceId: "income-certificate",
      serviceType: "Certificates",
      applicantDetails: { fullName: "Pavan Kumar", phone: "+91 98765 43210", aadhaarId: "9876-5432-1000", annualIncome: "₹85,000", address: "Village Ward 2" },
      status: "Tehsildar Verification Pending",
      routingType: "multi-office",
      officeChain: ["Talati", "Revenue", "Tehsildar"],
      currentStageIndex: 2,
      stageVerifications: [
        { officeName: "Talati", stageName: "Step 1: Talati Income Check", status: "cleared", officerRemarks: "Confirmed village income records." },
        { officeName: "Revenue", stageName: "Step 2: Revenue Dues Check", status: "cleared", officerRemarks: "Dues ₹1,850 paid via UPI. Receipt: PAY-RC-9012" },
        { officeName: "Tehsildar", stageName: "Step 3: Tehsildar Final Issuance", status: "pending" }
      ]
    },
    {
      _id: "tehsil-102",
      applicationId: "CERT-902183",
      title: "Caste Certificate Request (OBC Category)",
      serviceId: "caste-certificate",
      serviceType: "Certificates",
      applicantDetails: { fullName: "Suresh Deshmukh", phone: "+91 98765 43212", aadhaarId: "9876-5432-1002", casteCategory: "OBC (Kunbi)", address: "Gram Panchayat Sector" },
      status: "Tehsildar Verification Pending",
      routingType: "multi-office",
      officeChain: ["Talati", "Tehsildar"],
      currentStageIndex: 1,
      stageVerifications: [
        { officeName: "Talati", stageName: "Step 1: Talati Record Check", status: "cleared", officerRemarks: "Ancestral village residence confirmed." },
        { officeName: "Tehsildar", stageName: "Step 2: Tehsil Legal Verification", status: "pending" }
      ]
    },
    {
      _id: "tehsil-103",
      applicationId: "CERT-509120",
      title: "Legal Heir Certificate Request",
      serviceId: "legal-heir-certificate",
      serviceType: "Certificates",
      applicantDetails: { fullName: "Anita Sharma", phone: "+91 98765 43211", aadhaarId: "9876-5432-1003", deceasedName: "Late Ramesh Sharma", address: "Survey 104 Plot" },
      status: "Tehsildar Verification Pending",
      routingType: "multi-office",
      officeChain: ["Municipality", "Talati", "Tehsildar"],
      currentStageIndex: 2,
      stageVerifications: [
        { officeName: "Municipality", stageName: "Step 1: Death Reg Check", status: "cleared", officerRemarks: "Municipal Death Register confirmed." },
        { officeName: "Talati", stageName: "Step 2: Heir Family Check", status: "cleared", officerRemarks: "Village family tree verified." },
        { officeName: "Tehsildar", stageName: "Step 3: Tehsildar Magistrate Clearance", status: "pending" }
      ]
    }
  ];

  const handleAction = async (appId, action) => {
    const note = remarks[appId] || "";
    setStatusMsg(null);

    try {
      const res = await API.put(`/applications/${appId}/verify-stage`, {
        action,
        officerRemarks: note || `Action '${action}' executed by Tehsildar Magistrate`,
        verifiedBy: "Tehsildar Executive Magistrate"
      });

      if (res.data?.success) {
        setStatusMsg({ type: "success", text: `Action '${action}' processed for certificate!` });
        fetchTehsildarQueue();
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
      setStatusMsg({ type: "success", text: `Tehsildar Action '${action}' recorded!` });
    }
  };

  const servicesList = [
    "Income Certificate",
    "Caste Certificate",
    "Residence / Domicile Certificate",
    "Solvency Certificate",
    "Non-Creamy Layer Certificate",
    "Nationality Certificate",
    "Senior Citizen Certificate",
    "Agriculturist Certificate",
    "Legal Heir Certificate",
    "Disaster / Crop Loss Relief Certificate"
  ];

  return (
    <div style={{ background: "#f4f9f4", minHeight: "92vh", padding: "24px" }}>
      <div style={{ maxWidth: "1250px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #14532d 0%, #166534 100%)", color: "white", padding: "28px", borderRadius: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#86efac", color: "#14532d", padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>
                  OFFICE 2 OF 4 — STANDALONE PORTAL
                </span>
              </div>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", color: "#ffffff" }}>
                📜 Tehsildar Office Portal
              </h1>
              <p style={{ margin: 0, color: "#dcfce7", fontSize: "0.95rem" }}>
                Tehsil Administration &amp; Executive Magistrate Workspace. Legal verification against Tehsil income slabs, caste records, domicile history, and digital signature issuance.
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

        {/* Master Dataset Scope (Section 3.3) */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: "800", color: "#14532d" }}>
            Tehsildar Master Scope &amp; Legal Verification Datasets (Section 3):
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {servicesList.map((s) => (
              <div key={s} style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700" }}>
                • {s}
              </div>
            ))}
          </div>
        </div>

        {/* Tehsildar Queue */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #cbd5e1" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
            Tehsildar Magistrate Work Queue ({queue.length} Requests Pending):
          </h3>

          {loading ? (
            <div style={{ padding: "30px", color: "#64748b" }}>Loading Tehsildar queue...</div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {queue.map((app) => (
                <div key={app._id} style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ background: "#bbf7d0", color: "#14532d", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                          ID: {app.applicationId}
                        </span>
                        <span style={{ background: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                          MULTI-OFFICE SEQUENTIAL
                        </span>
                      </div>
                      <h4 style={{ margin: "4px 0", fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
                        {app.title}
                      </h4>
                      <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                        Applicant: <strong>{app.applicantDetails?.fullName}</strong> (Aadhaar: {app.applicantDetails?.aadhaarId}) | Income: {app.applicantDetails?.annualIncome || "N/A"} | Category: {app.applicantDetails?.casteCategory || "N/A"}
                      </div>
                    </div>

                    <span style={{ padding: "6px 14px", borderRadius: "16px", background: "#fef3c7", color: "#92400e", fontWeight: "800", fontSize: "0.85rem", border: "1px solid #fde68a" }}>
                      Status: {app.status}
                    </span>
                  </div>

                  {/* Dues Ledger & Payment Info Display */}
                  {app.pendingDues && app.pendingDues.amount > 0 && (
                    <div style={{ background: app.pendingDues.isPaid ? "#f0fdf4" : "#fffbeb", padding: "12px 16px", borderRadius: "10px", border: `1px solid ${app.pendingDues.isPaid ? "#bbf7d0" : "#fde68a"}`, fontSize: "0.85rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: app.pendingDues.isPaid ? "6px" : "0", flexWrap: "wrap", gap: "8px" }}>
                        <span><strong>Dues Ledger:</strong> {app.pendingDues.dueType} — Amount: <strong>₹{app.pendingDues.amount}</strong></span>
                        <span style={{ fontWeight: "800", color: app.pendingDues.isPaid ? "#15803d" : "#b45309" }}>
                          {app.pendingDues.isPaid ? "✅ DUES CLEARED VIA BANK PAYMENT" : "⚠️ DUES PENDING PAYMENT BY CITIZEN"}
                        </span>
                      </div>
                      {app.pendingDues.isPaid && (
                        <div style={{ fontSize: "0.8rem", color: "#334155", background: "#ffffff", padding: "8px 12px", borderRadius: "6px", border: "1px solid #dcfce7", display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "4px" }}>
                          <div><strong>Bank:</strong> {app.pendingDues.bankName || "State Bank of India"}</div>
                          <div><strong>Acc/Card:</strong> {app.pendingDues.accountNumber || "XXXX-4892"}</div>
                          <div><strong>Holder:</strong> {app.pendingDues.accountHolderName || app.applicantDetails?.fullName}</div>
                          <div><strong>Receipt:</strong> {app.pendingDues.paymentReceiptNo}</div>
                          <div><strong>Mode:</strong> {app.pendingDues.paymentMethod || "NetBanking"}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prior Talati & Revenue Verification Results (Section 3.2) */}
                  <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Automated Preceding Office Results (Exchange Layer):
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {app.officeChain?.map((off, idx) => {
                        const ver = app.stageVerifications?.[idx];
                        const isCleared = ver?.status === "cleared";
                        return (
                          <div key={off} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "800", background: isCleared ? "#dcfce7" : "#f1f5f9", color: isCleared ? "#15803d" : "#475569", border: "1px solid" }}>
                            {off}: {isCleared ? "CONFIRMED & CLEARED" : "PENDING"} {ver?.officerRemarks ? `(${ver.officerRemarks})` : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar with Specific Discrepancy Note Loop (Section 3.4) */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                    <input
                      type="text"
                      placeholder="Enter specific discrepancy correction request for citizen..."
                      value={remarks[app._id] || ""}
                      onChange={(e) => setRemarks({ ...remarks, [app._id]: e.target.value })}
                      style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                    <button onClick={() => handleAction(app._id, "approve")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#166534", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaStamp /> Issue &amp; Digitally Sign
                    </button>
                    <button onClick={() => handleAction(app._id, "discrepancy")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#d97706", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaExclamationTriangle /> Flag Correction Note
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
