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
import { createNewApplicationInStore } from "../../services/applicationStore";

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

  // Document Upload State
  const [aadhaarFileName, setAadhaarFileName] = useState("Aadhaar_Identity_Verification_Slip.pdf");
  const [addressFileName, setAddressFileName] = useState("Residence_Electricity_Bill_Proof.pdf");
  const [specificFileName, setSpecificFileName] = useState("Hospital_Death_Birth_Affidavit.pdf");

  // Mandatory Upfront Payment State with Detailed Options
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [upiSubProvider, setUpiSubProvider] = useState("PhonePe");
  const [paymentDetails, setPaymentDetails] = useState({
    phonepeId: "9876543210@ybl",
    gpayId: "pavan.citizen@okaxis",
    paytmId: "9876543210@paytm",
    bhimVpa: "pavan.citizen@upi",
    bankName: "State Bank of India",
    netbankingUser: "SBI-1092837412",
    ifscCode: "SBIN0001234",
    cardType: "RuPay",
    cardNumber: "4532-8921-1029-4411",
    cardHolder: "PAVAN KUMAR",
    cardExpiry: "12/28",
    cardCvv: "892"
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

  const getDetailedPaymentSummary = () => {
    if (paymentMethod === "UPI") {
      const upiId = upiSubProvider === "PhonePe" ? paymentDetails.phonepeId : upiSubProvider === "Google Pay" ? paymentDetails.gpayId : upiSubProvider === "Paytm" ? paymentDetails.paytmId : paymentDetails.bhimVpa;
      return `UPI (${upiSubProvider}: ${upiId})`;
    } else if (paymentMethod === "NetBanking") {
      return `NetBanking (${paymentDetails.bankName} - User: ${paymentDetails.netbankingUser}, IFSC: ${paymentDetails.ifscCode})`;
    } else {
      return `Card (${paymentDetails.cardType}: ${paymentDetails.cardNumber.slice(0, 4)}-XXXX-XXXX-${paymentDetails.cardNumber.slice(-4)}, Name: ${paymentDetails.cardHolder})`;
    }
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResultMsg(null);

    const feeAmount = selectedService.governmentFee || 50;
    const txnId = "TXN-" + Math.floor(10000000 + Math.random() * 90000000);
    const paymentSummary = getDetailedPaymentSummary();

    try {
      const payload = {
        serviceId: selectedService.serviceId,
        serviceTitle: selectedService.title,
        serviceType: selectedService.category,
        governmentFee: {
          amount: feeAmount,
          isPaid: true,
          paymentMethod: paymentMethod,
          paymentDetail: paymentSummary,
          transactionRef: txnId,
          paidAt: new Date().toLocaleString()
        },
        applicantDetails: formData,
        documents: [
          { docType: "Aadhaar Identity Proof", fileName: aadhaarFileName, fileUrl: `/uploads/${aadhaarFileName}` },
          { docType: "Address / Land Record Proof", fileName: addressFileName, fileUrl: `/uploads/${addressFileName}` },
          { docType: `${selectedService.title} Supporting Affidavit`, fileName: specificFileName, fileUrl: `/uploads/${specificFileName}` }
        ]
      };

      // Create in central persistent applicationStore (works 100% online/offline across all 4 offices)
      const newApp = createNewApplicationInStore(payload);

      setResultMsg({
        type: "success",
        text: `Payment of ₹${feeAmount} Verified & Application Submitted!`,
        details: `Tracking ID: ${newApp.applicationId}. Txn Ref: ${txnId}. Mode: ${paymentSummary}. Routed to ${newApp.currentOffice}.`
      });

      setTimeout(() => {
        setShowApplyModal(false);
        if (onApplicationSubmitted) onApplicationSubmitted();
      }, 2400);
    } catch (err) {
      setResultMsg({
        type: "error",
        text: "Error submitting application. Please try again."
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

                {/* Upload Verification Documents Section */}
                <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1", marginBottom: "16px" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: "800", color: "#0f172a", marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaFileUpload color="#2563eb" /> Step 2: Upload Required Verification Documents
                  </div>

                  <div style={{ display: "grid", gap: "10px" }}>
                    <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#334155" }}>1. Aadhaar / Photo Identity Proof *</div>
                        <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "700" }}>
                          <FaCheckCircle /> {aadhaarFileName}
                        </div>
                      </div>
                      <label style={{ background: "#eff6ff", color: "#2563eb", padding: "5px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", border: "1px solid #bfdbfe" }}>
                        Attach File
                        <input type="file" onChange={(e) => e.target.files[0] && setAadhaarFileName(e.target.files[0].name)} style={{ display: "none" }} />
                      </label>
                    </div>

                    <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#334155" }}>2. Residence / Electricity / 7-12 Land Proof *</div>
                        <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "700" }}>
                          <FaCheckCircle /> {addressFileName}
                        </div>
                      </div>
                      <label style={{ background: "#eff6ff", color: "#2563eb", padding: "5px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", border: "1px solid #bfdbfe" }}>
                        Attach File
                        <input type="file" onChange={(e) => e.target.files[0] && setAddressFileName(e.target.files[0].name)} style={{ display: "none" }} />
                      </label>
                    </div>

                    <div style={{ background: "#ffffff", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#334155" }}>3. Hospital Record / Service Specific Proof</div>
                        <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "700" }}>
                          <FaCheckCircle /> {specificFileName}
                        </div>
                      </div>
                      <label style={{ background: "#eff6ff", color: "#2563eb", padding: "5px 12px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", cursor: "pointer", border: "1px solid #bfdbfe" }}>
                        Attach File
                        <input type="file" onChange={(e) => e.target.files[0] && setSpecificFileName(e.target.files[0].name)} style={{ display: "none" }} />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Mandatory Upfront Fee Payment Section */}
                <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", padding: "16px", borderRadius: "12px", border: "1.5px solid #86efac", marginBottom: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <span style={{ fontSize: "0.7rem", fontWeight: "900", background: "#166534", color: "white", padding: "2px 8px", borderRadius: "4px" }}>STEP 3 — UPFRONT APPLICATION FEE</span>
                      <div style={{ fontSize: "1.05rem", fontWeight: "900", color: "#14532d", marginTop: "2px" }}>
                        Official Fee: ₹{selectedService.governmentFee || 50} (Non-Refundable)
                      </div>
                    </div>
                    <span style={{ background: "#ffffff", color: "#166534", padding: "4px 10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.78rem", border: "1px solid #bbf7d0" }}>
                      Pay During Applying Only
                    </span>
                  </div>

                  {/* Payment Method Selector */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "14px" }}>
                    {[
                      { id: "UPI", label: "📱 UPI Apps / VPA" },
                      { id: "NetBanking", label: "🏛️ NetBanking" },
                      { id: "Card", label: "💳 Credit / Debit Card" }
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id)}
                        style={{
                          padding: "10px",
                          borderRadius: "8px",
                          border: paymentMethod === m.id ? "2px solid #166534" : "1px solid #cbd5e1",
                          background: paymentMethod === m.id ? "#ffffff" : "#f8fafc",
                          color: paymentMethod === m.id ? "#166534" : "#475569",
                          fontWeight: "900",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          boxShadow: paymentMethod === m.id ? "0 2px 6px rgba(22, 101, 52, 0.15)" : "none"
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* 1. Detailed UPI Payment Controls */}
                  {paymentMethod === "UPI" && (
                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#166534", marginBottom: "8px" }}>
                        Select UPI Provider App:
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "6px", marginBottom: "12px" }}>
                        {["PhonePe", "Google Pay", "Paytm", "BHIM UPI"].map((app) => (
                          <button
                            key={app}
                            type="button"
                            onClick={() => setUpiSubProvider(app)}
                            style={{
                              padding: "6px 4px",
                              borderRadius: "6px",
                              border: upiSubProvider === app ? "2px solid #059669" : "1px solid #e2e8f0",
                              background: upiSubProvider === app ? "#ecfdf5" : "#ffffff",
                              color: upiSubProvider === app ? "#065f46" : "#475569",
                              fontSize: "0.75rem",
                              fontWeight: "800",
                              cursor: "pointer"
                            }}
                          >
                            {app}
                          </button>
                        ))}
                      </div>

                      {upiSubProvider === "PhonePe" && (
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>PhonePe VPA / Mobile Number</label>
                          <input
                            type="text"
                            placeholder="e.g. 9876543210@ybl"
                            value={paymentDetails.phonepeId}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, phonepeId: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      )}
                      {upiSubProvider === "Google Pay" && (
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Google Pay UPI VPA ID</label>
                          <input
                            type="text"
                            placeholder="e.g. pavan.citizen@okaxis"
                            value={paymentDetails.gpayId}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, gpayId: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      )}
                      {upiSubProvider === "Paytm" && (
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Paytm UPI / Mobile VPA</label>
                          <input
                            type="text"
                            placeholder="e.g. 9876543210@paytm"
                            value={paymentDetails.paytmId}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, paytmId: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      )}
                      {upiSubProvider === "BHIM UPI" && (
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Virtual Payment Address (VPA)</label>
                          <input
                            type="text"
                            placeholder="e.g. pavan.citizen@upi"
                            value={paymentDetails.bhimVpa}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, bhimVpa: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      )}

                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "0.72rem", color: "#166534", fontWeight: "700" }}>
                        <span>🟢 Verified Instant UPI Gateway</span> | <span>Auto-Approved NPCI Clearing</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Detailed NetBanking Controls */}
                  {paymentMethod === "NetBanking" && (
                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Select Bank</label>
                          <select
                            value={paymentDetails.bankName}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, bankName: e.target.value })}
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          >
                            <option value="State Bank of India">State Bank of India (SBI)</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="Punjab National Bank">Punjab National Bank (PNB)</option>
                            <option value="Bank of Baroda">Bank of Baroda (BOB)</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Internet Banking ID / Account No.</label>
                          <input
                            type="text"
                            value={paymentDetails.netbankingUser}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, netbankingUser: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Branch IFSC Code</label>
                        <input
                          type="text"
                          value={paymentDetails.ifscCode}
                          onChange={(e) => setPaymentDetails({ ...paymentDetails, ifscCode: e.target.value })}
                          required
                          style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. Detailed Credit/Debit Card Controls */}
                  {paymentMethod === "Card" && (
                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "10px", marginBottom: "10px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Card Network</label>
                          <select
                            value={paymentDetails.cardType}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardType: e.target.value })}
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          >
                            <option value="RuPay">RuPay (Govt Preferred)</option>
                            <option value="Visa">Visa</option>
                            <option value="MasterCard">MasterCard</option>
                            <option value="Maestro">Maestro</option>
                          </select>
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>16-Digit Card Number</label>
                          <input
                            type="text"
                            value={paymentDetails.cardNumber}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardNumber: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "10px" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Cardholder Name</label>
                          <input
                            type="text"
                            value={paymentDetails.cardHolder}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardHolder: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Expiry (MM/YY)</label>
                          <input
                            type="text"
                            value={paymentDetails.cardExpiry}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardExpiry: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>CVV Code</label>
                          <input
                            type="password"
                            maxLength="4"
                            value={paymentDetails.cardCvv}
                            onChange={(e) => setPaymentDetails({ ...paymentDetails, cardCvv: e.target.value })}
                            required
                            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "0.85rem" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowApplyModal(false)} style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ padding: "12px 24px", borderRadius: "8px", border: "none", background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)", color: "white", fontWeight: "900", cursor: "pointer", fontSize: "0.95rem" }}>
                    {submitting ? "Processing Payment..." : `💳 Pay ₹${selectedService.governmentFee || 50} & Submit Application`}
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
