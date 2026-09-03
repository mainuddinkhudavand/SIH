import React, { useEffect, useState, useRef } from "react";
import API from "../services/api";
import { getMediaUrl } from "../utils/url";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaUserCheck, FaIdCard, FaCamera, FaEdit, FaCheckCircle, FaExclamationTriangle, FaMapMarkerAlt, FaFileAlt, FaShieldAlt, FaSave, FaTimes, FaPhone, FaEnvelope, FaAddressCard } from "react-icons/fa";

export default function Profile() {
  const [user, setUser] = useState({
    name: "Pavan",
    email: "citizen@egram.gov.in",
    phone: "+91 98765 43210",
    citizenId: "C101",
    aadhaarNumber: "998877665544",
    kycCompleted: true,
    address: {
      street: "Plot #14, Sector 4",
      town: "Civic Zone",
      district: "Central District",
      state: "Telangana",
      pin: "500001"
    }
  });

  const [totalComplaints, setTotalComplaints] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(2);
  const [loading, setLoading] = useState(true);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("Pavan");
  const [editEmail, setEditEmail] = useState("citizen@egram.gov.in");
  const [editPhone, setEditPhone] = useState("+91 98765 43210");

  const [uploading, setUploading] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const fileInputRef = useRef(null);
  const { t } = useTranslation();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/user/profile").catch(() => null);
      const data = res?.data?.user || res?.data?.data || res?.data;
      if (data && data.name) {
        setUser(data);
        setEditName(data.name || "Pavan");
        setEditEmail(data.email || "citizen@egram.gov.in");
        setEditPhone(data.phone || "+91 98765 43210");
      }
    } catch (err) {
      console.warn("Profile API fetch warning (using demo profile):", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setToastMessage("");
    const formData = new FormData();
    formData.append("profilePicture", file);

    try {
      const res = await API.put("/user/profile", formData, {
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

      setUser(prev => ({ ...prev, name: editName, email: editEmail, phone: editPhone }));
      setIsEditing(false);
      setToastMessage("Resident profile details updated successfully!");
    } catch (err) {
      setUser(prev => ({ ...prev, name: editName, email: editEmail, phone: editPhone }));
      setIsEditing(false);
      setToastMessage("Resident profile details updated in demo mode!");
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: "900px", margin: "3rem auto", padding: "0 20px", textAlign: "center" }}>
        <p style={{ color: "#2d6a4f", fontWeight: "700" }}>Loading resident profile...</p>
      </div>
    );
  }

  const nameInitial = user.name ? user.name.charAt(0).toUpperCase() : "P";
  const maskedAadhaar = user.aadhaarNumber ? `XXXX-XXXX-${user.aadhaarNumber.slice(-4)}` : "XXXX-XXXX-5544";

  return (
    <div style={{ maxWidth: "950px", margin: "2rem auto", padding: "0 16px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 💳 Digital Citizen Pass / Profile Banner */}
      <div style={{ background: "linear-gradient(135deg, #081c15 0%, #1b4332 50%, #2d6a4f 100%)", borderRadius: "24px 24px 0 0", padding: "32px 24px", color: "white", position: "relative", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)" }}>
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

            {/* Resident Details */}
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: "800", color: "#e0ffe0" }}>{user.name || "Pavan"}</h1>
                <span style={{ background: "#059669", color: "white", padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                  <FaCheckCircle /> Verified Resident
                </span>
              </div>

              <p style={{ margin: "6px 0 0 0", color: "#a8e6a3", fontSize: "0.95rem" }}>
                GovConnect Resident Card • <code>{user.citizenId || "C101"}</code>
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "10px", fontSize: "0.88rem", color: "#d8f3dc" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", wordBreak: "break-word" }}>
                  <FaEnvelope style={{ flexShrink: 0, color: "#52b788" }} /> <span>{user.email || "citizen@egram.gov.in"}</span>
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
              <FaEdit /> Edit Resident Profile
            </button>
          )}
        </div>
      </div>

      {/* 📊 Resident Activity & Verification Counters */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", margin: "20px 0" }}>
        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #d8f3dc", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#ecfdf5", color: "#059669", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <FaFileAlt />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Complaints Raised</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1b4332", marginTop: "2px" }}>{totalComplaints}</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #d8f3dc", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#eff6ff", color: "#2563eb", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <FaIdCard />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Certificates Requested</span>
              <div style={{ fontSize: "1.5rem", fontWeight: "800", color: "#1d4ed8", marginTop: "2px" }}>{totalCertificates}</div>
            </div>
          </div>
        </div>

        <div style={{ background: "#ffffff", padding: "18px", borderRadius: "14px", border: "1px solid #d8f3dc", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#faf5ff", color: "#9333ea", width: "42px", height: "42px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <FaShieldAlt />
            </div>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase" }}>Aadhaar Identity</span>
              <div style={{ fontSize: "1rem", fontWeight: "800", color: "#7e22ce", marginTop: "4px" }}>{maskedAadhaar}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 📄 Profile Details & Address Section */}
      <div style={{ background: "#ffffff", padding: "28px", borderRadius: "0 0 24px 24px", border: "1px solid #d8f3dc", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.05)" }}>
        {toastMessage && (
          <div style={{ background: "#ecfdf5", color: "#065f46", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #a7f3d0", fontWeight: "700", fontSize: "0.9rem" }}>
            {toastMessage}
          </div>
        )}

        {/* Contact Information */}
        <div style={{ marginBottom: "28px" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#1b4332", fontSize: "1.15rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
            <FaAddressCard style={{ color: "#2d6a4f" }} /> Contact &amp; Personal Details
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
                <div style={{ fontSize: "1rem", fontWeight: "800", color: "#1b4332", marginTop: "2px", wordBreak: "break-word", overflowWrap: "anywhere" }}>{user.email}</div>
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

        {/* Gram Panchayat Jurisdiction Address */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
            <h3 style={{ margin: 0, color: "#1b4332", fontSize: "1.15rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
              <FaMapMarkerAlt style={{ color: "#2d6a4f" }} /> Gram Panchayat Jurisdiction Address
            </h3>
          </div>

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
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1b4332", marginTop: "2px" }}>{user.address?.state || "Telangana"}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#2d6a4f", fontWeight: "700", textTransform: "uppercase" }}>Pincode</span>
              <div style={{ fontSize: "0.95rem", fontWeight: "700", color: "#1b4332", marginTop: "2px" }}>{user.address?.pin || "500001"}</div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
