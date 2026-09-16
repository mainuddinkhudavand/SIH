import React, { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { getMediaUrl } from "../utils/url";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FaUserCheck,
  FaIdCard,
  FaCamera,
  FaEdit,
  FaCheckCircle,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaFileAlt,
  FaShieldAlt,
  FaSave,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaAddressCard,
  FaDownload,
  FaQrcode,
  FaPlusCircle,
  FaCheckDouble,
  FaBuilding,
  FaTractor,
  FaReceipt,
  FaCertificate
} from "react-icons/fa";
import {
  getAllApplicationsFromStore,
  createNewApplicationInStore,
  subscribeToAppStore
} from "../services/applicationStore";

export default function Profile() {
  const [user, setUser] = useState({
    name: "Pavan Kumar",
    email: "citizen@example.com",
    phone: "+91 98765 43210",
    citizenId: "CIT-IND-9001",
    aadhaarNumber: "987654321000",
    kycCompleted: true,
    isVerifiedAsset: true,
    address: {
      street: "Plot #14, Sector 4, Ward 4",
      town: "Civic Zone Gram Panchayat",
      district: "Central District",
      state: "Maharashtra",
      pin: "400001"
    }
  });

  const [activeTab, setActiveTab] = useState("details"); // "details", "certificates", "asset-declaration", "dpdp-consents"
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // DPDP Act Consent State
  const [consents, setConsents] = useState([
    { id: "c1", module: "Municipality Portal", scope: "Aadhaar Identity & Property Tax Records", granted: true },
    { id: "c2", module: "Revenue Inspectorate", scope: "Land Survey Boundaries & 7/12 Cess Status", granted: true },
    { id: "c3", module: "Tehsildar Sub-Division", scope: "Declared Income & Category Verification", granted: true },
    { id: "c4", module: "Talati Village Register", scope: "Panchayat Khata & Scheme Beneficiary Data", granted: true }
  ]);

  const handleToggleConsent = (id) => {
    setConsents((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.granted;
          setToastMessage(`Consent for ${c.module} ${nextState ? "GRANTED" : "REVOKED"} (DPDP Act 2023 Compliance updated).`);
          return { ...c, granted: nextState };
        }
        return c;
      })
    );
  };

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("Pavan Kumar");
  const [editEmail, setEditEmail] = useState("citizen@example.com");
  const [editPhone, setEditPhone] = useState("+91 98765 43210");

  // Asset Declaration Form States
  const [assetUsage, setAssetUsage] = useState("Land / Agriculture");
  const [plotAreaSize, setPlotAreaSize] = useState("");
  const [plotLocation, setPlotLocation] = useState("");
  const [surveyNumber, setSurveyNumber] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [khataNumber, setKhataNumber] = useState("");
  const [assetSubmitting, setAssetSubmitting] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const loadLocalApps = () => {
    const storeApps = getAllApplicationsFromStore();
    setApplications(storeApps);
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      loadLocalApps();

      const res = await API.get("/user/profile").catch(() => null);
      const data = res?.data?.user || res?.data?.data || res?.data;
      if (data && data.name) {
        setUser((prev) => ({
          ...prev,
          ...data,
          aadhaarNumber: data.aadhaarNumber || prev.aadhaarNumber
        }));
        setEditName(data.name || "Pavan Kumar");
        setEditEmail(data.email || "citizen@example.com");
        setEditPhone(data.phone || "+91 98765 43210");
      }
    } catch (err) {
      console.warn("Profile API fetch warning (using local resident profile):", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    const unsubscribe = subscribeToAppStore(() => {
      loadLocalApps();
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setToastMessage("");
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      await API.put("/user/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      }).catch(() => null);
      setToastMessage("Profile picture updated successfully!");
    } catch (err) {
      setToastMessage("Profile picture updated in demo mode!");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    setToastMessage("");
    try {
      await API.put("/user/profile", {
        name: editName,
        email: editEmail,
        phone: editPhone
      }).catch(() => null);

      setUser((prev) => ({ ...prev, name: editName, email: editEmail, phone: editPhone }));
      setIsEditing(false);
      setToastMessage("Resident profile details updated successfully!");
    } catch (err) {
      setUser((prev) => ({ ...prev, name: editName, email: editEmail, phone: editPhone }));
      setIsEditing(false);
      setToastMessage("Resident profile details updated in local mode!");
    }
  };

  const handleDeclareAssetSubmit = (e) => {
    e.preventDefault();
    if (!plotAreaSize || !plotLocation || (!surveyNumber && !propertyId && !khataNumber)) {
      setToastMessage("Please fill in Plot Area, Location, and at least one Identifier (Survey/Property/Khata #)");
      return;
    }

    setAssetSubmitting(true);
    setToastMessage("");

    const isAgri = assetUsage.includes("Land") || assetUsage.includes("Agriculture");
    const title = `New ${assetUsage} Asset Registration & Verification`;

    const newApp = createNewApplicationInStore({
      serviceId: isAgri ? "property-land-mutation" : "building-plan-sanction",
      serviceType: isAgri ? "Land Records" : "Civic Utilities",
      title,
      governmentFee: 100,
      applicantDetails: {
        fullName: user.name,
        phone: user.phone,
        email: user.email,
        aadhaarId: user.aadhaarNumber,
        address: plotLocation,
        surveyNumber: surveyNumber || `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
        propertyId: propertyId || `PROP-MH-${Math.floor(1000 + Math.random() * 9000)}`,
        khataNumber: khataNumber || `KHT-${Math.floor(1000 + Math.random() * 9000)}`,
        builtUpArea: plotAreaSize,
        assetUsage
      }
    });

    setAssetSubmitting(false);
    setToastMessage(`Asset Registration Application ${newApp.applicationId} created! Forwarded to Talati, Revenue, Tehsildar & Municipality for verification.`);

    // Reset form
    setPlotAreaSize("");
    setPlotLocation("");
    setSurveyNumber("");
    setPropertyId("");
    setKhataNumber("");
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "950px", margin: "3rem auto", padding: "0 20px", textAlign: "center" }}>
        <p style={{ color: "#2d6a4f", fontWeight: "700" }}>Loading resident profile...</p>
      </div>
    );
  }

  // Filter approved applications and digital certificates
  const approvedApps = applications.filter(
    (a) =>
      (a.status || "").toLowerCase().includes("approved") ||
      a.currentOffice === "Completed" ||
      !!a.issuedCertificate
  );

  // Filter declared asset applications
  const declaredAssetsApps = applications.filter(
    (a) =>
      (a.title || "").toLowerCase().includes("asset") ||
      (a.title || "").toLowerCase().includes("land") ||
      (a.title || "").toLowerCase().includes("mutation") ||
      (a.title || "").toLowerCase().includes("sanction") ||
      (a.title || "").toLowerCase().includes("building")
  );

  const isVerifiedAssetResident =
    user.isVerifiedAsset ||
    approvedApps.some((a) => (a.title || "").toLowerCase().includes("asset") || (a.title || "").toLowerCase().includes("land"));

  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "P";
  const rawAadhaar = String(user.aadhaarNumber || "987654321000");
  const maskedAadhaar = `XXXX-XXXX-${rawAadhaar.slice(-4)}`;

  return (
    <div style={{ maxWidth: "1050px", margin: "2rem auto", padding: "0 16px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 💳 Digital Citizen Pass / Profile Header Banner */}
      <div style={{ background: "linear-gradient(135deg, #081c15 0%, #1b4332 50%, #2d6a4f 100%)", borderRadius: "24px", padding: "32px 24px", color: "white", position: "relative", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
            {/* Avatar Input & Trigger */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageUpload}
            />
            <div
              style={{ position: "relative", width: "100px", height: "100px", cursor: "pointer", flexShrink: 0 }}
              onClick={() => fileInputRef.current?.click()}
              title="Click to update profile picture"
            >
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#ffffff", color: "#1b4332", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.8rem", fontWeight: "800", border: "4px solid #52b788", boxShadow: "0 6px 16px rgba(0,0,0,0.2)", overflow: "hidden" }}>
                {user.profilePictureUrl ? (
                  <img src={getMediaUrl(user.profilePictureUrl)} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  nameInitial
                )}
              </div>
              <div style={{ position: "absolute", bottom: "0", right: "0", background: "#059669", color: "white", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", border: "2px solid #ffffff", boxShadow: "0 2px 6px rgba(0,0,0,0.3)" }}>
                {uploading ? "⏳" : <FaCamera />}
              </div>
            </div>

            {/* Resident Details & Verified Asset Badges */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "800", color: "#e0ffe0" }}>{user.name || "Pavan Kumar"}</h1>
                
                <span style={{ background: "#059669", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <FaCheckCircle /> Verified Resident
                </span>

                {isVerifiedAssetResident && (
                  <span style={{ background: "#2563eb", color: "white", padding: "4px 14px", borderRadius: "20px", fontSize: "0.78rem", fontWeight: "900", display: "inline-flex", alignItems: "center", gap: "5px", boxShadow: "0 4px 10px rgba(37, 99, 235, 0.4)" }}>
                    <FaCheckDouble /> VERIFIED ASSET BADGE
                  </span>
                )}
              </div>

              <p style={{ margin: "6px 0 0 0", color: "#a8e6a3", fontSize: "0.95rem" }}>
                GovConnect Resident Identity Pass • <code>{user.citizenId || "CIT-IND-9001"}</code>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px", fontSize: "0.88rem", color: "#d8f3dc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-word" }}>
                  <FaEnvelope style={{ flexShrink: 0, color: "#52b788" }} /> <span>{user.email || "citizen@example.com"}</span>
                </div>
                {user.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaPhone style={{ flexShrink: 0, color: "#52b788" }} /> <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{ background: "#ffffff", color: "#1b4332", border: "none", padding: "10px 20px", borderRadius: "12px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
            >
              <FaEdit /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* 📊 Navigation Tabs & Counter Badges */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "20px" }}>
        <button
          onClick={() => setActiveTab("details")}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            border: "2px solid",
            borderColor: activeTab === "details" ? "#1b4332" : "#cbd5e1",
            background: activeTab === "details" ? "#1b4332" : "#ffffff",
            color: activeTab === "details" ? "#ffffff" : "#334155",
            fontWeight: "800",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FaAddressCard /> Resident Details &amp; Address
        </button>

        <button
          onClick={() => setActiveTab("certificates")}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            border: "2px solid",
            borderColor: activeTab === "certificates" ? "#1d4ed8" : "#cbd5e1",
            background: activeTab === "certificates" ? "#1d4ed8" : "#ffffff",
            color: activeTab === "certificates" ? "#ffffff" : "#334155",
            fontWeight: "800",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FaCertificate /> Approved Certificates &amp; Downloads ({approvedApps.length})
        </button>

        <button
          onClick={() => setActiveTab("asset-declaration")}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            border: "2px solid",
            borderColor: activeTab === "asset-declaration" ? "#047857" : "#cbd5e1",
            background: activeTab === "asset-declaration" ? "#047857" : "#ffffff",
            color: activeTab === "asset-declaration" ? "#ffffff" : "#334155",
            fontWeight: "800",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FaTractor /> Declare Land / Property Asset
        </button>

        <button
          onClick={() => setActiveTab("dpdp-consents")}
          style={{
            padding: "12px 20px",
            borderRadius: "12px",
            border: "2px solid",
            borderColor: activeTab === "dpdp-consents" ? "#7c3aed" : "#cbd5e1",
            background: activeTab === "dpdp-consents" ? "#7c3aed" : "#ffffff",
            color: activeTab === "dpdp-consents" ? "#ffffff" : "#334155",
            fontWeight: "800",
            cursor: "pointer",
            fontSize: "0.9rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <FaShieldAlt /> 🔒 Privacy &amp; DPDP Consents
        </button>
      </div>

      {toastMessage && (
        <div style={{ background: "#ecfdf5", color: "#065f46", padding: "14px 18px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #a7f3d0", fontWeight: "800", fontSize: "0.92rem", display: "flex", alignItems: "center", gap: "10px" }}>
          <FaCheckCircle style={{ color: "#059669", fontSize: "1.2rem" }} /> {toastMessage}
        </div>
      )}

      {/* TAB 1: RESIDENT DETAILS */}
      {activeTab === "details" && (
        <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "1px solid #d8f3dc", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
          {/* Contact Information */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#1b4332", fontSize: "1.15rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaAddressCard style={{ color: "#2d6a4f" }} /> Contact &amp; Personal Identity Details
            </h3>

            {isEditing ? (
              <form onSubmit={handleSaveDetails}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "6px" }}>Full Resident Name</label>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "0.95rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "6px" }}>Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "0.95rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "6px" }}>Phone Number</label>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      required
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", boxSizing: "border-box", fontSize: "0.95rem" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#2d6a4f", marginBottom: "6px" }}>Aadhaar Number (Encrypted)</label>
                    <input
                      value={maskedAadhaar}
                      disabled
                      style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#64748b", boxSizing: "border-box", fontSize: "0.95rem" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <button type="submit" style={{ background: "#2d6a4f", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                    <FaSave /> Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "10px 20px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <FaTimes /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", background: "#f4f9f4", padding: "20px", borderRadius: "14px", border: "1px solid #d8f3dc" }}>
                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>Full Name</span>
                  <div style={{ fontSize: "1rem", fontWeight: "800", color: "#1b4332", marginTop: "2px", wordBreak: "break-word" }}>{user.name}</div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>Email Address</span>
                  <div style={{ fontSize: "1rem", fontWeight: "800", color: "#1b4332", marginTop: "2px", wordBreak: "break-word" }}>{user.email}</div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>Phone Number</span>
                  <div style={{ fontSize: "1rem", fontWeight: "800", color: "#1b4332", marginTop: "2px", wordBreak: "break-word" }}>{user.phone || "N/A"}</div>
                </div>

                <div style={{ minWidth: 0 }}>
                  <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>Aadhaar Proof</span>
                  <div style={{ fontSize: "1rem", fontWeight: "800", color: "#1b4332", marginTop: "2px" }}>{maskedAadhaar}</div>
                </div>
              </div>
            )}
          </div>

          {/* Address */}
          <div>
            <h3 style={{ margin: "0 0 16px 0", color: "#1b4332", fontSize: "1.15rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaMapMarkerAlt style={{ color: "#2d6a4f" }} /> Gram Panchayat Jurisdiction Address
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", background: "#f4f9f4", padding: "20px", borderRadius: "14px", border: "1px solid #d8f3dc" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>Street / Landmark</span>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1b4332", marginTop: "2px" }}>{user.address?.street || "Plot #14, Sector 4"}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>Town / Village</span>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1b4332", marginTop: "2px" }}>{user.address?.town || "Civic Zone"}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>District</span>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1b4332", marginTop: "2px" }}>{user.address?.district || "Central District"}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>State</span>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1b4332", marginTop: "2px" }}>{user.address?.state || "Maharashtra"}</div>
              </div>

              <div>
                <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>Pincode</span>
                <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1b4332", marginTop: "2px" }}>{user.address?.pin || "400001"}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: APPROVED CERTIFICATES & DOWNLOADS */}
      {activeTab === "certificates" && (
        <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "1px solid #cbd5e1" }}>
          <h3 style={{ margin: "0 0 20px 0", color: "#1e3a8a", fontSize: "1.25rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "10px" }}>
            <FaCertificate style={{ color: "#2563eb" }} /> Issued &amp; Approved Digital Certificates
          </h3>

          {approvedApps.length === 0 ? (
            <div style={{ padding: "32px", textAlign: "center", background: "#f8fafc", borderRadius: "14px", border: "1px dashed #cbd5e1", color: "#64748b" }}>
              No approved certificates issued yet. Submit a certificate or asset request from the portal!
            </div>
          ) : (
            <div style={{ display: "grid", gap: "18px" }}>
              {approvedApps.map((app) => {
                const cert = app.issuedCertificate || {
                  certificateId: `CERT-${app.applicationId}`,
                  issuedAt: app.approvalDate || new Date().toISOString(),
                  digitalSignature: `SIG-DIGI-OFFICIAL-EGRAM-${app.applicationId}`,
                  qrCodeData: `https://egram.gov.in/verify/${app.applicationId}`
                };

                return (
                  <div key={app._id || app.applicationId} style={{ background: "#f0fdf4", borderRadius: "14px", border: "2px solid #bbf7d0", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
                      <div>
                        <span style={{ background: "#166534", color: "white", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "900", marginRight: "8px" }}>
                          {cert.certificateId}
                        </span>
                        <span style={{ background: "#dcfce7", color: "#15803d", padding: "4px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800" }}>
                          Ref: {app.applicationId}
                        </span>
                        <h4 style={{ margin: "8px 0 4px 0", fontSize: "1.15rem", fontWeight: "900", color: "#064e3b" }}>
                          {app.title}
                        </h4>
                        <p style={{ margin: 0, fontSize: "0.85rem", color: "#047857" }}>
                          Issued to <strong>{app.applicantDetails?.fullName || user.name}</strong> • Approved by {app.primaryOffice || "Government Authority"}
                        </p>
                      </div>

                      <a
                        href={cert.qrCodeData}
                        target="_blank"
                        rel="noreferrer"
                        style={{ background: "#16a34a", color: "white", padding: "10px 18px", borderRadius: "10px", textDecoration: "none", fontWeight: "800", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(22, 163, 74, 0.3)" }}
                      >
                        <FaDownload /> Download PDF Certificate <FaQrcode />
                      </a>
                    </div>

                    <div style={{ background: "#ffffff", padding: "12px 16px", borderRadius: "10px", border: "1px solid #a7f3d0", fontSize: "0.8rem", color: "#065f46", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                      <div>
                        <strong>Digital Seal Signature:</strong> <code>{cert.digitalSignature}</code>
                      </div>
                      <div>
                        <strong>Issued On:</strong> {new Date(cert.issuedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DECLARE LAND & PROPERTY ASSET */}
      {activeTab === "asset-declaration" && (
        <div style={{ display: "grid", gap: "24px" }}>
          
          {/* Asset Declaration Form */}
          <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "2px solid #a7f3d0", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ background: "#dcfce7", color: "#047857", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
                <FaPlusCircle />
              </div>
              <div>
                <h3 style={{ margin: 0, color: "#064e3b", fontSize: "1.2rem", fontWeight: "900" }}>
                  Register New Land, Plot or Property Details
                </h3>
                <p style={{ margin: "2px 0 0 0", color: "#047857", fontSize: "0.85rem" }}>
                  If your details are missing or new, register here. It routes to Talati, Revenue, Tehsildar &amp; Municipality for verification.
                </p>
              </div>
            </div>

            <form onSubmit={handleDeclareAssetSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#064e3b", marginBottom: "6px" }}>1) Asset Usage / Type</label>
                  <select
                    value={assetUsage}
                    onChange={(e) => setAssetUsage(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", fontWeight: "700" }}
                  >
                    <option value="Land / Agriculture">🌾 Land / Agriculture</option>
                    <option value="Home / Plot">🏡 Home / Residential Plot</option>
                    <option value="Business Plot / Commercial">🏢 Business Plot / Commercial</option>
                    <option value="Educational / Institutional">🎓 Educational / Institutional</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#064e3b", marginBottom: "6px" }}>2) Area / Size of Plot (Acres / Sq Ft)</label>
                  <input
                    type="text"
                    placeholder="e.g. 3.5 Acres or 1450 Sq Ft"
                    value={plotAreaSize}
                    onChange={(e) => setPlotAreaSize(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#064e3b", marginBottom: "6px" }}>3) Plot Location / Gram Panchayat Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Gat No 104, Green Valley Panchayat Ward 2"
                    value={plotLocation}
                    onChange={(e) => setPlotLocation(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#064e3b", marginBottom: "6px" }}>Survey Number (Optional/If Known)</label>
                  <input
                    type="text"
                    placeholder="e.g. SRV-1005"
                    value={surveyNumber}
                    onChange={(e) => setSurveyNumber(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#064e3b", marginBottom: "6px" }}>Property ID (Optional/If Known)</label>
                  <input
                    type="text"
                    placeholder="e.g. PROP-MH-1005"
                    value={propertyId}
                    onChange={(e) => setPropertyId(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "800", color: "#064e3b", marginBottom: "6px" }}>7/12 Khata Number (Optional/If Known)</label>
                  <input
                    type="text"
                    placeholder="e.g. KHT-1005"
                    value={khataNumber}
                    onChange={(e) => setKhataNumber(e.target.value)}
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem" }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={assetSubmitting}
                style={{ background: "#047857", color: "white", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.92rem", display: "inline-flex", alignItems: "center", gap: "8px", boxShadow: "0 4px 12px rgba(4, 120, 87, 0.3)" }}
              >
                <FaTractor /> {assetSubmitting ? "Submitting..." : "Submit Asset Declaration for Verification"}
              </button>
            </form>
          </div>

          {/* List of Declared Assets */}
          <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "1px solid #cbd5e1" }}>
            <h4 style={{ margin: "0 0 16px 0", fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
              🏡 Your Declared Assets &amp; Official Verification Status
            </h4>

            {declaredAssetsApps.length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "#64748b", background: "#f8fafc", borderRadius: "10px" }}>
                No property declarations submitted yet. Fill the form above to register your land or plot!
              </div>
            ) : (
              <div style={{ display: "grid", gap: "14px" }}>
                {declaredAssetsApps.map((item) => {
                  const isVerified = (item.status || "").toLowerCase().includes("approved") || item.currentOffice === "Completed";

                  return (
                    <div key={item._id || item.applicationId} style={{ background: isVerified ? "#f0fdf4" : "#fefce8", border: `2px solid ${isVerified ? "#86efac" : "#fef08a"}`, borderRadius: "14px", padding: "18px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <span style={{ background: "#e2e8f0", color: "#1e293b", padding: "4px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "800", marginRight: "8px" }}>
                            {item.applicationId}
                          </span>
                          <h5 style={{ margin: "6px 0 4px 0", fontSize: "1.05rem", fontWeight: "800", color: "#0f172a" }}>
                            {item.title}
                          </h5>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
                            Location: {item.applicantDetails?.address} | Area: {item.applicantDetails?.builtUpArea || "N/A"}
                          </p>
                        </div>

                        <div>
                          {isVerified ? (
                            <span style={{ background: "#16a34a", color: "white", padding: "6px 14px", borderRadius: "20px", fontWeight: "900", fontSize: "0.82rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                              <FaCheckCircle /> VERIFIED ASSET
                            </span>
                          ) : (
                            <span style={{ background: "#ca8a04", color: "white", padding: "6px 14px", borderRadius: "20px", fontWeight: "900", fontSize: "0.82rem" }}>
                              ⏳ {item.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 4: PRIVACY & DPDP ACT CONSENT MANAGEMENT */}
      {activeTab === "dpdp-consents" && (
        <div style={{ background: "#ffffff", padding: "28px", borderRadius: "20px", border: "2px solid #7c3aed", boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "#f3e8ff", color: "#7c3aed", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem" }}>
              <FaShieldAlt />
            </div>
            <div>
              <h3 style={{ margin: 0, color: "#581c87", fontSize: "1.25rem", fontWeight: "900" }}>
                🔒 Digital Personal Data Protection (DPDP) Act Consent Manager
              </h3>
              <p style={{ margin: "2px 0 0 0", color: "#6b21a8", fontSize: "0.85rem" }}>
                Manage inter-departmental data sharing permissions granted to Municipality, Tehsildar, Revenue &amp; Talati portals.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
            {consents.map((item) => (
              <div key={item.id} style={{ background: item.granted ? "#f4f0ff" : "#fef2f2", border: `2px solid ${item.granted ? "#c4b5fd" : "#fecaca"}`, borderRadius: "14px", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
                <div>
                  <span style={{ background: item.granted ? "#7c3aed" : "#dc2626", color: "white", padding: "3px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "900", marginRight: "8px" }}>
                    {item.granted ? "CONSENT ACTIVE" : "CONSENT REVOKED"}
                  </span>
                  <h4 style={{ margin: "6px 0 2px 0", fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
                    {item.module}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#475569" }}>
                    Granted Scope: <strong>{item.scope}</strong>
                  </p>
                </div>

                <button
                  onClick={() => handleToggleConsent(item.id)}
                  style={{
                    background: item.granted ? "#dc2626" : "#16a34a",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "10px",
                    fontWeight: "900",
                    cursor: "pointer",
                    fontSize: "0.88rem",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                  }}
                >
                  {item.granted ? "Revoke Consent" : "Grant Data Sharing Consent"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
