import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaProjectDiagram, FaUserTie, FaClock, FaExclamationTriangle, FaCheckDouble, FaTasks } from "react-icons/fa";

export default function WorkflowOrchestration() {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, deptRes] = await Promise.all([
        API.get("/admin/complaints"),
        API.get("/department/all")
      ]);
      setComplaints(compRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error("Failed to load workflow orchestration data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDept = async (complaintId) => {
    const deptId = selectedDept[complaintId];
    if (!deptId) {
      alert("Please select a department first.");
      return;
    }

    try {
      await API.put(`/admin/assign-department/${complaintId}`, { departmentId: deptId });
      alert("Department successfully assigned!");
      fetchData();
    } catch (err) {
      alert("Failed to assign department.");
    }
  };

  const handleStageTransition = async (complaintId, newStatus) => {
    try {
      await API.put(`/admin/complaints/${complaintId}/status`, { status: newStatus });
      fetchData();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  // Group by workflow stage
  const pendingStage = complaints.filter((c) => c.status === "Pending");
  const assignedStage = complaints.filter((c) => c.status === "Assigned" || c.status === "Accepted");
  const completedStage = complaints.filter((c) => c.status === "Completed");

  return (
    <div style={{ padding: "20px", maxWidth: "1300px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px 0", color: "#1e293b", fontSize: "1.75rem", fontWeight: "700" }}>
          🔄 Workflow Orchestration & Pipeline Management
        </h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "0.95rem" }}>
          Orchestrate multi-stage civic workflows, assign department officers, set SLA deadlines, and handle escalations.
        </p>
      </div>

      {/* Pipeline Board 3-Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px" }}>
        {/* Column 1: Submitted / Pending Stage */}
        <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#92400e", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaClock /> 1. Submitted & Intake ({pendingStage.length})
            </h3>
            <span style={{ background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>STAGE 1</span>
          </div>

          {loading ? (
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Loading...</p>
          ) : pendingStage.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>No pending intake tickets.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {pendingStage.map((c) => (
                <div key={c._id} style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.95rem" }}>{c.title || c.grievance}</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 10px 0" }}>
                    Category: {c.utilityCategory} | Urgency: <strong style={{ color: c.urgency === "Critical" ? "#dc2626" : "#2563eb" }}>{c.urgency}</strong>
                  </div>

                  {/* Assign Department */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    <select
                      value={selectedDept[c._id] || ""}
                      onChange={(e) => setSelectedDept({ ...selectedDept, [c._id]: e.target.value })}
                      style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                    >
                      <option value="">Select Dept...</option>
                      {departments.map((d) => (
                        <option key={d._id} value={d._id}>{d.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleAssignDept(c._id)}
                      style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                    >
                      Assign
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Assigned & Field Execution */}
        <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#1d4ed8", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaTasks /> 2. In Progress / Field ({assignedStage.length})
            </h3>
            <span style={{ background: "#dbeafe", color: "#1d4ed8", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>STAGE 2</span>
          </div>

          {loading ? (
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Loading...</p>
          ) : assignedStage.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>No tickets in field execution.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {assignedStage.map((c) => (
                <div key={c._id} style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #cbd5e1", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.95rem" }}>{c.title || c.grievance}</div>
                  <div style={{ fontSize: "0.8rem", color: "#2563eb", margin: "4px 0" }}>
                    Assigned Dept: {c.department?.name || "Field Unit"}
                  </div>
                  {c.isEscalatedToAdmin && (
                    <div style={{ background: "#fef2f2", color: "#dc2626", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700", marginBottom: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FaExclamationTriangle /> Escalated SLA Breach
                    </div>
                  )}
                  <button
                    onClick={() => handleStageTransition(c._id, "Completed")}
                    style={{ width: "100%", background: "#059669", color: "white", border: "none", padding: "6px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" }}
                  >
                    Mark Resolved ✓
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Resolved & Closed Stage */}
        <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "16px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", color: "#065f46", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaCheckDouble /> 3. Resolved & Closed ({completedStage.length})
            </h3>
            <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "10px", fontSize: "0.75rem", fontWeight: "700" }}>STAGE 3</span>
          </div>

          {loading ? (
            <p style={{ fontSize: "0.85rem", color: "#64748b" }}>Loading...</p>
          ) : completedStage.length === 0 ? (
            <p style={{ fontSize: "0.85rem", color: "#94a3b8" }}>No resolved tickets in history.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {completedStage.slice(0, 10).map((c) => (
                <div key={c._id} style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                  <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "0.95rem" }}>{c.title || c.grievance}</div>
                  <div style={{ fontSize: "0.8rem", color: "#059669", marginTop: "4px" }}>
                    Completed on {new Date(c.updatedAt).toLocaleDateString()}
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
