import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { FaHeartbeat, FaUserCheck, FaCertificate, FaHospital, FaCheckCircle, FaNetworkWired, FaPlus, FaSearch, FaCalculator, FaFileAlt, FaAward, FaArrowDown } from "react-icons/fa";

export default function HealthPortal() {
  const [activeTab, setActiveTab] = useState("vital");
  
  // Pension Queue State
  const [applications, setApplications] = useState([
    { _id: "PENS-101", applicationId: "GC-PENSION-4004", serviceType: "Senior / Widow Pension", applicantDetails: { fullName: "Rameshwar Prasad", phone: "+91 98765 12345", address: "Ward 4, Old Colony" }, status: "Approved", pensionAmount: "₹2,500 / Month", dbtStatus: "Bank Seeded (Aadhaar active)" },
    { _id: "PENS-102", applicationId: "GC-PENSION-4008", serviceType: "Widow Pension Scheme", applicantDetails: { fullName: "Sunita Devi", phone: "+91 98111 22233", address: "Ward 9, Civic Sector 2" }, status: "Under Review", pensionAmount: "₹2,500 / Month", dbtStatus: "Verification Pending" }
  ]);

  // Vital Records State (Birth & Death Certificates)
  const [vitalRecords, setVitalRecords] = useState([
    {
      id: "VITAL-B-101",
      certId: "CERT-BIRTH-8801",
      type: "Birth Certificate",
      subjectName: "Aarav Sharma",
      eventDate: "15-08-2025",
      location: "Civic General Hospital, Ward 4",
      informantName: "Pavan (Father)",
      digitalSealToken: "SEAL-BIRTH-994812",
      status: "Pending Registrar Verification"
    },
    {
      id: "VITAL-D-102",
      certId: "CERT-DEATH-9904",
      type: "Death Certificate",
      subjectName: "Rameshwar Prasad",
      eventDate: "10-07-2025",
      location: "LifeCare Multispecialty Hospital",
      informantName: "Sunita Devi (Informant)",
      digitalSealToken: "SEAL-DEATH-881203",
      status: "ISSUED (Cryptographic Seal Active)"
    }
  ]);

  // New Vital Record Form State
  const [certType, setCertType] = useState("Birth Certificate");
  const [subjectName, setSubjectName] = useState("Aarav Sharma");
  const [eventDate, setEventDate] = useState("2025-08-15");
  const [hospitalLocation, setHospitalLocation] = useState("Civic General Hospital, Ward 4");
  const [informantName, setInformantName] = useState("Pavan");

  const [ayushmanNumber, setAyushmanNumber] = useState("AYUSH-9904-8812");
  const [toastMsg, setToastMsg] = useState(null);

  const handleUpdatePensionStatus = (id, newStatus) => {
    setApplications(apps => apps.map(a => a._id === id ? { ...a, status: newStatus } : a));
    setToastMsg(`Pension request ${id} updated to ${newStatus}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleIssueAyushmanCard = () => {
    setToastMsg(`Ayushman Digital Health Card issued for Resident! Token: ${ayushmanNumber}`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateVitalRecord = (e) => {
    e.preventDefault();
    const newRecord = {
      id: `VITAL-${Math.floor(100 + Math.random() * 900)}`,
      certId: `CERT-${certType.startsWith("Birth") ? "BIRTH" : "DEATH"}-${Math.floor(1000 + Math.random() * 9000)}`,
      type: certType,
      subjectName,
      eventDate,
      location: hospitalLocation,
      informantName,
      digitalSealToken: `SEAL-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      status: "Pending Registrar Verification"
    };

    setVitalRecords([newRecord, ...vitalRecords]);
    setToastMsg(`Registered ${certType} request ${newRecord.certId}! Sent to Medical Registrar Queue.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleIssueVitalCertificate = (id) => {
    setVitalRecords(recs => recs.map(r => r.id === id ? { ...r, status: "ISSUED (Cryptographic Seal Active)" } : r));
    setToastMsg(`Approved & Issued Cryptographic Digital Certificate for ${id}! Archived in Vault.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div style={{ background: "#ecfdf5", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #047857 0%, #064e3b 100%)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(4, 120, 87, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ background: "#34d399", color: "#064e3b", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
                DEPARTMENTAL PORTAL PROVIDER (WELFARE &amp; HEALTH) 🔵
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaHeartbeat /> Social Welfare &amp; Health Department
              </h1>
              <p style={{ margin: 0, color: "#a7f3d0", fontSize: "0.95rem" }}>
                Processing provider for Senior/Widow Pension DBT, Ayushman Healthcare Enrollment &amp; Vital Certificate Issuance.
              </p>
            </div>

            <Link to="/govconnect" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaNetworkWired /> GovConnect Interop Core
            </Link>
          </div>
        </div>

        {toastMsg && (
          <div style={{ background: "#d1fae5", color: "#065f46", border: "1px solid #6ee7b7", padding: "14px 18px", borderRadius: "10px", fontWeight: "800", marginBottom: "20px" }}>
            {toastMsg}
          </div>
        )}

        {/* 3 Tabs Navigation */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "24px", paddingBottom: "4px" }}>
          {[
            { key: "vital", label: "📜 Birth & Death Certificates", icon: <FaCertificate /> },
            { key: "pension", label: "👴 Senior & Widow Pension DBT", icon: <FaUserCheck /> },
            { key: "ayushman", label: "🏥 Ayushman Healthcare Enrollment", icon: <FaHospital /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: activeTab === tab.key ? "2px solid #047857" : "1px solid #a7f3d0",
                background: activeTab === tab.key ? "#047857" : "#ffffff",
                color: activeTab === tab.key ? "#ffffff" : "#065f46",
                fontWeight: "800",
                fontSize: "0.9rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                whiteSpace: "nowrap"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 📜 TAB 1: BIRTH & DEATH CERTIFICATES (IN-DEPTH WORKSPACE) */}
        {activeTab === "vital" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Form & Workflow Pathway Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              
              {/* Certificate Intake Form */}
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #a7f3d0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#065f46", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaCertificate color="#047857" /> Register New Birth / Death Event
                </h3>

                <form onSubmit={handleCreateVitalRecord}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Certificate Type</label>
                    <select value={certType} onChange={e => setCertType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}>
                      <option value="Birth Certificate">Birth Certificate Registration</option>
                      <option value="Death Certificate">Death Certificate Registration</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Full Name of Child / Deceased</label>
                    <input type="text" value={subjectName} onChange={e => setSubjectName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Date of Event</label>
                      <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Informant / Parent Name</label>
                      <input type="text" value={informantName} onChange={e => setInformantName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Hospital / Place of Event</label>
                    <input type="text" value={hospitalLocation} onChange={e => setHospitalLocation(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                  </div>

                  <button type="submit" style={{ width: "100%", background: "#047857", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "900", cursor: "pointer" }}>
                    Submit Vital Record Registration
                  </button>
                </form>
              </div>

              {/* Vital Registration 5-Step Workflow */}
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #a7f3d0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#065f46", fontWeight: "800" }}>5-Step Vital Certificate Issuance Workflow</h3>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>1. Event Notification &amp; Application Intake</span>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>✓ Complete</span>
                  </div>

                  <div style={{ textAlign: "center", color: "#047857", fontSize: "0.8rem" }}><FaArrowDown /></div>

                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>2. Medical Registrar Verification</span>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>✓ Verified</span>
                  </div>

                  <div style={{ textAlign: "center", color: "#047857", fontSize: "0.8rem" }}><FaArrowDown /></div>

                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>3. GovConnect Identity &amp; Aadhaar Interop</span>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>✓ Matched</span>
                  </div>

                  <div style={{ textAlign: "center", color: "#047857", fontSize: "0.8rem" }}><FaArrowDown /></div>

                  <div style={{ background: "#ecfdf5", border: "1px solid #6ee7b7", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#065f46" }}>4. Cryptographic Digital Seal Generation</span>
                    <span style={{ background: "#d1fae5", color: "#065f46", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>Token Active</span>
                  </div>

                  <div style={{ textAlign: "center", color: "#047857", fontSize: "0.8rem" }}><FaArrowDown /></div>

                  <div style={{ background: "#d1fae5", border: "1px solid #34d399", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#064e3b" }}>5. Certificate Archived in Vault</span>
                    <span style={{ background: "#059669", color: "white", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>READY TO DOWNLOAD</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Vital Records Processing Queue Table */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #a7f3d0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#065f46", fontWeight: "800", fontSize: "1.2rem" }}>
                Vital Records &amp; Certificates Queue
              </h3>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "#ecfdf5", borderBottom: "2px solid #a7f3d0", color: "#065f46", textAlign: "left" }}>
                      <th style={{ padding: "12px" }}>Record ID</th>
                      <th style={{ padding: "12px" }}>Certificate Type</th>
                      <th style={{ padding: "12px" }}>Subject Name</th>
                      <th style={{ padding: "12px" }}>Event Location</th>
                      <th style={{ padding: "12px" }}>Informant</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Registrar Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vitalRecords.map(r => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #a7f3d0" }}>
                        <td style={{ padding: "12px", fontWeight: "900", color: "#047857" }}>{r.certId}</td>
                        <td style={{ padding: "12px", fontWeight: "800", color: "#065f46" }}>{r.type}</td>
                        <td style={{ padding: "12px", fontWeight: "800" }}>{r.subjectName}</td>
                        <td style={{ padding: "12px", color: "#475569", fontSize: "0.82rem" }}>{r.location}</td>
                        <td style={{ padding: "12px", fontWeight: "700" }}>{r.informantName}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: r.status.includes("ISSUED") ? "#d1fae5" : "#fef3c7", color: r.status.includes("ISSUED") ? "#065f46" : "#854d0e" }}>
                            {r.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {!r.status.includes("ISSUED") && (
                            <button
                              onClick={() => handleIssueVitalCertificate(r.id)}
                              style={{ background: "#059669", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "800", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
                            >
                              <FaAward /> Issue Digital Seal &amp; Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 👴 TAB 2: SENIOR & WIDOW PENSION DBT */}
        {activeTab === "pension" && (
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #a7f3d0", marginBottom: "28px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#065f46", fontWeight: "800" }}>Pension Applications &amp; Direct Benefit Transfer (DBT) Queue</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#ecfdf5", borderBottom: "2px solid #a7f3d0", color: "#065f46", textAlign: "left" }}>
                    <th style={{ padding: "12px" }}>App ID</th>
                    <th style={{ padding: "12px" }}>Service</th>
                    <th style={{ padding: "12px" }}>Citizen Name</th>
                    <th style={{ padding: "12px" }}>Monthly Benefit</th>
                    <th style={{ padding: "12px" }}>Aadhaar DBT Status</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} style={{ borderBottom: "1px solid #a7f3d0" }}>
                      <td style={{ padding: "12px", fontWeight: "900", color: "#047857" }}>{app.applicationId}</td>
                      <td style={{ padding: "12px", fontWeight: "700" }}>{app.serviceType}</td>
                      <td style={{ padding: "12px", fontWeight: "800" }}>{app.applicantDetails.fullName}</td>
                      <td style={{ padding: "12px", fontWeight: "900", color: "#047857" }}>{app.pensionAmount}</td>
                      <td style={{ padding: "12px", color: "#475569", fontSize: "0.82rem" }}>{app.dbtStatus}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: app.status === "Approved" ? "#d1fae5" : "#fef3c7", color: app.status === "Approved" ? "#065f46" : "#854d0e" }}>
                          {app.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {app.status !== "Approved" && (
                          <button onClick={() => handleUpdatePensionStatus(app._id, "Approved")} style={{ background: "#059669", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", cursor: "pointer" }}>
                            Approve Pension
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 🏥 TAB 3: AYUSHMAN HEALTHCARE ENROLLMENT */}
        {activeTab === "ayushman" && (
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #a7f3d0", marginBottom: "28px" }}>
            <h3 style={{ margin: "0 0 14px 0", color: "#065f46", fontWeight: "800" }}>Ayushman Health Card &amp; Empanelled Network</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ background: "#ecfdf5", padding: "20px", borderRadius: "12px", border: "1px solid #6ee7b7" }}>
                <div style={{ fontWeight: "800", color: "#065f46", marginBottom: "8px" }}>Generate Ayushman Health Card</div>
                <p style={{ fontSize: "0.85rem", color: "#047857", marginBottom: "14px" }}>Provides ₹5,00,000 annual health cover per family across empanelled hospitals.</p>
                <button onClick={handleIssueAyushmanCard} style={{ background: "#047857", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
                  Issue Ayushman Digital Card
                </button>
              </div>

              <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "12px", border: "1px solid #cbd5e1" }}>
                <div style={{ fontWeight: "800", color: "#334155", marginBottom: "8px" }}>Empanelled Hospital Network</div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.85rem" }}>
                  <div>🏥 Civic General Hospital (Empanelled • Cashless)</div>
                  <div>🏥 LifeCare Multispecialty (Empanelled • Cashless)</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
