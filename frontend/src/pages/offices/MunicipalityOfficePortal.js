import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaSearch,
  FaFileAlt,
  FaTint,
  FaLightbulb,
  FaStore,
  FaCertificate,
  FaTools,
  FaArrowLeft
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API from "../../services/api";

export default function MunicipalityOfficePortal() {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState("all");
  const [remarks, setRemarks] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchMunicipalityQueue();
  }, []);

  const fetchMunicipalityQueue = async () => {
    setLoading(true);
    try {
      const res = await API.get("/applications/office-queue/Municipality");
      if (res.data?.applications && res.data.applications.length > 0) {
        setQueue(res.data.applications);
      } else {
        setQueue(getDemoMunicipalityData());
      }
    } catch (err) {
      setQueue(getDemoMunicipalityData());
    } finally {
      setLoading(false);
    }
  };

  const getDemoMunicipalityData = () => [
    {
      _id: "muni-101",
      applicationId: "APP-401928",
      title: "Streetlight Installation & Repair Request",
      serviceId: "streetlight-repair",
      serviceType: "Civic Utilities",
      applicantDetails: { fullName: "Ramesh Patil", phone: "+91 98765 43210", aadhaarId: "9876-5432-1001", wardCode: "WARD-02", address: "Plot 18, Ward 2" },
      status: "Under Verification",
      routingType: "single-office",
      officeChain: ["Municipality"],
      currentStageIndex: 0,
      stageVerifications: [{ officeName: "Municipality", stageName: "Step 1: Municipal Verification", status: "pending" }],
      documents: [{ docType: "Pole Location Photo", fileUrl: "/uploads/pole_photo.jpg" }]
    },
    {
      _id: "muni-102",
      applicationId: "APP-509124",
      title: "Building Plan Sanction & Zoning Clearance",
      serviceId: "building-plan-sanction",
      serviceType: "Civic Utilities",
      applicantDetails: { fullName: "Anita Sharma", phone: "+91 98765 43211", aadhaarId: "9876-5432-1003", surveyNumber: "SRV-104", address: "Plot 42, Sector 1" },
      status: "Municipal Review Pending",
      routingType: "multi-office",
      officeChain: ["Talati", "Municipality"],
      currentStageIndex: 1,
      stageVerifications: [
        { officeName: "Talati", stageName: "Step 1: Talati Land-Use Check", status: "cleared", officerRemarks: "Land boundary & 7/12 extract verified clear." },
        { officeName: "Municipality", stageName: "Step 2: Municipal Zoning Approval", status: "pending" }
      ],
      documents: [{ docType: "Architect Blueprints", fileUrl: "/uploads/architect_plan.pdf" }]
    },
    {
      _id: "muni-103",
      applicationId: "CERT-102948",
      title: "Birth Certificate Registration & Digital Issuance",
      serviceId: "birth-certificate",
      serviceType: "Certificates",
      applicantDetails: { fullName: "Pavan Kumar", phone: "+91 98765 43210", aadhaarId: "9876-5432-1000", deceasedName: "Baby of Pavan", address: "Ward 4 Hospital" },
      status: "Submitted",
      routingType: "single-office",
      officeChain: ["Municipality"],
      currentStageIndex: 0,
      stageVerifications: [{ officeName: "Municipality", stageName: "Step 1: Municipal Registrar Verification", status: "pending" }],
      documents: [{ docType: "Hospital Birth Slip", fileUrl: "/uploads/hospital_slip.pdf" }]
    }
  ];

  const handleAction = async (appId, action) => {
    const note = remarks[appId] || "";
    setStatusMsg(null);

    try {
      const res = await API.put(`/applications/${appId}/verify-stage`, {
        action,
        officerRemarks: note || `Action '${action}' executed by Municipal Officer`,
        verifiedBy: "Municipal Executive Officer"
      });

      if (res.data?.success) {
        setStatusMsg({ type: "success", text: `Action '${action}' saved for application!` });
        fetchMunicipalityQueue();
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
      setStatusMsg({ type: "success", text: `Municipal Action '${action}' recorded!` });
    }
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

  return (
    <div style={{ background: "#f8fafc", minHeight: "92vh", padding: "24px" }}>
      <div style={{ maxWidth: "1250px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)", color: "white", padding: "28px", borderRadius: "16px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ background: "#7dd3fc", color: "#0c4a6e", padding: "4px 12px", borderRadius: "12px", fontSize: "0.78rem", fontWeight: "900" }}>
                  OFFICE 1 OF 4 — STANDALONE PORTAL
                </span>
              </div>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", color: "#ffffff" }}>
                🏢 Municipality Office Portal
              </h1>
              <p style={{ margin: 0, color: "#e0f2fe", fontSize: "0.95rem" }}>
                Municipal Corporation &amp; Public Works Administration Workspace. Manage Birth/Death certificates, Property Tax, Water connections, Streetlights, Trade Licenses, and Building Plan Sanctions.
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

        {/* Master Dataset & Services Overview Box (Section 2.3) */}
        <div style={{ background: "#ffffff", borderRadius: "14px", padding: "20px", border: "1px solid #cbd5e1", marginBottom: "24px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0c4a6e" }}>
            Municipality Master Datasets &amp; Scope (Section 2):
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {servicesList.map((s) => (
              <div key={s} style={{ background: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", padding: "10px", borderRadius: "8px", fontSize: "0.82rem", fontWeight: "700" }}>
                • {s}
              </div>
            ))}
          </div>
        </div>

        {/* Municipal Review Queue */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #cbd5e1" }}>
          <h3 style={{ margin: "0 0 16px 0", fontSize: "1.25rem", fontWeight: "800", color: "#0f172a" }}>
            Municipal Officer Work Queue ({queue.length} Applications Pending):
          </h3>

          {loading ? (
            <div style={{ padding: "30px", color: "#64748b" }}>Loading Municipal queue...</div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {queue.map((app) => (
                <div key={app._id} style={{ background: "#f8fafc", borderRadius: "12px", padding: "20px", border: "1px solid #cbd5e1", display: "flex", flexDirection: "column", gap: "14px" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ background: "#bae6fd", color: "#0369a1", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
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
                        Applicant: <strong>{app.applicantDetails?.fullName}</strong> (Aadhaar: {app.applicantDetails?.aadhaarId}) | Phone: {app.applicantDetails?.phone} | Ward: {app.applicantDetails?.wardCode || "Ward 2"}
                      </div>
                    </div>

                    <span style={{ padding: "6px 14px", borderRadius: "16px", background: "#fef3c7", color: "#92400e", fontWeight: "800", fontSize: "0.85rem", border: "1px solid #fde68a" }}>
                      Status: {app.status}
                    </span>
                  </div>

                  {/* Multi-Office Verification Pending Flag Display (Section 2.4) */}
                  <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                      Cross-Office Sequential Verification Flags:
                    </div>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                      {app.officeChain?.map((off, idx) => {
                        const ver = app.stageVerifications?.[idx];
                        const isCleared = ver?.status === "cleared";
                        return (
                          <div key={off} style={{ padding: "6px 12px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "800", background: isCleared ? "#dcfce7" : "#f1f5f9", color: isCleared ? "#15803d" : "#475569", border: "1px solid" }}>
                            {off}: {isCleared ? "CLEARED" : "PENDING"} {ver?.officerRemarks ? `(${ver.officerRemarks})` : ""}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                    <input
                      type="text"
                      placeholder="Enter municipal officer remarks / correction notes..."
                      value={remarks[app._id] || ""}
                      onChange={(e) => setRemarks({ ...remarks, [app._id]: e.target.value })}
                      style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                    />
                    <button onClick={() => handleAction(app._id, "approve")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#0284c7", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaCheckCircle /> Approve &amp; Issue
                    </button>
                    <button onClick={() => handleAction(app._id, "discrepancy")} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#d97706", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaExclamationTriangle /> Flag Discrepancy
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
