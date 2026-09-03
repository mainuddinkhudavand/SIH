import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { FaCertificate, FaPlus, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaDownload, FaPrint, FaShieldAlt } from "react-icons/fa";

const CERTIFICATE_TYPES = [
  { id: "Birth Certificate", name: "Birth Certificate", desc: "Official proof of birth registration for legal & identity verification." },
  { id: "Death Certificate", name: "Death Certificate", desc: "Official municipal death record for legal & estate proceedings." },
  { id: "Income Certificate", name: "Annual Income Certificate", desc: "Certified household revenue proof for welfare & scholarship claims." },
  { id: "Caste Certificate", name: "Category / Caste Certificate", desc: "Official community category verification for educational/civic reservations." },
  { id: "Residence Certificate", name: "Domicile / Residence Certificate", desc: "Proof of domicile and long-term local residence status." }
];

export default function CertificatesModule() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedType, setSelectedType] = useState(CERTIFICATE_TYPES[0].id);

  const [formData, setFormData] = useState({
    fullName: "",
    fatherOrSpouseName: "",
    dob: "",
    address: "",
    mobile: "",
    aadhaarNumber: "",
    purpose: "",
    supportingDocUrl: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(null);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await API.get("/certificates/my-certificates", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCertificates(res.data || []);
    } catch (err) {
      console.error("Failed to load certificates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const token = localStorage.getItem("token");
      const payload = {
        certificateType: selectedType,
        applicantDetails: {
          fullName: formData.fullName,
          fatherOrSpouseName: formData.fatherOrSpouseName,
          dob: formData.dob,
          address: formData.address,
          mobile: formData.mobile,
          aadhaarNumber: formData.aadhaarNumber,
          purpose: formData.purpose
        },
        supportingDocUrl: formData.supportingDocUrl
      };

      const res = await API.post("/certificates/request", payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMessage({ type: "success", text: `Certificate request submitted! Certificate Request ID: ${res.data.certificate.certificateId}` });
      setFormData({ fullName: "", fatherOrSpouseName: "", dob: "", address: "", mobile: "", aadhaarNumber: "", purpose: "", supportingDocUrl: "" });
      setShowForm(false);
      fetchCertificates();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to submit certificate request." });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return <span style={{ background: "#d1fae5", color: "#065f46", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}><FaCheckCircle /> Issued & Ready</span>;
      case "Rejected":
        return <span style={{ background: "#fee2e2", color: "#991b1b", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}><FaTimesCircle /> Rejected</span>;
      case "In Verification":
        return <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}><FaHourglassHalf /> Under Verification</span>;
      default:
        return <span style={{ background: "#fef3c7", color: "#92400e", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}><FaHourglassHalf /> Submitted</span>;
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h2 style={{ margin: 0, color: "#1e293b", fontSize: "1.75rem", fontWeight: "700" }}>
            📜 Official Certificate Requests
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
            Request, track, and download official municipal & government certificates with digital seal verification.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "linear-gradient(135deg, #059669, #10b981)",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "10px",
            fontSize: "0.95rem",
            fontWeight: "600",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.25)"
          }}
        >
          {showForm ? "Close Form" : <><FaPlus /> Request Certificate</>}
        </button>
      </div>

      {message && (
        <div style={{ padding: "14px", borderRadius: "8px", marginBottom: "20px", background: message.type === "success" ? "#ecfdf5" : "#fef2f2", color: message.type === "success" ? "#065f46" : "#991b1b", border: `1px solid ${message.type === "success" ? "#a7f3d0" : "#fecaca"}` }}>
          {message.text}
        </div>
      )}

      {/* New Certificate Form */}
      {showForm && (
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e2e8f0", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)", marginBottom: "32px" }}>
          <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#0f172a" }}>Submit Certificate Application</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Certificate Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                >
                  {CERTIFICATE_TYPES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Full Name (as per official record)</label>
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Legal Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Father's / Spouse's Name</label>
                <input
                  type="text"
                  name="fatherOrSpouseName"
                  placeholder="Guardian / Spouse Name"
                  value={formData.fatherOrSpouseName}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Date of Birth</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Mobile Number</label>
                <input
                  type="text"
                  name="mobile"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  placeholder="12-digit Aadhaar Number"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Full Residence Address</label>
              <textarea
                name="address"
                rows="2"
                placeholder="House No, Ward, Village / Town, District..."
                value={formData.address}
                onChange={handleInputChange}
                required
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginTop: "16px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "#475569", marginBottom: "6px" }}>Purpose of Certificate</label>
              <input
                type="text"
                name="purpose"
                placeholder="e.g. Higher Education Admission / Bank Loan / Employment"
                value={formData.purpose}
                onChange={handleInputChange}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
              />
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  background: "#059669",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                {submitting ? "Submitting..." : <><FaCertificate /> Submit Certificate Request</>}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Digital Certificate Display Modal */}
      {viewingCertificate && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", width: "100%", maxWidth: "650px", borderRadius: "16px", padding: "32px", border: "4px double #059669", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <div style={{ textAlign: "center", borderBottom: "2px solid #e2e8f0", pb: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "2.5rem", color: "#059669" }}>📜</div>
              <h2 style={{ margin: "8px 0 2px 0", color: "#065f46", fontFamily: "serif" }}>OFFICIAL GOVERNMENT CERTIFICATE</h2>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>E-Gram Panchayat Digital Governance Authority</p>
            </div>

            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "20px", fontSize: "0.9rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span><strong>Certificate No:</strong></span>
                <span style={{ color: "#059669", fontWeight: "700" }}>{viewingCertificate.issuedCertificate?.certificateNumber || "GOV-APPROVED"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span><strong>Certificate Type:</strong></span>
                <span>{viewingCertificate.certificateType}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span><strong>Issued To:</strong></span>
                <span style={{ fontWeight: "700" }}>{viewingCertificate.applicantDetails?.fullName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span><strong>Father / Spouse Name:</strong></span>
                <span>{viewingCertificate.applicantDetails?.fatherOrSpouseName || "N/A"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span><strong>Issue Date:</strong></span>
                <span>{viewingCertificate.issuedCertificate?.issueDate ? new Date(viewingCertificate.issuedCertificate.issueDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span><strong>Digital Seal Token:</strong></span>
                <span style={{ fontFamily: "monospace", color: "#1e293b" }}><FaShieldAlt style={{ color: "#059669" }} /> {viewingCertificate.issuedCertificate?.digitalSealToken}</span>
              </div>
            </div>

            <div style={{ textAlign: "center", background: "#ecfdf5", padding: "12px", borderRadius: "8px", color: "#065f46", fontSize: "0.85rem", fontWeight: "600", marginBottom: "20px" }}>
              ✓ Digitally authenticated certificate issued under Digital Governance Act. Verified valid.
            </div>

            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => window.print()}
                style={{ padding: "10px 20px", background: "#059669", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}
              >
                <FaPrint /> Print / Save PDF
              </button>
              <button
                onClick={() => setViewingCertificate(null)}
                style={{ padding: "10px 20px", background: "#64748b", color: "white", border: "none", borderRadius: "8px", fontWeight: "600", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitted Certificates List */}
      <h3 style={{ color: "#334155", marginBottom: "16px" }}>My Certificate Requests History</h3>
      {loading ? (
        <p style={{ color: "#64748b" }}>Loading certificate records...</p>
      ) : certificates.length === 0 ? (
        <div style={{ padding: "32px", textAlign: "center", background: "#f8fafc", borderRadius: "12px", border: "1px dashed #cbd5e1" }}>
          <p style={{ color: "#64748b", margin: 0 }}>No certificate requests yet. Click "Request Certificate" above to submit a request.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "16px" }}>
          {certificates.map((cert) => (
            <div
              key={cert._id}
              style={{
                background: "#ffffff",
                borderRadius: "12px",
                padding: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                <div>
                  <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: "600" }}>ID: {cert.certificateId}</span>
                  <h4 style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "1.1rem" }}>{cert.certificateType}</h4>
                  <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: "500" }}>Applicant: {cert.applicantDetails?.fullName}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {getStatusBadge(cert.status)}
                  {cert.status === "Approved" && (
                    <button
                      onClick={() => setViewingCertificate(cert)}
                      style={{
                        background: "#059669",
                        color: "white",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "8px",
                        fontWeight: "600",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <FaDownload /> View & Download
                    </button>
                  )}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", background: "#f8fafc", padding: "12px", borderRadius: "8px", fontSize: "0.85rem", color: "#475569" }}>
                <div><strong>Mobile:</strong> {cert.applicantDetails?.mobile}</div>
                <div><strong>Aadhaar:</strong> {cert.applicantDetails?.aadhaarNumber || "N/A"}</div>
                <div><strong>Requested Date:</strong> {new Date(cert.createdAt).toLocaleDateString()}</div>
                <div><strong>Remarks:</strong> {cert.remarks || "Under process"}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
