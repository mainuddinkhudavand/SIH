import React, { useState } from "react";
import API from "../../services/api";
import { FaSearch, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaMapMarkerAlt, FaCalendarAlt, FaUserCheck, FaLayerGroup } from "react-icons/fa";

export default function UnifiedTracking() {
  const [searchId, setSearchId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [itemType, setItemType] = useState(null); // "Application", "Certificate", "Complaint"
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setItemType(null);

    const term = searchId.trim();

    try {
      // 1. Try Application API
      if (term.startsWith("APP-") || term.length > 5) {
        try {
          const res = await API.get(`/applications/track/${term}`);
          if (res.data) {
            setResult(res.data);
            setItemType("Application");
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore & try next
        }
      }

      // 2. Try Certificate API
      if (term.startsWith("CERT-") || term.length > 5) {
        try {
          const res = await API.get(`/certificates/track/${term}`);
          if (res.data) {
            setResult(res.data);
            setItemType("Certificate");
            setLoading(false);
            return;
          }
        } catch (e) {
          // ignore & try next
        }
      }

      // 3. Try Grievance / Complaint API
      try {
        const res = await API.get(`/complaints/${term}`);
        if (res.data) {
          setResult(res.data);
          setItemType("Complaint");
          setLoading(false);
          return;
        }
      } catch (e) {
        // ignore
      }

      setError("No record found matching the entered Tracking ID. Please verify the ID and try again.");
    } catch (err) {
      setError("An error occurred while tracking your record. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderTimeline = (timeline = [], currentStatus) => {
    // If timeline is empty, construct standard steps based on currentStatus
    const defaultSteps = [
      { stage: "Submitted", note: "Received into digital system", status: "Completed" },
      { stage: "Under Review", note: "Assigned to department officer", status: currentStatus === "Submitted" ? "In Progress" : "Completed" },
      { stage: "Field Verification", note: "On-ground site inspection", status: ["Field Verification", "Assigned"].includes(currentStatus) ? "In Progress" : ["Approved", "Completed"].includes(currentStatus) ? "Completed" : "Pending" },
      { stage: "Final Resolution / Issue", note: "Approved certificate or grievance resolved", status: ["Approved", "Completed"].includes(currentStatus) ? "Completed" : currentStatus === "Rejected" ? "Rejected" : "Pending" }
    ];

    const displaySteps = timeline.length > 0 ? timeline : defaultSteps;

    return (
      <div style={{ margin: "24px 0" }}>
        <h4 style={{ color: "#334155", marginBottom: "16px" }}>Real-Time Stage Timeline</h4>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", position: "relative" }}>
          {displaySteps.map((step, idx) => {
            const isCompleted = step.status === "Completed" || step.status === "Approved" || step.status === "Submitted";
            const isCurrent = step.status === "In Progress" || step.status === "Under Review" || step.status === "In Verification";
            const isRejected = step.status === "Rejected";

            let bgColor = "#f1f5f9";
            let borderColor = "#cbd5e1";
            let icon = <FaHourglassHalf style={{ color: "#94a3b8" }} />;

            if (isCompleted) {
              bgColor = "#ecfdf5";
              borderColor = "#10b981";
              icon = <FaCheckCircle style={{ color: "#10b981" }} />;
            } else if (isCurrent) {
              bgColor = "#eff6ff";
              borderColor = "#3b82f6";
              icon = <FaHourglassHalf style={{ color: "#3b82f6" }} />;
            } else if (isRejected) {
              bgColor = "#fef2f2";
              borderColor = "#ef4444";
              icon = <FaTimesCircle style={{ color: "#ef4444" }} />;
            }

            return (
              <div
                key={idx}
                style={{
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: "12px",
                  padding: "16px",
                  position: "relative"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  {icon}
                  <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#0f172a" }}>{step.stage || step.status}</span>
                </div>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>{step.note || step.updatedBy || "Stage update"}</p>
                {step.timestamp && (
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", display: "block", marginTop: "6px" }}>
                    <FaCalendarAlt /> {new Date(step.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1000px", margin: "0 auto" }}>
      {/* Search Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          borderRadius: "16px",
          padding: "36px",
          color: "white",
          textAlign: "center",
          marginBottom: "32px",
          boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)"
        }}
      >
        <h2 style={{ margin: "0 0 8px 0", fontSize: "2rem", fontWeight: "800" }}>🔍 Unified Tracking Center</h2>
        <p style={{ margin: "0 0 24px 0", color: "#94a3b8", fontSize: "1rem" }}>
          Enter your Application ID, Certificate Request ID, or Grievance Ticket ID to check live status.
        </p>

        <form onSubmit={handleSearch} style={{ display: "flex", justifyContent: "center", gap: "8px", maxWidth: "600px", margin: "0 auto" }}>
          <input
            type="text"
            placeholder="e.g. APP-849201, CERT-49201, or Complaint ID"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            style={{
              flex: 1,
              padding: "14px 20px",
              borderRadius: "10px",
              border: "none",
              fontSize: "1rem",
              outline: "none",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: "#2563eb",
              color: "white",
              border: "none",
              padding: "14px 24px",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            {loading ? "Searching..." : <><FaSearch /> Track</>}
          </button>
        </form>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", color: "#991b1b", border: "1px solid #fecaca", padding: "16px", borderRadius: "10px", textAlign: "center", marginBottom: "24px" }}>
          {error}
        </div>
      )}

      {/* Result Card */}
      {result && (
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "28px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", pb: "16px", borderBottom: "1px solid #e2e8f0", marginBottom: "20px" }}>
            <div>
              <span style={{ fontSize: "0.8rem", background: "#eff6ff", color: "#1d4ed8", padding: "4px 10px", borderRadius: "6px", fontWeight: "700" }}>
                {itemType} Tracking Result
              </span>
              <h3 style={{ margin: "8px 0 0 0", color: "#0f172a" }}>
                {result.applicationId || result.certificateId || result.title || result.grievance || "Record Details"}
              </h3>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.85rem", color: "#64748b", display: "block" }}>Current Status</span>
              <span style={{ fontSize: "1.1rem", fontWeight: "700", color: result.status === "Approved" || result.status === "Completed" ? "#059669" : result.status === "Rejected" ? "#dc2626" : "#2563eb" }}>
                {result.status}
              </span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", background: "#f8fafc", padding: "16px", borderRadius: "12px", marginBottom: "24px", fontSize: "0.9rem" }}>
            <div><strong>Record ID:</strong> {result.applicationId || result.certificateId || result._id}</div>
            <div><strong>Submitted Date:</strong> {new Date(result.createdAt).toLocaleDateString()}</div>
            <div><strong>Applicant / User:</strong> {result.applicantDetails?.fullName || result.user?.name || "Registered Resident"}</div>
            <div><strong>Department:</strong> {result.assignedDepartment?.name || result.serviceType || result.certificateType || result.utilityCategory || "Civic Services"}</div>
          </div>

          {/* Timeline Visualizer */}
          {renderTimeline(result.timeline, result.status)}
        </div>
      )}
    </div>
  );
}
