// 🏛️ Dynamic Citizen Profile Attributes Generator for Frontend

const USAGE_TYPES = [
  "Home / Plot",
  "Business Plot / Commercial",
  "Educational / Institutional",
  "Land / Agriculture"
];

const CASTE_CATEGORIES = ["OBC", "SC", "ST", "EWS", "General"];
const RATION_CARDS = ["APL-Orange", "BPL-Yellow"];

export function generateDefaultCitizenAttributes(userData = {}) {
  const seedStr = String(userData._id || userData.id || userData.aadhaarNumber || userData.aadhaarId || userData.name || "Mainu");
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed << 5) - seed + seedStr.charCodeAt(i);
    seed |= 0;
  }
  seed = Math.abs(seed) || 1234;

  const idNum = userData.citizenId ? userData.citizenId : `CIT-IND-${400000 + (seed % 90000)}`;

  const nameParts = (userData.name || "Mainu").trim().split(" ");
  const firstName = nameParts[0] || "Mainu";
  const lastName = nameParts[nameParts.length - 1] || "Citizen";

  const firstCode = firstName.slice(0, 3).toUpperCase().padEnd(3, "M");
  const lastCode = lastName.slice(0, 2).toUpperCase().padEnd(2, "N");

  const panNumber = userData.panNumber || `${firstCode}${lastCode}${1000 + (seed % 8999)}X`;
  const voterId = userData.voterId || `VTR-MH-${700000 + (seed % 100000)}`;
  const rawAadhaar = String(userData.aadhaarNumber || userData.aadhaarId || "372623296162").replace(/\D/g, "");
  const formattedAadhaar = rawAadhaar.length === 12
    ? `${rawAadhaar.slice(0, 4)}-${rawAadhaar.slice(4, 8)}-${rawAadhaar.slice(8, 12)}`
    : "3726-2329-6162";

  const wardNum = (seed % 15) + 1;
  const villageNum = (seed % 10) + 1;
  const wardCode = userData.wardCode || `WARD-${wardNum < 10 ? '0' + wardNum : wardNum}`;
  const villageCode = userData.villageCode || `VIL-MH-${villageNum < 10 ? '0' + villageNum : villageNum}`;

  let formattedAddress = "";
  if (typeof userData.address === 'object' && userData.address !== null) {
    formattedAddress = [userData.address.street, userData.address.town || userData.city, userData.address.district, userData.address.state]
      .filter(Boolean).join(", ");
  } else if (typeof userData.address === 'string' && userData.address.trim()) {
    formattedAddress = userData.address;
  } else if (userData.fullAddress) {
    formattedAddress = userData.fullAddress;
  } else {
    formattedAddress = `Plot #${(seed % 150) + 1}, Ward #${wardNum}, Hubli, Dharwad, Karnataka, 580020`;
  }

  const assetUsage = userData.assetUsage || USAGE_TYPES[seed % USAGE_TYPES.length];
  const isAgri = assetUsage === "Land / Agriculture";
  const plotAreaSize = userData.plotAreaSize || (isAgri ? `${(1.2 + (seed % 5) * 0.75).toFixed(1)} Acres` : `${850 + (seed % 15) * 100} Sq Ft`);
  const plotLocation = userData.plotLocation || `${formattedAddress}, Ward ${wardNum}`;

  const surveyNumber = userData.surveyNumber || `SRV-${1000 + (seed % 8999)}`;
  const propertyId = userData.propertyId || `PROP-MH-${1000 + (seed % 8999)}`;
  const khataNumber = userData.khataNumber || `KHT-${1000 + (seed % 8999)}`;

  const assetVerificationStatus = userData.assetVerificationStatus || "VERIFIED_ASSET";
  const municipalPropertyTaxStatus = userData.municipalPropertyTaxStatus || "Paid";
  const municipalTaxArrears = 0;

  const annualIncome = userData.annualIncome || (65000 + (seed % 20) * 10000);
  const casteCategory = userData.casteCategory || CASTE_CATEGORIES[seed % CASTE_CATEGORIES.length];

  const revenueTaxStatus = userData.revenueTaxStatus || "Paid";
  const pendingRevenueDues = 0;
  const rationCardType = userData.rationCardType || RATION_CARDS[seed % RATION_CARDS.length];

  return {
    citizenId: idNum,
    panNumber,
    voterId,
    aadhaarNumber: formattedAadhaar,
    fullAddress: formattedAddress,
    address: formattedAddress,
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
    talatiKhataNo: khataNumber,
    rationCardType,
    isVerifiedAsset: true,

    revenue: {
      surveyNumber: surveyNumber,
      landAreaAcres: isAgri ? parseFloat(plotAreaSize) : 1.5,
      revenueTaxStatus: revenueTaxStatus
    },
    talati: {
      khataNumber712: khataNumber,
      extract8ASummary: "Active (Clear Title)",
      rationCardType: rationCardType
    },
    municipality: {
      propertyId: propertyId,
      builtUpAreaSqFt: !isAgri ? parseInt(plotAreaSize) : 1200,
      taxStatus: municipalPropertyTaxStatus
    },
    tehsildar: {
      annualIncome: annualIncome,
      incomeCategory: annualIncome <= 100000 ? "EWS / Low Income Group" : "Middle Income Group",
      casteCategory: casteCategory
    }
  };
}
