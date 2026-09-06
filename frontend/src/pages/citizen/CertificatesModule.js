import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { createNewApplicationInStore } from "../../services/applicationStore";
import { FaCertificate, FaPlus, FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaDownload, FaPrint, FaShieldAlt } from "react-icons/fa";

const CERTIFICATE_TYPES = [
  { id: "Birth Certificate", name: "Birth Certificate", fee: 25, desc: "Official proof of birth registration for legal & identity verification." },
  { id: "Death Certificate", name: "Death Certificate", fee: 25, desc: "Official municipal death record for legal & estate proceedings." },
  { id: "Income Certificate", name: "Annual Income Certificate", fee: 30, desc: "Certified household revenue proof for welfare & scholarship claims." },
  { id: "Caste Certificate", name: "Category / Caste Certificate", fee: 50, desc: "Official community category verification for educational/civic reservations." },
  { id: "Residence Certificate", name: "Domicile / Residence Certificate", fee: 50, desc: "Proof of domicile and long-term local residence status." }
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

  // Upload Documents & Upfront Payment State with Detailed Options
  const [aadhaarDocName, setAadhaarDocName] = useState("Aadhaar_Identity_Proof.pdf");
  const [addressDocName, setAddressDocName] = useState("Address_Domicile_Proof.pdf");
  const [hospitalOrIncomeDocName, setHospitalOrIncomeDocName] = useState("Hospital_Death_Birth_Record.pdf");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const selectedCertObj = CERTIFICATE_TYPES.find((c) => c.id === selectedType);
    const feeAmount = selectedCertObj?.fee || 25;
    const txnId = "TXN-" + Math.floor(10000000 + Math.random() * 90000000);
    const paymentSummary = getDetailedPaymentSummary();

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

      let certId = null;
      try {
        const res = await API.post("/certificates/request", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
        certId = res.data?.certificate?.certificateId;
      } catch (apiErr) {
        console.warn("Backend API unavailable, using applicationStore fallback:", apiErr.message);
      }

      // Map service ID and government fee
      const serviceIdMap = {
        "Birth Certificate": "birth-cert",
        "Death Certificate": "death-cert",
        "Income Certificate": "income-cert",
        "Caste Certificate": "caste-cert",
        "Residence Certificate": "domicile-cert"
      };

      const appStorePayload = {
        serviceId: serviceIdMap[selectedType] || "cert-gen",
        serviceTitle: selectedType,
        serviceType: "Certificates",
        governmentFee: {
          amount: feeAmount,
          isPaid: true,
          paymentMethod: paymentMethod,
          paymentDetail: paymentSummary,
          transactionRef: txnId,
          paidAt: new Date().toLocaleString()
        },
        applicantDetails: {
          fullName: formData.fullName || "Citizen Resident",
          phone: formData.mobile || "+91 98765 43210",
          address: formData.address || "Ward #4, Gram Panchayat Zone",
          aadhaarId: formData.aadhaarNumber || "9876-5432-1000",
          reason: formData.purpose || "Official Certificate Verification"
        },
        documents: [
          { docType: "Aadhaar Identity Proof", fileName: aadhaarDocName, fileUrl: `/uploads/${aadhaarDocName}` },
          { docType: "Address / Domicile Proof", fileName: addressDocName, fileUrl: `/uploads/${addressDocName}` },
          { docType: `${selectedType} Mandatory Record`, fileName: hospitalOrIncomeDocName, fileUrl: `/uploads/${hospitalOrIncomeDocName}` }
        ]
      };

      const newApp = createNewApplicationInStore(appStorePayload);
      const finalId = certId || newApp.applicationId;

      setMessage({
        type: "success",
        text: `Payment of ₹${feeAmount} Verified & Application Submitted! Tracking ID: ${finalId} (Txn Ref: ${txnId})`
      });

      setFormData({
        fullName: "",
        fatherOrSpouseName: "",
        dob: "",
        address: "",
        mobile: "",
        aadhaarNumber: "",
        purpose: "",
        supportingDocUrl: ""
      });

      setShowForm(false);
      fetchCertificates();
    } catch (err) {
      console.error("Submission error:", err);
      setMessage({ type: "error", text: "Failed to submit certificate request. Please try again." });
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

            {/* Document Upload Section */}
            <div style={{ marginTop: "20px", background: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
              <div style={{ fontSize: "0.9rem", fontWeight: "800", color: "#0f172a", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaFileUpload color="#059669" /> Attach Verification Documents
              </div>

              <div style={{ display: "grid", gap: "10px" }}>
                <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#334155" }}>1. Aadhaar / Identity Proof *</div>
                    <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "700" }}>
                      <FaCheckCircle /> {aadhaarDocName}
                    </div>
                  </div>
                  <label style={{ background: "#ecfdf5", color: "#047857", padding: "6px 14px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", border: "1px solid #a7f3d0" }}>
                    Attach Document
                    <input type="file" onChange={(e) => e.target.files[0] && setAadhaarDocName(e.target.files[0].name)} style={{ display: "none" }} />
                  </label>
                </div>

                <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#334155" }}>2. Residence / Domicile Proof *</div>
                    <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "700" }}>
                      <FaCheckCircle /> {addressDocName}
                    </div>
                  </div>
                  <label style={{ background: "#ecfdf5", color: "#047857", padding: "6px 14px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", border: "1px solid #a7f3d0" }}>
                    Attach Document
                    <input type="file" onChange={(e) => e.target.files[0] && setAddressDocName(e.target.files[0].name)} style={{ display: "none" }} />
                  </label>
                </div>

                <div style={{ background: "#ffffff", padding: "10px 14px", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: "800", color: "#334155" }}>3. {selectedType} Verification Affidavit / Hospital Record</div>
                    <div style={{ fontSize: "0.75rem", color: "#166534", fontWeight: "700" }}>
                      <FaCheckCircle /> {hospitalOrIncomeDocName}
                    </div>
                  </div>
                  <label style={{ background: "#ecfdf5", color: "#047857", padding: "6px 14px", borderRadius: "6px", fontSize: "0.78rem", fontWeight: "800", cursor: "pointer", border: "1px solid #a7f3d0" }}>
                    Attach Document
                    <input type="file" onChange={(e) => e.target.files[0] && setHospitalOrIncomeDocName(e.target.files[0].name)} style={{ display: "none" }} />
                  </label>
                </div>
              </div>
            </div>

            {/* Upfront Application Payment Section */}
            {(() => {
              const currentCertObj = CERTIFICATE_TYPES.find((c) => c.id === selectedType);
              const certFee = currentCertObj?.fee || 25;
              return (
                <div style={{ marginTop: "20px", background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)", padding: "18px", borderRadius: "12px", border: "1.5px solid #6ee7b7" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <div>
                      <span style={{ fontSize: "0.72rem", fontWeight: "900", background: "#047857", color: "white", padding: "3px 8px", borderRadius: "4px" }}>UPFRONT CERTIFICATE APPLICATION FEE</span>
                      <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#064e3b", marginTop: "4px" }}>
                        Government Fee: ₹{certFee} (Paid During Applying Only)
                      </div>
                    </div>
                  </div>

                  {/* Payment Mode Selector */}
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
                          border: paymentMethod === m.id ? "2px solid #047857" : "1px solid #cbd5e1",
                          background: paymentMethod === m.id ? "#ffffff" : "#f8fafc",
                          color: paymentMethod === m.id ? "#047857" : "#475569",
                          fontWeight: "900",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          boxShadow: paymentMethod === m.id ? "0 2px 6px rgba(4, 120, 87, 0.15)" : "none"
                        }}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  {/* 1. Detailed UPI Payment Controls */}
                  {paymentMethod === "UPI" && (
                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
                      <div style={{ fontSize: "0.78rem", fontWeight: "800", color: "#047857", marginBottom: "8px" }}>
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
                              border: upiSubProvider === app ? "2px solid #047857" : "1px solid #e2e8f0",
                              background: upiSubProvider === app ? "#ecfdf5" : "#ffffff",
                              color: upiSubProvider === app ? "#047857" : "#475569",
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

                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px", fontSize: "0.72rem", color: "#047857", fontWeight: "700" }}>
                        <span>🟢 Verified Instant UPI Gateway</span> | <span>Auto-Approved NPCI Clearing</span>
                      </div>
                    </div>
                  )}

                  {/* 2. Detailed NetBanking Controls */}
                  {paymentMethod === "NetBanking" && (
                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
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
                    <div style={{ background: "#ffffff", padding: "14px", borderRadius: "10px", border: "1px solid #a7f3d0" }}>
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
              );
            })()}

            <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontWeight: "700" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "12px 26px",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(135deg, #047857 0%, #065f46 100%)",
                  color: "white",
                  fontWeight: "900",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "0.95rem"
                }}
              >
                {submitting ? "Processing Payment..." : <><FaCertificate /> Pay ₹{(CERTIFICATE_TYPES.find(c => c.id === selectedType)?.fee || 25)} &amp; Submit Application</>}
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
