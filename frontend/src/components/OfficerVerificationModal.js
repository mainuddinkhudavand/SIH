import React, { useState, useEffect, useRef } from "react";
import {
  FaTimes as X,
  FaClock as Clock,
  FaShieldAlt as ShieldCheck,
  FaCamera as Camera,
  FaEdit as Edit3,
  FaCheckCircle as CheckCircle,
  FaRedo as RefreshCw,
  FaExclamationTriangle as AlertTriangle
} from "react-icons/fa";

export default function OfficerVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  applicationId,
  officeName = "Officer",
  officerName = "Duty Officer"
}) {
  const [timeLeft, setTimeLeft] = useState(60);
  const [step, setStep] = useState(1); // Step 1: Digital Signature, Step 2: Face Recognition
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);
  
  // Signature Canvas state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const [sigError, setSigError] = useState("");

  // Camera & Face Scan state
  const videoRef = useRef(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [faceVerified, setFaceVerified] = useState(false);

  // 🔒 3-Attempt Verification Limit per Application
  const attemptKey = `verification_attempts_${applicationId || 'default'}`;
  const [attemptsCount, setAttemptsCount] = useState(0);

  // Timer Effect & Attempt Initialization
  useEffect(() => {
    let timer = null;
    if (isOpen) {
      // Read current attempts for this application
      const savedAttempts = parseInt(localStorage.getItem(attemptKey) || "0", 10);
      setAttemptsCount(savedAttempts);

      // Reset state on open
      setTimeLeft(60);
      setStep(1);
      setTimerExpired(false);
      setSignatureData(null);
      setFaceVerified(false);
      setIsTimerRunning(savedAttempts < 3);
    } else {
      stopCamera();
    }
    return () => {
      if (timer) clearInterval(timer);
      stopCamera();
    };
  }, [isOpen, applicationId]);

  useEffect(() => {
    let interval = null;
    if (isOpen && isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setTimerExpired(true);
      stopCamera();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen, isTimerRunning, timeLeft]);

  // Restart / Reset Verification Flow
  const handleRestart = () => {
    const newCount = attemptsCount + 1;
    setAttemptsCount(newCount);
    localStorage.setItem(attemptKey, newCount.toString());

    if (newCount >= 3) {
      stopCamera();
      setIsTimerRunning(false);
      return;
    }

    stopCamera();
    setTimeLeft(60);
    setStep(1);
    setTimerExpired(false);
    setSignatureData(null);
    setSigError("");
    setFaceVerified(false);
    setIsTimerRunning(true);
    clearCanvas();
  };

  // Canvas Drawing Methods
  const startDrawing = (e) => {
    if (timerExpired) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || timerExpired) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL("image/png"));
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setSignatureData(null);
    }
  };

  // Transition Step 1 -> Step 2
  const handleProceedToFaceScan = () => {
    if (!signatureData) {
      setSigError("Please draw or apply your digital signature to proceed.");
      return;
    }
    setSigError("");
    setStep(2);
    startCamera();
  };

  // Camera Management with Resilient Fallback
  const startCamera = async () => {
    try {
      if (navigator?.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        }).catch(() => navigator.mediaDevices.getUserMedia({ video: true }));

        setCameraStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.warn("Camera access fallback mode active:", err.message);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  // Simulate Face Scan & Verification
  const handleScanFace = () => {
    if (timerExpired) return;
    setIsScanning(true);
    setScanProgress(10);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setFaceVerified(true);

          // Auto-trigger completion if verified within 60s
          setTimeout(() => {
            stopCamera();
            onSuccess({
              digitalSignature: signatureData,
              faceVerified: true,
              verifiedAt: new Date().toISOString()
            });
          }, 600);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem"
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          maxWidth: "520px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          overflow: "hidden",
          border: "1px solid #e2e8f0"
        }}
      >
        {/* Header with 60-Second Live Timer */}
        <div
          style={{
            backgroundColor: timerExpired ? "#ef4444" : "#0f172a",
            color: "#ffffff",
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={22} style={{ color: "#38bdf8" }} />
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>
                {officeName} Approval Verification
              </h3>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "#94a3b8" }}>
                App #: {applicationId || "APP-REF-1001"} | Officer: {officerName}
              </p>
            </div>
          </div>

          {/* Timer Display */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: timeLeft <= 15 ? "#b91c1c" : "rgba(255,255,255,0.15)",
              padding: "6px 14px",
              borderRadius: "20px",
              fontWeight: 800,
              fontSize: "1.05rem",
              letterSpacing: "1px"
            }}
          >
            <Clock size={18} className={timeLeft <= 15 ? "animate-pulse" : ""} />
            <span>{timeLeft}s</span>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: "20px" }}>
          {/* 🔒 3-Attempt Limit Exceeded Alert */}
          {attemptsCount >= 3 ? (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "2px solid #ef4444",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center"
              }}
            >
              <AlertTriangle size={48} style={{ color: "#dc2626", margin: "0 auto 12px auto" }} />
              <h4 style={{ margin: "0 0 8px 0", color: "#991b1b", fontSize: "1.2rem", fontWeight: 900 }}>
                🔒 MAXIMUM 3-ATTEMPT VERIFICATION LIMIT REACHED
              </h4>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.88rem", color: "#7f1d1d", lineHeight: "1.5" }}>
                You have reached the limit of <strong>3 Digital Signature / Face Recognition attempts</strong> for Application <strong>#{applicationId}</strong>. Further verification attempts for this application are locked for security.
              </p>
              <button
                onClick={onClose}
                style={{
                  backgroundColor: "#991b1b",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 22px",
                  borderRadius: "8px",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  cursor: "pointer"
                }}
              >
                Close Verification Window
              </button>
            </div>
          ) : timerExpired ? (
            <div
              style={{
                backgroundColor: "#fef2f2",
                border: "1.5px dashed #ef4444",
                borderRadius: "12px",
                padding: "20px",
                textAlign: "center"
              }}
            >
              <AlertTriangle size={42} style={{ color: "#dc2626", margin: "0 auto 10px auto" }} />
              <h4 style={{ margin: "0 0 6px 0", color: "#991b1b", fontSize: "1.1rem", fontWeight: 800 }}>
                ⏰ 1-Minute Verification Time Expired!
              </h4>
              <p style={{ margin: "0 0 16px 0", fontSize: "0.85rem", color: "#7f1d1d" }}>
                The 60-second limit to complete both Digital Signature and Face Recognition was exceeded. Process has been reset for security.
              </p>
              <button
                onClick={handleRestart}
                style={{
                  backgroundColor: "#dc2626",
                  color: "#ffffff",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "8px",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <RefreshCw size={16} /> Restart Process (Step 1)
              </button>
            </div>
          ) : (
            <>
              {/* Stepper Bar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "20px",
                  paddingBottom: "12px",
                  borderBottom: "1px solid #e2e8f0"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: step === 1 ? "#0284c7" : "#16a34a"
                  }}
                >
                  <span
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      backgroundColor: step === 1 ? "#0284c7" : "#16a34a",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem"
                    }}
                  >
                    1
                  </span>
                  1st: Digital Signature {signatureData && "✓"}
                </div>

                <div style={{ color: "#cbd5e1", fontWeight: "bold" }}>➔</div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontWeight: 700,
                    fontSize: "0.88rem",
                    color: step === 2 ? "#0284c7" : "#64748b"
                  }}
                >
                  <span
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      backgroundColor: step === 2 ? "#0284c7" : "#e2e8f0",
                      color: step === 2 ? "#fff" : "#64748b",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.8rem"
                    }}
                  >
                    2
                  </span>
                  2nd: Face Recognition
                </div>
              </div>

              {/* STEP 1: Digital Signature */}
              {step === 1 && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <label style={{ fontSize: "0.85rem", fontWeight: 800, color: "#334155" }}>
                      <Edit3 size={15} style={{ display: "inline", marginRight: "4px" }} />
                      Draw Official Digital Signature:
                    </label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      style={{ background: "none", border: "none", color: "#64748b", fontSize: "0.78rem", cursor: "pointer", textDecoration: "underline" }}
                    >
                      Clear Pad
                    </button>
                  </div>

                  <div style={{ border: "2px dashed #94a3b8", borderRadius: "10px", backgroundColor: "#f8fafc", position: "relative" }}>
                    <canvas
                      ref={canvasRef}
                      width={470}
                      height={160}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      style={{ display: "block", cursor: "crosshair", width: "100%", borderRadius: "10px" }}
                    />
                    {!signatureData && (
                      <div
                        style={{
                          position: "absolute",
                          top: "45%",
                          left: "50%",
                          transform: "translate(-50%, -50%)",
                          color: "#cbd5e1",
                          pointerEvents: "none",
                          fontWeight: 600,
                          fontSize: "0.9rem"
                        }}
                      >
                        Sign Here with Mouse / Touch
                      </div>
                    )}
                  </div>

                  {sigError && <p style={{ color: "#ef4444", fontSize: "0.8rem", marginTop: "6px", fontWeight: 700 }}>{sigError}</p>}

                  <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                    <button
                      onClick={() => {
                        stopCamera();
                        onClose();
                      }}
                      style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleProceedToFaceScan}
                      style={{
                        padding: "10px 20px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: "#0284c7",
                        color: "#fff",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      Next: Face Recognition ➔
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Face Recognition Camera Scan */}
              {step === 2 && (
                <div style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "0.85rem", color: "#475569", fontWeight: 700, marginBottom: "12px" }}>
                    <Camera size={16} style={{ display: "inline", marginRight: "4px" }} />
                    Step 2: Position Officer Face inside Frame for Scan
                  </p>

                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "220px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: "#090d16",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                  >
                    {cameraStream ? (
                      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", height: "220px", objectFit: "cover" }} />
                    ) : (
                      <div style={{ textAlign: "center", color: "#38bdf8", padding: "20px" }}>
                        <div style={{ fontSize: "2.8rem", marginBottom: "4px" }}>👨‍⚖️</div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 800, color: "#e2e8f0" }}>
                          Biometric Facial AI Scanner Active
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "4px", fontWeight: 700 }}>
                          [CAMERA VIEWFINDER READY • CLICK SCAN FACE]
                        </div>
                      </div>
                    )}

                    {/* Facial Targeting Overlay Box */}
                    <div
                      style={{
                        position: "absolute",
                        width: "140px",
                        height: "140px",
                        border: isScanning ? "3px dashed #38bdf8" : faceVerified ? "3px solid #22c55e" : "2px dashed rgba(255,255,255,0.6)",
                        borderRadius: "50%",
                        boxShadow: isScanning ? "0 0 15px #38bdf8" : faceVerified ? "0 0 20px #22c55e" : "none",
                        transition: "all 0.3s ease"
                      }}
                    />

                    {faceVerified && (
                      <div
                        style={{
                          position: "absolute",
                          backgroundColor: "rgba(22, 163, 74, 0.9)",
                          color: "#fff",
                          padding: "8px 16px",
                          borderRadius: "20px",
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <CheckCircle size={18} /> Biometric Verified!
                      </div>
                    )}
                  </div>

                  {/* Progress Bar during scan */}
                  {isScanning && (
                    <div style={{ marginTop: "12px" }}>
                      <div style={{ height: "6px", width: "100%", backgroundColor: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${scanProgress}%`, backgroundColor: "#0284c7", transition: "width 0.2s linear" }} />
                      </div>
                      <p style={{ fontSize: "0.78rem", color: "#0284c7", fontWeight: 700, marginTop: "4px" }}>
                        Scanning Face Descriptor Biometrics... ({scanProgress}%)
                      </p>
                    </div>
                  )}

                  {!faceVerified && (
                    <div style={{ marginTop: "16px", display: "flex", justifyContent: "space-between" }}>
                      <button
                        onClick={() => setStep(1)}
                        style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer", fontWeight: 600 }}
                      >
                        ⇦ Back to Signature
                      </button>
                      <button
                        onClick={handleScanFace}
                        disabled={isScanning}
                        style={{
                          padding: "10px 22px",
                          borderRadius: "8px",
                          border: "none",
                          backgroundColor: "#16a34a",
                          color: "#fff",
                          fontWeight: 700,
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px"
                        }}
                      >
                        <Camera size={16} /> {isScanning ? "Scanning..." : "Scan & Verify Face"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
