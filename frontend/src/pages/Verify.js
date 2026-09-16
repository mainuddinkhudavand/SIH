import React, { useState, useEffect } from "react";
import {
  FaSearch,
  FaCheckCircle,
  FaCheckDouble,
  FaDatabase,
  FaCertificate,
  FaShieldAlt,
  FaFileAlt,
  FaQrcode,
  FaDownload,
  FaMapMarkerAlt,
  FaReceipt,
  FaUserCheck,
  FaBuilding,
  FaLandmark,
  FaFileInvoiceDollar,
  FaHome
} from "react-icons/fa";
import API from "../services/api";
import { getAllApplicationsFromStore } from "../services/applicationStore";

export default function Verify() {
  const [query, setQuery] = useState("");
  const [masterResults, setMasterResults] = useState([]);
  const [trackedRecord, setTrackedRecord] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);

  useEffect(() => {
    // Auto load demo record on initial load for instant presentation
    handleSearch("Pavan Kumar");
  }, []);

  const handleSearch = async (overrideTerm) => {
    const searchTerm = overrideTerm !== undefined ? overrideTerm : query;
    if (!searchTerm || !searchTerm.trim()) return;

    setSearching(true);
    setSearchExecuted(true);
    setMasterResults([]);
    setTrackedRecord(null);

    const term = searchTerm.trim();

    // 1. Search Master Dataset via Backend API
    try {
      const res = await API.get(`/interop/master-search?q=${encodeURIComponent(term)}`).catch(() => null);
      if (res?.data?.results && res.data.results.length > 0) {
        setMasterResults(res.data.results);
      }
    } catch (err) {
      console.warn("Backend master search notice:", err.message);
    }

    // 2. Search local applications & certificates store for tracking IDs
    try {
      const allApps = getAllApplicationsFromStore();
      const match = allApps.find(
        (a) =>
          (a.applicationId || "").toLowerCase() === term.toLowerCase() ||
          (a._id || "").toLowerCase() === term.toLowerCase() ||
          (a.issuedCertificate?.certificateId || "").toLowerCase() === term.toLowerCase() ||
          (a.applicantDetails?.surveyNumber || "").toLowerCase() === term.toLowerCase() ||
          (a.applicantDetails?.propertyId || "").toLowerCase() === term.toLowerCase()
      );

      if (match) {
        setTrackedRecord(match);
      }
    } catch (err) {
      console.warn("Local tracking search notice:", err.message);
    } finally {
      setSearching(false);
    }
  };

  const sampleChips = [
    { label: "Pavan Kumar (Resident)", term: "Pavan Kumar" },
    { label: "Survey # SRV-1001", term: "SRV-1001" },
    { label: "Khata # KHT-1001", term: "KHT-1001" },
    { label: "Property # PROP-MH-1001", term: "PROP-MH-1001" },
    { label: "Aadhaar # 9876-5432-1000", term: "9876-5432-1000" },
    { label: "App ID # APP-401928", term: "APP-401928" },
    { label: "Cert ID # CERT-847291", term: "CERT-847291" }
  ];

  return (
    <div style={{ background: "#f8fafc", minHeight: "92vh", padding: "28px 16px", fontFamily: "'Inter', sans-serif" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Header Banner */}
        <div style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0284c7 100%)", color: "white", padding: "36px 28px", borderRadius: "24px", marginBottom: "28px", boxShadow: "0 10px 25px -5px rgba(15, 23, 42, 0.3)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
            <div style={{ background: "#38bdf8", color: "#0f172a", width: "48px", height: "48px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
              <FaShieldAlt />
            </div>
            <div>
              <span style={{ background: "#38bdf8", color: "#0f172a", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "900", textTransform: "uppercase" }}>
                GovConnect Master Interoperability Verification Portal
              </span>
              <h1 style={{ margin: "4px 0 0 0", fontSize: "2.2rem", fontWeight: "900", color: "#ffffff" }}>
                🔍 Official Verification &amp; Master Search Page
              </h1>
            </div>
          </div>

          <p style={{ margin: 0, color: "#94a3b8", fontSize: "1rem", maxWidth: "850px" }}>
            Cross-verify land, revenue, municipal property, 7/12 extracts, Tehsildar income records, and digital certificates across 1,000 master citizen records and federated office databases.
          </p>
        </div>

        {/* 🔍 SEARCH BAR CARD */}
        <div style={{ background: "#ffffff", borderRadius: "20px", padding: "28px", border: "2px solid #38bdf8", boxShadow: "0 8px 25px -5px rgba(56, 189, 248, 0.15)", marginBottom: "28px" }}>
          <label style={{ display: "block", fontSize: "0.95rem", fontWeight: "800", color: "#0f172a", marginBottom: "10px" }}>
            Enter Search Identifier (Survey Number, Revenue/Khata Number, Aadhaar Number, Property ID, Name, or Tracking ID):
          </label>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "16px" }}
          >
            <div style={{ flex: 1, minWidth: "300px", position: "relative" }}>
              <FaSearch style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#0284c7", fontSize: "1.1rem" }} />
              <input
                type="text"
                placeholder="Search by Survey # (SRV-1001), Khata # (KHT-1001), Aadhaar # (9876-5432-1000), Property ID (PROP-MH-1001), Name, or App ID..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ width: "100%", padding: "14px 16px 14px 48px", borderRadius: "12px", border: "2px solid #93c5fd", fontSize: "1rem", outline: "none", boxSizing: "border-box", fontWeight: "600" }}
              />
            </div>

            <button
              type="submit"
              disabled={searching}
              style={{ background: "#0284c7", color: "white", border: "none", padding: "14px 28px", borderRadius: "12px", fontWeight: "800", cursor: "pointer", fontSize: "1rem", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 4px 12px rgba(2, 132, 199, 0.3)" }}
            >
              <FaSearch /> {searching ? "Searching..." : "Execute Verification Search"}
            </button>
          </form>

          {/* Sample Search Chips */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap", fontSize: "0.85rem" }}>
            <span style={{ fontWeight: "800", color: "#475569" }}>Quick Search Samples:</span>
            {sampleChips.map((chip) => (
              <button
                key={chip.term}
                onClick={() => {
                  setQuery(chip.term);
                  handleSearch(chip.term);
                }}
                style={{ background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontWeight: "700", fontSize: "0.82rem" }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESULTS SECTION */}
        {searching ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#0284c7", fontWeight: "800", fontSize: "1.1rem" }}>
            ⏳ Querying 1,000 Member Master Dataset &amp; Federated Databases...
          </div>
        ) : (
          <div>
            {/* 1. Tracked Application / Certificate Match */}
            {trackedRecord && (
              <div style={{ background: "#ffffff", borderRadius: "20px", border: "2px solid #10b981", padding: "24px", marginBottom: "28px", boxShadow: "0 6px 16px rgba(16, 185, 129, 0.15)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                  <div>
                    <span style={{ background: "#059669", color: "white", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "900", marginRight: "8px" }}>
                      AUTHENTIC VERIFIED RECORD
                    </span>
                    <span style={{ background: "#e2e8f0", color: "#0f172a", padding: "4px 12px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "800" }}>
                      ID: {trackedRecord.applicationId}
                    </span>
                    <h3 style={{ margin: "8px 0 4px 0", fontSize: "1.3rem", fontWeight: "900", color: "#064e3b" }}>
                      {trackedRecord.title}
                    </h3>
                    <p style={{ margin: 0, color: "#047857", fontSize: "0.9rem" }}>
                      Applicant: <strong>{trackedRecord.applicantDetails?.fullName}</strong> | Aadhaar: {trackedRecord.applicantDetails?.aadhaarId}
                    </p>
                  </div>

                  <span style={{ background: "#dcfce7", color: "#15803d", padding: "8px 16px", borderRadius: "20px", fontWeight: "900", fontSize: "0.88rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                    <FaCheckCircle /> Status: {trackedRecord.status}
                  </span>
                </div>

                {trackedRecord.issuedCertificate && (
                  <div style={{ background: "#f0fdf4", border: "1px solid #a7f3d0", padding: "16px", borderRadius: "12px", fontSize: "0.85rem", color: "#065f46" }}>
                    <div style={{ fontWeight: "900", fontSize: "0.95rem", marginBottom: "4px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <FaCertificate style={{ color: "#16a34a" }} /> Digital Certificate Ref: {trackedRecord.issuedCertificate.certificateId}
                    </div>
                    <div>Digital Seal Signature Token: <code>{trackedRecord.issuedCertificate.digitalSignature}</code></div>
                    <div style={{ marginTop: "8px" }}>
                      <a href={trackedRecord.issuedCertificate.qrCodeData} target="_blank" rel="noreferrer" style={{ background: "#16a34a", color: "white", padding: "6px 14px", borderRadius: "8px", textDecoration: "none", fontWeight: "800", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <FaQrcode /> Verify Digital QR Code Seal
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Master Dataset Member Matches */}
            {masterResults.length > 0 ? (
              <div style={{ display: "grid", gap: "24px" }}>
                <div style={{ fontSize: "1.05rem", fontWeight: "900", color: "#0f172a" }}>
                  📋 Master Dataset Query Results ({masterResults.length} Matched Citizens from 1,000 Records):
                </div>

                {masterResults.map((citizen) => (
                  <div key={citizen.citizenId} style={{ background: "#ffffff", borderRadius: "20px", border: "2px solid #93c5fd", padding: "24px", boxShadow: "0 6px 16px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "16px" }}>
                      <div>
                        <span style={{ background: "#0284c7", color: "white", padding: "4px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "900", marginRight: "8px" }}>
                          {citizen.citizenId}
                        </span>
                        <span style={{ background: "#f1f5f9", color: "#334155", padding: "4px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "800" }}>
                          Aadhaar: {citizen.aadhaarId}
                        </span>
                        <h3 style={{ margin: "8px 0 4px 0", fontSize: "1.35rem", fontWeight: "900", color: "#0c4a6e" }}>
                          {citizen.fullName}
                        </h3>
                        <p style={{ margin: 0, fontSize: "0.9rem", color: "#475569" }}>
                          Address: <strong>{citizen.address}</strong> | Ward: {citizen.wardCode} | Village: {citizen.villageCode}
                        </p>
                      </div>

                      <span style={{ background: citizen.isVerifiedAsset ? "#16a34a" : "#ca8a04", color: "white", padding: "8px 18px", borderRadius: "20px", fontWeight: "900", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                        <FaCheckDouble /> {citizen.isVerifiedAsset ? "VERIFIED ASSET BADGE" : "PENDING ASSET VERIFICATION"}
                      </span>
                    </div>

                    {/* 4-Office Breakdown Cards */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", marginTop: "16px" }}>
                      
                      {/* Revenue Record */}
                      <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", padding: "16px", borderRadius: "14px" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: "900", color: "#047857", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaFileInvoiceDollar /> Revenue Department
                        </h4>
                        <div style={{ fontSize: "0.85rem", color: "#064e3b", display: "grid", gap: "4px" }}>
                          <div>Survey Number: <strong>{citizen.revenue?.surveyNumber}</strong></div>
                          <div>Land Area: <strong>{citizen.revenue?.landAreaAcres} Acres</strong></div>
                          <div>Land Type: {citizen.revenue?.landClassification}</div>
                          <div>Revenue Tax: <span style={{ color: citizen.revenue?.pendingRevenueDues > 0 ? "#dc2626" : "#16a34a", fontWeight: "900" }}>{citizen.revenue?.revenueTaxStatus} (₹{citizen.revenue?.pendingRevenueDues})</span></div>
                          <div>Loan/Encumbrance: {citizen.revenue?.encumbranceStatus}</div>
                        </div>
                      </div>

                      {/* Talati Record */}
                      <div style={{ background: "#fffbeb", border: "1px solid #fef3c7", padding: "16px", borderRadius: "14px" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: "900", color: "#b45309", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaHome /> Talati Village Register
                        </h4>
                        <div style={{ fontSize: "0.85rem", color: "#78350f", display: "grid", gap: "4px" }}>
                          <div>7/12 Khata Number: <strong>{citizen.talati?.khataNumber712}</strong></div>
                          <div>8A Summary: {citizen.talati?.extract8ASummary}</div>
                          <div>Ration Card Type: {citizen.talati?.rationCardType}</div>
                          <div>Scheme Beneficiary: {citizen.talati?.schemeBeneficiaryStatus}</div>
                        </div>
                      </div>

                      {/* Municipality Record */}
                      <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", padding: "16px", borderRadius: "14px" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: "900", color: "#0284c7", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaBuilding /> Municipal Property Tax
                        </h4>
                        <div style={{ fontSize: "0.85rem", color: "#0c4a6e", display: "grid", gap: "4px" }}>
                          <div>Property ID: <strong>{citizen.municipality?.propertyId}</strong></div>
                          <div>Built-up Area: <strong>{citizen.municipality?.builtUpAreaSqFt} Sq Ft</strong></div>
                          <div>Property Tax Status: <span style={{ color: citizen.municipality?.pendingTaxArrears > 0 ? "#dc2626" : "#16a34a", fontWeight: "900" }}>{citizen.municipality?.taxStatus} (₹{citizen.municipality?.pendingTaxArrears})</span></div>
                          <div>Water Connection: {citizen.municipality?.waterConnectionStatus}</div>
                        </div>
                      </div>

                      {/* Tehsildar Record */}
                      <div style={{ background: "#faf5ff", border: "1px solid #e9d5ff", padding: "16px", borderRadius: "14px" }}>
                        <h4 style={{ margin: "0 0 10px 0", fontSize: "0.95rem", fontWeight: "900", color: "#7e22ce", display: "flex", alignItems: "center", gap: "6px" }}>
                          <FaLandmark /> Tehsildar Administration
                        </h4>
                        <div style={{ fontSize: "0.85rem", color: "#581c87", display: "grid", gap: "4px" }}>
                          <div>Annual Income: <strong>₹{citizen.tehsildar?.annualIncome}</strong></div>
                          <div>Category: {citizen.tehsildar?.incomeCategory}</div>
                          <div>Caste / Sub-Caste: {citizen.tehsildar?.casteCategory} ({citizen.tehsildar?.subCaste})</div>
                          <div>Solvency Amount: ₹{citizen.tehsildar?.solvencyAmount}</div>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            ) : (
              searchExecuted && !trackedRecord && (
                <div style={{ padding: "32px", textAlign: "center", background: "#ffffff", borderRadius: "20px", border: "1px dashed #cbd5e1", color: "#64748b" }}>
                  No matching record found for '{query}'. Try searching with 'Pavan Kumar', 'SRV-1001', 'KHT-1001', or '9876-5432-1000'!
                </div>
              )
            )}
          </div>
        )}

      </div>
    </div>
  );
}
