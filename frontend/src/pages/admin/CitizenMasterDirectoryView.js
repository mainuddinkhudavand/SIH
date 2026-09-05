import React, { useState, useEffect } from "react";
import {
  FaIdCard,
  FaSearch,
  FaBuilding,
  FaLandmark,
  FaFileInvoiceDollar,
  FaHome,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUserCheck,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt
} from "react-icons/fa";
import API from "../../services/api";

export default function CitizenMasterDirectoryView() {
  const [citizens, setCitizens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCitizen, setSelectedCitizen] = useState(null);

  useEffect(() => {
    fetchCitizensMaster();
  }, []);

  const fetchCitizensMaster = async () => {
    setLoading(true);
    try {
      const res = await API.get("/applications/citizens-master");
      if (res.data?.citizens) {
        setCitizens(res.data.citizens);
        if (res.data.citizens.length > 0) {
          setSelectedCitizen(res.data.citizens[0]);
        }
      }
    } catch (err) {
      console.warn("Using fallback master dataset");
    } finally {
      setLoading(false);
    }
  };

  const filteredCitizens = citizens.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.aadhaarId.includes(searchTerm) ||
      c.citizenId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ background: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ background: "#dcfce7", color: "#166534", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: "800", display: "inline-block", marginBottom: "6px" }}>
          MASTER DATASETS &amp; ID VERIFICATION DIRECTORY
        </div>
        <h2 style={{ margin: 0, fontSize: "1.75rem", fontWeight: "800", color: "#0f172a" }}>
          👨‍👩‍👧‍👦 Citizens Master Directory &amp; 4-Office Records
        </h2>
        <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "0.95rem" }}>
          Search resident records by Aadhaar ID or Name. View verified ID proofs (Aadhaar, PAN, Voter ID) and inspect cross-office data linked across Municipality, Tehsildar, Revenue, and Talati.
        </p>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: "24px", maxWidth: "480px" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search by Name, Aadhaar ID (e.g. 9876-5432-1000) or Resident ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: "10px", border: "2px solid #cbd5e1", fontSize: "0.9rem", fontWeight: "700" }}
          />
          <FaSearch style={{ position: "absolute", left: "14px", top: "16px", color: "#94a3b8" }} />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: "40px", color: "#64748b" }}>Loading Citizen Master Directory...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" }}>
          
          {/* Left Column: Citizen List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "700px", overflowY: "auto", paddingRight: "6px" }}>
            {filteredCitizens.map((c) => {
              const isSelected = selectedCitizen?.citizenId === c.citizenId;
              return (
                <div
                  key={c.citizenId}
                  onClick={() => setSelectedCitizen(c)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: `2px solid ${isSelected ? "#166534" : "#e2e8f0"}`,
                    background: isSelected ? "#f0fdf4" : "#ffffff",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <h4 style={{ margin: 0, color: "#0f172a", fontSize: "1.05rem", fontWeight: "800" }}>
                      {c.fullName}
                    </h4>
                    <span style={{ background: "#dcfce7", color: "#166534", fontSize: "0.7rem", fontWeight: "800", padding: "2px 8px", borderRadius: "10px" }}>
                      {c.kycStatus}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#475569", fontWeight: "700" }}>
                    Aadhaar: {c.aadhaarId}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                    {c.citizenId} | Ward: {c.wardCode}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Complete 4-Offices Data Details */}
          {selectedCitizen ? (
            <div style={{ background: "#f8fafc", borderRadius: "14px", padding: "24px", border: "1px solid #cbd5e1" }}>
              
              {/* Resident Identity Header */}
              <div style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#15803d" }}>
                      RESIDENT IDENTIFICATION &amp; KYC PROFILE
                    </span>
                    <h3 style={{ margin: "2px 0 6px 0", fontSize: "1.5rem", fontWeight: "900", color: "#0f172a" }}>
                      {selectedCitizen.fullName} ({selectedCitizen.citizenId})
                    </h3>
                    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.85rem", color: "#475569" }}>
                      <span><FaPhoneAlt /> {selectedCitizen.phone}</span>
                      <span><FaEnvelope /> {selectedCitizen.email}</span>
                      <span><FaMapMarkerAlt /> {selectedCitizen.address}</span>
                    </div>
                  </div>

                  <div style={{ background: "#f0fdf4", padding: "12px 18px", borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                    <div style={{ fontSize: "0.75rem", fontWeight: "800", color: "#166534" }}>VERIFIED ID PROOFS:</div>
                    <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#15803d", marginTop: "2px" }}>
                      Aadhaar: <strong>{selectedCitizen.aadhaarId}</strong>
                    </div>
                    {selectedCitizen.panNumber && (
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#15803d" }}>
                        PAN: <strong>{selectedCitizen.panNumber}</strong>
                      </div>
                    )}
                    {selectedCitizen.voterId && (
                      <div style={{ fontSize: "0.82rem", fontWeight: "700", color: "#15803d" }}>
                        Voter ID: <strong>{selectedCitizen.voterId}</strong>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 4 Offices Data Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                
                {/* 🏢 1. Municipality Data */}
                <div style={{ background: "#ffffff", borderRadius: "12px", padding: "18px", border: "2px solid #0284c7" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#0c4a6e", fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaBuilding /> 1. Municipality Office Data
                  </h4>
                  <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", color: "#334155" }}>
                    <div>Property ID: <strong>{selectedCitizen.municipality?.propertyId}</strong></div>
                    <div>Built-Up Area: <strong>{selectedCitizen.municipality?.builtUpAreaSqFt} Sq Ft</strong></div>
                    <div>Tax Value: <strong>₹{selectedCitizen.municipality?.taxAssessmentValue}</strong></div>
                    <div>Tax Status: <strong style={{ color: selectedCitizen.municipality?.taxStatus === "Paid" ? "#166534" : "#b45309" }}>{selectedCitizen.municipality?.taxStatus}</strong> {selectedCitizen.municipality?.pendingTaxArrears > 0 ? `(Arrears: ₹${selectedCitizen.municipality?.pendingTaxArrears})` : ""}</div>
                    <div>Water Connection: <strong>{selectedCitizen.municipality?.waterMeterId} ({selectedCitizen.municipality?.waterConnectionStatus})</strong></div>
                    <div>Trade License: <strong>{selectedCitizen.municipality?.tradeLicenseId} ({selectedCitizen.municipality?.businessName})</strong></div>
                    <div>Birth Register Ref: <strong>{selectedCitizen.municipality?.birthRecordRef}</strong></div>
                  </div>
                </div>

                {/* 📜 2. Tehsildar Data */}
                <div style={{ background: "#ffffff", borderRadius: "12px", padding: "18px", border: "2px solid #166534" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#14532d", fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaLandmark /> 2. Tehsildar Office Data
                  </h4>
                  <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", color: "#334155" }}>
                    <div>Declared Income: <strong>₹{selectedCitizen.tehsildar?.annualIncome} / year</strong></div>
                    <div>Income Category: <strong>{selectedCitizen.tehsildar?.incomeCategory}</strong></div>
                    <div>Caste Category: <strong>{selectedCitizen.tehsildar?.casteCategory} ({selectedCitizen.tehsildar?.subCaste})</strong></div>
                    <div>Residence Duration: <strong>{selectedCitizen.tehsildar?.residenceDurationYears} Years</strong></div>
                    <div>Solvency Valuation: <strong>₹{selectedCitizen.tehsildar?.solvencyAmount}</strong></div>
                    <div>Agriculturist Status: <strong>{selectedCitizen.tehsildar?.agriculturistVerified ? "Verified Farmer" : "Non-Farmer"}</strong></div>
                    <div>Legal Heir Ref: <strong>{selectedCitizen.tehsildar?.legalHeirRef}</strong></div>
                  </div>
                </div>

                {/* 🌾 3. Revenue Data */}
                <div style={{ background: "#ffffff", borderRadius: "12px", padding: "18px", border: "2px solid #b45309" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#78350f", fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaFileInvoiceDollar /> 3. Revenue Office Data
                  </h4>
                  <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", color: "#334155" }}>
                    <div>Land Survey Parcel: <strong>{selectedCitizen.revenue?.surveyNumber}</strong></div>
                    <div>Land Holding Area: <strong>{selectedCitizen.revenue?.landAreaAcres} Acres</strong></div>
                    <div>Land Classification: <strong>{selectedCitizen.revenue?.landClassification}</strong></div>
                    <div>Revenue Tax Status: <strong style={{ color: selectedCitizen.revenue?.revenueTaxStatus === "Paid" ? "#166534" : "#b45309" }}>{selectedCitizen.revenue?.revenueTaxStatus}</strong> {selectedCitizen.revenue?.pendingRevenueDues > 0 ? `(Dues: ₹${selectedCitizen.revenue?.pendingRevenueDues})` : ""}</div>
                    <div>Encumbrance Mortgage: <strong>{selectedCitizen.revenue?.encumbranceStatus}</strong></div>
                    <div>Court Disputes: <strong>{selectedCitizen.revenue?.courtDisputeStatus}</strong></div>
                  </div>
                </div>

                {/* 🏡 4. Talati Data */}
                <div style={{ background: "#ffffff", borderRadius: "12px", padding: "18px", border: "2px solid #7c3aed" }}>
                  <h4 style={{ margin: "0 0 10px 0", color: "#581c87", fontSize: "1.1rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "8px" }}>
                    <FaHome /> 4. Talati Office Data
                  </h4>
                  <div style={{ fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "6px", color: "#334155" }}>
                    <div>7/12 Khata Account: <strong>{selectedCitizen.talati?.khataNumber712}</strong></div>
                    <div>8-A Holding Summary: <strong>{selectedCitizen.talati?.extract8ASummary}</strong></div>
                    <div>Village Family Register: <strong>{selectedCitizen.talati?.familyRegisterId} ({selectedCitizen.talati?.familyMembersCount} Members)</strong></div>
                    <div>Ration Card: <strong>{selectedCitizen.talati?.rationCardType}</strong></div>
                    <div>Scheme Beneficiary: <strong>{selectedCitizen.talati?.schemeBeneficiaryStatus}</strong></div>
                    <div>Crop Damage %: <strong>{selectedCitizen.talati?.cropLossPercentage}% ({selectedCitizen.talati?.fieldVisitStatus})</strong></div>
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div style={{ padding: "40px", color: "#64748b" }}>Select a citizen from the list to view full 4-office records.</div>
          )}

        </div>
      )}
    </div>
  );
}
