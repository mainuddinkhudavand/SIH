// 🏢 Procedural Generator for 1,000 Citizen Master Dataset Records
const FIRST_NAMES = [
  "Pavan", "Rajesh", "Suresh", "Anita", "Mahesh", "Priya", "Amit", "Sunita", "Ramesh", "Kavita",
  "Vikas", "Pooja", "Sanjay", "Deepa", "Vijay", "Neeta", "Anil", "Meena", "Rahul", "Swati",
  "Ganesh", "Aarti", "Ashok", "Lata", "Dinesh", "Ritu", "Santosh", "Rekha", "Manoj", "Shoba",
  "Prakash", "Usha", "Kiran", "Geeta", "Sunil", "Asha", "Nitin", "Suman", "Ajay", "Seema"
];

const LAST_NAMES = [
  "Kumar", "Patil", "Deshmukh", "Sharma", "Pawar", "Joshi", "Kulkarni", "Shinde", "Gaekwad", "More",
  "Chavan", "Rao", "Reddy", "Verma", "Gupta", "Singh", "Yadav", "Nair", "Bhosale", "Jadhav",
  "Mane", "Wagh", "Kamble", "Suryavanshi", "Sawant", "Kadam", "Salunkhe", "Thakur", "Rathod", "Naik"
];

const TOWNS_VILLAGES = [
  "Gram Panchayat Zone A", "Shivaji Nagar Ward 2", "Civic Zone Sector 4", "Anand Nagar Ward 1",
  "Green Valley Gram Panchayat", "Panchayat Market Area", "Subhash Ward 3", "Krishi Nagar Zone 5"
];

const USAGE_TYPES = [
  "Land / Agriculture",
  "Home / Plot",
  "Business Plot / Commercial",
  "Educational / Institutional"
];

export function generateMasterDataset(count = 1000) {
  const dataset = [];

  for (let i = 1; i <= count; i++) {
    const idNum = 9000 + i;
    const firstName = FIRST_NAMES[(i - 1) % FIRST_NAMES.length];
    const lastName = LAST_NAMES[Math.floor((i - 1) / FIRST_NAMES.length) % LAST_NAMES.length];
    const fullName = `${firstName} ${lastName}`;
    const srvNum = `SRV-${1000 + i}`;
    const propNum = `PROP-MH-${1000 + i}`;
    const khtNum = `KHT-${1000 + i}`;
    const aadhaarDigit = String(1000 + (i % 9000)).padStart(4, "0");
    const aadhaarId = `9876-5432-${aadhaarDigit}`;
    const phoneDigit = String(40000 + i).padStart(5, "0");
    const phone = `+91 98765 ${phoneDigit}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@egram.gov.in`;

    const usageType = USAGE_TYPES[i % USAGE_TYPES.length];
    const isAgri = usageType === "Land / Agriculture";
    const landArea = isAgri ? Number((1.2 + (i % 8) * 0.75).toFixed(2)) : Number((0.1 + (i % 5) * 0.15).toFixed(2));
    const builtArea = isAgri ? 0 : 800 + (i % 15) * 150;
    const hasMunicipalDues = i % 7 === 0;
    const municipalDueAmt = hasMunicipalDues ? 1200 + (i % 5) * 600 : 0;
    const hasRevenueDues = i % 11 === 0;
    const revenueDueAmt = hasRevenueDues ? 850 + (i % 4) * 350 : 0;

    const record = {
      citizenId: `CIT-IND-${idNum}`,
      fullName,
      phone,
      email,
      aadhaarId,
      panNumber: `${lastName.slice(0, 3).toUpperCase()}${firstName.slice(0, 2).toUpperCase()}${1000 + i}X`,
      voterId: `VTR-MH-${700000 + i}`,
      address: `Plot #${(i % 150) + 1}, ${TOWNS_VILLAGES[i % TOWNS_VILLAGES.length]}`,
      wardCode: `WARD-0${(i % 6) + 1}`,
      villageCode: `VIL-MAH-0${(i % 4) + 1}`,
      kycStatus: "Verified",
      isVerifiedAsset: i % 3 !== 0, // ~66% verified, 33% new/unverified asset

      // Asset & Plot Details
      assetDetails: {
        usageType, // "Land / Agriculture" or "Home / Plot / Business Plot / Education"
        plotAreaSize: isAgri ? `${landArea} Acres` : `${builtArea} Sq Ft`,
        plotLocation: `${TOWNS_VILLAGES[i % TOWNS_VILLAGES.length]}, Ward ${(i % 6) + 1}`,
        surveyNumber: srvNum,
        propertyId: propNum,
        khataNumber: khtNum,
        verificationBadge: i % 3 !== 0 ? "VERIFIED_ASSET" : "PENDING_VERIFICATION"
      },

      // 🏢 Municipality Data
      municipality: {
        propertyId: propNum,
        builtUpAreaSqFt: builtArea,
        taxAssessmentValue: builtArea * 12,
        taxStatus: hasMunicipalDues ? "Pending" : "Paid",
        pendingTaxArrears: municipalDueAmt,
        waterMeterId: `WAT-${1000 + i}`,
        waterConnectionStatus: "Active",
        usageType
      },

      // 📜 Tehsildar Data
      tehsildar: {
        annualIncome: 50000 + (i % 20) * 15000,
        incomeCategory: (50000 + (i % 20) * 15000) < 100000 ? "LIG (Low Income Group)" : "MIG (Middle Income Group)",
        casteCategory: ["General", "OBC", "SC", "ST", "EWS"][i % 5],
        subCaste: ["Open", "Kunbi", "Mahar", "Bhil", "Maratha"][i % 5],
        residenceDurationYears: 5 + (i % 25),
        solvencyAmount: 1000000 + (i % 10) * 500000,
        agriculturistVerified: isAgri
      },

      // 🌾 Revenue Data
      revenue: {
        surveyNumber: srvNum,
        landAreaAcres: landArea,
        landClassification: isAgri ? "Agricultural (Irrigated)" : "Non-Agricultural (NA)",
        revenueTaxStatus: hasRevenueDues ? "Arrears Pending" : "Paid",
        pendingRevenueDues: revenueDueAmt,
        encumbranceStatus: i % 9 === 0 ? `Active Bank Loan (₹${100000 + i * 500})` : "Cleared (No Loan)",
        courtDisputeStatus: "No Dispute"
      },

      // 🏡 Talati Data
      talati: {
        khataNumber712: khtNum,
        extract8ASummary: isAgri ? `${landArea} Acres in ${srvNum}` : `Plot ${propNum}`,
        familyRegisterId: `FAM-${100 + (i % 200)}`,
        familyMembersCount: 2 + (i % 5),
        rationCardType: i % 4 === 0 ? "BPL-Yellow" : "APL-Orange",
        schemeBeneficiaryStatus: "Verified Beneficiary",
        cropLossPercentage: i % 13 === 0 ? 30 : 0
      }
    };

    dataset.push(record);
  }

  return dataset;
}
