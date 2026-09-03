import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import API from "../../services/api";
import { indiaStatesAndDistricts } from "../../constants/indiaStatesDistricts";

const categoryColors = {
  "Streetlights / Electricity": "#eab308",
  "Streetlights/ Electricity": "#eab308",
  "Water Supply / Leakages": "#0284c7",
  "Water supply/leakages": "#0284c7",
  "Roads / Potholes": "#ea580c",
  "Roads/potholes": "#ea580c",
  "Garbage Collection / Waste Management": "#16a34a",
  "Garbage collection/ Waste Management": "#16a34a",
  "Public Toilets": "#8b5cf6",
  "Public toilets": "#8b5cf6",
  "Parks": "#10b981",
  "Public Facilities": "#6366f1",
  "Public facilities": "#6366f1",
  "Other": "#ec4899",
  "General Utility": "#64748b"
};


// Complaint Pin Marker Icon (Red Pin)
const complaintIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Admin-Created Department Office Marker Icon (Green Building)
const departmentIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Map View Recenter Helper Component
function RecenterMap({ lat, lon }) {
  const map = useMap();
  React.useEffect(() => {
    if (lat && lon && lat !== 0 && lon !== 0) {
      map.setView([lat, lon], 11);
    }
  }, [lat, lon, map]);
  return null;
}

export default function HeatmapView() {
  const [points, setPoints] = useState([]);
  const [departmentMarkers, setDepartmentMarkers] = useState([]);
  const [adminCreatedDepartments, setAdminCreatedDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cascading Selection Controls
  const [selectedState, setSelectedState] = useState("All");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // State List (All Indian States & UTs)
  const stateNames = Object.keys(indiaStatesAndDistricts);

  // Dependent Districts List for the selected State
  const availableDistricts = selectedState !== "All" && indiaStatesAndDistricts[selectedState]
    ? indiaStatesAndDistricts[selectedState]
    : [];

  // Reset district selection when state changes
  const handleStateChange = (e) => {
    const newState = e.target.value;
    setSelectedState(newState);
    setSelectedDistrict("All"); // Reset district
  };

  useEffect(() => {
    const fetchHeatmapData = async () => {
      // Do not fetch or display markers until a District is selected
      if (selectedDistrict === "All") {
        setPoints([]);
        setDepartmentMarkers([]);
        setLoading(false);

        // Fetch created departments list for the dropdown
        try {
          const deptRes = await API.get("/admin/departments");
          setAdminCreatedDepartments(deptRes.data || []);
        } catch (e) {
          console.error("Fetch depts list error:", e);
        }
        return;
      }

      try {
        setLoading(true);
        const res = await API.get("/admin/analytics/heatmap", {
          params: {
            state: selectedState,
            district: selectedDistrict,
            department: selectedDepartment
          }
        });

        if (res.data.success) {
          setDepartmentMarkers(res.data.departmentMarkers || []);
          if (res.data.departments) {
            setAdminCreatedDepartments(res.data.departments);
          }

          // 🚀 Show complaint pins ONLY after a specific department is selected
          if (selectedDepartment !== "All") {
            setPoints(res.data.points || []);
          } else {
            setPoints([]); // Hide complaint pins when All Departments is selected
          }
        }
      } catch (err) {
        console.error("Failed to load map analytics", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmapData();
  }, [selectedState, selectedDistrict, selectedDepartment]);

  const filteredPoints = points;


  // Dynamic Map Center Calculation
  let centerLat = 20.5937;
  let centerLng = 78.9629;

  if (filteredPoints.length > 0 && filteredPoints[0].lat !== 0) {
    centerLat = filteredPoints[0].lat;
    centerLng = filteredPoints[0].lng;
  } else if (departmentMarkers.length > 0) {
    centerLat = departmentMarkers[0].lat;
    centerLng = departmentMarkers[0].lng;
  }

  return (
    <div style={{ background: "#ffffff", borderRadius: "14px", padding: "24px", boxShadow: "0 6px 18px rgba(0,0,0,0.06)", marginBottom: "2rem", border: "1px solid #e2e8f0" }}>
      
      {/* Header Bar */}
      <div style={{ marginBottom: "18px" }}>
        <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1.35rem", fontWeight: "700" }}>
          🗺️ State & District GIS Infrastructure Map
        </h3>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.85rem" }}>
          Interactive state-district cascading filter mapping raised complaints and admin-created department headquarters
        </p>
      </div>

      {/* Cascading Filter Controls Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px", marginBottom: "18px", background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
        
        {/* 1. 🇮🇳 State Dropdown */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
            🇮🇳 Select State / UT:
          </label>
          <select
            value={selectedState}
            onChange={handleStateChange}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: "600", color: "#0f172a", backgroundColor: "#fff" }}
          >
            <option value="All">All States / UTs</option>
            {stateNames.map((st, i) => (
              <option key={i} value={st}>{st}</option>
            ))}
          </select>
        </div>

        {/* 2. 📍 District Dropdown (Cascading based on Selected State) */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
            📍 Select District:
          </label>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            disabled={selectedState === "All"}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: "600", color: "#0f172a", backgroundColor: selectedState === "All" ? "#e2e8f0" : "#fff" }}
          >
            <option value="All">{selectedState === "All" ? "Select a State First" : "All Districts in " + selectedState}</option>
            {availableDistricts.map((dist, i) => (
              <option key={i} value={dist}>{dist}</option>
            ))}
          </select>
        </div>

        {/* 3. 🏢 Department Dropdown (Shows ONLY Admin-Created Departments) */}
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>
            🏢 Created Departments:
          </label>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            disabled={selectedDistrict === "All"}
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", fontWeight: "600", color: "#0f172a", backgroundColor: selectedDistrict === "All" ? "#e2e8f0" : "#fff" }}
          >
            <option value="All">{selectedDistrict === "All" ? "Select District First" : "All Created Departments in " + selectedDistrict}</option>
            {adminCreatedDepartments.map((d) => (
              <option key={d.id || d._id} value={d.id || d._id}>{d.name} ({d.district})</option>
            ))}
          </select>
        </div>

      </div>

      {/* Dynamic Status / Map Instruction Banner */}
      {selectedDistrict !== "All" && (
        <div style={{ marginBottom: "14px", padding: "10px 14px", borderRadius: "8px", backgroundColor: selectedDepartment === "All" ? "#f0f9ff" : "#fefce8", border: `1px solid ${selectedDepartment === "All" ? "#bae6fd" : "#fef08a"}`, color: selectedDepartment === "All" ? "#0369a1" : "#a16207", fontSize: "0.85rem", fontWeight: "600" }}>
          {selectedDepartment === "All"
            ? `🏢 District [${selectedDistrict}] selected. Displaying green department office markers. Select a department above to reveal assigned complaint pins.`
            : `📌 Department selected. Displaying assigned citizen complaint pins on the GIS Map.`}
        </div>
      )}


      {/* Map Marker Legend */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "15px", fontSize: "0.8rem", color: "#475569", background: "#f1f5f9", padding: "8px 14px", borderRadius: "8px" }}>
        <span>📍 <strong>Red Pin Markers:</strong> Raised Citizen Complaints</span>
        <span>🏢 <strong>Green Building Markers:</strong> Admin-Created Department Offices</span>
        <span>🟢 <strong>Green Circle:</strong> 🗑️ Garbage collection/ Waste Management Geofence Density</span>
      </div>


      {selectedDistrict === "All" ? (
        <div style={{ height: "380px", width: "100%", borderRadius: "12px", background: "#f8fafc", border: "2px dashed #cbd5e1", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "8px" }}>🗺️</div>
          <h3 style={{ margin: "0 0 6px 0", color: "#0f172a", fontWeight: "800" }}>Select a State & District to Load Map Data</h3>
          <p style={{ margin: 0, color: "#64748b", maxWidth: "520px", fontSize: "0.9rem", lineHeight: "1.5" }}>
            Please select a <strong>State</strong> and <strong>District</strong> from the dropdown controls above to display municipal department offices and raised citizen complaints on the map.
          </p>
        </div>
      ) : loading ? (
        <p style={{ padding: "60px", textAlign: "center", color: "#64748b" }}>Loading district GIS map data...</p>
      ) : (
        <div style={{ height: "480px", width: "100%", borderRadius: "12px", overflow: "hidden", border: "1px solid #cbd5e1" }}>

          <MapContainer center={[centerLat, centerLng]} zoom={selectedDistrict !== "All" ? 11 : selectedState !== "All" ? 7 : 5} style={{ height: "100%", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <RecenterMap lat={centerLat} lon={centerLng} />

            {/* 🏢 1. Render Admin-Created Department Office Markers */}
            {departmentMarkers.map((dept) => (
              <Marker key={`dept-${dept.id}`} position={[dept.lat, dept.lng]} icon={departmentIcon}>
                <Popup>
                  <div style={{ minWidth: "190px" }}>
                    <h4 style={{ margin: "0 0 4px 0", color: "#16a34a" }}>🏢 {dept.name}</h4>
                    <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#334155" }}>
                      State: <strong>{dept.state}</strong><br />
                      District: <strong>{dept.district}</strong><br />
                      Contact Email: {dept.email}<br />
                      Coverage PIN: {dept.pincode}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* 📍 2. Render Raised Citizen Complaint Markers */}
            {filteredPoints.map((pt) => {
              const color = categoryColors[pt.category] || "#64748b";
              return (
                <React.Fragment key={pt.id}>
                  {/* Heatmap Density Circle */}
                  <CircleMarker
                    center={[pt.lat, pt.lng]}
                    radius={pt.urgency === "Critical" ? 24 : pt.urgency === "High" ? 18 : 12}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.35,
                      weight: 2
                    }}
                  />
                  {/* Raised Complaint Pin Marker */}
                  <Marker position={[pt.lat, pt.lng]} icon={complaintIcon}>
                    <Popup>
                      <div style={{ minWidth: "200px" }}>
                        <h4 style={{ margin: "0 0 6px 0", color: "#0f172a" }}>📌 {pt.title}</h4>
                        <div style={{ fontSize: "0.8rem", color: "#475569", lineHeight: "1.4" }}>
                          <span>Category: <strong>{pt.category}</strong></span><br />
                          <span>District: <strong>{pt.district}</strong></span><br />
                          <span>Dept Assigned: <strong>{pt.departmentName}</strong></span><br />
                          <span>Status: <strong style={{ color: pt.status === "Completed" ? "green" : "orange" }}>{pt.status}</strong></span><br />
                          {pt.duplicateCount > 1 && (
                            <span style={{ color: "#b45309", fontWeight: "bold" }}>🔥 {pt.duplicateCount} Citizens Reported This</span>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                </React.Fragment>
              );
            })}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
