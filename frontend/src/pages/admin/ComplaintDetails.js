import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function ComplaintDetails() {
  const { id } = useParams();
  const [complaint, setComplaint] = useState(null);
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/admin/complaints/${id}`);
        setComplaint(res.data);
      } catch (err) {
        console.error("Error fetching complaint:", err);
      }
    };
    fetchComplaint();
  }, [id]);

  if (!complaint) return <p>Loading complaint details...</p>;

  return (
    <div style={{ padding: "2rem" }}>
      <h2>{complaint.title}</h2>
      <p><strong>Description:</strong> {complaint.description}</p>
      <p><strong>Status:</strong> {complaint.status}</p>
      <p><strong>User:</strong> {complaint.user?.name} ({complaint.user?.email})</p>
      <p><strong>Location:</strong> {complaint.location?.address}</p>

      {complaint.location?.lat && complaint.location?.lng && (
        <div style={{ marginTop: "1rem" }}>
          <MapContainer
            center={[complaint.location.lat, complaint.location.lng]}
            zoom={14}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <Marker position={[complaint.location.lat, complaint.location.lng]}>
              <Popup>
                {complaint.location.address || "Complaint Location"}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      )}
    </div>
  );
}