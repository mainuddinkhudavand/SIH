// 🏛️ Dynamic Citizen Profile Attributes Generator (Sample CSV Schema Standard)

const USAGE_TYPES = [
  "Home / Plot",
  "Business Plot / Commercial",
  "Educational / Institutional",
  "Land / Agriculture"
];

const TOWNS_VILLAGES = [
  "Shivaji Nagar Ward 2",
  "Civic Zone Sector 4",
  "Anand Nagar Ward 1",
  "Green Valley Gram Panchayat",
  "Panchayat Market Area",
  "Subhash Ward 3",
  "Krishi Nagar Zone 5",
  "Gram Panchayat Zone A"
];

const CASTE_CATEGORIES = ["OBC", "SC", "ST", "EWS", "General"];
const RATION_CARDS = ["APL-Orange", "BPL-Yellow"];

export function generateDefaultCitizenAttributes(userData = {}) {
  const seed = Math.floor(1000 + Math.random() * 9000);
  const idNum = userData.citizenId ? userData.citizenId : `CIT-IND-${9000 + (seed % 900)}`;

  const nameParts = (userData.name || "Citizen User").trim().split(" ");
  const firstName = nameParts[0] || "Citizen";
  const lastName = nameParts[nameParts.length - 1] || "User";

  const firstCode = firstName.slice(0, 3).toUpperCase().padEnd(3, "K");
  const lastCode = lastName.slice(0, 2).toUpperCase().padEnd(2, "M");

  const panNumber = userData.panNumber || `${firstCode}${lastCode}${seed}X`;
  const voterId = userData.voterId || `VTR-MH-${700000 + seed}`;
  const aadhaarNumber = userData.aadhaarNumber || userData.aadhaarId || `9876-5432-${seed}`;

  const wardNum = (seed % 6) + 1;
  const villageNum = (seed % 4) + 1;
  const wardCode = userData.wardCode || `WARD-0${wardNum}`;
  const villageCode = userData.villageCode || `VIL-MAH-0${villageNum}`;

  const areaName = TOWNS_VILLAGES[seed % TOWNS_VILLAGES.length];
  const fullAddress = userData.fullAddress || userData.address?.street || `Plot #${(seed % 150) + 1}, ${areaName}`;

  const assetUsage = userData.assetUsage || USAGE_TYPES[seed % USAGE_TYPES.length];
  const isAgri = assetUsage === "Land / Agriculture";
  const plotAreaSize = userData.plotAreaSize || (isAgri ? `${(1.2 + (seed % 5) * 0.75).toFixed(1)} Acres` : `${850 + (seed % 15) * 100} Sq Ft`);
  const plotLocation = userData.plotLocation || `${areaName}, Ward ${wardNum}`;

  const surveyNumber = userData.surveyNumber || `SRV-${1000 + seed}`;
  const propertyId = userData.propertyId || `PROP-MH-${1000 + seed}`;
  const khataNumber = userData.khataNumber || `KHT-${1000 + seed}`;
  const talatiKhataNo = userData.talatiKhataNo || khataNumber;

  const assetVerificationStatus = userData.assetVerificationStatus || "VERIFIED_ASSET";
  const municipalPropertyTaxStatus = userData.municipalPropertyTaxStatus || (seed % 7 === 0 ? "Pending" : "Paid");
  const municipalTaxArrears = municipalPropertyTaxStatus === "Pending" ? (userData.municipalTaxArrears || 1800 + (seed % 5) * 600) : 0;

  const annualIncome = userData.annualIncome || (60000 + (seed % 20) * 12500);
  const casteCategory = userData.casteCategory || CASTE_CATEGORIES[seed % CASTE_CATEGORIES.length];

  const revenueTaxStatus = userData.revenueTaxStatus || (seed % 11 === 0 ? "Arrears Pending" : "Paid");
  const pendingRevenueDues = revenueTaxStatus === "Arrears Pending" ? (userData.pendingRevenueDues || 1200 + (seed % 4) * 350) : 0;
  const rationCardType = userData.rationCardType || RATION_CARDS[seed % RATION_CARDS.length];

  return {
    citizenId: idNum,
    panNumber,
    voterId,
    aadhaarNumber,
    fullAddress,
    wardCode,
    villageCode,
    assetUsage,
    plotAreaSize,
    plotLocation,
    surveyNumber,
    propertyId,
    khataNumber,
    assetVerificationStatus,
    municipalPropertyTaxStatus,
    municipalTaxArrears,
    annualIncome,
    casteCategory,
    revenueTaxStatus,
    pendingRevenueDues,
    talatiKhataNo,
    rationCardType,
    isVerifiedAsset: assetVerificationStatus === "VERIFIED_ASSET"
  };
}
