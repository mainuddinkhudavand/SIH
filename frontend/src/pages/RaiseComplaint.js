import React, { useState, useContext, useEffect, useRef } from 'react';
import API from '../services/api';
import { useNavigate } from 'react-router-dom';
import "./styles/Register.css";
import { useTranslation } from "react-i18next";
import Chatbot from "../components/Chatbot";
import { GrievanceContext } from "../context/GrievanceContext";
import { getGrievanceByKey } from "../constants/grievances";
import { ToastContext } from "../context/ToastContext";

// Leaflet imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// 1. ADD THIS PART RIGHT HERE (ABOVE YOUR MAIN COMPONENT)
function RecenterMap({ lat, lon }) {
  const map = useMap();
  React.useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], 15);
    }
  }, [lat, lon, map]);
  return null;
}

// ✅ Custom red marker icon
const RedIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function RaiseComplaint() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState({
    street: "",
    town: "",
    district: "",
    state: "",
    pin: ""
  });
  const [location, setLocation] = useState(null); 
  const [geoError, setGeoError] = useState("");
  const [locating, setLocating] = useState(false);
  const [pinError, setPinError] = useState("");

  // 🚀 Camera States
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const nav = useNavigate();
  const { t } = useTranslation();
  const { selectedGrievance, clearGrievance } = useContext(GrievanceContext);
  const { showToast } = useContext(ToastContext);

  const grievance = getGrievanceByKey(selectedGrievance);

  useEffect(() => {
    if (!selectedGrievance) {
      nav("/grievance");
    }
  }, [selectedGrievance, nav]);

  // 🚀 Logic to attach stream to video element once both exist
  useEffect(() => {
    if (isCameraOpen && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => console.error("Video play error:", err));
      };
    }
  }, [isCameraOpen, stream]);

  // 🚀 Camera Logic
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }, 
        audio: false 
      });
      setStream(mediaStream);
      setIsCameraOpen(true); 
      setPreview(null);
      setImageFile(null);
      getLocation(); // Auto-sync GPS
    } catch (err) {
      console.error("Camera Error:", err);
      showToast("Camera access denied. Please allow camera permissions.", "error");
    }
  };

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    // 🚀 Robust check: Video must be playing and have dimensions
    if (!video || video.videoWidth === 0 || video.readyState < 2) {
      showToast("Camera is still warming up, please wait a second...", "info");
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob((blob) => {
      if (!blob) {
        showToast("Failed to capture image. Try again.", "error");
        return;
      }
      const file = new File([blob], `evidence_${Date.now()}.jpg`, { type: "image/jpeg" });
      setImageFile(file);
      setPreview(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsCameraOpen(false);
    setStream(null);
  };

  const fetchAddressFromCoords = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        setAddress({
          street: addr.road || addr.neighbourhood || "",
          town: addr.city || addr.town || addr.village || "",
          district: addr.county || addr.state_district || "",
          state: addr.state || "",
          pin: addr.postcode || "",
        });
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation not supported.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLocation({ lat: latitude, lon: longitude });
        setGeoError("");
        setLocating(false);
        fetchAddressFromCoords(latitude, longitude);
      },
      (err) => {
        setGeoError("Location permission required for evidence.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const validatePin = (pin) => /^[0-9]{6}$/.test(pin);

  const submit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      showToast("Live photo evidence is required.", "error");
      return;
    }

    if (!validatePin(address.pin)) {
      setPinError("Invalid PIN code.");
      return;
    }

    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("grievance", selectedGrievance);
    formData.append("title", title);
    formData.append("description", description);
    formData.append("address", JSON.stringify(address));
    formData.append("location", JSON.stringify(location
      ? { type: "Point", coordinates: [location.lon, location.lat] }
      : { type: "Point", coordinates: [0, 0] }
    ));

    try {
      await API.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast(t("complaintSubmitted"), "success");
      clearGrievance();
      nav('/my-complaints');
    } catch (err) {
      showToast(err.response?.data?.message || t("complaintError"), "error");
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">{t("raiseComplaint")}</h2>

      {grievance && (
        <p style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          {t("selectedGrievance")}: <span style={{ marginRight: "0.5rem" }}>{grievance.icon}</span>
          <strong>{t(grievance.key)}</strong>
        </p>
      )}

      <form className="register-form" onSubmit={submit}>
        
        {/* 📸 CAMERA SECTION */}
        <div style={{ marginBottom: "1.5rem", textAlign: "center", border: "2px dashed #cbd5e1", padding: "15px", borderRadius: "12px", background: "#f8fafc" }}>
          <label style={{ display: "block", marginBottom: "10px", fontWeight: "bold", color: "#334155" }}>
            Step 1: Live Evidence Capture
          </label>

          {!isCameraOpen && !preview && (
            <button type="button" className="register-button" onClick={startCamera}>
              📸 Open Live Camera
            </button>
          )}

          {isCameraOpen && (
            <div style={{ position: "relative" }}>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ width: "100%", borderRadius: "8px", background: "#000", border: "3px solid #334155" }} 
              />
              <button 
                type="button" 
                onClick={takePhoto} 
                className="register-button" 
                style={{ marginTop: "15px", backgroundColor: "#ef4444", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2)" }}
              >
                Capture Photo
              </button>
            </div>
          )}

          {preview && (
            <div>
              <img src={preview} alt="Evidence" style={{ width: "100%", borderRadius: "8px", border: "3px solid #10b981" }} />
              <button 
                type="button" 
                onClick={startCamera} 
                style={{ background: "none", border: "none", color: "#3b82f6", cursor: "pointer", textDecoration: "underline", marginTop: "10px", fontWeight: "600" }}
              >
                Retake Photo
              </button>
            </div>
          )}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>

        <input className="register-input" value={title} onChange={e => setTitle(e.target.value)} placeholder={t("shortTitle")} required />
        <textarea className="register-input" value={description} onChange={e => setDescription(e.target.value)} placeholder={t("describeIssue")} required rows={4} />

        <div style={{ marginTop: "1rem" }}>
          <Chatbot onVoiceInput={(voiceText) => setDescription(voiceText)} />
        </div>

        {/* Address Inputs */}
        <input className="register-input" value={address.street} onChange={e => setAddress({ ...address, street: e.target.value })} placeholder={t("streetArea")} required />
        <input className="register-input" value={address.town} onChange={e => setAddress({ ...address, town: e.target.value })} placeholder={t("town")} required />
        <input className="register-input" value={address.district} onChange={e => setAddress({ ...address, district: e.target.value })} placeholder={t("District")} required />
        <input className="register-input" value={address.state} onChange={e => setAddress({ ...address, state: e.target.value })} placeholder={t("state")} required />
        <input className="register-input" value={address.pin} onChange={e => setAddress({ ...address, pin: e.target.value })} placeholder={t("pinCode")} required />
        {pinError && <p style={{ color: "red" }}>{pinError}</p>}

        <div className="location-section">
          <button type="button" className="register-button" onClick={getLocation}>
            {t("captureLocation")}
          </button>
          {locating && <p style={{ color: "blue" }}>🔄 Syncing GPS...</p>}
          {location && <div className="location-info">📍 {location.lat}, {location.lon}</div>}
          {geoError && <p style={{ color: "red" }}>{geoError}</p>}
        </div>

        {location && (
          <div style={{ marginTop: "1rem", height: "250px" }}>
            <MapContainer center={[location.lat, location.lon]} zoom={15} style={{ height: "100%", width: "100%", borderRadius: "10px" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              
              {/* ADD THIS LINE BELOW */}
              <RecenterMap lat={location.lat} lon={location.lon} />
              <Marker position={[location.lat, location.lon]} icon={RedIcon} draggable={true}
                eventHandlers={{
                  dragend: (e) => {
                    const { lat, lng } = e.target.getLatLng();
                    setLocation({ lat, lon: lng });
                    fetchAddressFromCoords(lat, lng);
                  },
                }}
              />
            </MapContainer>
          </div>
        )}

        <div className="submit-section" style={{ marginTop: "2rem" }}>
          <button type="submit" className="register-button" style={{ backgroundColor: "#059669" }}>
            {t("submitComplaint")}
          </button>
        </div>
      </form>
    </div>
  );
}