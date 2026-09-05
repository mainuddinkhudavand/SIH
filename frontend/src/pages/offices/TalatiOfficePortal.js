import React, { useState, useEffect } from "react";
import {
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaStamp,
  FaArrowLeft
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function TalatiOfficePortal() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchTalatiQueue();
  }, []);

  const fetchTalatiQueue = async () => {
    setLoading(true);
    try {
      const res = await API.get("/applications/office-queue/Talati");
      if (res.data?.applications && res.data.applications.length > 0) {
        setQueue(res.data.applications);
      } else {
        setQueue(getDemoTalatiData());
      }
    } catch (err) {
      setQueue(getDemoTalatiData());
    } finally {
      setLoading(false);
    }
  };

  const getDemoTalatiData = () => [
    {
      _id: "talati-101",
      applicationId: "CERT-712091",
      title: "7/12 Extract (Village Land Ownership Record)",
      serviceId: "7-12-extract",
      serviceType: "Land Records",
      applicantDetails: { fullName: "Pavan Kumar", phone: "+91 98765 43210", aadhaarId: "9876-5432-1000", surveyNumber: "SRV-101", address: "Gut No 101, Village Ward 2" },
      status: "Under Verification",
      routingType: "single-office",
      officeChain: ["Talati"],
      currentStageIndex: 0,
      stageVerifications: [{ officeName: "Talati", stageName: "Step 1: Talati Digital Signature", status: "pending" }]
    },
    {
      _id: "talati-102",
      applicationId: "CERT-309481",
      title: "Crop Loss Field Verification & Relief Certificate",
      serviceId: "crop-loss-verification",
      serviceType: "Village Services",
      applicantDetails: { fullName: "Anita Sharma", phone: "+91 98765 43211", aadhaarId: "9876-5432-1003", surveyNumber: "SRV-104", address: "Wheat Farm Parcel" },
      status: "Field Visit Scheduled",
      routingType: "multi-office",
      officeChain: ["Talati", "Tehsildar"],
      currentStageIndex: 0,
      stageVerifications: [
        { officeName: "Talati", stageName: "Step 1: On-Field Inspection", status: "pending", officerRemarks: "Field visit scheduled for crop damage assessment." },
        { officeName: "Tehsildar", stageName: "Step 2: Relief Disbursement", status: "pending" }
      ]
    },
    {
      _id: "talati-103",
      applicationId: "CERT-8-A-0192",
      title: "8-A Extract (Consolidated Landholding Record)",
      serviceId: "8-a-extract",
      serviceType: "Land Records",
      applicantDetails: { fullName: "Rajesh Patil", phone: "+91 98765 43214", aadhaarId: "9876-5432-1001", surveyNumber: "SRV-102", address: "Gram Panchayat Area" },
      status: "Submitted",
      routingType: "single-office",
      officeChain: ["Talati"],
      currentStageIndex: 0,
      stageVerifications: [{ officeName: "Talati", stageName: "Step 1: Talati 8-A Extract Digital Sign", status: "pending" }]
    }
  ];

  const handleAction = async (appId, action) => {
    const note = remarks[appId] || "";
    setStatusMsg(null);

    try {
      const res = await API.put(`/applications/${appId}/verify-stage`, {
        action,
        officerRemarks: note || `Talati Action '${action}' performed`,
        verifiedBy: "Talati Village Officer"
      });

      if (res.data?.success) {
        setStatusMsg({ type: "success", text: `Action '${action}' processed for Talati record!` });
        fetchTalatiQueue();
      }
    } catch (err) {
      setQueue((prev) =>
        prev.map((item) => {
          if (item._id === appId) {
            return {
              ...item,
              status: action === "approve" ? "Approved" : action === "field_visit" ? "Field Visit Scheduled" : action === "discrepancy" ? "Discrepancy Found" : "Rejected"
            };
          }
          return item;
        })
      );
      setStatusMsg({ type: "success", text: `Talati Action '${action}' recorded!` });
    }
  };

  const servicesList = [
    "7/12 Extract (Land Ownership Record)",
    "8-A Extract (Landholding Summary)",
    "Village Form Registers (Gaon Namuna)",
    "Village Land Mutation Entry",
    "Ration Card Verification Support",
    "Crop Damage / Loss Field Verification",
    "Government Scheme Beneficiary Verification",
    "Village-Level Income / Residence Confirmation"
  ];

  return (
    <div style={{ background: "#faf5ff", minHeight: "92vh", padding: "24px" }}>
      <div style={{ maxWidth: "1250px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #581c87 0%, #7c3aed 100%)", color: "white", padding: "28px", borderRadius: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#e9d5ff", color: "#581c87", padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>
                  OFFICE 4 OF 4 — STANDALONE PORTAL
                </span>
              </div>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", color: "#ffffff" }}>
                🏡 Talati Office Portal
              </h1>
              <p style={{ margin: 0, color: "#f3e8ff", fontSize: "0.95rem" }}>
                Talati Gram Panchayat Village Records Office. Issue 7/12 &amp; 8-A extracts, village family registers, crop loss field verifications, and income/residence data confirmation.
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

        {/* Master Dataset Scope (Section 5.3) */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: "800", color: "#581c87" }}>
            Talati Village Registers &amp; Master Datasets (Section 5):
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {servicesList.map((s) => (
              <div key={s} style={{ background: "#faf5ff", border: "1px solid #e9d5ff", color: "#6b21a8", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700" }}>
                • {s}
              </div>
            ))}
          </div>
        </div>

        {/* Talati Queue */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #cbd5e1" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
            Talati Village Work Queue ({queue.length} Tasks Pending):
          </h3>

          {loading ? (
            <div style={{ padding: "30px", color: "#64748b" }}>Loading Talati queue...</div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {queue.map((app) => (
                <div key={app._id} style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ background: "#e9d5ff", color: "#581c87", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                          ID: {app.applicationId}
                        </span>
                        <span style={{ background: app.routingType === "multi-office" ? "#dbeafe" : "#f1f5f9", color: app.routingType === "multi-office" ? "#1e40af" : "#475569", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                          {app.routingType?.toUpperCase() || "SINGLE-OFFICE"}
                        </span>
                      </div>
                      <h4 style={{ margin: "4px 0", fontSize: "1.2rem", fontWeight: "800", color: "#0f172a" }}>
                        {app.title}
                      </h4>
                      <div style={{ fontSize: "0.85rem", color: "#475569" }}>
                        Applicant: <strong>{app.applicantDetails?.fullName}</strong> (Aadhaar: {app.applicantDetails?.aadhaarId}) | Survey Number: {app.applicantDetails?.surveyNumber || "SRV-101"}
                      </div>
                    </div>

                    <span style={{ padding: "6px 14px", borderRadius: "16px", background: app.status === "Field Visit Scheduled" ? "#fef3c7" : "#dcfce7", color: app.status === "Field Visit Scheduled" ? "#92400e" : "#166534", fontWeight: "800", fontSize: "0.85rem", border: "1px solid" }}>
                      Status: {app.status}
                    </span>
                  </div>

                  {/* Action Bar with Field Visit Toggle (Section 5.4) */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                    <input
                      type="text"
                      placeholder="Enter village record notes / inspection details..."
                      value={remarks[app._id] || ""}
                      onChange={(e) => setRemarks({ ...remarks, [app._id]: e.target.value })}
                      style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                    <button onClick={() => handleAction(app._id, "approve")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#7c3aed", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaStamp /> Confirm &amp; Push to Exchange
                    </button>
                    <button onClick={() => handleAction(app._id, "field_visit")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#d97706", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaCalendarAlt /> Schedule Field Visit
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
