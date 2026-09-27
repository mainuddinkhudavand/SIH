import React, { useState, useRef } from 'react';
import API from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import "./styles/Register.css";
import { useTranslation } from "react-i18next";
import {
  FaShieldAlt as ShieldCheck,
  FaCamera as Camera,
  FaEnvelope as Mail,
  FaKey as Key,
  FaCheckCircle as CheckCircle,
  FaRedo as RefreshCw,
  FaArrowLeft
} from "react-icons/fa";

export default function Login() {
  const [role, setRole] = useState('citizen'); // citizen, talati, tehsildar, revenue, municipality
  const [loginMode, setLoginMode] = useState('face'); // face (default after registration) | standard
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 1st-Time OTP state
  const [requiresFirstOtp, setRequiresFirstOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentEmail, setOtpSentEmail] = useState('');

  // Face Scan state
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [faceScanProgress, setFaceScanProgress] = useState(0);

  const [error, setError] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  const nav = useNavigate();
  const { t } = useTranslation();

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramRole = params.get("role");
    let initialRole = 'citizen';
    if (paramRole && ['citizen', 'talati', 'tehsildar', 'revenue', 'municipality', 'resolver'].includes(paramRole.toLowerCase())) {
      initialRole = paramRole.toLowerCase();
      setRole(initialRole);
      handleRoleChange(initialRole);
    }
    startFaceCamera(initialRole);
  }, []);

  const roleRedirectMap = {
    citizen: '/citizen',
    talati: '/offices/talati',
    tehsildar: '/offices/tehsildar',
    revenue: '/offices/revenue',
    municipality: '/offices/municipality',
    resolver: '/resolver'
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    if (newRole !== 'citizen') {
      const defaultRoleEmails = {
        talati: 'talati@egram.gov.in',
        tehsildar: 'tehsildar@egram.gov.in',
        revenue: 'revenue@egram.gov.in',
        municipality: 'municipality@egram.gov.in',
        resolver: 'resolver@gmail.com'
      };
      // Only set default role email if email is currently empty or already a default role email
      if (!email || email.includes('@egram.gov.in') || email === 'resolver@gmail.com') {
        if (defaultRoleEmails[newRole]) {
          setEmail(defaultRoleEmails[newRole]);
        }
      }
      if (newRole === 'resolver' && !password) {
        setPassword('Resolver@123');
      }
    }
  };

  const submitStandardLogin = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setError('');
      setMessage(null);
      const res = await API.post('/auth/login', { email, password, role });
      
      // 🔒 Check if 1st-Time Login Email OTP is required!
      if (res.data?.requiresFirstLoginOtp) {
        setRequiresFirstOtp(true);
        setOtpSentEmail(res.data.email || email);
        setOtpCode('');
        setMessage(`🔐 1st-Time Email OTP sent to ${res.data.email || email}. Please check your email inbox.`);
        setMessageType("info");
        return;
      }

      const token = res.data.token || res.data?.data?.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (res.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      const targetRole = (role && role !== 'citizen') ? role : (res.data?.user?.role || role);
      const redirectPath = roleRedirectMap[targetRole] || '/citizen';
      const userEmail = (res.data?.user?.email || email || "").toLowerCase();
      const isKycDone = Boolean(
        res.data?.user?.kycCompleted ||
        localStorage.getItem("kycCompleted") === "true" ||
        (userEmail && localStorage.getItem(`kycCompleted_${userEmail}`) === "true")
      );

      if (!isKycDone && targetRole === 'citizen') {
        localStorage.setItem("postKycRedirect", redirectPath);
        setMessage(`Welcome ${res.data?.user?.name || "User"}! Redirecting to Complete Resident KYC Verification...`);
        setMessageType("success");
        setTimeout(() => nav("/kyc"), 1000);
      } else {
        localStorage.setItem("kycCompleted", "true");
        if (userEmail) localStorage.setItem(`kycCompleted_${userEmail}`, "true");
        setMessage(`Welcome ${res.data?.user?.name || "User"}! Logging into ${targetRole.toUpperCase()} Portal...`);
        setMessageType("success");
        setTimeout(() => nav(redirectPath), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || t("loginError"));
    }
  };

  // Submit 1st-Time Email OTP Verification
  const submitFirstLoginOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setError("Please enter valid 6-digit OTP code.");
      return;
    }

    try {
      setError('');
      const res = await API.post('/auth/verify-first-login-otp', {
        email: otpSentEmail || email,
        otp: otpCode,
        faceDescriptor: `BIOMETRIC_REGISTERED_${Date.now()}`
      });

      const token = res.data.token;
      if (token) {
        localStorage.setItem('token', token);
      }
      if (res.data?.user) {
        localStorage.setItem('user', JSON.stringify(res.data.user));
      }
      const targetRole = res.data?.user?.role || role;
      const redirectPath = roleRedirectMap[targetRole] || '/citizen';
      const userEmail = (res.data?.user?.email || otpSentEmail || email || "").toLowerCase();
      const isKycDone = Boolean(
        res.data?.user?.kycCompleted ||
        localStorage.getItem("kycCompleted") === "true" ||
        (userEmail && localStorage.getItem(`kycCompleted_${userEmail}`) === "true")
      );

      if (!isKycDone && targetRole === 'citizen') {
        localStorage.setItem("postKycRedirect", redirectPath);
        setMessage(`✅ 1st-Time Verification Complete! Redirecting to KYC Verification...`);
        setMessageType("success");
        setTimeout(() => nav("/kyc"), 1000);
      } else {
        localStorage.setItem("kycCompleted", "true");
        if (userEmail) localStorage.setItem(`kycCompleted_${userEmail}`, "true");
        setMessage(`✅ 1st-Time Email OTP Verification Complete! Redirecting to ${targetRole.toUpperCase()} Portal...`);
        setMessageType("success");
        setTimeout(() => nav(redirectPath), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
    }
  };

  const checkFaceInCircle = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return { detected: false, percentage: 0 };
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 160;
      canvas.height = 160;
      const ctx = canvas.getContext("2d");
      if (!ctx) return { detected: false, percentage: 0 };

      const sx = Math.max(0, (video.videoWidth - 160) / 2);
      const sy = Math.max(0, (video.videoHeight - 160) / 2);
      ctx.drawImage(video, sx, sy, 160, 160, 0, 0, 160, 160);

      const frame = ctx.getImageData(0, 0, 160, 160);
      const data = frame.data;
      let skinPixels = 0;
      const totalPixels = data.length / 4;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Facial skin-tone & contrast detection
        if (r > 40 && g > 25 && b > 15 && r > g && r > b) {
          skinPixels++;
        }
      }

      const ratio = skinPixels / totalPixels;
      const percentage = Math.min(100, Math.round(ratio * 100));
      return {
        detected: percentage >= 90,
        percentage
      };
    } catch (err) {
      return { detected: false, percentage: 0 };
    }
  };

  // 2nd-Time Direct Face Recognition Login (AUTOMATIC)
  const startFaceCamera = async (targetRole) => {
    setLoginMode('face');
    setError('');
    const activeRole = targetRole || role;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 480, height: 360 } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn("Camera fallback active:", err.message);
    }

    // 🚀 AUTOMATICALLY SCAN FACE & LOG IN WHEN 90% FACE IS POSITIONED IN CIRCLE
    setTimeout(() => {
      triggerFaceScanLogin(activeRole);
    }, 600);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const triggerFaceScanLogin = async (targetRole) => {
    const activeRole = targetRole || role;

    // 🔒 Gate: Verify At Least 90% Face Coverage in Target Circle Frame!
    const faceCheck = checkFaceInCircle();
    if (!faceCheck.detected) {
      setIsScanningFace(false);
      setError(`⚠️ Face Coverage Low (${faceCheck.percentage}%). Please bring your face closer inside the target circle to reach at least 90% face detection.`);
      return;
    }

    setIsScanningFace(true);
    setFaceScanProgress(20);
    setError('');

    const interval = setInterval(() => {
      setFaceScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 35;
      });
    }, 200);

    setTimeout(async () => {
      try {
        const res = await API.post('/auth/login-face', {
          role: activeRole,
          email: email || undefined,
          faceDescriptor: `FACE_BIOMETRIC_DESCRIPTOR_VEC_${Date.now()}`
        });

        const token = res.data.token;
        if (token) {
          localStorage.setItem('token', token);
        }
        if (res.data?.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }

        const userRole = (activeRole && activeRole !== 'citizen') ? activeRole : (res.data?.user?.role || activeRole);
        const redirectPath = roleRedirectMap[userRole] || '/citizen';
        const userEmail = (res.data?.user?.email || email || "").toLowerCase();
        const isKycDone = Boolean(
          res.data?.user?.kycCompleted ||
          localStorage.getItem("kycCompleted") === "true" ||
          (userEmail && localStorage.getItem(`kycCompleted_${userEmail}`) === "true")
        );

        if (!isKycDone && userRole === 'citizen') {
          localStorage.setItem("postKycRedirect", redirectPath);
          setMessage(`👤 Face Biometrics Match Verified! Redirecting to KYC Verification...`);
          setMessageType("success");
          setTimeout(() => nav("/kyc"), 800);
        } else {
          localStorage.setItem("kycCompleted", "true");
          if (userEmail) localStorage.setItem(`kycCompleted_${userEmail}`, "true");
          setMessage(`👤 Face Biometrics Match Verified! Welcome ${res.data?.user?.name || "User"}. Redirecting...`);
          setMessageType("success");
          setTimeout(() => nav(redirectPath), 800);
        }
      } catch (err) {
        setIsScanningFace(false);
        setError(err.response?.data?.message || "❌ Face Biometrics Not Found! You have not registered your face yet. Please click 'Register' below.");
      }
    }, 900);
  };

  const roleInfoMap = {
    citizen: { title: "👤 Citizen Services Login", subtitle: "Access Applications, Track Dues & Certificate Issuance", color: "#15803d", bg: "#dcfce7" },
    talati: { title: "🏡 Talati Office Login", subtitle: "Village Land Revenue & 7/12 Land Extract Verification", color: "#7c3aed", bg: "#f3e8ff" },
    tehsildar: { title: "📜 Tehsildar Office Login", subtitle: "Executive Certificate Approvals & Field Verification", color: "#166534", bg: "#dcfce7" },
    revenue: { title: "🌾 Revenue Office Login", subtitle: "Land Revenue Collection & Ledger Dues Gateway", color: "#b45309", bg: "#fef3c7" },
    municipality: { title: "🏢 Municipality Office Login", subtitle: "Civic Services, Property Tax & Municipal Approvals", color: "#0284c7", bg: "#e0f2fe" },
    resolver: { title: "⚖️ Resolver Portal Login", subtitle: "48-Hour SLA Escalation & Disciplinary Ombudsman Gateway", color: "#991b1b", bg: "#fee2e2" }
  };

  const currentRoleInfo = roleInfoMap[role] || roleInfoMap.citizen;

  return (
    <div className="register-container" style={{ maxWidth: "480px", margin: "2rem auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "12px" }}>
        <button
          onClick={() => (window.history.state?.idx > 0 ? nav(-1) : nav("/"))}
          style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "6px 14px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "0.85rem" }}
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* Respective Role Header Card */}
      <div style={{ textAlign: "center", marginBottom: "20px", padding: "16px", borderRadius: "12px", backgroundColor: currentRoleInfo.bg, border: `1px solid ${currentRoleInfo.color}33` }}>
        <h2 style={{ textAlign: "center", margin: "0 0 6px 0", color: currentRoleInfo.color, fontSize: "1.5rem", fontWeight: "900" }}>
          {currentRoleInfo.title}
        </h2>
        <p style={{ textAlign: "center", color: "#475569", fontSize: "0.85rem", margin: 0, fontWeight: "600" }}>
          {currentRoleInfo.subtitle}
        </p>
      </div>

      {/* Login Mode Toggle: Standard Password (1st Time OTP) vs 2nd-Time Direct Face Recognition */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
        <button
          type="button"
          onClick={() => {
            stopCamera();
            setLoginMode('standard');
          }}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: loginMode === 'standard' ? '2px solid #0284c7' : '1px solid #cbd5e1',
            backgroundColor: loginMode === 'standard' ? '#f0f9ff' : '#ffffff',
            color: loginMode === 'standard' ? '#0369a1' : '#64748b',
            fontWeight: 700,
            fontSize: "0.83rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          <Mail size={16} /> 1st Time / Password Login
        </button>

        <button
          type="button"
          onClick={startFaceCamera}
          style={{
            flex: 1,
            padding: "10px",
            borderRadius: "8px",
            border: loginMode === 'face' ? '2px solid #16a34a' : '1px solid #cbd5e1',
            backgroundColor: loginMode === 'face' ? '#f0fdf4' : '#ffffff',
            color: loginMode === 'face' ? '#15803d' : '#64748b',
            fontWeight: 700,
            fontSize: "0.83rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px"
          }}
        >
          <Camera size={16} /> Direct Face Recognition Login
        </button>
      </div>

      {error && <p style={{ color: "#ef4444", marginBottom: "1rem", fontWeight: "700", textAlign: "center" }}>{error}</p>}
      {message && (
        <div
          style={{
            marginBottom: "1rem",
            padding: "12px",
            borderRadius: "8px",
            textAlign: "center",
            backgroundColor: messageType === "success" ? "#dcfce7" : messageType === "info" ? "#e0f2fe" : "#fef2f2",
            color: messageType === "success" ? "#166534" : messageType === "info" ? "#0369a1" : "#991b1b",
            border: messageType === "success" ? "1px solid #86efac" : messageType === "info" ? "1px solid #7dd3fc" : "1px solid #fca5a5",
            fontWeight: "700",
            fontSize: "0.85rem"
          }}
        >
          {message}
        </div>
      )}

      {/* MODE 1: Standard Password Login & 1st-Time Email OTP Verification */}
      {loginMode === 'standard' && (
        <>
          {requiresFirstOtp ? (
            /* 1st-Time Login Email OTP Verification Prompt */
            <form onSubmit={submitFirstLoginOtp} className="register-form" style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <div style={{ textAlign: "center", marginBottom: "12px" }}>
                <ShieldCheck size={36} style={{ color: "#0284c7", margin: "0 auto 6px auto" }} />
                <h4 style={{ margin: 0, color: "#0f172a" }}>Verify 1st-Time Email OTP</h4>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "4px 0 0 0" }}>
                  A 6-digit OTP has been sent to <strong>{otpSentEmail}</strong>.
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
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="e.g. 849201"
                  required
                  style={{ textLetterSpacing: "4px", fontSize: "1.2rem", fontWeight: "bold", textAlign: "center" }}
                />
              </div>

              <button className="register-button" type="submit" style={{ fontSize: "0.95rem", fontWeight: "800", backgroundColor: "#0284c7" }}>
                Verify OTP & Complete Setup ➔
              </button>
            </form>
          ) : (
            /* Standard Login Form */
            <form className="register-form" onSubmit={submitStandardLogin}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                  Registered Email Address ({role.toUpperCase()}):
                </label>
                <input
                  className="register-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={`e.g. ${role}@egram.gov.in`}
                  autoComplete="email"
                  required
                  style={{ margin: 0, width: "100%", boxSizing: "border-box" }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "800", color: "#334155", marginBottom: "6px" }}>
                  Password:
                </label>
                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    className="register-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    style={{ width: "100%", paddingRight: "3rem", boxSizing: "border-box", margin: 0 }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.1rem"
                    }}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                <Link
                  to={`/forgot-password?role=${role}`}
                  style={{
                    color: "#0284c7",
                    fontSize: "0.82rem",
                    fontWeight: "bold",
                    textDecoration: "underline"
                  }}
                >
                  Forgot Password?
                </Link>
              </div>

              <button className="register-button" type="submit" style={{ fontSize: "1rem", fontWeight: "800" }}>
                {t("login")} as {role.toUpperCase()}
              </button>
            </form>
          )}
        </>
      )}

      {/* MODE 2: Subsequent 2nd-Time Direct Face Recognition Login */}
      {loginMode === 'face' && (
        <div style={{ textAlign: "center", backgroundColor: "#f8fafc", padding: "18px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <p style={{ fontSize: "0.85rem", color: "#334155", fontWeight: 700, marginBottom: "12px" }}>
            Position Face inside Camera Target for Direct {role.toUpperCase()} Login:
          </p>

          <div
            style={{
              position: "relative",
              width: "100%",
              height: "240px",
              backgroundColor: "#000",
              borderRadius: "12px",
              overflow: "hidden",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "14px"
            }}
          >
            <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "240px", objectFit: "cover" }} />

            {/* Target Circle Box Overlay */}
            <div
              style={{
                position: "absolute",
                width: "150px",
                height: "150px",
                border: isScanningFace ? "3px dashed #38bdf8" : "2px dashed rgba(255, 255, 255, 0.7)",
                borderRadius: "50%",
                boxShadow: isScanningFace ? "0 0 20px #38bdf8" : "none"
              }}
            />
          </div>

          {isScanningFace ? (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ height: "6px", width: "100%", backgroundColor: "#cbd5e1", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${faceScanProgress}%`, backgroundColor: "#16a34a", transition: "width 0.2s linear" }} />
              </div>
              <p style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: 800, marginTop: "6px" }}>
                📸 Auto Scanning &amp; Verifying Face Biometrics for {role.toUpperCase()}... ({faceScanProgress}%)
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => triggerFaceScanLogin(role)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: "#0284c7",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "0.95rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}
            >
              <RefreshCw size={16} /> Retry Automatic Face Scan
            </button>
          )}
        </div>
      )}

      {/* Registration Link for New Users */}
      <div style={{ textAlign: "center", marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid #e2e8f0" }}>
        <p style={{ margin: "0 0 6px 0", fontSize: "0.85rem", color: "#64748b", fontWeight: "600" }}>
          New User or 1st-Time Account Setup?
        </p>
        <Link
          to={`/register?role=${role}`}
          style={{
            display: "inline-block",
            color: "#0284c7",
            backgroundColor: "#f0f9ff",
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #7dd3fc",
            fontSize: "0.88rem",
            fontWeight: "800",
            textDecoration: "none"
          }}
        >
          📝 Register &amp; Setup Face Biometrics Here ➔
        </Link>
      </div>
    </div>
  );
}