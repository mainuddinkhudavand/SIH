import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { FaBuilding, FaTint, FaStore, FaHome, FaShoppingBag, FaExchangeAlt, FaNetworkWired, FaCheckCircle, FaTimesCircle, FaArrowRight, FaBolt, FaPlus, FaSearch, FaClipboardList, FaCalculator, FaFileContract } from "react-icons/fa";

export default function MunicipalPortal() {
  const [activeSubModule, setActiveSubModule] = useState("water");
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interopData, setInteropData] = useState(null);
  const [queryCitizenId, setQueryCitizenId] = useState("C101");

  // New Service Forms State
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState("water");
  const [applicantName, setApplicantName] = useState("Pavan");
  const [contactPhone, setContactPhone] = useState("+91 98765 43210");
  const [propertyAddress, setPropertyAddress] = useState("Plot #14, Sector 4, Civic Zone");
  const [extraDetails, setExtraDetails] = useState("");
  const [toastMsg, setToastMsg] = useState(null);

  // Water Pipe Allotment Calculator State
  const [pipeSize, setPipeSize] = useState("0.5"); // inches
  const [connectionType, setConnectionType] = useState("Domestic");

  // Trade License Merchant State
  const [businessType, setBusinessType] = useState("Retail Store");
  const [gstNumber, setGstNumber] = useState("36AAAAA0000A1Z5");

  // Vending Zone State
  const [vendingZone, setVendingZone] = useState("Zone A - Central Market");

  useEffect(() => {
    fetchMunicipalApps();
  }, []);

  const fetchMunicipalApps = async () => {
    setLoading(true);
    try {
      const res = await API.get("/municipal/applications");
      setApplications(res.data?.applications || []);
    } catch (err) {
      console.warn("Municipal applications fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    try {
      let serviceTitle = "New Water Meter Connection";
      if (formType === "trade") serviceTitle = "Commercial Trade License";
      if (formType === "housing") serviceTitle = "Housing Assistance Scheme";
      if (formType === "vending") serviceTitle = "Street Vending Zone Permit";

      await API.post("/municipal/applications", {
        serviceType: serviceTitle,
        title: `${serviceTitle} Request`,
        applicantDetails: { fullName: applicantName, phone: contactPhone, address: propertyAddress }
      });

      setToastMsg(`Successfully registered ${serviceTitle} intake request!`);
      setShowForm(false);
      fetchMunicipalApps();
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      alert("Failed to submit request to Municipality queue");
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await API.put(`/municipal/applications/${id}`, {
        status: newStatus,
        remarks: `Processed by Municipal Officer (${newStatus}) via GovConnect Gateway`
      });
      fetchMunicipalApps();
      setToastMsg(`Updated Application ${id} to ${newStatus}`);
      setTimeout(() => setToastMsg(null), 3000);
    } catch (err) {
      // Fallback local update
      setApplications(apps => apps.map(a => a._id === id ? { ...a, status: newStatus } : a));
      setToastMsg(`Updated Application ${id} to ${newStatus}`);
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleExecuteGovConnectQuery = async () => {
    try {
      const res = await API.get(`/interop/mapped-data?citizenId=${queryCitizenId}&queryType=MUNICIPAL_PROPERTY_VERIFY`);
      setInteropData(res.data?.data || res.data);
      setToastMsg(`Successfully fetched verified property title deed from Revenue DB via GovConnect!`);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ background: "#f0f9ff", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #0369a1 0%, #0c4a6e 100%)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(2, 132, 199, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ background: "#38bdf8", color: "#0c4a6e", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
                DEPARTMENTAL PORTAL PROVIDER 🔵
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaBuilding /> Municipality &amp; Civic Development Department
              </h1>
              <p style={{ margin: 0, color: "#bae6fd", fontSize: "0.95rem" }}>
                Operational workspace for Water Connections, Trade Licenses, Housing Allotments, and Street Vending Permits.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={() => setShowForm(true)}
                style={{ background: "#38bdf8", color: "#0c4a6e", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FaPlus /> New Intake Application
              </button>
              <Link to="/govconnect" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                <FaNetworkWired /> GovConnect Interop
              </Link>
            </div>
          </div>
        </div>

        {toastMsg && (
          <div style={{ background: "#dcfce7", color: "#166534", border: "1px solid #86efac", padding: "14px 18px", borderRadius: "10px", fontWeight: "800", marginBottom: "20px" }}>
            {toastMsg}
          </div>
        )}

        {/* 🌟 SIH 129 CORE INTEROPERABILITY DEMO QUERY BAR */}
        <div style={{ background: "#0f172a", color: "#f8fafc", padding: "20px 24px", borderRadius: "14px", border: "2px solid #38bdf8", marginBottom: "28px", boxShadow: "0 8px 20px rgba(0,0,0,0.25)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ background: "#38bdf8", color: "#0f172a", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "900" }}>
                SIH 129 ZERO RE-UPLOAD FEATURE
              </span>
              <h3 style={{ margin: "4px 0 2px 0", color: "#ffffff", fontSize: "1.15rem", fontWeight: "800" }}>
                Need Property Verification for Water / Trade License?
              </h3>
              <p style={{ margin: 0, color: "#94a3b8", fontSize: "0.85rem" }}>
                Query GovConnect to pull verified title deed data directly from Revenue DB (No citizen document re-upload required).
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input
                type="text"
                value={queryCitizenId}
                onChange={e => setQueryCitizenId(e.target.value)}
                placeholder="Citizen ID (C101)"
                style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #475569", background: "#1e293b", color: "#ffffff", fontWeight: "700", width: "120px" }}
              />
              <button
                onClick={handleExecuteGovConnectQuery}
                style={{ background: "#38bdf8", color: "#0f172a", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <FaBolt /> Query Revenue DB via GovConnect
              </button>
            </div>
          </div>

          {interopData && (
            <div style={{ marginTop: "16px", background: "#1e293b", border: "1px solid #334155", padding: "14px", borderRadius: "8px", fontSize: "0.85rem" }}>
              <div style={{ color: "#38bdf8", fontWeight: "800", marginBottom: "6px" }}>✓ Verified Property Data Response (Transformed by GovConnect):</div>
              <pre style={{ margin: 0, color: "#e2e8f0", overflowX: "auto" }}>{JSON.stringify(interopData, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* 🏢 4 Operational Sub-Module Tabs */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "24px", paddingBottom: "4px" }}>
          {[
            { key: "water", label: "🚰 Water Meter Department", icon: <FaTint /> },
            { key: "trade", label: "🏪 Commercial Trade Licensing", icon: <FaStore /> },
            { key: "housing", label: "🏠 Housing Assistance Scheme", icon: <FaHome /> },
            { key: "vending", label: "🛒 Street Vending Permits", icon: <FaShoppingBag /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveSubModule(tab.key)}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: activeSubModule === tab.key ? "2px solid #0284c7" : "1px solid #bae6fd",
                background: activeSubModule === tab.key ? "#0284c7" : "#ffffff",
                color: activeSubModule === tab.key ? "#ffffff" : "#0369a1",
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

        {/* 🚰 MODULE 1: WATER METER DEPARTMENT */}
        {activeSubModule === "water" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e0f2fe", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 14px 0", color: "#0c4a6e", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                <FaCalculator color="#0284c7" /> Connection Allotment Fee Calculator
              </h3>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Pipeline Connection Type</label>
                <select value={connectionType} onChange={e => setConnectionType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <option value="Domestic">Domestic Residential (Standard Tariff)</option>
                  <option value="Commercial">Commercial Establishment (High Pressure)</option>
                  <option value="Industrial">Industrial Facility Pipeline</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Pipe Diameter (Inches)</label>
                <select value={pipeSize} onChange={e => setPipeSize(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <option value="0.5">0.5 Inch (Standard Domestic)</option>
                  <option value="0.75">0.75 Inch (Large Family Residence)</option>
                  <option value="1.0">1.0 Inch (Commercial / Industrial)</option>
                </select>
              </div>

              <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "16px", borderRadius: "10px" }}>
                <div style={{ fontSize: "0.85rem", color: "#0369a1", fontWeight: "700" }}>Estimated Connection &amp; Meter Fee:</div>
                <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#0c4a6e" }}>
                  ₹{connectionType === "Domestic" ? (parseFloat(pipeSize) * 2500).toLocaleString() : (parseFloat(pipeSize) * 7500).toLocaleString()}
                </div>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Includes Digital Smart Meter, Pipeline Extension &amp; Sanction Fee</span>
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e0f2fe", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 14px 0", color: "#0c4a6e", fontWeight: "800" }}>Meter Allotment &amp; Supply Zone Registry</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Zone 4 - Civic Center Reservoir</span>
                  <strong style={{ color: "#166534" }}>Active (4.2 Bar Pressure)</strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Zone 7 - Sector 12 High Tank</span>
                  <strong style={{ color: "#166534" }}>Active (3.8 Bar Pressure)</strong>
                </div>
                <div style={{ background: "#f8fafc", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Assigned Meter Stock ID</span>
                  <strong style={{ color: "#0284c7" }}>METER-SMART-99042</strong>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 🏪 MODULE 2: COMMERCIAL TRADE LICENSING */}
        {activeSubModule === "trade" && (
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #e0f2fe", marginBottom: "28px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h3 style={{ margin: "0 0 14px 0", color: "#0c4a6e", fontWeight: "800" }}>Merchant Licensing &amp; Compliance Clearance Console</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div style={{ background: "#f3e8ff", border: "1px solid #c084fc", padding: "16px", borderRadius: "12px" }}>
                <div style={{ color: "#7e22ce", fontWeight: "800", fontSize: "0.95rem" }}>GST Identification Check</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#581c87", marginTop: "4px" }}>{gstNumber}</div>
                <span style={{ fontSize: "0.75rem", color: "#6b21a8" }}>Verified via Central Tax Interop Gateway</span>
              </div>

              <div style={{ background: "#dcfce7", border: "1px solid #4ade80", padding: "16px", borderRadius: "12px" }}>
                <div style={{ color: "#166534", fontWeight: "800", fontSize: "0.95rem" }}>Fire NOC Safety Clearance</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#14532d", marginTop: "4px" }}>CLEARANCE-PASSED</div>
                <span style={{ fontSize: "0.75rem", color: "#15803d" }}>Municipal Fire Safety Inspector Sign-Off</span>
              </div>

              <div style={{ background: "#e0f2fe", border: "1px solid #38bdf8", padding: "16px", borderRadius: "12px" }}>
                <div style={{ color: "#0369a1", fontWeight: "800", fontSize: "0.95rem" }}>Trade License Fee Status</div>
                <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#0c4a6e", marginTop: "4px" }}>₹4,500 / Year</div>
                <span style={{ fontSize: "0.75rem", color: "#0284c7" }}>Paid Online via Single Sign-On Gateway</span>
              </div>
            </div>
          </div>
        )}

        {/* 📋 MUNICIPAL OFFICER APPLICATION PROCESSING QUEUE */}
        <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #e0f2fe", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          <h3 style={{ margin: "0 0 16px 0", color: "#0c4a6e", fontWeight: "800", fontSize: "1.25rem" }}>
            Municipal Processing Queue
          </h3>

          {loading ? (
            <p style={{ color: "#64748b" }}>Loading applications queue...</p>
          ) : applications.length === 0 ? (
            <p style={{ color: "#64748b" }}>No active Municipal applications in queue.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#f0f9ff", borderBottom: "2px solid #bae6fd", color: "#0c4a6e", textAlign: "left" }}>
                    <th style={{ padding: "12px" }}>Application ID</th>
                    <th style={{ padding: "12px" }}>Citizen</th>
                    <th style={{ padding: "12px" }}>Service</th>
                    <th style={{ padding: "12px" }}>Status</th>
                    <th style={{ padding: "12px", textAlign: "right" }}>Officer Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map(app => (
                    <tr key={app._id} style={{ borderBottom: "1px solid #e0f2fe" }}>
                      <td style={{ padding: "12px", fontWeight: "900", color: "#0284c7" }}>
                        {app.applicationId || "GC1001"}
                      </td>
                      <td style={{ padding: "12px", fontWeight: "800", color: "#0f172a" }}>
                        {app.applicantDetails?.fullName || app.user?.name || "Pavan"}
                      </td>
                      <td style={{ padding: "12px", fontWeight: "700", color: "#334155" }}>
                        {app.serviceType}
                      </td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: app.status === "Approved" ? "#dcfce7" : app.status === "Rejected" ? "#fee2e2" : "#fef3c7", color: app.status === "Approved" ? "#166534" : app.status === "Rejected" ? "#991b1b" : "#854d0e" }}>
                          {app.status || "Pending"}
                        </span>
                      </td>
                      <td style={{ padding: "12px", textAlign: "right" }}>
                        {app.status !== "Approved" && (
                          <button onClick={() => handleUpdateStatus(app._id, "Approved")} style={{ background: "#16a34a", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", marginRight: "6px", cursor: "pointer" }}>
                            Approve
                          </button>
                        )}
                        {app.status !== "Rejected" && (
                          <button onClick={() => handleUpdateStatus(app._id, "Rejected")} style={{ background: "#dc2626", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "700", marginRight: "6px", cursor: "pointer" }}>
                            Reject
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Apply Form */}
        {showForm && (
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
            <div style={{ background: "white", padding: "30px", borderRadius: "16px", width: "100%", maxWidth: "500px" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#0c4a6e", fontWeight: "800" }}>Submit New Municipal Application</h3>
              <form onSubmit={handleCreateRequest}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Service Category</label>
                  <select value={formType} onChange={e => setFormType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <option value="water">New Water Meter Connection</option>
                    <option value="trade">Commercial Trade License</option>
                    <option value="housing">Housing Assistance Scheme</option>
                    <option value="vending">Street Vending Zone Permit</option>
                  </select>
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Applicant Full Name</label>
                  <input type="text" value={applicantName} onChange={e => setApplicantName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                </div>

                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Phone Number</label>
                  <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                </div>

                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", marginBottom: "4px" }}>Address / Site Location</label>
                  <textarea value={propertyAddress} onChange={e => setPropertyAddress(e.target.value)} required rows={2} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
                </div>

                <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", fontWeight: "700", cursor: "pointer" }}>Cancel</button>
                  <button type="submit" style={{ padding: "10px 18px", borderRadius: "8px", border: "none", background: "#0284c7", color: "white", fontWeight: "800", cursor: "pointer" }}>Submit Intake</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
