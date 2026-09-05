import React, { useState, useEffect } from "react";
import {
  FaCertificate,
  FaCity,
  FaLandmark,
  FaTree,
  FaArrowRight,
  FaCheckCircle,
  FaShieldAlt,
  FaFileUpload,
  FaNetworkWired,
  FaFileAlt
} from "react-icons/fa";
import API from "../../services/api";

export default function AvailableServicesView({ onApplicationSubmitted }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedService, setSelectedService] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: "Pavan Kumar",
    phone: "+91 98765 43210",
    email: "pavan.citizen@egram.gov.in",
    address: "House #14, Sector 3, Gram Panchayat Jurisdiction",
    aadhaarId: "9876-5432-1000",
    surveyNumber: "SRV-101",
    propertyId: "PROP-MH-401",
    wardCode: "WARD-04",
    annualIncome: "85000",
    casteCategory: "OBC",
    deceasedName: "",
    businessName: "",
    reason: "Official requirement for education subsidy"
  });

  const [submitting, setSubmitting] = useState(false);
  const [resultMsg, setResultMsg] = useState(null);

  useEffect(() => {
    fetchServicesCatalog();
  }, []);

  const fetchServicesCatalog = async () => {
    try {
      const res = await API.get("/applications/services");
      if (res.data?.services) {
        setServices(res.data.services);
      }
    } catch (err) {
      console.warn("Using fallback service catalog");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (service) => {
    setSelectedService(service);
    setShowApplyModal(true);
    setResultMsg(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResultMsg(null);

    try {
      const res = await API.post("/applications/submit", {
        serviceId: selectedService.serviceId,
        applicantDetails: formData,
        documents: [
          { docType: "Aadhaar Identity Verification Slip", fileUrl: "/uploads/aadhaar_proof.pdf" },
          { docType: "Address / Land Record Proof", fileUrl: "/uploads/residence_proof.pdf" }
        ]
      });

      if (res.data?.success) {
        const app = res.data.application;
        setResultMsg({
          type: "success",
          text: `Application submitted successfully! Tracking ID: ${app.applicationId}`,
          details: `Routed to ${app.currentOffice}. Office Chain: ${app.officeChain.join(" → ")}.`
        });
        setTimeout(() => {
          setShowApplyModal(false);
          if (onApplicationSubmitted) onApplicationSubmitted();
        }, 2200);
      }
    } catch (err) {
      setResultMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to submit application."
      });
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ["All", "Certificates", "Civic Utilities", "Land Records", "Village Services"];

  const filteredServices = services.filter(
    (s) => selectedCategory === "All" || s.category === selectedCategory
  );

  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
      {/* Header Banner */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div style={{ background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", display: "inline-block", marginBottom: "6px" }}>
            SECTION 1.2 — UNIFIED SERVICE CATALOG &amp; ROUTING MAP
          </div>
          <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
            E-Governance Public Services Catalog
          </h2>
          <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
            Select any service. Single-office requests route directly; multi-office services trigger automated sequential verification across Talati, Revenue, Tehsildar, and Municipality.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: "1px solid",
              borderColor: selectedCategory === cat ? "#1b4332" : "#cbd5e1",
              background: selectedCategory === cat ? "#1b4332" : "#ffffff",
              color: selectedCategory === cat ? "#ffffff" : "#334155",
              fontWeight: "700",
              fontSize: "0.85rem",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Services Grid */}
      {loading ? (
        <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>Loading Service Routing Catalog...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
          {filteredServices.map((s) => {
            const isMulti = s.serviceType === "multi-office";
            return (
              <div
                key={s.serviceId}
                style={{
                  background: "#f8fafc",
                  borderRadius: "14px",
                  padding: "20px",
                  border: isMulti ? "1px solid #93c5fd" : "1px solid #e2e8f0",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span
                      style={{
                        background: isMulti ? "#dbeafe" : "#f1f5f9",
                        color: isMulti ? "#1e40af" : "#475569",
                        fontSize: "0.7rem",
                        fontWeight: "800",
                        padding: "3px 10px",
                        borderRadius: "12px"
                      }}
                    >
                      {isMulti ? "MULTI-OFFICE SEQUENTIAL" : `SINGLE OFFICE (${s.primaryOffice.toUpperCase()})`}
                    </span>
                    <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#64748b" }}>
                      ID Prefix: {s.prefix || "APP"}
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 8px 0", fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>
                    {s.title}
                  </h3>

                  <p style={{ margin: "0 0 14px 0", fontSize: "0.85rem", color: "#475569", lineHeight: "1.4" }}>
                    {s.description}
                  </p>

                  <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", marginBottom: "16px" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#1e293b", marginBottom: "4px" }}>
                      <FaNetworkWired /> Verification Routing Chain:
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: "700" }}>
                      {s.officeChain.join(" → ")}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenApply(s)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
                    color: "white",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  Apply Online <FaArrowRight />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Dynamic Form Modal (Section 1.3) */}
      {showApplyModal && selectedService && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div style={{ background: "#ffffff", padding: "32px", borderRadius: "16px", width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#2563eb" }}>
                  DYNAMIC APPLICATION FORM (STEP 1.3)
                </span>
                <h3 style={{ margin: "2px 0 0 0", fontSize: "1.3rem", fontWeight: "800", color: "#0f172a" }}>
                  {selectedService.title}
                </h3>
              </div>
              <button onClick={() => setShowApplyModal(false)} style={{ background: "none", border: "none", fontSize: "1.4rem", cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            {resultMsg ? (
              <div style={{ padding: "20px", borderRadius: "10px", background: resultMsg.type === "success" ? "#f0fdf4" : "#fef2f2", border: `1px solid ${resultMsg.type === "success" ? "#bbf7d0" : "#fecaca"}`, color: resultMsg.type === "success" ? "#166534" : "#991b1b" }}>
                <FaCheckCircle size={28} style={{ marginBottom: "8px", display: "block" }} />
                <strong>{resultMsg.text}</strong>
                {resultMsg.details && <p style={{ margin: "6px 0 0 0", fontSize: "0.85rem" }}>{resultMsg.details}</p>}
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>Full Applicant Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>Aadhaar Number (12-Digit)</label>
                    <input type="text" name="aadhaarId" value={formData.aadhaarId} onChange={handleInputChange} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>Phone Number</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                  </div>
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>Residential Address</label>
                  <input type="text" name="address" value={formData.address} onChange={handleInputChange} required style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
                </div>

                {/* Service Specific Dynamic Fields */}
                <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #e2e8f0", marginBottom: "16px" }}>
                  <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#1e293b", marginBottom: "10px" }}>
                    Service Specific Details:
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    {selectedService.dynamicFields?.map((field) => (
                      <div key={field.name}>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#475569" }}>{field.label}</label>
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleInputChange}
                          required={field.required}
                          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155", marginBottom: "6px" }}><FaFileUpload /> Required Scanned Proofs Upload</label>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>
                    Attached: Aadhaar_Proof.pdf, Address_Record.pdf (Verified via GovConnect Wallet)
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowApplyModal(false)} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ padding: "10px 22px", borderRadius: "8px", border: "none", background: "#1b4332", color: "white", fontWeight: "800", cursor: "pointer" }}>
                    {submitting ? "Submitting..." : "Submit & Run Routing Engine"}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
