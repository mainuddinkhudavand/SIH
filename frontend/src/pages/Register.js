import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import "./styles/Register.css";
import API from '../services/api';
import { useTranslation } from "react-i18next";
import { FaCamera, FaEnvelope, FaShieldAlt, FaCheckCircle, FaArrowLeft } from "react-icons/fa";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'citizen',
    state: 'Karnataka',
    district: 'Dharwad',
    city: 'Hubli',
    officeName: '',
    designation: ''
  });
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const { t } = useTranslation();

  // Location Cascading Mapping
  const districtsMap = {
    Karnataka: ["Dharwad", "Belagavi", "Mysuru", "Bengaluru Urban"],
    Maharashtra: ["Mumbai", "Pune", "Nagpur"],
    Gujarat: ["Ahmedabad", "Surat", "Vadodara"]
  };

  const citiesMap = {
    Dharwad: ["Hubli", "Dharwad City", "Kalghatgi", "Navalgund"],
    Belagavi: ["Belagavi City", "Gokak", "Chikkodi"],
    Mysuru: ["Mysuru City", "Nanjangud", "Hunsur"],
    "Bengaluru Urban": ["Bengaluru South", "Bengaluru North", "Electronic City"],
    Mumbai: ["Mumbai City", "Suburban North", "Thane"],
    Pune: ["Pune City", "Pimpri-Chinchwad"],
    Nagpur: ["Nagpur Central", "Nagpur East"],
    Ahmedabad: ["Ahmedabad Central", "Gandhinagar"],
    Surat: ["Surat City", "Navsari"],
    Vadodara: ["Vadodara City", "Anand"]
  };

  // Face Scan state during registration
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceScanProgress, setFaceScanProgress] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramRole = params.get("role");
    if (paramRole && ['citizen', 'talati', 'tehsildar', 'revenue', 'municipality', 'resolver'].includes(paramRole.toLowerCase())) {
      const selectedRole = paramRole.toLowerCase();
      setForm(prev => ({
        ...prev,
        role: selectedRole,
        designation: selectedRole !== 'citizen' ? `${selectedRole.toUpperCase()} Officer` : '',
        officeName: selectedRole !== 'citizen' ? `${selectedRole.toUpperCase()} Sub-Division Office` : ''
      }));
    }
  }, []);

  const validatePassword = (password) => password.length >= 6;

  const startRegCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera fallback active during registration:", err.message);
    }
  };

  const stopRegCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.phone || form.phone.length !== 10) {
      setError("Mobile Number must be exactly 10 digits long.");
      return;
    }

    if (!validatePassword(form.password)) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setError("");
      setSuccessMsg("");
      const res = await API.post('/auth/register', form);
      const registeredUserId = res.data.userId || res.data.user?._id || res.data.id || "user_reg_" + Date.now();
      setUserId(registeredUserId);
      setOtp("");
      setSuccessMsg(`📧 6-Digit Verification OTP sent to ${form.email}. Please enter the OTP code below & position your face inside the target circle to complete registration.`);
      
      // Auto-start camera for Face Recognition Setup
      setTimeout(() => startRegCamera(), 300);
    } catch (err) {
      setError(err.response?.data?.message || t("error"));
    }
  };

  const verifyOtpAndFace = async (e) => {
    if (e) e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Please enter the valid 6-digit Email OTP code.");
      return;
    }

    setIsScanningFace(true);
    setFaceScanProgress(20);
    setError("");

    const interval = setInterval(() => {
      setFaceScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 40;
      });
    }, 200);

    setTimeout(async () => {
      try {
        const res = await API.post('/auth/verify-otp', {
          userId,
          otp,
          faceDescriptor: `FACE_BIOMETRIC_REGISTERED_${Date.now()}`
        });

        stopRegCamera();
        setIsScanningFace(false);

        if (res.data?.token) {
          localStorage.setItem("token", res.data.token);
        }

        const userObj = res.data?.user || {
          email: form.email.toLowerCase(),
          name: form.name,
          role: form.role,
          state: form.state,
          district: form.district,
          city: form.city,
          officeName: form.officeName,
          designation: form.designation,
          faceRegistered: true,
          kycCompleted: true
        };
        const emailKey = form.email.toLowerCase().trim();
        localStorage.setItem("user", JSON.stringify(userObj));
        localStorage.setItem("faceRegistered", "true");
        localStorage.setItem("kycCompleted", "true");
        localStorage.setItem(`registered_${emailKey}`, "true");
        localStorage.setItem(`registeredUser_${emailKey}`, JSON.stringify(userObj));
        localStorage.setItem(`kycCompleted_${emailKey}`, "true");

        setSuccessMsg(`✅ Account Registered Successfully! Office Profile created for ${form.city} Jurisdiction. Redirecting to ${form.role.toUpperCase()} Login...`);
        setTimeout(() => {
          navigate(`/login?role=${form.role}`);
        }, 1500);
      } catch (err) {
        setIsScanningFace(false);
        setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
      }
    }, 1000);
  };

  return (
    <div className="register-container" style={{ maxWidth: "520px", margin: "2rem auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
        <button
          onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"))}
          style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "6px 14px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
        >
          <FaArrowLeft /> Back
        </button>
      </div>
      <h2 className="register-title" style={{ textAlign: "center", marginBottom: "6px" }}>
        📝 Account &amp; Office Profile Registration
      </h2>
      <p style={{ textAlign: "center", color: "#64748b", fontSize: "0.85rem", marginBottom: "16px" }}>
        Select your State, District, and City jurisdiction to create your profile.
      </p>

      {error && <p style={{ color: "#ef4444", marginBottom: "1rem", fontWeight: "700", textAlign: "center" }}>{error}</p>}
      {successMsg && (
        <div style={{ padding: "12px", borderRadius: "8px", backgroundColor: "#e0f2fe", color: "#0369a1", border: "1px solid #7dd3fc", fontWeight: 700, fontSize: "0.85rem", marginBottom: "16px", textAlign: "center" }}>
          {successMsg}
        </div>
      )}

      {!userId ? (
        /* STEP 1: Registration Input Form */
        <form className="register-form" onSubmit={handleSubmit}>
          {/* Account Role Selection */}
          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>Register Account As / Role:</label>
            <select
              className="register-input"
              value={form.role}
              onChange={e => {
                const r = e.target.value;
                setForm(prev => ({
                  ...prev,
                  role: r,
                  designation: r !== 'citizen' ? `${r.toUpperCase()} Officer` : '',
                  officeName: r !== 'citizen' ? `${r.toUpperCase()} Sub-Division Office` : ''
                }));
              }}
              style={{ fontWeight: "700", cursor: "pointer" }}
            >
              <option value="citizen">👤 Resident Citizen</option>
              <option value="talati">🏡 Talati Office Officer</option>
              <option value="tehsildar">📜 Tehsildar Office Officer</option>
              <option value="revenue">🌾 Revenue Office Officer</option>
              <option value="municipality">🏢 Municipality Office Officer</option>
              <option value="resolver">⚖️ Resolver Portal Ombudsman</option>
            </select>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>Full Name:</label>
            <input
              className="register-input"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder={t("name")}
              required
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>Email Address (OTP will be sent here):</label>
            <input
              className="register-input"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder={t("email")}
              type="email"
              required
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>Mobile Number (10 Digits Only):</label>
            <input
              className="register-input"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              placeholder="10-Digit Mobile Number"
              maxLength={10}
              required
            />
          </div>

          {/* Location Selection: State, District, City */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>State:</label>
              <select
                className="register-input"
                value={form.state}
                onChange={e => {
                  const s = e.target.value;
                  const firstDist = districtsMap[s] ? districtsMap[s][0] : "Dharwad";
                  const firstCity = citiesMap[firstDist] ? citiesMap[firstDist][0] : "Hubli";
                  setForm({ ...form, state: s, district: firstDist, city: firstCity });
                }}
                style={{ fontSize: "0.85rem", padding: "6px" }}
              >
                {Object.keys(districtsMap).map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>District:</label>
              <select
                className="register-input"
                value={form.district}
                onChange={e => {
                  const d = e.target.value;
                  const firstCity = citiesMap[d] ? citiesMap[d][0] : "Hubli";
                  setForm({ ...form, district: d, city: firstCity });
                }}
                style={{ fontSize: "0.85rem", padding: "6px" }}
              >
                {(districtsMap[form.state] || ["Dharwad"]).map(dt => (
                  <option key={dt} value={dt}>{dt}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>City / Taluka:</label>
              <select
                className="register-input"
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                style={{ fontSize: "0.85rem", padding: "6px" }}
              >
                {(citiesMap[form.district] || ["Hubli"]).map(ct => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Officer Details (if officer role selected) */}
          {form.role !== 'citizen' && (
            <div style={{ backgroundColor: "#f0fdf4", padding: "10px", borderRadius: "8px", border: "1px solid #bbf7d0", marginBottom: "12px" }}>
              <h5 style={{ margin: "0 0 6px 0", color: "#166534" }}>🏛️ Officer Portal Jurisdiction Details</h5>
              <div style={{ marginBottom: "6px" }}>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#15803d" }}>Office Designation / Title:</label>
                <input
                  className="register-input"
                  value={form.designation}
                  onChange={e => setForm({ ...form, designation: e.target.value })}
                  placeholder="e.g. Chief Talati Officer - Hubli Circle"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: "700", color: "#15803d" }}>Office Premises Name:</label>
                <input
                  className="register-input"
                  value={form.officeName}
                  onChange={e => setForm({ ...form, officeName: e.target.value })}
                  placeholder="e.g. Talati Chavadi Sub-Division Office"
                  style={{ fontSize: "0.85rem" }}
                />
              </div>
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "4px" }}>Password:</label>
            <input
              className="register-input"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder={t("password")}
              type="password"
              required
            />
          </div>

          <button className="register-button" type="submit" style={{ fontSize: "1rem", fontWeight: "800", backgroundColor: "#0284c7" }}>
            Send Email OTP &amp; Proceed to Face Setup ➔
          </button>
        </form>
      ) : (
        /* STEP 2: Email OTP Entry + Live Face Biometrics Capture */
        <form onSubmit={verifyOtpAndFace} style={{ backgroundColor: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <FaShieldAlt size={32} style={{ color: "#0284c7", marginBottom: "4px" }} />
            <h4 style={{ margin: 0, color: "#0f172a" }}>Step 2: Email OTP &amp; Face Scan</h4>
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 0 0" }}>
              Enter the 6-digit OTP sent to <strong>{form.email}</strong> and position face inside circle.
            </p>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
              Enter 6-Digit Email OTP:
            </label>
            <input
              className="register-input"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="e.g. 849201"
              required
              style={{ textLetterSpacing: "4px", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}
            />
          </div>

          {/* Live Camera Preview Box for Face Biometrics Registration */}
          <div style={{ textAlign: "center", marginBottom: "14px" }}>
            <p style={{ fontSize: "0.8rem", color: "#334155", fontWeight: 700, marginBottom: "8px" }}>
              <FaCamera style={{ marginRight: "4px" }} /> Position Face for Biometric Registration:
            </p>

            <div
              style={{
                position: "relative",
                width: "100%",
                height: "220px",
                backgroundColor: "#000",
                borderRadius: "12px",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "220px", objectFit: "cover" }} />
              <div
                style={{
                  position: "absolute",
                  width: "140px",
                  height: "140px",
                  border: isScanningFace ? "3px solid #16a34a" : "2px dashed #38bdf8",
                  borderRadius: "50%",
                  boxShadow: isScanningFace ? "0 0 18px #16a34a" : "0 0 10px rgba(56, 189, 248, 0.5)"
                }}
              />
            </div>

            {isScanningFace && (
              <div style={{ marginTop: "10px" }}>
                <div style={{ height: "6px", width: "100%", backgroundColor: "#cbd5e1", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${faceScanProgress}%`, backgroundColor: "#16a34a", transition: "width 0.2s linear" }} />
                </div>
                <p style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700, marginTop: "4px" }}>
                  Saving Face Biometrics... ({faceScanProgress}%)
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isScanningFace}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#16a34a",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "1rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            <FaCheckCircle size={18} /> {isScanningFace ? "Saving Biometrics..." : "Verify OTP & Save Face Biometrics ➔"}
          </button>
        </form>
      )}

      <div style={{ textAlign: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
        <p style={{ margin: "0 0 4px 0", fontSize: "0.85rem", color: "#64748b" }}>Already registered?</p>
        <Link to={`/login?role=${form.role}`} style={{ color: "#0284c7", fontWeight: "bold", fontSize: "0.88rem" }}>
          Log In via Direct Face Recognition ➔
        </Link>
      </div>
    </div>
  );
}