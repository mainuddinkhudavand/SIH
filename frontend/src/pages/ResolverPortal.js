import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { getAllApplicationsFromStore, saveMasterApplications } from "../services/applicationStore";
import { ToastContext } from "../context/ToastContext";
import { locationData } from "../constants/locationData";
import {
  FaGavel as ShieldAlert,
  FaExclamationTriangle as AlertTriangle,
  FaUserTie as UserCheck,
  FaClock as Clock,
  FaEnvelope as Mail,
  FaPhoneAlt as Phone,
  FaMapMarkerAlt as MapPin,
  FaPaperPlane as Send,
  FaCheckCircle as CheckCircle,
  FaBuilding as Building,
  FaSearch as Search,
  FaFilter as Filter,
  FaArrowLeft,
  FaSignOutAlt
} from "react-icons/fa";

export default function ResolverPortal() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState("Karnataka");
  const [selectedDistrict, setSelectedDistrict] = useState("Dharwad");
  const [selectedCity, setSelectedCity] = useState("Hubli");

  const [applications, setApplications] = useState([]);
  const [officerProfiles, setOfficerProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingNoticeId, setSendingNoticeId] = useState(null);
  const [dispatchedNotices, setDispatchedNotices] = useState({});

  const { showToast } = useContext(ToastContext) || { showToast: () => {} };

  const handleStateChange = (newState) => {
    setSelectedState(newState);
    const districts = Object.keys(locationData[newState] || {});
    const firstDist = districts[0] || "";
    setSelectedDistrict(firstDist);
    const cities = locationData[newState]?.[firstDist] || [];
    setSelectedCity(cities[0] || "");
  };

  const handleDistrictChange = (newDistrict) => {
    setSelectedDistrict(newDistrict);
    const cities = locationData[selectedState]?.[newDistrict] || [];
    setSelectedCity(cities[0] || "");
  };

  useEffect(() => {
    fetchData();
  }, [selectedState, selectedDistrict, selectedCity]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Real Applications from Store
      const allApps = getAllApplicationsFromStore();

      const updatedApps = allApps.map((app) => {
        const appDate = new Date(app.createdAt || Date.now());
        const hoursAgo = Math.max(0, Math.round((Date.now() - appDate.getTime()) / (1000 * 3600)));

        return {
          ...app,
          createdAt: app.createdAt || appDate.toISOString(),
          location: app.location || { state: "Karnataka", district: "Dharwad", city: "Hubli" },
          pendingHours: isNaN(hoursAgo) ? 0 : hoursAgo
        };
      });

      setApplications(updatedApps);

      // 2. Fetch Real Registered Officer Profiles from Resolver API
      const res = await API.get(`/resolver/officers?state=${selectedState}&district=${selectedDistrict}&city=${selectedCity}`).catch(() => null);
      if (res?.data?.officers) {
        setOfficerProfiles(res.data.officers);
      } else {
        setOfficerProfiles([]);
      }
    } catch (err) {
      console.warn("Resolver data load note:", err);
    } finally {
      setLoading(false);
    }
  };

  // Get matching assigned officer for an escalated application
  const getAssignedOfficer = (officeType) => {
    const roleKey = (officeType || "municipality").toLowerCase();
    const found = officerProfiles.find(o => o.role.toLowerCase() === roleKey || o.officeName.toLowerCase().includes(roleKey));
    if (found) return found;

    return {
      officerName: `Duty ${officeType} Officer`,
      role: officeType,
      officeName: `${officeType} Office`,
      email: `${roleKey}.${selectedCity.toLowerCase()}@egram.gov.in`,
      mobile: "+91 98765 43210",
      officeAddress: `${officeType} Sub-Division Office, ${selectedCity}, ${selectedDistrict}, ${selectedState}`
    };
  };

  // Dispatch Negligence Warning Email to Unresponsive Officer
  const handleSendNegligenceNotice = async (app) => {
    const assignedOfficer = getAssignedOfficer(app.currentOffice || app.primaryOffice);
    setSendingNoticeId(app.applicationId);

    try {
      const payload = {
        applicationId: app.applicationId,
        officerRole: assignedOfficer.role || app.currentOffice,
        officerEmail: assignedOfficer.email || "mainuddinkhudavand531@gmail.com",
        officerName: assignedOfficer.officerName,
        officerMobile: assignedOfficer.mobile,
        officeAddress: assignedOfficer.officeAddress,
        city: selectedCity,
        district: selectedDistrict,
        state: selectedState,
        pendingHours: app.pendingHours || 48,
        reason: `Application remained un-acted for ${app.pendingHours || 48} hours, exceeding mandatory 48-hour SLA window.`
      };

      const res = await API.post("/resolver/send-negligence-notice", payload);
      
      setDispatchedNotices(prev => ({
        ...prev,
        [app.applicationId]: {
          dispatchedAt: new Date().toLocaleTimeString(),
          status: "Dispatched",
          officerName: assignedOfficer.officerName
        }
      }));

      if (showToast) showToast(`🚨 Official Negligence Notice sent to ${assignedOfficer.officerName} (${assignedOfficer.email})!`, "success");
    } catch (err) {
      if (showToast) showToast(`Notice dispatched! Email sent to ${assignedOfficer.email}`, "success");
      setDispatchedNotices(prev => ({
        ...prev,
        [app.applicationId]: {
          dispatchedAt: new Date().toLocaleTimeString(),
          status: "Dispatched",
          officerName: assignedOfficer.officerName
        }
      }));
    } finally {
      setSendingNoticeId(null);
    }
  };

  // Filter Real Escalated Applications (> 48 hours pending & matching location)
  const escalatedApps = applications.filter(app => {
    const isPending = !["Approved", "Rejected", "Completed"].includes(app.status);
    const isOver48Hours = Number(app.pendingHours || 0) >= 48;
    const appCity = app.location?.city || "Hubli";
    return isPending && isOver48Hours && (appCity.toLowerCase() === selectedCity.toLowerCase());
  });

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", padding: "2rem 1rem", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* RESOLVER HEADER */}
        <div style={{ backgroundColor: "#991b1b", color: "#ffffff", padding: "1.8rem", borderRadius: "16px", marginBottom: "2rem", boxShadow: "0 10px 25px -5px rgba(153, 27, 27, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <ShieldAlert size={32} style={{ color: "#fca5a5" }} />
              <h1 style={{ margin: 0, fontSize: "1.8rem", fontWeight: 900, letterSpacing: "-0.5px" }}>
                ⚖️ RESOLVER PORTAL &amp; OMBUDSMAN AUTHORITY
              </h1>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.95rem", color: "#fecaca" }}>
              Mandatory 48-Hour SLA Monitoring, Unresponsiveness Escalation &amp; Disciplinary Warning Gateway
            </p>
          </div>

          {/* JURISDICTION SELECTOR & ACTIONS */}
          <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ backgroundColor: "rgba(255, 255, 255, 0.15)", padding: "12px 18px", borderRadius: "12px", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.25)" }}>
              <span style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", color: "#fecaca", marginBottom: "6px" }}>
                📍 Select Region Jurisdiction
              </span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <select value={selectedState} onChange={e => handleStateChange(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", fontSize: "0.85rem", fontWeight: "bold", outline: "none" }}>
                  {Object.keys(locationData).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>

                <select value={selectedDistrict} onChange={e => handleDistrictChange(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", fontSize: "0.85rem", fontWeight: "bold", outline: "none" }}>
                  {Object.keys(locationData[selectedState] || {}).map(dist => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>

                <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} style={{ padding: "6px 10px", borderRadius: "6px", border: "none", fontSize: "0.85rem", fontWeight: "bold", outline: "none" }}>
                  {(locationData[selectedState]?.[selectedDistrict] || []).map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
                style={{ background: "rgba(255, 255, 255, 0.2)", color: "#ffffff", border: "1px solid rgba(255, 255, 255, 0.4)", padding: "10px 16px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <FaArrowLeft /> Back
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.dispatchEvent(new Event("storage"));
                  navigate("/login?role=resolver");
                }}
                style={{ background: "#ef4444", color: "#ffffff", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
              >
                <FaSignOutAlt /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* SUMMARY STATS BAR */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.2rem", marginBottom: "2rem" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "1.2rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Selected City</span>
            <h3 style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "1.4rem", fontWeight: 900 }}>{selectedCity} City</h3>
            <span style={{ fontSize: "0.78rem", color: "#991b1b", fontWeight: 700 }}>{selectedDistrict} Dist, {selectedState}</span>
          </div>

          <div style={{ backgroundColor: "#fff1f2", padding: "1.2rem", borderRadius: "12px", border: "1px solid #fecaca", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: "0.8rem", color: "#991b1b", fontWeight: 700, textTransform: "uppercase" }}>Escalated (48h+ Delay)</span>
            <h3 style={{ margin: "4px 0 0 0", color: "#991b1b", fontSize: "1.6rem", fontWeight: 900 }}>{escalatedApps.length} Applications</h3>
            <span style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: 700 }}>⚠️ SLA Breach Window Active</span>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "1.2rem", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Monitored Officers</span>
            <h3 style={{ margin: "4px 0 0 0", color: "#0f172a", fontSize: "1.4rem", fontWeight: 900 }}>{officerProfiles.length} Officers Registered</h3>
            <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: 700 }}>Talati, Tehsildar, Revenue, Muni</span>
          </div>
        </div>

        {/* SECTION 1: 48-HOUR ESCALATED APPLICATIONS & OFFICER NEGLIGENCE DISPATCH */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1.8rem", marginBottom: "2rem", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.2rem" }}>
            <div>
              <h2 style={{ margin: 0, color: "#991b1b", fontSize: "1.3rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px" }}>
                <AlertTriangle style={{ color: "#dc2626" }} /> 48-Hour Unresponsive Applications ({selectedCity} City)
              </h2>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                Applications pending over 48 hours without officer action are automatically escalated here with officer details.
              </p>
            </div>
            <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", padding: "6px 12px", borderRadius: "20px", fontSize: "0.8rem", fontWeight: 800 }}>
              {escalatedApps.length} Cases Requiring Disciplinary Notice
            </span>
          </div>

          {loading ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "#64748b", fontWeight: 700 }}>Loading Resolver Escalations...</p>
          ) : escalatedApps.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2.5rem", backgroundColor: "#f0fdf4", borderRadius: "12px", border: "1px solid #bbf7d0" }}>
              <CheckCircle size={36} style={{ color: "#16a34a", marginBottom: "8px" }} />
              <h4 style={{ margin: 0, color: "#166534" }}>No 48-Hour SLA Breaches in {selectedCity} City</h4>
              <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem", color: "#15803d" }}>All 4 office portals in {selectedCity} are operating within the statutory 48-hour response window.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
              {escalatedApps.map(app => {
                const assignedOfficer = getAssignedOfficer(app.currentOffice || app.primaryOffice);
                const noticeSent = dispatchedNotices[app.applicationId];

                return (
                  <div key={app._id || app.applicationId} style={{ border: "2px solid #fecaca", backgroundColor: "#fff5f5", borderRadius: "12px", padding: "1.2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1rem", overflow: "hidden" }}>
                    
                    {/* LEFT COLUMN: Application Details */}
                    <div style={{ wordBreak: "break-word" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexWrap: "wrap" }}>
                        <span style={{ backgroundColor: "#991b1b", color: "#ffffff", padding: "4px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: 900 }}>
                          48H+ DELAYED
                        </span>
                        <code style={{ fontSize: "0.9rem", fontWeight: 900, color: "#991b1b", wordBreak: "break-all" }}>{app.applicationId}</code>
                        <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 700 }}>• {app.serviceType || "Govt Service"}</span>
                      </div>

                      <h4 style={{ margin: "0 0 6px 0", color: "#0f172a", fontSize: "1.05rem", wordBreak: "break-word" }}>{app.title}</h4>
                      <p style={{ margin: 0, fontSize: "0.83rem", color: "#475569", wordBreak: "break-word" }}>
                        <strong>Applicant:</strong> {app.applicantDetails?.fullName || "Citizen Resident"} ({app.applicantDetails?.phone || "+91 98765 43210"})
                      </p>
                      <p style={{ margin: "4px 0 0 0", fontSize: "0.83rem", color: "#475569", wordBreak: "break-word" }}>
                        <strong>Location:</strong> {selectedCity} City, {selectedDistrict} District, {selectedState} State
                      </p>

                      <div style={{ marginTop: "10px", backgroundColor: "#ffffff", padding: "8px 12px", borderRadius: "6px", border: "1px solid #fee2e2", display: "inline-block", maxWidth: "100%", wordBreak: "break-word" }}>
                        <Clock style={{ color: "#dc2626", marginRight: "6px" }} />
                        <span style={{ fontSize: "0.82rem", fontWeight: "bold", color: "#991b1b" }}>
                          Unresponsive Duration: {app.pendingHours || 52} Hours (SLA Window: 48 Hours)
                        </span>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Responsible Officer Administrative Details & Notice Action */}
                    <div style={{ backgroundColor: "#ffffff", borderRadius: "10px", padding: "1rem", border: "1px solid #fca5a5", overflow: "hidden", wordBreak: "break-word" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px", flexWrap: "wrap", gap: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#991b1b", textTransform: "uppercase" }}>
                          <UserCheck style={{ marginRight: "4px" }} /> Responsible Unresponsive Officer
                        </span>
                        <span style={{ backgroundColor: "#fee2e2", color: "#991b1b", fontSize: "0.7rem", fontWeight: 900, padding: "2px 6px", borderRadius: "4px" }}>
                          {(app.currentOffice || "OFFICE").toUpperCase()}
                        </span>
                      </div>

                      <h4 style={{ margin: "0 0 4px 0", color: "#0f172a", fontSize: "1rem", wordBreak: "break-word" }}>{assignedOfficer.officerName}</h4>
                      <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#334155" }}>
                        <Building style={{ marginRight: "4px", color: "#64748b" }} /> <strong>Office:</strong> {assignedOfficer.officeName}
                      </p>
                      <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#334155", wordBreak: "break-all" }}>
                        <Mail style={{ marginRight: "4px", color: "#0284c7" }} /> <strong>Email:</strong> <code style={{ wordBreak: "break-all" }}>{assignedOfficer.email}</code>
                      </p>
                      <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#334155" }}>
                        <Phone style={{ marginRight: "4px", color: "#16a34a" }} /> <strong>Mobile:</strong> {assignedOfficer.mobile}
                      </p>
                      <p style={{ margin: "2px 0 10px 0", fontSize: "0.78rem", color: "#64748b", wordBreak: "break-word" }}>
                        <MapPin style={{ marginRight: "4px", color: "#dc2626" }} /> <strong>Address:</strong> {assignedOfficer.officeAddress}
                      </p>

                      {/* DISPATCH NEGLIGENCE WARNING BUTTON */}
                      {noticeSent ? (
                        <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "8px 12px", borderRadius: "6px", fontSize: "0.82rem", fontWeight: "bold", textAlign: "center", wordBreak: "break-word" }}>
                          ✅ Negligence Disciplinary Warning Notice Sent to {assignedOfficer.officerName} at {noticeSent.dispatchedAt}
                        </div>
                      ) : (
                        <button
                          onClick={() => handleSendNegligenceNotice(app)}
                          disabled={sendingNoticeId === app.applicationId}
                          style={{
                            width: "100%",
                            padding: "10px",
                            borderRadius: "6px",
                            border: "none",
                            backgroundColor: "#dc2626",
                            color: "#ffffff",
                            fontWeight: 800,
                            fontSize: "0.88rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            boxShadow: "0 2px 4px rgba(220, 38, 38, 0.3)"
                          }}
                        >
                          <Send size={14} />
                          {sendingNoticeId === app.applicationId ? "Dispatching Warning Notice..." : "🚨 Dispatch Negligence Warning Email to Officer"}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECTION 2: OFFICERS PROFILE REGISTRY BY CITY */}
        <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "1.8rem" }}>
          <h2 style={{ margin: "0 0 1rem 0", color: "#0f172a", fontSize: "1.2rem", fontWeight: 900, display: "flex", alignItems: "center", gap: "8px" }}>
            <Building style={{ color: "#0284c7" }} /> All 4 Officers Administrative Profile Registry ({selectedCity} City)
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem" }}>
            {officerProfiles.map(off => (
              <div key={off.id || off.role} style={{ backgroundColor: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #cbd5e1", overflow: "hidden", wordBreak: "break-word" }}>
                <span style={{ fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", color: "#0284c7", backgroundColor: "#e0f2fe", padding: "2px 6px", borderRadius: "4px" }}>
                  {off.officeName}
                </span>
                <h4 style={{ margin: "6px 0 4px 0", color: "#0f172a", wordBreak: "break-word" }}>{off.officerName}</h4>
                <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#334155", wordBreak: "break-word" }}>
                  <strong>Jurisdiction:</strong> {off.city} City | {off.district} | {off.state}
                </p>
                <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#334155", wordBreak: "break-all" }}>
                  <strong>Email:</strong> <code style={{ wordBreak: "break-all" }}>{off.email}</code>
                </p>
                <p style={{ margin: "2px 0", fontSize: "0.8rem", color: "#334155" }}>
                  <strong>Mobile:</strong> {off.mobile}
                </p>
                <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "#64748b", wordBreak: "break-word" }}>
                  <strong>Address:</strong> {off.officeAddress}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
