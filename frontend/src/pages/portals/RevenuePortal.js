import React, { useState, useEffect } from "react";
import API from "../../services/api";
import { Link } from "react-router-dom";
import { FaLandmark, FaFileContract, FaSearch, FaCalculator, FaCheckCircle, FaExchangeAlt, FaNetworkWired, FaPlus, FaBolt, FaAward, FaFileAlt, FaUserCheck, FaArrowDown } from "react-icons/fa";

export default function RevenuePortal() {
  const [activeTab, setActiveTab] = useState("transfer");
  
  // Land Registry Search State
  const [surveyQuery, setSurveyQuery] = useState("SURVEY-402-A");
  const [searchResult, setSearchResult] = useState({
    propertyId: "PROP102",
    surveyNumber: "SURVEY-402-A",
    ownerName: "Pavan",
    extentArea: "2,400 Sq. Ft.",
    landCategory: "Residential Urban",
    encumbranceStatus: "NIL (Clear Title)",
    taxDues: "NIL (Paid for 2025-2026)",
    verificationStatus: "VERIFIED_VALID"
  });

  // Property Ownership Transfer Mutation State
  const [transferRequests, setTransferRequests] = useState([
    {
      id: "MUT-9901",
      applicationId: "GC-PROPERTY-5005",
      propertyId: "PROP102",
      surveyNo: "SURVEY-402-A",
      sellerName: "Pavan",
      buyerName: "Anita Sharma",
      deedType: "Sale Deed",
      considerationValue: "₹50,00,000",
      stampDutyStatus: "PAID (₹3,00,000 via SSO Gateway)",
      taxCheck: "PASSED (Municipal Tax Clearance NOC Verified via Interop)",
      status: "Pending Tahsildar Approval"
    }
  ]);

  // Transfer Form State
  const [sellerName, setSellerName] = useState("Pavan");
  const [buyerName, setBuyerName] = useState("Anita Sharma");
  const [propertyIdInput, setPropertyIdInput] = useState("PROP102");
  const [deedType, setDeedType] = useState("Sale Deed");
  const [valueInput, setValueInput] = useState("5000000");

  // Stamp Duty Calculator State
  const [propertyValue, setPropertyValue] = useState("5000000");

  // Interop Data Sharing Log State
  const [incomingQueries, setIncomingQueries] = useState([
    { id: "QRY-9901", requestingDept: "Municipal Portal", purpose: "Water Connection Verification (GC1001)", citizen: "Pavan", propertyId: "PROP102", status: "FULFILLED (Ownership Verified)" },
    { id: "QRY-9902", requestingDept: "Renewable Energy Portal", purpose: "Solar Rooftop Subsidy Grant", citizen: "Anita Sharma", propertyId: "PROP880", status: "FULFILLED (Land Title Clear)" }
  ]);

  const [toastMsg, setToastMsg] = useState(null);

  const handleSearchRegistry = (e) => {
    e.preventDefault();
    setToastMsg(`Searched Revenue Registry for ${surveyQuery}. Record retrieved!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleIssueEcCertificate = () => {
    setToastMsg(`Encumbrance Certificate (EC) for PROP102 generated with Cryptographic Revenue Seal!`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCreateTransferDeed = (e) => {
    e.preventDefault();
    const newReq = {
      id: `MUT-${Math.floor(1000 + Math.random() * 9000)}`,
      applicationId: `GC-PROPERTY-${Math.floor(1000 + Math.random() * 9000)}`,
      propertyId: propertyIdInput,
      surveyNo: "SURVEY-402-A",
      sellerName,
      buyerName,
      deedType,
      considerationValue: `₹${parseInt(valueInput).toLocaleString()}`,
      stampDutyStatus: `PAID (₹${(parseInt(valueInput) * 0.06).toLocaleString()})`,
      taxCheck: "PASSED (Municipal Tax NOC Verified)",
      status: "Pending Tahsildar Approval"
    };

    setTransferRequests([newReq, ...transferRequests]);
    setToastMsg(`Property Transfer application ${newReq.applicationId} registered!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApproveMutation = (id) => {
    setTransferRequests(reqs => reqs.map(r => r.id === id ? { ...r, status: "APPROVED (Title Mutated & Digital Deed Issued)" } : r));
    setToastMsg(`Approved Property Ownership Transfer ${id}! Land record updated to buyer.`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <div style={{ background: "#fffbeb", minHeight: "100vh", padding: "30px 20px" }}>
      <div style={{ maxWidth: "1300px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #b45309 0%, #78350f 100%)", borderRadius: "16px", padding: "28px", color: "white", marginBottom: "24px", boxShadow: "0 10px 25px -5px rgba(180, 83, 9, 0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <span style={{ background: "#fbbf24", color: "#78350f", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
                DEPARTMENTAL PORTAL PROVIDER (REVENUE &amp; LAND) 🔵
              </span>
              <h1 style={{ margin: "8px 0 4px 0", fontSize: "2rem", fontWeight: "900", display: "flex", alignItems: "center", gap: "10px" }}>
                <FaLandmark /> Revenue &amp; Land Records Department
              </h1>
              <p style={{ margin: 0, color: "#fef3c7", fontSize: "0.95rem" }}>
                Master provider for Land Registrations, Property Ownership Transfers, Encumbrance Certificates &amp; Inter-Departmental Data Queries.
              </p>
            </div>

            <Link to="/govconnect" style={{ background: "rgba(255,255,255,0.2)", color: "white", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <FaNetworkWired /> GovConnect Interop Core
            </Link>
          </div>
        </div>

        {toastMsg && (
          <div style={{ background: "#fef3c7", color: "#78350f", border: "1px solid #fde68a", padding: "14px 18px", borderRadius: "10px", fontWeight: "800", marginBottom: "20px" }}>
            {toastMsg}
          </div>
        )}

        {/* 🌟 GOVCONNECT DATA PROVIDER ROLE HIGHLIGHT */}
        <div style={{ background: "#78350f", color: "#fef3c7", padding: "20px 24px", borderRadius: "14px", border: "2px solid #fbbf24", marginBottom: "28px", boxShadow: "0 8px 20px rgba(0,0,0,0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <span style={{ background: "#fbbf24", color: "#78350f", padding: "2px 8px", borderRadius: "4px", fontSize: "0.7rem", fontWeight: "900" }}>
                INTER-DEPARTMENTAL DATA PROVIDER ROLE
              </span>
              <h3 style={{ margin: "4px 0 2px 0", color: "#ffffff", fontSize: "1.15rem", fontWeight: "800" }}>
                Revenue Acts as Authoritative Master Data Provider
              </h3>
              <p style={{ margin: 0, color: "#fde68a", fontSize: "0.85rem" }}>
                When Municipality or Energy portals request property verification, Revenue responds through GovConnect without making citizens re-upload title deeds.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Tabs Navigation */}
        <div style={{ display: "flex", gap: "10px", overflowX: "auto", marginBottom: "24px", paddingBottom: "4px" }}>
          {[
            { key: "transfer", label: "📄 Property Ownership Transfer", icon: <FaFileContract /> },
            { key: "records", label: "🏛️ Land Records Registry", icon: <FaSearch /> },
            { key: "calculator", label: "💰 Stamp Duty Calculator", icon: <FaCalculator /> },
            { key: "interop_logs", label: "⚡ GovConnect Interop Log", icon: <FaExchangeAlt /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: "12px 20px",
                borderRadius: "10px",
                border: activeTab === tab.key ? "2px solid #b45309" : "1px solid #fef3c7",
                background: activeTab === tab.key ? "#b45309" : "#ffffff",
                color: activeTab === tab.key ? "#ffffff" : "#78350f",
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

        {/* 📄 TAB 1: PROPERTY OWNERSHIP TRANSFER (IN-DEPTH WORKSPACE) */}
        {activeTab === "transfer" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* New Transfer Form & Pipeline Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              
              {/* Transfer Registration Form */}
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #fef3c7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#78350f", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                  <FaFileContract color="#b45309" /> Initiate Property Ownership Transfer
                </h3>

                <form onSubmit={handleCreateTransferDeed}>
                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Seller Name (Current Owner)</label>
                    <input type="text" value={sellerName} onChange={e => setSellerName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Buyer Name (New Title Holder)</label>
                    <input type="text" value={buyerName} onChange={e => setBuyerName(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Property Parcel ID</label>
                      <input type="text" value={propertyIdInput} onChange={e => setPropertyIdInput(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Deed Type</label>
                      <select value={deedType} onChange={e => setDeedType(e.target.value)} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}>
                        <option value="Sale Deed">Sale Deed Transfer</option>
                        <option value="Gift Deed">Gift Deed</option>
                        <option value="Inheritance Mutation">Inheritance Mutation</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: "16px" }}>
                    <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Declared Value (₹)</label>
                    <input type="number" value={valueInput} onChange={e => setValueInput(e.target.value)} required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }} />
                  </div>

                  <button type="submit" style={{ width: "100%", background: "#b45309", color: "white", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "900", cursor: "pointer" }}>
                    Submit Ownership Transfer Intake
                  </button>
                </form>
              </div>

              {/* Workflow Pipeline Diagram */}
              <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #fef3c7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <h3 style={{ margin: "0 0 16px 0", color: "#78350f", fontWeight: "800" }}>5-Step Property Transfer Workflow Pathway</h3>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>1. Property Transfer Application</span>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>✓ Complete</span>
                  </div>

                  <div style={{ textAlign: "center", color: "#b45309", fontSize: "0.8rem" }}><FaArrowDown /></div>

                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>2. GovConnect Gateway Route</span>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>✓ Complete</span>
                  </div>

                  <div style={{ textAlign: "center", color: "#b45309", fontSize: "0.8rem" }}><FaArrowDown /></div>

                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>3. Revenue Record Verification</span>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>✓ Complete</span>
                  </div>

                  <div style={{ textAlign: "center", color: "#b45309", fontSize: "0.8rem" }}><FaArrowDown /></div>

                  <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#166534" }}>4. Tax Verification (Municipal Interop Check)</span>
                    <span style={{ background: "#dcfce7", color: "#166534", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>✓ Complete</span>
                  </div>

                  <div style={{ textAlign: "center", color: "#b45309", fontSize: "0.8rem" }}><FaArrowDown /></div>

                  <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontWeight: "800", color: "#92400e" }}>5. Ownership Update &amp; Digital Title Deed</span>
                    <span style={{ background: "#fef3c7", color: "#78350f", padding: "2px 8px", borderRadius: "6px", fontWeight: "900" }}>Tahsildar Sign-Off</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Pending Mutation Applications Queue Table */}
            <div style={{ background: "#ffffff", borderRadius: "16px", padding: "24px", border: "1px solid #fef3c7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 16px 0", color: "#78350f", fontWeight: "800", fontSize: "1.2rem" }}>
                Pending Title Mutation Applications Queue
              </h3>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "#fffbeb", borderBottom: "2px solid #fef3c7", color: "#78350f", textAlign: "left" }}>
                      <th style={{ padding: "12px" }}>Mutation ID</th>
                      <th style={{ padding: "12px" }}>Property ID</th>
                      <th style={{ padding: "12px" }}>Seller (Current)</th>
                      <th style={{ padding: "12px" }}>Buyer (New Owner)</th>
                      <th style={{ padding: "12px" }}>Stamp Duty Status</th>
                      <th style={{ padding: "12px" }}>Status</th>
                      <th style={{ padding: "12px", textAlign: "right" }}>Officer Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transferRequests.map(req => (
                      <tr key={req.id} style={{ borderBottom: "1px solid #fef3c7" }}>
                        <td style={{ padding: "12px", fontWeight: "900", color: "#b45309" }}>{req.id} ({req.applicationId})</td>
                        <td style={{ padding: "12px", fontWeight: "800" }}>{req.propertyId} ({req.surveyNo})</td>
                        <td style={{ padding: "12px", fontWeight: "800", color: "#475569" }}>{req.sellerName}</td>
                        <td style={{ padding: "12px", fontWeight: "800", color: "#166534" }}>{req.buyerName}</td>
                        <td style={{ padding: "12px", color: "#166534", fontSize: "0.82rem", fontWeight: "700" }}>{req.stampDutyStatus}</td>
                        <td style={{ padding: "12px" }}>
                          <span style={{ padding: "4px 10px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", background: req.status.includes("APPROVED") ? "#dcfce7" : "#fef3c7", color: req.status.includes("APPROVED") ? "#166534" : "#854d0e" }}>
                            {req.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {!req.status.includes("APPROVED") && (
                            <button
                              onClick={() => handleApproveMutation(req.id)}
                              style={{ background: "#16a34a", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", fontWeight: "800", cursor: "pointer" }}
                            >
                              Approve Title Transfer
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

        {/* 🏛️ TAB 2: LAND RECORDS REGISTRY */}
        {activeTab === "records" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "28px" }}>
            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #fef3c7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 14px 0", color: "#78350f", fontWeight: "800" }}>Survey Number / Parcel Search</h3>
              <form onSubmit={handleSearchRegistry}>
                <div style={{ marginBottom: "14px" }}>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Survey Number or Property ID</label>
                  <input
                    type="text"
                    value={surveyQuery}
                    onChange={e => setSurveyQuery(e.target.value)}
                    required
                    style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}
                  />
                </div>
                <button type="submit" style={{ background: "#b45309", color: "white", border: "none", padding: "10px 18px", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
                  Search Land Registry
                </button>
              </form>

              <div style={{ marginTop: "20px" }}>
                <button onClick={handleIssueEcCertificate} style={{ background: "#78350f", color: "#fef3c7", border: "none", padding: "10px 16px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaAward /> Generate Encumbrance Certificate (EC)
                </button>
              </div>
            </div>

            <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #fef3c7", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
              <h3 style={{ margin: "0 0 14px 0", color: "#78350f", fontWeight: "800" }}>Property Record Details</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.88rem" }}>
                <div style={{ background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Property ID:</span> <strong>{searchResult.propertyId}</strong>
                </div>
                <div style={{ background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Registered Owner:</span> <strong>{searchResult.ownerName}</strong>
                </div>
                <div style={{ background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Extent Area:</span> <strong>{searchResult.extentArea}</strong>
                </div>
                <div style={{ background: "#fffbeb", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between" }}>
                  <span>Land Classification:</span> <strong>{searchResult.landCategory}</strong>
                </div>
                <div style={{ background: "#dcfce7", color: "#166534", padding: "10px 14px", borderRadius: "8px", display: "flex", justifyContent: "space-between", fontWeight: "800" }}>
                  <span>Title Status:</span> <span>✓ VERIFIED CLEAR TITLE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 💰 TAB 3: STAMP DUTY CALCULATOR */}
        {activeTab === "calculator" && (
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #fef3c7", marginBottom: "28px", maxWidth: "600px" }}>
            <h3 style={{ margin: "0 0 14px 0", color: "#78350f", fontWeight: "800" }}>Stamp Duty &amp; Registration Fee Estimator</h3>
            <div style={{ marginBottom: "14px" }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "700", color: "#334155", marginBottom: "4px" }}>Declared Property Consideration Value (₹)</label>
              <input
                type="number"
                value={propertyValue}
                onChange={e => setPropertyValue(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontWeight: "700" }}
              />
            </div>

            <div style={{ background: "#fffbeb", border: "1px solid #fde68a", padding: "18px", borderRadius: "12px", marginTop: "16px" }}>
              <div style={{ fontSize: "0.85rem", color: "#78350f", fontWeight: "700" }}>Stamp Duty (5%):</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#b45309" }}>₹{(parseFloat(propertyValue || 0) * 0.05).toLocaleString()}</div>
              
              <div style={{ fontSize: "0.85rem", color: "#78350f", fontWeight: "700", marginTop: "8px" }}>Registration Fee (1%):</div>
              <div style={{ fontSize: "1.4rem", fontWeight: "900", color: "#b45309" }}>₹{(parseFloat(propertyValue || 0) * 0.01).toLocaleString()}</div>

              <div style={{ borderTop: "1px dashed #fbbf24", paddingTop: "10px", marginTop: "10px", fontWeight: "900", fontSize: "1.1rem", color: "#78350f" }}>
                Total Fee Required: ₹{(parseFloat(propertyValue || 0) * 0.06).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* ⚡ TAB 4: GOVCONNECT INTEROP QUERY LOG */}
        {activeTab === "interop_logs" && (
          <div style={{ background: "#ffffff", padding: "24px", borderRadius: "16px", border: "1px solid #fef3c7", marginBottom: "28px" }}>
            <h3 style={{ margin: "0 0 16px 0", color: "#78350f", fontWeight: "800" }}>Incoming Inter-Department Data Queries Log</h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "#fffbeb", borderBottom: "2px solid #fef3c7", color: "#78350f", textAlign: "left" }}>
                    <th style={{ padding: "12px" }}>Query ID</th>
                    <th style={{ padding: "12px" }}>Requesting Portal</th>
                    <th style={{ padding: "12px" }}>Purpose</th>
                    <th style={{ padding: "12px" }}>Citizen</th>
                    <th style={{ padding: "12px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingQueries.map(q => (
                    <tr key={q.id} style={{ borderBottom: "1px solid #fef3c7" }}>
                      <td style={{ padding: "12px", fontWeight: "900", color: "#b45309" }}>{q.id}</td>
                      <td style={{ padding: "12px", fontWeight: "800" }}>{q.requestingDept}</td>
                      <td style={{ padding: "12px", color: "#475569" }}>{q.purpose}</td>
                      <td style={{ padding: "12px", fontWeight: "800" }}>{q.citizen} ({q.propertyId})</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ background: "#dcfce7", color: "#166534", padding: "4px 10px", borderRadius: "8px", fontWeight: "800", fontSize: "0.75rem" }}>
                          {q.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
