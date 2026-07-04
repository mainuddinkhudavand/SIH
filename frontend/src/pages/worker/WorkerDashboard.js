import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Custom markers
const BlueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const RedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function WorkerDashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [activeTaskId, setActiveTaskId] = useState(null); 
  const [workerMessage, setWorkerMessage] = useState("");

  const [routeTaskMap, setRouteTaskMap] = useState({}); 
  const [fetchingLocId, setFetchingLocId] = useState(null);

  const getRouteToTask = (taskId, destLat, destLng) => {
    if (routeTaskMap[taskId]) {
      const updated = { ...routeTaskMap };
      delete updated[taskId];
      setRouteTaskMap(updated);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setFetchingLocId(taskId);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setRouteTaskMap(prev => ({
          ...prev,
          [taskId]: [latitude, longitude]
        }));
        setFetchingLocId(null);
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Failed to get your current location. Please check browser permissions.");
        setFetchingLocId(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  
  // Camera States
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("workerToken");
  const workerInfo = JSON.parse(localStorage.getItem("workerInfo") || "{}");
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  // --- 1. Fetch Assigned Tasks ---
  const fetchMyTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BACKEND_URL}/api/worker/my-tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data.complaints || []);
    } catch (err) {
      console.error("Fetch Tasks Error:", err);
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      navigate("/worker/login");
      return;
    }
    fetchMyTasks();
  }, [fetchMyTasks, token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("workerToken");
    localStorage.removeItem("workerInfo");
    navigate("/worker/login");
  };

  // --- 2. Live Camera Logic ---
  const startCamera = async (taskId) => {
    try {
      setActiveTaskId(taskId); 
      setWorkerMessage("");
      setImageFile(null);
      setPreview(null);

      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      setStream(mediaStream);
      setIsCameraOpen(true);
    } catch (err) {
      alert("Camera access denied. Please allow permissions in your browser.");
    }
  };

  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(e => console.error(e));
      };
    }
  }, [isCameraOpen, stream]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || video.videoWidth === 0) {
      alert("Camera warming up, please wait a second...");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `resolution_${Date.now()}.jpg`, { type: "image/jpeg" });
      setImageFile(file);
      setPreview(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
    setStream(null);
  };

  // --- 3. Submit Resolution ---
  const submitResolution = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert("A live photo is required to mark this task as completed.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("workerMessage", workerMessage);

    try {
      await axios.put(`${BACKEND_URL}/api/worker/complaints/${activeTaskId}/complete`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        }
      });
      
      alert("Task successfully completed and sent to Department for verification!");
      setActiveTaskId(null);
      setImageFile(null);
      setPreview(null);
      fetchMyTasks(); 
    } catch (err) {
      alert(err.response?.data?.message || "Error submitting completion.");
    }
  };

  // --- Styles ---
  const styles = {
    wrapper: { maxWidth: "800px", margin: "0 auto", padding: "1rem", fontFamily: "'Plus Jakarta Sans', sans-serif", color: "#1e293b", paddingBottom: "5rem" },
    header: { background: "#3b5f3a", color: "white", padding: "1.5rem", borderRadius: "16px", marginBottom: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" },
    taskCard: { background: "#ffffff", borderRadius: "16px", padding: "1.5rem", marginBottom: "1.5rem", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0" },
    badge: (status) => ({ background: status === "Completed" ? "#dcfce7" : "#eff6ff", color: status === "Completed" ? "#166534" : "#3b5f3a", padding: "0.4rem 0.8rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: "800", display: "inline-block", marginBottom: "10px" }),
    btnBlue: { background: "#3b5f3a", color: "#fff", border: "none", borderRadius: "10px", padding: "0.85rem", cursor: "pointer", fontWeight: "800", width: "100%", fontSize: "1rem", marginTop: "1rem" },
    btnRed: { background: "#ef4444", color: "#fff", border: "none", borderRadius: "10px", padding: "0.85rem", cursor: "pointer", fontWeight: "800", width: "100%", fontSize: "1rem", marginTop: "10px" },
    btnGreen: { background: "#16a34a", color: "#fff", border: "none", borderRadius: "10px", padding: "0.85rem", cursor: "pointer", fontWeight: "800", width: "100%", fontSize: "1rem", marginTop: "1rem" },
    input: { width: "100%", padding: "0.85rem", borderRadius: "10px", border: "2px solid #cbd5e1", marginTop: "10px", boxSizing: "border-box", fontSize: "0.95rem" },
    citizenImg: { width: "100%", height: "200px", objectFit: "cover", borderRadius: "12px", border: "2px solid #e2e8f0", marginTop: "10px" }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div>
          <h2 style={{ margin: 0 }}>👷‍♂️ Field Tasks</h2>
          <p style={{ margin: "5px 0 0 0", color: "#94a3b8", fontSize: "0.9rem" }}>Welcome, {workerInfo.name}</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => navigate("/worker/profile")} style={{ background: "#ffffff", border: "none", color: "#3b5f3a", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            👤 My Profile
          </button>
          <button onClick={handleLogout} style={{ background: "#ef4444", border: "none", color: "white", padding: "8px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            Logout
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#64748b" }}>Loading your assigned tasks...</p>
      ) : tasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", background: "white", borderRadius: "16px", border: "1px dashed #cbd5e1" }}>
          <span style={{ fontSize: "2rem" }}>🎉</span>
          <p style={{ fontWeight: "700", color: "#475569" }}>No tasks assigned right now!</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task._id} style={styles.taskCard}>
            <div style={styles.badge(task.status)}>{task.status}</div>
            <h3 style={{ margin: "0 0 10px 0", fontSize: "1.3rem" }}>{task.title}</h3>
            
            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "10px", fontSize: "0.9rem", color: "#475569", marginBottom: "15px" }}>
              <strong>📍 Location:</strong> {task.address?.street}, {task.address?.town} <br/>
              <strong>📱 Contact:</strong> {task.user?.phone}
            </div>

            <p style={{ color: "#334155", fontSize: "0.95rem", lineHeight: "1.5" }}>{task.description}</p>

            {/* Show Citizen's Original Photo */}
            {task.imageUrl && (
              <div style={{ marginTop: "15px" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#64748b" }}>REPORTED ISSUE:</span>
                <img src={`${BACKEND_URL}${task.imageUrl}`} alt="Reported Issue" style={styles.citizenImg} />
              </div>
            )}

            {/* Map Directions / Inline routing map */}
            {task.location?.coordinates?.length === 2 && (
              <div style={{ marginTop: "15px" }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button 
                    style={{ ...styles.btnBlue, background: "#0f172a", marginTop: 0, flex: 1 }}
                    onClick={() => getRouteToTask(task._id, task.location.coordinates[1], task.location.coordinates[0])}
                  >
                    {fetchingLocId === task._id ? "⌛ Locating..." : routeTaskMap[task._id] ? "🗺️ Hide Route Map" : "🗺️ Show Route Map"}
                  </button>
                  <button 
                    style={{ ...styles.btnBlue, background: "#1e3a8a", marginTop: 0, flex: 1 }}
                    onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${task.location.coordinates[1]},${task.location.coordinates[0]}`, "_blank")}
                  >
                    🚗 Navigate (Google Maps)
                  </button>
                </div>

                {routeTaskMap[task._id] && (
                  <div style={{ marginTop: "15px", height: "300px", borderRadius: "16px", overflow: "hidden", border: "2px solid #cbd5e1", position: "relative", zIndex: 1 }}>
                    <MapContainer 
                      center={[
                        (routeTaskMap[task._id][0] + task.location.coordinates[1]) / 2,
                        (routeTaskMap[task._id][1] + task.location.coordinates[0]) / 2
                      ]} 
                      zoom={13} 
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      />
                      {/* Worker Marker */}
                      <Marker position={routeTaskMap[task._id]} icon={BlueIcon}>
                        <Popup>
                          <strong>👷‍♂️ You (Worker)</strong> <br/>
                          Your current location
                        </Popup>
                      </Marker>

                      {/* Complaint Marker */}
                      <Marker position={[task.location.coordinates[1], task.location.coordinates[0]]} icon={RedIcon}>
                        <Popup>
                          <strong>📍 Complaint Location</strong> <br/>
                          {task.address?.street}, {task.address?.town}
                        </Popup>
                      </Marker>

                      {/* Line connecting the two */}
                      <Polyline 
                        positions={[
                          routeTaskMap[task._id],
                          [task.location.coordinates[1], task.location.coordinates[0]]
                        ]}
                        color="#2563eb"
                        dashArray="10, 10"
                        weight={4}
                      />
                    </MapContainer>
                  </div>
                )}
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

            {/* ================================================= */}
            {/* RESOLUTION SECTION (Camera & Form) */}
            {/* ================================================= */}
            {task.status !== "Completed" ? (
              activeTaskId === task._id ? (
                <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "12px", border: "2px dashed #cbd5e1" }}>
                  <h4 style={{ margin: "0 0 15px 0", color: "#0f172a" }}>📸 Capture Resolution</h4>
                  
                  {!isCameraOpen && !preview && (
                    <button style={styles.btnBlue} onClick={() => startCamera(task._id)}>
                      Open Live Camera
                    </button>
                  )}

                  {isCameraOpen && (
                    <div style={{ position: "relative" }}>
                      <video ref={videoRef} autoPlay playsInline muted style={{ width: "100%", borderRadius: "12px", background: "#000" }} />
                      <button style={styles.btnRed} onClick={takePhoto}>🔴 Snap Photo</button>
                      <button style={{ background: "none", border: "none", color: "#64748b", marginTop: "10px", width: "100%", fontWeight: "bold" }} onClick={stopCamera}>Cancel</button>
                    </div>
                  )}

                  {preview && (
                    <form onSubmit={submitResolution}>
                      <img src={preview} alt="Resolution" style={{ width: "100%", borderRadius: "12px", border: "3px solid #16a34a" }} />
                      <button type="button" style={{ background: "none", border: "none", color: "#3b5f3a", marginTop: "10px", width: "100%", fontWeight: "bold", textDecoration: "underline" }} onClick={() => startCamera(task._id)}>Retake Photo</button>
                      
                      <textarea 
                        style={styles.input} 
                        rows="3" 
                        placeholder="Explain what you did to fix it..." 
                        required 
                        value={workerMessage} 
                        onChange={e => setWorkerMessage(e.target.value)} 
                      />
                      
                      <button type="submit" style={styles.btnGreen}>✅ Submit Completion</button>
                      <button type="button" style={{ background: "none", border: "none", color: "#64748b", marginTop: "10px", width: "100%", fontWeight: "bold" }} onClick={() => { setActiveTaskId(null); setPreview(null); }}>Cancel</button>
                    </form>
                  )}
                  <canvas ref={canvasRef} style={{ display: "none" }} />
                </div>
              ) : (
                <button style={styles.btnGreen} onClick={() => setActiveTaskId(task._id)}>
                  🛠️ Resolve Task
                </button>
              )
            ) : (
              // Task is already completed
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ background: "#f0fdf4", padding: "15px", borderRadius: "12px", border: "1px solid #bbfcbd", textAlign: "center" }}>
                  <span style={{ fontSize: "1.5rem" }}>✅</span>
                  <p style={{ color: "#166534", fontWeight: "700", margin: "5px 0" }}>Task Completed</p>
                  <p style={{ color: "#166534", fontSize: "0.85rem", margin: 0 }}>Resolution submitted successfully.</p>
                </div>

                {/* 🚀 NEW: Citizen Feedback Display */}
                {task.feedbacks && task.feedbacks.length > 0 && (
                  <div style={{ background: "#fffbeb", padding: "15px", borderRadius: "12px", border: "1px solid #fde68a" }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#b45309", fontSize: "0.95rem" }}>⭐ Citizen Feedback</h4>
                    {task.feedbacks.map((fb, idx) => (
                      <div key={idx} style={{ marginBottom: idx !== task.feedbacks.length - 1 ? "10px" : "0" }}>
                        <div style={{ color: "#f59e0b", fontSize: "1.2rem", letterSpacing: "2px" }}>
                          {"★".repeat(fb.rating)}{"☆".repeat(5 - fb.rating)}
                        </div>
                        {fb.text && (
                          <p style={{ margin: "5px 0 0 0", color: "#78350f", fontSize: "0.9rem", fontStyle: "italic" }}>
                            "{fb.text}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}