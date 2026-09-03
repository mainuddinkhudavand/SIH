import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaProjectDiagram, FaPlus, FaTrash, FaSave, FaBuilding } from "react-icons/fa";

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const [formData, setFormData] = useState({
    departmentName: "Water Supply & Sanitation Board",
    email: "water@egram.gov.in",
    password: "Water@123",
    serviceType: "Water Pipeline Connection",
    description: "Multi-stage intake, field site survey, and meter connection pipeline.",
    stages: [
      { stageName: "Document Verification & Fee Receipt", stageOrder: 1, assignedRole: "Desk Officer", slaHours: 24, isFinal: false },
      { stageName: "Field Plumbing & Pressure Inspection", stageOrder: 2, assignedRole: "Field Engineer", slaHours: 48, isFinal: false },
      { stageName: "Meter Sanction & Meter Installation", stageOrder: 3, assignedRole: "Sanction Inspector", slaHours: 24, isFinal: true }
    ],
    requiredDocuments: ["Aadhaar Proof", "Property Ownership Deed", "Tax Clearance"]
  });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const savedLocal = JSON.parse(localStorage.getItem("configuredWorkflows") || "[]");

      let apiList = [];
      try {
        const res = await API.get("/workflows/all");
        apiList = Array.isArray(res.data) ? res.data : (res.data?.workflows || res.data?.data || []);
      } catch (err) {
        console.warn("Backend workflow fetch error, using local storage cache:", err);
      }

      const mergedMap = new Map();
      [...savedLocal, ...apiList].forEach((wf) => {
        if (wf.serviceType || wf.departmentName) {
          const key = (wf.serviceType || wf.departmentName).toLowerCase();
          mergedMap.set(key, wf);
        }
      });

      const mergedList = Array.from(mergedMap.values());
      setWorkflows(mergedList);
    } catch (err) {
      console.error("Failed to load workflows:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = () => {
    setFormData({
      ...formData,
      stages: [
        ...formData.stages,
        {
          stageName: `Stage ${formData.stages.length + 1}`,
          stageOrder: formData.stages.length + 1,
          assignedRole: "Review Officer",
          slaHours: 24,
          isFinal: false
        }
      ]
    });
  };

  const handleRemoveStage = (index) => {
    const updated = formData.stages.filter((_, idx) => idx !== index);
    setFormData({ ...formData, stages: updated });
  };

  const handleStageChange = (index, field, value) => {
    const updated = [...formData.stages];
    updated[index][field] = value;
    setFormData({ ...formData, stages: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      await API.post("/workflows/configure", formData);

      const savedLocal = JSON.parse(localStorage.getItem("configuredWorkflows") || "[]");
      const filtered = savedLocal.filter((w) => w.serviceType?.toLowerCase() !== formData.serviceType.toLowerCase());
      const updatedLocal = [...filtered, formData];
      localStorage.setItem("configuredWorkflows", JSON.stringify(updatedLocal));

      setMessage({
        type: "success",
        text: `Department '${formData.departmentName}' & Workflow '${formData.serviceType}' created successfully! You can now log into Department Portal using ${formData.email}`
      });

      fetchWorkflows();
    } catch (err) {
      const savedLocal = JSON.parse(localStorage.getItem("configuredWorkflows") || "[]");
      const filtered = savedLocal.filter((w) => w.serviceType?.toLowerCase() !== formData.serviceType.toLowerCase());
      const updatedLocal = [...filtered, formData];
      localStorage.setItem("configuredWorkflows", JSON.stringify(updatedLocal));

      setMessage({
        type: "success",
        text: `Department workflow '${formData.serviceType}' saved locally & configured!`
      });
      fetchWorkflows();
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveDepartment = async (wf) => {
    const targetName = wf.departmentName || wf.serviceType;
    if (!window.confirm(`Are you sure you want to remove '${targetName}' department and pipeline?`)) {
      return;
    }

    try {
      const targetId = wf._id || wf.serviceType || wf.departmentName;
      await API.delete(`/workflows/delete/${encodeURIComponent(targetId)}`);
    } catch (err) {
      console.warn("API deletion fallback:", err);
    }

    // Clean local storage cache
    const savedLocal = JSON.parse(localStorage.getItem("configuredWorkflows") || "[]");
    const updatedLocal = savedLocal.filter(
      (w) => (w.serviceType || w.departmentName)?.toLowerCase() !== (wf.serviceType || wf.departmentName)?.toLowerCase()
    );
    localStorage.setItem("configuredWorkflows", JSON.stringify(updatedLocal));

    setMessage({ type: "success", text: `Department '${targetName}' and workflow pipeline removed successfully!` });
    fetchWorkflows();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px 0", color: "#1b4332", fontSize: "1.75rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <FaProjectDiagram style={{ color: "#2d6a4f" }} /> Configurable Department Workflow Engine & Management
        </h2>
        <p style={{ margin: 0, color: "#475569", fontSize: "0.95rem" }}>
          Create departments, configure login credentials, design multi-stage approval pipelines, and set SLA deadlines.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px", maxWidth: "100%" }}>
        {/* Department & Workflow Configuration Form */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #d8f3dc", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)", boxSizing: "border-box", width: "100%", overflow: "hidden" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#1b4332", fontSize: "1.25rem", fontWeight: "800" }}>
            Add / Configure Department & Pipeline
          </h3>

          {message && (
            <div style={{ padding: "12px", borderRadius: "8px", marginBottom: "16px", background: message.type === "success" ? "#ecfdf5" : "#fef2f2", color: message.type === "success" ? "#065f46" : "#991b1b", border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}`, fontSize: "0.88rem", lineHeight: "1.5" }}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Department Account Credentials */}
            <div style={{ background: "#f4f9f4", padding: "14px", borderRadius: "10px", border: "1px solid #d8f3dc", marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 12px 0", color: "#1b4332", fontSize: "0.95rem", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaBuilding style={{ color: "#2d6a4f" }} /> Department Details & Login Setup
              </h4>

              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "4px" }}>
                  Department Name (e.g., Water Board)
                </label>
                <input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  required
                  placeholder="Water Board"
                  style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "0.9rem" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "4px" }}>
                    Login Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    placeholder="water@egram.gov.in"
                    style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "4px" }}>
                    Initial Password
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "4px" }}>
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of responsibilities..."
                  style={{ width: "100%", padding: "9px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "0.85rem" }}
                />
              </div>
            </div>

            {/* Target Service & Pipeline Stages */}
            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "4px" }}>Target Service / Application Type</label>
              <input
                type="text"
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                required
                placeholder="Water Pipeline Connection"
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "6px" }}>
                <label style={{ fontSize: "0.85rem", fontWeight: "700", color: "#1b4332" }}>Custom Pipeline Stages & SLA Hours</label>
                <button
                  type="button"
                  onClick={handleAddStage}
                  style={{ background: "#ecfdf5", color: "#065f46", border: "1px solid #a7f3d0", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <FaPlus /> Add Stage
                </button>
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                {formData.stages.map((stg, idx) => (
                  <div key={idx} style={{ background: "#f4f9f4", padding: "12px", borderRadius: "8px", border: "1px solid #d8f3dc", boxSizing: "border-box" }}>
                    <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
                      <input
                        type="text"
                        placeholder="Stage Name"
                        value={stg.stageName}
                        onChange={(e) => handleStageChange(idx, "stageName", e.target.value)}
                        style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem", minWidth: "0" }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStage(idx)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 10px", borderRadius: "6px", cursor: "pointer" }}
                      >
                        <FaTrash />
                      </button>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <input
                        type="text"
                        placeholder="Assigned Role"
                        value={stg.assignedRole}
                        onChange={(e) => handleStageChange(idx, "assignedRole", e.target.value)}
                        style={{ flex: 1, padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem", minWidth: "120px" }}
                      />
                      <input
                        type="number"
                        placeholder="SLA Hours"
                        value={stg.slaHours}
                        onChange={(e) => handleStageChange(idx, "slaHours", Number(e.target.value))}
                        style={{ width: "80px", padding: "6px 8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "none",
                background: "linear-gradient(135deg, #2d6a4f, #1b4332)",
                color: "white",
                fontWeight: "700",
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {submitting ? "Saving Department & Pipeline..." : <><FaSave /> Create Department & Save Workflow</>}
            </button>
          </form>
        </div>

        {/* Permanent Configured Department Pipelines List */}
        <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #d8f3dc", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.03)", boxSizing: "border-box", width: "100%", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.25rem", fontWeight: "800" }}>Active Configured Department Pipelines</h3>
            <span style={{ fontSize: "0.75rem", background: "#d8f3dc", color: "#1b4332", padding: "4px 10px", borderRadius: "12px", fontWeight: "700" }}>
              Permanent Storage
            </span>
          </div>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading workflows...</p>
          ) : workflows.length === 0 ? (
            <p style={{ color: "#64748b" }}>No custom department workflows configured yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "14px" }}>
              {workflows.map((wf, idx) => (
                <div key={wf._id || idx} style={{ background: "#f4f9f4", padding: "16px", borderRadius: "12px", border: "1px solid #d8f3dc", boxSizing: "border-box", wordBreak: "break-word" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
                    <div>
                      <span style={{ fontWeight: "800", color: "#1b4332", fontSize: "1rem", display: "block" }}>{wf.serviceType}</span>
                      {wf.email && (
                        <span style={{ fontSize: "0.75rem", color: "#2d6a4f" }}>
                          Login: <code>{wf.email}</code>
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "0.75rem", background: "#2d6a4f", color: "#ffffff", padding: "4px 10px", borderRadius: "8px", fontWeight: "700" }}>
                        {wf.departmentName}
                      </span>
                      {/* 🗑 Remove Department Button */}
                      <button
                        onClick={() => handleRemoveDepartment(wf)}
                        style={{
                          background: "#fee2e2",
                          color: "#dc2626",
                          border: "1px solid #fecaca",
                          padding: "4px 10px",
                          borderRadius: "8px",
                          fontSize: "0.75rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px"
                        }}
                      >
                        <FaTrash /> Remove Department
                      </button>
                    </div>
                  </div>

                  {wf.description && (
                    <p style={{ margin: "4px 0 10px 0", fontSize: "0.82rem", color: "#475569" }}>{wf.description}</p>
                  )}

                  <div style={{ fontSize: "0.8rem", color: "#475569", marginTop: "8px" }}>
                    <strong style={{ display: "block", marginBottom: "6px", color: "#1b4332" }}>Pipeline Stages ({wf.stages?.length || 0}):</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {(wf.stages || []).map((s, sIdx) => (
                        <div key={sIdx} style={{ background: "#ffffff", border: "1px solid #b7e4c7", padding: "6px 10px", borderRadius: "8px", fontSize: "0.75rem", color: "#1b4332", display: "inline-flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: "700" }}>{s.stageOrder || sIdx + 1}. {s.stageName}</span>
                          <span style={{ color: "#2d6a4f", fontSize: "0.7rem" }}>Role: {s.assignedRole || "Officer"} • SLA: {s.slaHours}h</span>
                        </div>
                      ))}
                    </div>
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
