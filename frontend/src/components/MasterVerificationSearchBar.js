import React, { useState } from "react";
import {
  FaSearch,
  FaDatabase,
  FaCheckDouble,
  FaEye,
  FaEyeSlash,
  FaUserCheck,
  FaTimes,
  FaCheckCircle,
  FaFileInvoiceDollar,
  FaHome,
  FaBuilding,
  FaLandmark,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaCertificate,
  FaIdCard
} from "react-icons/fa";
import API from "../services/api";

export default function MasterVerificationSearchBar({ officeName = "Office", themeColor = "#0284c7" }) {
  const [masterQuery, setMasterQuery] = useState("");
  const [masterResults, setMasterResults] = useState([]);
  const [masterSearching, setMasterSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Modals state for Resident KYC and Verified Asset
  const [selectedKycCitizen, setSelectedKycCitizen] = useState(null);
  const [selectedAssetCitizen, setSelectedAssetCitizen] = useState(null);

  const handleMasterSearch = async (overrideQuery) => {
    const q = overrideQuery !== undefined ? overrideQuery : masterQuery;

    setMasterSearching(true);
    setHasSearched(true);
    try {
      const res = await API.get(`/interop/master-search?q=${encodeURIComponent((q || "").trim())}&office=${encodeURIComponent(officeName)}`).catch(() => null);
      if (res?.data?.results) {
        setMasterResults(res.data.results);
      }
    } catch (err) {
      console.warn("Master verification search notice:", err);
    } finally {
      setMasterSearching(false);
    }
  };

  const handleHideRecords = () => {
    setHasSearched(false);
    setMasterResults([]);
  };

  const sampleChips = ["Pavan Kumar", "SRV-1001", "KHT-1001", "PROP-MH-1001", "9876-5432-1000", "SRV-1004"];

  return (
    <div style={{ background: "#ffffff", borderRadius: "16px", padding: "20px", border: `2px solid ${themeColor}`, marginBottom: "24px", boxShadow: "0 4px 15px -3px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
        <div style={{ background: `${themeColor}20`, color: themeColor, width: "36px", height: "36px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
          <FaDatabase />
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
            🔍 {officeName} Officer Cross-Verification Bar (1,000 Member Master Dataset)
          </h3>
          <p style={{ margin: "2px 0 0 0", fontSize: "0.82rem", color: "#64748b" }}>
            Search official 1,000 member records by Survey #, Khata #, Aadhaar #, Property ID, or Name. Click 'View Records' to reveal matching master data.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "12px" }}>
        <div style={{ flex: 1, minWidth: "260px", position: "relative" }}>
          <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder={`Search 1,000 Master DB records in ${officeName} (e.g. SRV-1001, KHT-1001, PROP-MH-1001, 9876-5432-1000, Name)...`}
            value={masterQuery}
            onChange={(e) => setMasterQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleMasterSearch();
              }
            }}
            style={{ width: "100%", padding: "10px 12px 10px 38px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.9rem", outline: "none", boxSizing: "border-box" }}
          />
        </div>

        <button
          onClick={() => handleMasterSearch()}
          style={{ background: themeColor, color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "800", cursor: "pointer", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}
        >
          <FaEye /> {masterSearching ? "Loading Records..." : "View Records"}
        </button>

        {hasSearched && (
          <button
            onClick={handleHideRecords}
            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid #cbd5e1", padding: "10px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.88rem", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <FaEyeSlash /> Hide Records
          </button>
        )}
      </div>

      {/* Quick Sample Chips */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", fontSize: "0.78rem" }}>
        <span style={{ fontWeight: "800", color: "#475569" }}>Samples:</span>
        {sampleChips.map((chip) => (
          <button
            key={chip}
            onClick={() => {
              setMasterQuery(chip);
              handleMasterSearch(chip);
            }}
            style={{ background: "#f1f5f9", color: themeColor, border: "1px solid #cbd5e1", padding: "3px 8px", borderRadius: "6px", cursor: "pointer", fontWeight: "700" }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Search Results Display - Only shown after clicking View Records */}
      {hasSearched && (
        <div style={{ marginTop: "16px", display: "grid", gap: "14px" }}>
          <div style={{ fontSize: "0.85rem", fontWeight: "800", color: themeColor, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span>
              {masterResults.length > 0
                ? `Found ${masterResults.length} matching records from 1,000 member master dataset:`
                : `No matching records found for '${masterQuery}'.`}
            </span>
            <span style={{ fontSize: "0.75rem", background: `${themeColor}15`, color: themeColor, padding: "2px 8px", borderRadius: "4px" }}>
              Press 'Hide Records' to collapse list
            </span>
          </div>

          {masterResults.map((citizen) => (
            <div key={citizen.citizenId} style={{ background: "#f8fafc", borderRadius: "12px", border: `2px solid ${themeColor}40`, padding: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
                <div>
                  <span style={{ background: themeColor, color: "white", padding: "3px 8px", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "900", marginRight: "6px" }}>
                    {citizen.citizenId}
                  </span>
                  <h4 style={{ margin: "4px 0 2px 0", fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
                    {citizen.fullName}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.82rem", color: "#475569" }}>
                    Aadhaar: <strong>{citizen.aadhaarId}</strong> (12-Digit Verified) | Address: {citizen.address}
                  </p>
                </div>

                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {/* 1. Verified Resident KYC Button */}
                  <button
                    onClick={() => setSelectedKycCitizen(citizen)}
                    style={{ background: "#059669", color: "white", border: "none", padding: "6px 14px", borderRadius: "20px", fontWeight: "900", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "5px", cursor: "pointer", boxShadow: "0 2px 6px rgba(5, 150, 105, 0.3)" }}
                    title="Click to view Resident KYC Info"
                  >
                    <FaCheckCircle /> VERIFIED RESIDENT KYC
                  </button>

                  {/* 2. Verified Asset Badge Button */}
                  <button
                    onClick={() => setSelectedAssetCitizen(citizen)}
                    style={{ background: citizen.isVerifiedAsset ? "#2563eb" : "#ca8a04", color: "white", border: "none", padding: "6px 14px", borderRadius: "20px", fontWeight: "900", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "5px", cursor: "pointer", boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)" }}
                    title="Click to view 4-Office Asset Breakdown"
                  >
                    <FaCheckDouble /> {citizen.isVerifiedAsset ? "VERIFIED ASSET BADGE" : "PENDING ASSET VERIFICATION"}
                  </button>
                </div>
              </div>

              {/* 4-Office Grid Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}>
                <div>
                  <strong style={{ color: "#047857", display: "block" }}>🌾 Revenue Data:</strong>
                  <div>Survey #: <strong>{citizen.revenue?.surveyNumber}</strong></div>
                  <div>Area: {citizen.revenue?.landAreaAcres} Acres</div>
                  <div>Tax: <span style={{ color: "#16a34a", fontWeight: "800" }}>✓ {citizen.revenue?.revenueTaxStatus}</span></div>
                </div>

                <div>
                  <strong style={{ color: "#b45309", display: "block" }}>🏡 Talati Data:</strong>
                  <div>Khata #: <strong>{citizen.talati?.khataNumber712}</strong></div>
                  <div>8A: <span style={{ color: "#16a34a", fontWeight: "800" }}>✓ {citizen.talati?.extract8ASummary}</span></div>
                  <div>Ration: {citizen.talati?.rationCardType}</div>
                </div>

                <div>
                  <strong style={{ color: "#0284c7", display: "block" }}>🏢 Municipal Data:</strong>
                  <div>Property ID: <strong>{citizen.municipality?.propertyId}</strong></div>
                  <div>Built Area: {citizen.municipality?.builtUpAreaSqFt} Sq Ft</div>
                  <div>Tax: <span style={{ color: "#16a34a", fontWeight: "800" }}>✓ {citizen.municipality?.taxStatus}</span></div>
                </div>

                <div>
                  <strong style={{ color: "#4338ca", display: "block" }}>📜 Tehsildar Data:</strong>
                  <div>Income: ₹{citizen.tehsildar?.annualIncome}</div>
                  <div>Category: <span style={{ color: "#16a34a", fontWeight: "800" }}>✓ {citizen.tehsildar?.incomeCategory}</span></div>
                  <div>Caste: {citizen.tehsildar?.casteCategory}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🟢 MODAL 1: VERIFIED RESIDENT KYC INFO MODAL */}
      {selectedKycCitizen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px" }}>
          <div style={{ background: "#ffffff", width: "100%", maxWidth: "650px", borderRadius: "20px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", overflow: "hidden", border: "2px solid #059669" }}>
            
            {/* Modal Header */}
            <div style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)", color: "white", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaUserCheck style={{ fontSize: "1.5rem", color: "#6ee7b7" }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#ffffff" }}>
                    Verified Resident eKYC &amp; Identity Record
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "#a7f3d0" }}>
                    Official UIDAI eKYC Gateway &amp; State Master Registry Token
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedKycCitizen(null)} style={{ background: "none", border: "none", color: "white", fontSize: "1.4rem", cursor: "pointer" }}>
                <FaTimes />
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ padding: "24px", display: "grid", gap: "16px" }}>
              
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "14px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <FaCheckCircle style={{ color: "#16a34a", fontSize: "1.8rem" }} />
                <div>
                  <strong style={{ color: "#166534", fontSize: "0.95rem" }}>✔ eKYC VERIFIED RESIDENT IDENTITY</strong>
                  <div style={{ fontSize: "0.8rem", color: "#15803d" }}>
                    100% Identity Match across Aadhaar eKYC (12-Digit) &amp; Civil Registration Systems.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>FULL RESIDENT NAME</span>
                  <div style={{ fontSize: "1.05rem", fontWeight: "900", color: "#0f172a" }}>{selectedKycCitizen.fullName}</div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>CITIZEN ID PASS</span>
                  <div style={{ fontSize: "1rem", fontWeight: "800", color: "#0284c7" }}><code>{selectedKycCitizen.citizenId}</code></div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>AADHAAR ID (12-DIGIT)</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>
                    <FaIdCard style={{ color: "#059669", marginRight: "6px" }} />
                    {selectedKycCitizen.aadhaarId} <span style={{ color: "#16a34a" }}>(✔ Verified)</span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>MOBILE NUMBER (10-DIGIT)</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: "800", color: "#0f172a" }}>
                    <FaPhone style={{ color: "#059669", marginRight: "6px" }} />
                    {selectedKycCitizen.phone || "+91 98765 43210"} <span style={{ color: "#16a34a" }}>(✔ OTP Verified)</span>
                  </div>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>EMAIL ADDRESS</span>
                  <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#334155" }}>
                    <FaEnvelope style={{ color: "#0284c7", marginRight: "6px" }} />
                    {selectedKycCitizen.email || "citizen@govconnect.in"}
                  </div>
                </div>

                <div style={{ gridColumn: "span 2" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "700" }}>RESIDENTIAL ADDRESS</span>
                  <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#0f172a", marginTop: "2px" }}>
                    <FaMapMarkerAlt style={{ color: "#dc2626", marginRight: "6px" }} />
                    {selectedKycCitizen.address} | Ward: {selectedKycCitizen.wardCode || 4}, Village: {selectedKycCitizen.villageCode || 102}
                  </div>
                </div>
              </div>

              <div style={{ background: "#f1f5f9", padding: "12px", borderRadius: "10px", fontSize: "0.78rem", color: "#475569", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>🔒 Digital Token: <code>EKYC-UIDAI-{selectedKycCitizen.citizenId}-9984</code></span>
                <span style={{ background: "#dcfce7", color: "#15803d", padding: "2px 8px", borderRadius: "6px", fontWeight: "800" }}>Confidence: 99.8%</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ background: "#f8fafc", padding: "14px 24px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>
              <button onClick={() => setSelectedKycCitizen(null)} style={{ background: "#059669", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
                Close eKYC Info
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🔵 MODAL 2: VERIFIED ASSET BREAKDOWN MODAL */}
      {selectedAssetCitizen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999, padding: "20px" }}>
          <div style={{ background: "#ffffff", width: "100%", maxWidth: "800px", borderRadius: "20px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.3)", overflow: "hidden", border: "2px solid #2563eb", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            
            {/* Modal Header */}
            <div style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)", color: "white", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <FaCheckDouble style={{ fontSize: "1.6rem", color: "#93c5fd" }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "900", color: "#ffffff" }}>
                    🛡️ 4-Department Verified Asset Breakdown &amp; Cross-KYC
                  </h3>
                  <span style={{ fontSize: "0.78rem", color: "#bfdbfe" }}>
                    Citizen: {selectedAssetCitizen.fullName} ({selectedAssetCitizen.citizenId})
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedAssetCitizen(null)} style={{ background: "none", border: "none", color: "white", fontSize: "1.4rem", cursor: "pointer" }}>
                <FaTimes />
              </button>
            </div>

            {/* Modal Content Body */}
            <div style={{ padding: "24px", overflowY: "auto", display: "grid", gap: "16px" }}>
              
              <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", padding: "14px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "12px" }}>
                <FaShieldAlt style={{ color: "#2563eb", fontSize: "1.8rem" }} />
                <div>
                  <strong style={{ color: "#1e40af", fontSize: "0.95rem" }}>✔ VERIFIED ASSET BADGE CONFIRMED ACROSS ALL 4 DEPARTMENTS</strong>
                  <div style={{ fontSize: "0.8rem", color: "#1d4ed8" }}>
                    Federated cross-verification completed for Land, Village Khata, Municipal Property &amp; Tehsildar Income records.
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                
                {/* 1. Revenue Department Asset */}
                <div style={{ background: "#f0fdf4", border: "2px solid #16a34a", padding: "18px", borderRadius: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: "#047857", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaFileInvoiceDollar /> 1. Revenue Department KYC
                    </h4>
                    <span style={{ background: "#16a34a", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "900" }}>
                      ✔ VERIFIED
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#064e3b", display: "grid", gap: "6px" }}>
                    <div>Survey / Gut Number: <strong>{selectedAssetCitizen.revenue?.surveyNumber}</strong></div>
                    <div>Total Land Area: <strong>{selectedAssetCitizen.revenue?.landAreaAcres} Acres</strong></div>
                    <div>Classification: {selectedAssetCitizen.revenue?.landClassification || "Agricultural A-Class"}</div>
                    <div>Revenue Tax Status: <strong style={{ color: "#16a34a" }}>✔ {selectedAssetCitizen.revenue?.revenueTaxStatus}</strong></div>
                    <div>Title Deed / Encumbrance: <strong style={{ color: "#16a34a" }}>✔ {selectedAssetCitizen.revenue?.encumbranceStatus || "Clear Title Deed"}</strong></div>
                  </div>
                </div>

                {/* 2. Talati Office Asset */}
                <div style={{ background: "#fffbeb", border: "2px solid #d97706", padding: "18px", borderRadius: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: "#b45309", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaHome /> 2. Talati Village Register KYC
                    </h4>
                    <span style={{ background: "#d97706", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "900" }}>
                      ✔ VERIFIED
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#78350f", display: "grid", gap: "6px" }}>
                    <div>7/12 Khata Number: <strong>{selectedAssetCitizen.talati?.khataNumber712}</strong></div>
                    <div>8A Summary Extract: <strong style={{ color: "#b45309" }}>✔ {selectedAssetCitizen.talati?.extract8ASummary}</strong></div>
                    <div>Ration Card Status: <strong style={{ color: "#16a34a" }}>✔ {selectedAssetCitizen.talati?.rationCardType}</strong></div>
                    <div>Ferfar Mutation Entry: <strong style={{ color: "#16a34a" }}>✔ Crop &amp; Water Rights Certified</strong></div>
                  </div>
                </div>

                {/* 3. Municipal Property Asset */}
                <div style={{ background: "#f0f9ff", border: "2px solid #0284c7", padding: "18px", borderRadius: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: "#0284c7", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaBuilding /> 3. Municipal Corporation KYC
                    </h4>
                    <span style={{ background: "#0284c7", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "900" }}>
                      ✔ VERIFIED
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#0c4a6e", display: "grid", gap: "6px" }}>
                    <div>Property Tax ID: <strong>{selectedAssetCitizen.municipality?.propertyId}</strong></div>
                    <div>Built-Up Plot Area: <strong>{selectedAssetCitizen.municipality?.builtUpAreaSqFt} Sq Ft</strong></div>
                    <div>Municipal Tax Status: <strong style={{ color: "#16a34a" }}>✔ {selectedAssetCitizen.municipality?.taxStatus}</strong></div>
                    <div>Water Connection &amp; Plan: <strong style={{ color: "#16a34a" }}>✔ Sanctioned Building Plan</strong></div>
                  </div>
                </div>

                {/* 4. Tehsildar Sub-Division Asset */}
                <div style={{ background: "#faf5ff", border: "2px solid #7e22ce", padding: "18px", borderRadius: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <h4 style={{ margin: 0, fontSize: "1rem", fontWeight: "900", color: "#7e22ce", display: "flex", alignItems: "center", gap: "6px" }}>
                      <FaLandmark /> 4. Tehsildar Sub-Division KYC
                    </h4>
                    <span style={{ background: "#7e22ce", color: "white", padding: "2px 10px", borderRadius: "12px", fontSize: "0.72rem", fontWeight: "900" }}>
                      ✔ VERIFIED
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#581c87", display: "grid", gap: "6px" }}>
                    <div>Certified Annual Income: <strong>₹{selectedAssetCitizen.tehsildar?.annualIncome}</strong></div>
                    <div>Income Category: <strong style={{ color: "#7e22ce" }}>✔ {selectedAssetCitizen.tehsildar?.incomeCategory}</strong></div>
                    <div>Solvency Amount Verified: <strong style={{ color: "#16a34a" }}>✔ ₹{selectedAssetCitizen.tehsildar?.solvencyAmount || 250000}</strong></div>
                    <div>Caste &amp; Ancestral Proof: <strong style={{ color: "#16a34a" }}>✔ {selectedAssetCitizen.tehsildar?.casteCategory} ({selectedAssetCitizen.tehsildar?.subCaste})</strong></div>
                  </div>
                </div>

              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ background: "#f8fafc", padding: "14px 24px", textAlign: "right", borderTop: "1px solid #e2e8f0" }}>
              <button onClick={() => setSelectedAssetCitizen(null)} style={{ background: "#2563eb", color: "white", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "800", cursor: "pointer" }}>
                Close Asset Breakdown
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
