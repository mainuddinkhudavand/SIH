import React, { useState } from "react";
import { FaSearch, FaDatabase, FaCheckDouble, FaEye, FaEyeSlash } from "react-icons/fa";
import API from "../services/api";

export default function MasterVerificationSearchBar({ officeName = "Office", themeColor = "#0284c7" }) {
  const [masterQuery, setMasterQuery] = useState("");
  const [masterResults, setMasterResults] = useState([]);
  const [masterSearching, setMasterSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

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
                    Aadhaar: <strong>{citizen.aadhaarId}</strong> | Address: {citizen.address}
                  </p>
                </div>

                <span style={{ background: citizen.isVerifiedAsset ? "#16a34a" : "#ca8a04", color: "white", padding: "4px 12px", borderRadius: "20px", fontWeight: "900", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <FaCheckDouble /> {citizen.isVerifiedAsset ? "VERIFIED ASSET" : "PENDING VERIFICATION"}
                </span>
              </div>

              {/* 4-Office Grid Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", background: "#ffffff", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}>
                <div>
                  <strong style={{ color: "#047857", display: "block" }}>🌾 Revenue Data:</strong>
                  <div>Survey #: <strong>{citizen.revenue?.surveyNumber}</strong></div>
                  <div>Area: {citizen.revenue?.landAreaAcres} Acres</div>
                  <div>Tax: {citizen.revenue?.revenueTaxStatus}</div>
                </div>

                <div>
                  <strong style={{ color: "#b45309", display: "block" }}>🏡 Talati Data:</strong>
                  <div>Khata #: <strong>{citizen.talati?.khataNumber712}</strong></div>
                  <div>8A: {citizen.talati?.extract8ASummary}</div>
                  <div>Ration: {citizen.talati?.rationCardType}</div>
                </div>

                <div>
                  <strong style={{ color: "#0284c7", display: "block" }}>🏢 Municipal Data:</strong>
                  <div>Property ID: <strong>{citizen.municipality?.propertyId}</strong></div>
                  <div>Built Area: {citizen.municipality?.builtUpAreaSqFt} Sq Ft</div>
                  <div>Tax: {citizen.municipality?.taxStatus}</div>
                </div>

                <div>
                  <strong style={{ color: "#4338ca", display: "block" }}>📜 Tehsildar Data:</strong>
                  <div>Income: ₹{citizen.tehsildar?.annualIncome}</div>
                  <div>Category: {citizen.tehsildar?.incomeCategory}</div>
                  <div>Caste: {citizen.tehsildar?.casteCategory}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
