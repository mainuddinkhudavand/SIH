import React from "react";
import { FaTimes, FaGlobe, FaLayerGroup, FaTractor, FaMapMarkedAlt, FaShieldAlt, FaCheckCircle } from "react-icons/fa";

export default function GisMapModal({ isOpen, onClose, surveyNumber = "SRV-1001", landDetails = {} }) {
  if (!isOpen) return null;

  const srvNum = surveyNumber || landDetails.surveyNumber || "SRV-1001";
  const acres = landDetails.landAreaAcres || landDetails.plotAreaSize || "3.5 Acres";
  const landType = landDetails.landClassification || landDetails.usageType || "Agricultural (Irrigated)";
  const location = landDetails.plotLocation || landDetails.address || "Gram Panchayat Sector Zone";

  // Generate pseudo-coordinates based on Survey #
  const srvInt = parseInt(srvNum.replace(/\D/g, "") || "1001", 10);
  const lat = (19.8762 + (srvInt % 50) * 0.0025).toFixed(4);
  const lng = (75.3431 + (srvInt % 30) * 0.0031).toFixed(4);

  return (
    <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}>
      <div style={{ background: "#ffffff", borderRadius: "24px", maxWidth: "900px", width: "100%", maxHeight: "90vh", overflowY: "auto", border: "2px solid #38bdf8", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)" }}>
        
        {/* Modal Header */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #0284c7 100%)", color: "white", padding: "20px 24px", borderRadius: "22px 22px 0 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ background: "#38bdf8", color: "#0f172a", width: "38px", height: "38px", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>
              <FaGlobe />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#ffffff" }}>
                🗺️ Bhuvan GIS Satellite Parcel Map Visualizer
              </h3>
              <p style={{ margin: "2px 0 0 0", color: "#bae6fd", fontSize: "0.82rem" }}>
                National Remote Sensing Centre (NRSC) Geo-Spatial Boundary Layer • Parcel {srvNum}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none", width: "36px", height: "36px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "24px" }}>
          
          {/* Simulated Satellite Map Screen */}
          <div style={{ background: "#064e3b", borderRadius: "16px", height: "320px", position: "relative", overflow: "hidden", border: "3px solid #0284c7", boxShadow: "inset 0 0 20px rgba(0,0,0,0.6)", marginBottom: "20px" }}>
            
            {/* Grid overlay lines */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundImage: "radial-gradient(#38bdf8 1px, transparent 1px)", backgroundSize: "30px 30px", opacity: 0.3 }}></div>

            {/* Satellite Parcel Boundary Polygon */}
            <div style={{ position: "absolute", top: "25%", left: "30%", width: "40%", height: "50%", border: "3px dashed #facc15", background: "rgba(250, 204, 21, 0.25)", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#ffffff", boxShadow: "0 0 15px rgba(250, 204, 21, 0.5)" }}>
              <div style={{ background: "#78350f", color: "#fef3c7", padding: "4px 12px", borderRadius: "20px", fontSize: "0.82rem", fontWeight: "900", marginBottom: "4px" }}>
                PARCEL {srvNum}
              </div>
              <div style={{ fontSize: "0.85rem", fontWeight: "800", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                {acres} • {landType}
              </div>
              <div style={{ fontSize: "0.75rem", opacity: 0.9 }}>
                GPS: {lat}° N, {lng}° E
              </div>
            </div>

            {/* Geo Map Controls Overlay */}
            <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(15, 23, 42, 0.85)", color: "white", padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaLayerGroup style={{ color: "#38bdf8" }} /> Layer: NRSC High-Res Satellite 2026
            </div>

            <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(15, 23, 42, 0.85)", color: "#4ade80", padding: "8px 14px", borderRadius: "8px", fontSize: "0.78rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaCheckCircle /> Boundaries Verified Clear
            </div>
          </div>

          {/* Parcel Metadata Specs */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", background: "#f8fafc", padding: "18px", borderRadius: "14px", border: "1px solid #cbd5e1" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase" }}>Survey Parcel ID</span>
              <div style={{ fontSize: "1.05rem", fontWeight: "900", color: "#0284c7" }}>{srvNum}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase" }}>Land Holding Size</span>
              <div style={{ fontSize: "1.05rem", fontWeight: "900", color: "#0f172a" }}>{acres}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase" }}>Land Classification</span>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#047857" }}>{landType}</div>
            </div>

            <div>
              <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "800", textTransform: "uppercase" }}>Geo-Location</span>
              <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#334155" }}>{location}</div>
            </div>
          </div>

          {/* Close Button */}
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button
              onClick={onClose}
              style={{ background: "#0284c7", color: "white", border: "none", padding: "10px 24px", borderRadius: "10px", fontWeight: "800", cursor: "pointer", fontSize: "0.9rem" }}
            >
              Close GIS Map Viewer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
