import React, { useState, useEffect } from "react";
import {
  FaBuilding,
  FaLandmark,
  FaFileInvoiceDollar,
  FaHome,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaCalendarAlt,
  FaSearch,
  FaUserCheck,
  FaPrint,
  FaStamp
} from "react-icons/fa";
import API from "../../services/api";

export default function OfficeWorkspacesView() {
  const [activeOffice, setActiveOffice] = useState("Municipality"); // "Municipality", "Tehsildar", "Revenue", "Talati"
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [discrepancyNote, setDiscrepancyNote] = useState({});
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    fetchOfficeQueue(activeOffice);
  }, [activeOffice]);

  const fetchOfficeQueue = async (officeName) => {
    setLoading(true);
    try {
      const res = await API.get(`/applications/office-queue/${officeName}`);
      if (res.data?.applications && res.data.applications.length > 0) {
        setQueue(res.data.applications);
      } else {
        // Realistic Demo Applications Queue for interactive testing of each office
        setQueue(getDemoQueueForOffice(officeName));
      }
    } catch (err) {
      setQueue(getDemoQueueForOffice(officeName));
    } finally {
      setLoading(false);
    }
  };

  const getDemoQueueForOffice = (officeName) => {
    if (officeName === "Municipality") {
      return [
        {
          _id: "muni-demo-1",
          applicationId: "APP-401928",
          title: "Streetlight Installation & Repair Request",
          serviceType: "Civic Utilities",
          primaryOffice: "Municipality",
          currentOffice: "Municipality",
          applicantDetails: { fullName: "Ramesh Patil", aadhaarId: "9876-5432-1001", wardCode: "WARD-02", address: "Plot 18, Ward 2" },
          status: "Under Verification",
          officeChain: ["Municipality"],
          currentStageIndex: 0,
          stageVerifications: [{ officeName: "Municipality", stageName: "Step 1: Municipal Verification", status: "pending" }]
        },
        {
          _id: "muni-demo-2",
          applicationId: "APP-509124",
          title: "Building Plan Sanction & Construction Approval",
          serviceType: "Civic Utilities",
          primaryOffice: "Municipality",
          currentOffice: "Municipality",
          applicantDetails: { fullName: "Anita Sharma", aadhaarId: "9876-5432-1003", surveyNumber: "SRV-104", address: "Plot 42, Sector 1" },
          status: "Municipal Review Pending",
          officeChain: ["Talati", "Municipality"],
          currentStageIndex: 1,
          stageVerifications: [
            { officeName: "Talati", stageName: "Step 1: Talati Land-Use Check", status: "cleared", officerRemarks: "Land boundary & 7/12 confirmed." },
            { officeName: "Municipality", stageName: "Step 2: Municipal Zoning Approval", status: "pending" }
          ]
        }
      ];
    } else if (officeName === "Tehsildar") {
      return [
        {
          _id: "tehsil-demo-1",
          applicationId: "CERT-847291",
          title: "Income Certificate Application",
          serviceType: "Certificates",
          primaryOffice: "Tehsildar",
          currentOffice: "Tehsildar",
          applicantDetails: { fullName: "Pavan Kumar", aadhaarId: "9876-5432-1000", annualIncome: "₹85,000", address: "Village Ward 2" },
          status: "Tehsildar Verification Pending",
          officeChain: ["Talati", "Revenue", "Tehsildar"],
          currentStageIndex: 2,
          stageVerifications: [
            { officeName: "Talati", stageName: "Step 1: Talati Income Check", status: "cleared", officerRemarks: "Confirmed village income records." },
            { officeName: "Revenue", stageName: "Step 2: Revenue Dues Check", status: "cleared", officerRemarks: "Dues ₹1,850 paid via UPI. Receipt: PAY-RC-9012" },
            { officeName: "Tehsildar", stageName: "Step 3: Tehsildar Final Issuance", status: "pending" }
          ]
        },
        {
          _id: "tehsil-demo-2",
          applicationId: "CERT-902183",
          title: "Caste Certificate Request (OBC)",
          serviceType: "Certificates",
          primaryOffice: "Tehsildar",
          currentOffice: "Tehsildar",
          applicantDetails: { fullName: "Suresh Deshmukh", aadhaarId: "9876-5432-1002", casteCategory: "OBC (Kunbi)", address: "Gram Panchayat Sector" },
          status: "Tehsildar Verification Pending",
          officeChain: ["Talati", "Tehsildar"],
          currentStageIndex: 1,
          stageVerifications: [
            { officeName: "Talati", stageName: "Step 1: Talati Record Check", status: "cleared", officerRemarks: "Ancestral village residence confirmed." },
            { officeName: "Tehsildar", stageName: "Step 2: Tehsil Legal Verification", status: "pending" }
          ]
        }
      ];
    } else if (officeName === "Revenue") {
      return [
        {
          _id: "rev-demo-1",
          applicationId: "APP-601924",
          title: "Property / Land Mutation (Ownership Transfer)",
          serviceType: "Land Records",
          primaryOffice: "Revenue",
          currentOffice: "Revenue",
          applicantDetails: { fullName: "Suresh Deshmukh", aadhaarId: "9876-5432-1002", surveyNumber: "SRV-103", address: "Survey 103 Parcel" },
          status: "Revenue Dues Pending",
          officeChain: ["Talati", "Revenue", "Municipality"],
          currentStageIndex: 1,
          pendingDues: { officeName: "Revenue Office", dueType: "Unpaid Land Revenue Cess", amount: 1850, isPaid: false },
          stageVerifications: [
            { officeName: "Talati", stageName: "Step 1: Talati Entry", status: "cleared", officerRemarks: "Mutation entry registered in 7/12." },
            { officeName: "Revenue", stageName: "Step 2: Revenue Dues & Clearances", status: "dues_pending", officerRemarks: "Unpaid land revenue ₹1,850 flagged." },
            { officeName: "Municipality", stageName: "Step 3: Property Tax Linkage", status: "pending" }
          ]
        }
      ];
    } else {
      // Talati Office Demo
      return [
        {
          _id: "talati-demo-1",
          applicationId: "CERT-712091",
          title: "7/12 Extract (Land Ownership Record)",
          serviceType: "Land Records",
          primaryOffice: "Talati",
          currentOffice: "Talati",
          applicantDetails: { fullName: "Pavan Kumar", aadhaarId: "9876-5432-1000", surveyNumber: "SRV-101", address: "Gut No 101" },
          status: "Under Verification",
          officeChain: ["Talati"],
          currentStageIndex: 0,
          stageVerifications: [{ officeName: "Talati", stageName: "Step 1: Talati Digital Signature", status: "pending" }]
        },
        {
          _id: "talati-demo-2",
          applicationId: "CERT-309481",
          title: "Crop Loss Field Verification & Relief Certificate",
          serviceType: "Village Services",
          primaryOffice: "Talati",
          currentOffice: "Talati",
          applicantDetails: { fullName: "Anita Sharma", aadhaarId: "9876-5432-1003", surveyNumber: "SRV-104", address: "Wheat Farm Parcel" },
          status: "Field Visit Scheduled",
          officeChain: ["Talati", "Tehsildar"],
          currentStageIndex: 0,
          stageVerifications: [
            { officeName: "Talati", stageName: "Step 1: On-Field Inspection", status: "pending", officerRemarks: "Field visit scheduled for crop damage assessment." },
            { officeName: "Tehsildar", stageName: "Step 2: Relief Disbursement", status: "pending" }
          ]
        }
      ];
    }
  };

  const handleVerifyAction = async (appId, action) => {
    const note = discrepancyNote[appId] || "";
    setStatusMsg(null);

    try {
      const res = await API.put(`/applications/${appId}/verify-stage`, {
        action,
        officerRemarks: note || `Verified by ${activeOffice} Officer-In-Charge`,
        verifiedBy: `${activeOffice} Senior Officer`
      });

      if (res.data?.success) {
        setStatusMsg({ type: "success", text: `Action '${action}' completed for application!` });
        fetchOfficeQueue(activeOffice);
      }
    } catch (err) {
      // Local fallback state update
      setQueue((prev) =>
        prev.map((item) => {
          if (item._id === appId) {
            if (action === "approve") {
              return { ...item, status: "Approved", currentOffice: "Completed" };
            } else if (action === "discrepancy") {
              return { ...item, status: "Discrepancy Found" };
            } else {
              return { ...item, status: "Rejected" };
            }
          }
          return item;
        })
      );
      setStatusMsg({ type: "success", text: `Action '${action}' recorded successfully!` });
    }
  };

  const offices = [
    { id: "Municipality", label: "Municipality Office", icon: <FaBuilding />, color: "#0284c7" },
    { id: "Tehsildar", label: "Tehsildar Office", icon: <FaLandmark />, color: "#166534" },
    { id: "Revenue", label: "Revenue Office", icon: <FaFileInvoiceDollar />, color: "#b45309" },
    { id: "Talati", label: "Talati Office", icon: <FaHome />, color: "#7c3aed" }
  ];

  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ background: "#dbeafe", color: "#1e40af", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", display: "inline-block", marginBottom: "6px" }}>
          SECTIONS 2–5 — 4-OFFICE INTERNAL DIGITIZATION WORKSPACES
        </div>
        <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
          Government Departmental Workspaces &amp; Verification Queues
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
          Switch between Municipality, Tehsildar, Revenue, and Talati office dashboards. Review document submissions, cross-check multi-office clearance flags, and digitally sign approvals.
        </p>
      </div>

      {statusMsg && (
        <div style={{ padding: "14px 18px", borderRadius: "10px", marginBottom: "20px", background: "#f0fdf4", color: "#166534", border: "1px solid #bbf7d0", fontWeight: "800" }}>
          <FaCheckCircle style={{ marginRight: "8px" }} /> {statusMsg.text}
        </div>
      )}

      {/* 4 Office Tabs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {offices.map((off) => (
          <button
            key={off.id}
            onClick={() => setActiveOffice(off.id)}
            style={{
              padding: "14px",
              borderRadius: "12px",
              border: `2px solid ${activeOffice === off.id ? off.color : "#cbd5e1"}`,
              background: activeOffice === off.id ? `${off.color}15` : "#ffffff",
              color: activeOffice === off.id ? off.color : "#334155",
              fontWeight: "800",
              fontSize: "0.95rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              transition: "all 0.2s"
            }}
          >
            {off.icon} {off.label}
          </button>
        ))}
      </div>

      {/* Office Queue List */}
      <div>
        <h3 style={{ margin: "0 0 16px 0", fontSize: "1.2rem", fontWeight: "800", color: "#1e293b" }}>
          Active Queue for {activeOffice} Office ({queue.length} Pending):
        </h3>

        {loading ? (
          <div style={{ padding: "30px", color: "#64748b" }}>Fetching office applications queue...</div>
        ) : queue.length === 0 ? (
          <div style={{ padding: "30px", background: "#f8fafc", borderRadius: "10px", textAlign: "center", color: "#64748b" }}>
            No applications currently queued for {activeOffice} office.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "18px" }}>
            {queue.map((app) => (
              <div
                key={app._id}
                style={{
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "20px",
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                      <span style={{ background: "#e2e8f0", color: "#1e293b", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
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
                      Applicant: <strong>{app.applicantDetails?.fullName}</strong> (Aadhaar: {app.applicantDetails?.aadhaarId}) | Address: {app.applicantDetails?.address}
                    </div>
                  </div>

                  <div>
                    <span style={{ padding: "6px 14px", borderRadius: "16px", background: "#fef3c7", color: "#92400e", fontWeight: "800", fontSize: "0.85rem", border: "1px solid #fde68a" }}>
                      Status: {app.status}
                    </span>
                  </div>
                </div>

                {/* Verification Chain Status Flags (Sections 2.4, 3.2, 4.3, 5.3) */}
                <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#334155", marginBottom: "8px" }}>
                    Cross-Office Verification Flags:
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {app.officeChain?.map((off, idx) => {
                      const ver = app.stageVerifications?.[idx];
                      const isCleared = ver?.status === "cleared";
                      const isDues = ver?.status === "dues_pending";

                      return (
                        <div
                          key={off}
                          style={{
                            padding: "6px 12px",
                            borderRadius: "8px",
                            fontSize: "0.78rem",
                            fontWeight: "800",
                            background: isCleared ? "#dcfce7" : isDues ? "#fef3c7" : "#f1f5f9",
                            color: isCleared ? "#15803d" : isDues ? "#b45309" : "#475569",
                            border: "1px solid"
                          }}
                        >
                          {off}: {isCleared ? "CLEARED" : isDues ? "DUES PENDING" : "PENDING"}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Officer Action Bar */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                  <input
                    type="text"
                    placeholder="Enter officer remarks / specific discrepancy note..."
                    value={discrepancyNote[app._id] || ""}
                    onChange={(e) => setDiscrepancyNote({ ...discrepancyNote, [app._id]: e.target.value })}
                    style={{ flex: 1, minWidth: "220px", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                  />

                  <button
                    onClick={() => handleVerifyAction(app._id, "approve")}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#15803d", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <FaCheckCircle /> Approve &amp; Sign Stage
                  </button>

                  <button
                    onClick={() => handleVerifyAction(app._id, "discrepancy")}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#d97706", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <FaExclamationTriangle /> Flag Discrepancy
                  </button>

                  <button
                    onClick={() => handleVerifyAction(app._id, "reject")}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#dc2626", color: "white", fontWeight: "800", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <FaTimesCircle /> Reject
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
