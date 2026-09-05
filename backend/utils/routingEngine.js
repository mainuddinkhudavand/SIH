// 🏛️ Section 0: Core Routing Engine & Federated Office Datasets

export const SERVICE_OFFICE_MAP = {
  // --- 2. Municipality Office Services ---
  "birth-certificate": {
    serviceId: "birth-certificate",
    title: "Birth Certificate Registration & Issuance",
    category: "Certificates",
    serviceType: "single-office",
    primaryOffice: "Municipality",
    officeChain: ["Municipality"],
    prefix: "CERT",
    description: "Official registration and digital issuance of Birth Certificate by Municipal Registrar.",
    requiredDocs: ["Hospital Birth Slip", "Parents Aadhaar Proof"],
    dynamicFields: [
      { name: "childName", label: "Child Full Name", type: "text", required: true },
      { name: "dob", label: "Date of Birth", type: "date", required: true },
      { name: "fatherName", label: "Father Name", type: "text", required: true },
      { name: "motherName", label: "Mother Name", type: "text", required: true },
      { name: "placeOfBirth", label: "Hospital / Place of Birth", type: "text", required: true }
    ]
  },
  "death-certificate": {
    serviceId: "death-certificate",
    title: "Death Certificate Registration & Issuance",
    category: "Certificates",
    serviceType: "single-office",
    primaryOffice: "Municipality",
    officeChain: ["Municipality"],
    prefix: "CERT",
    description: "Official registration and digital issuance of Death Certificate.",
    requiredDocs: ["Doctor Medical Certificate of Death", "Deceased Aadhaar Card"],
    dynamicFields: [
      { name: "deceasedName", label: "Deceased Person Full Name", type: "text", required: true },
      { name: "dod", label: "Date of Death", type: "date", required: true },
      { name: "placeOfDeath", label: "Place of Death", type: "text", required: true },
      { name: "causeOfDeath", label: "Cause of Death", type: "text", required: false }
    ]
  },
  "marriage-certificate": {
    serviceId: "marriage-certificate",
    title: "Marriage Certificate Registration",
    category: "Certificates",
    serviceType: "single-office",
    primaryOffice: "Municipality",
    officeChain: ["Municipality"],
    prefix: "CERT",
    description: "Registration of marriage and issuance of official legal certificate.",
    requiredDocs: ["Wedding Invitation / Hall Receipt", "Spouses Aadhaar Cards", "Joint Photo"],
    dynamicFields: [
      { name: "groomName", label: "Groom Full Name", type: "text", required: true },
      { name: "brideName", label: "Bride Full Name", type: "text", required: true },
      { name: "dom", label: "Date of Marriage", type: "date", required: true },
      { name: "venue", label: "Marriage Venue", type: "text", required: true }
    ]
  },
  "property-tax-mutation": {
    serviceId: "property-tax-mutation",
    title: "Property Tax Assessment, Payment & Ownership Update",
    category: "Civic Utilities",
    serviceType: "multi-office",
    primaryOffice: "Municipality",
    officeChain: ["Talati", "Revenue", "Municipality"],
    prefix: "APP",
    description: "Property tax record assessment and ownership mutation. Requires land verification by Talati and Revenue clearance.",
    requiredDocs: ["Sale Deed / Possession Letter", "Latest Property Tax Receipt"],
    dynamicFields: [
      { name: "propertyId", label: "Property Assessment Number / ID", type: "text", required: true },
      { name: "surveyNumber", label: "Linked Survey Number", type: "text", required: true },
      { name: "builtUpArea", label: "Built-up Area (Sq Ft)", type: "number", required: true },
      { name: "propertyType", label: "Property Type (Residential/Commercial)", type: "text", required: true }
    ]
  },
  "water-connection": {
    serviceId: "water-connection",
    title: "Water Connection (New, Transfer, Disconnection)",
    category: "Civic Utilities",
    serviceType: "single-office",
    primaryOffice: "Municipality",
    officeChain: ["Municipality"],
    prefix: "APP",
    description: "Application for new household water tap connection or pipeline transfer.",
    requiredDocs: ["Property Ownership Proof", "Address Proof"],
    dynamicFields: [
      { name: "propertyId", label: "Property Assessment ID", type: "text", required: true },
      { name: "connectionType", label: "Connection Type (Domestic / Commercial)", type: "text", required: true },
      { name: "pipeSize", label: "Pipeline Size (0.5 inch / 0.75 inch)", type: "text", required: true }
    ]
  },
  "streetlight-repair": {
    serviceId: "streetlight-repair",
    title: "Streetlight Installation / Repair Request",
    category: "Civic Utilities",
    serviceType: "single-office",
    primaryOffice: "Municipality",
    officeChain: ["Municipality"],
    prefix: "APP",
    description: "Report non-functional streetlights or request new pole installation.",
    requiredDocs: ["Location Landmark Photo"],
    dynamicFields: [
      { name: "wardCode", label: "Ward / Sector Number", type: "text", required: true },
      { name: "poleNumber", label: "Pole Number (if visible)", type: "text", required: false },
      { name: "issueDetails", label: "Issue Description", type: "text", required: true }
    ]
  },
  "trade-license": {
    serviceId: "trade-license",
    title: "Trade & Business License Issuance",
    category: "Civic Utilities",
    serviceType: "single-office",
    primaryOffice: "Municipality",
    officeChain: ["Municipality"],
    prefix: "APP",
    description: "Commercial trade permit and shop establishment registration.",
    requiredDocs: ["Shop Rent Agreement", "GST / Aadhaar Registration"],
    dynamicFields: [
      { name: "businessName", label: "Name of Firm / Business", type: "text", required: true },
      { name: "businessType", label: "Type of Business / Trade Category", type: "text", required: true },
      { name: "shopAddress", label: "Shop Premises Address", type: "text", required: true }
    ]
  },
  "building-plan-sanction": {
    serviceId: "building-plan-sanction",
    title: "Building Plan Sanction & Completion Certificate",
    category: "Civic Utilities",
    serviceType: "multi-office",
    primaryOffice: "Municipality",
    officeChain: ["Talati", "Municipality"],
    prefix: "APP",
    description: "Building construction approval requiring Talati land-use and boundary zoning verification.",
    requiredDocs: ["Architect Blueprints", "7/12 Extract", "NOC"],
    dynamicFields: [
      { name: "surveyNumber", label: "Land Survey Number", type: "text", required: true },
      { name: "plotArea", label: "Plot Area (Sq Ft)", type: "number", required: true },
      { name: "architectName", label: "Licensed Architect Name", type: "text", required: true }
    ]
  },

  // --- 3. Tehsildar Office Services ---
  "income-certificate": {
    serviceId: "income-certificate",
    title: "Income Certificate",
    category: "Certificates",
    serviceType: "multi-office",
    primaryOffice: "Tehsildar",
    officeChain: ["Talati", "Revenue", "Tehsildar"],
    prefix: "CERT",
    description: "Official income verification certificate. Verified sequentially by Talati (village income data), Revenue (dues check), and Tehsildar.",
    requiredDocs: ["Salary Slip / Income Self-Declaration", "Ration Card", "Aadhaar Card"],
    dynamicFields: [
      { name: "annualIncome", label: "Declared Annual Household Income (₹)", type: "number", required: true },
      { name: "incomeSource", label: "Primary Income Source (Agriculture/Salaried/Business)", type: "text", required: true },
      { name: "purpose", label: "Purpose of Certificate (Education/Scholarship/Subsidy)", type: "text", required: true }
    ]
  },
  "caste-certificate": {
    serviceId: "caste-certificate",
    title: "Caste Certificate",
    category: "Certificates",
    serviceType: "multi-office",
    primaryOffice: "Tehsildar",
    officeChain: ["Talati", "Tehsildar"],
    prefix: "CERT",
    description: "Official category certificate requiring Talati village record confirmation and Tehsildar legal check.",
    requiredDocs: ["Father/Relative Caste Certificate", "School Leaving Certificate"],
    dynamicFields: [
      { name: "casteCategory", label: "Caste Category (General / OBC / SC / ST / EWS)", type: "text", required: true },
      { name: "subCaste", label: "Sub-Caste Name", type: "text", required: true },
      { name: "fatherName", label: "Father Full Name", type: "text", required: true }
    ]
  },
  "residence-certificate": {
    serviceId: "residence-certificate",
    title: "Residence / Domicile Certificate",
    category: "Certificates",
    serviceType: "multi-office",
    primaryOffice: "Tehsildar",
    officeChain: ["Talati", "Tehsildar"],
    prefix: "CERT",
    description: "Proof of domicile requiring Talati village residence confirmation.",
    requiredDocs: ["Electricity Bill / Rent Agreement", "Aadhaar Card"],
    dynamicFields: [
      { name: "stayDurationYears", label: "Duration of Residence (Years)", type: "number", required: true },
      { name: "villageName", label: "Village / Gram Panchayat Name", type: "text", required: true }
    ]
  },
  "solvency-certificate": {
    serviceId: "solvency-certificate",
    title: "Solvency Certificate",
    category: "Certificates",
    serviceType: "single-office",
    primaryOffice: "Tehsildar",
    officeChain: ["Tehsildar"],
    prefix: "CERT",
    description: "Financial solvency evaluation certificate by Tehsil administration.",
    requiredDocs: ["Bank Balance Certificate", "Property Valuer Report"],
    dynamicFields: [
      { name: "solvencyAmount", label: "Required Solvency Amount (₹)", type: "number", required: true },
      { name: "bankName", label: "Banker / Valuer Name", type: "text", required: true }
    ]
  },
  "agriculturist-certificate": {
    serviceId: "agriculturist-certificate",
    title: "Agriculturist Certificate",
    category: "Certificates",
    serviceType: "multi-office",
    primaryOffice: "Tehsildar",
    officeChain: ["Talati", "Revenue", "Tehsildar"],
    prefix: "CERT",
    description: "Certificate proving status as a farmer. Requires Talati 7/12 extract check and Revenue ownership verification.",
    requiredDocs: ["7/12 Land Extract", "8-A Extract"],
    dynamicFields: [
      { name: "surveyNumber", label: "Agricultural Survey Number", type: "text", required: true },
      { name: "holdingArea", label: "Land Holding Area (Acres)", type: "number", required: true }
    ]
  },
  "legal-heir-certificate": {
    serviceId: "legal-heir-certificate",
    title: "Legal Heir Certificate",
    category: "Certificates",
    serviceType: "multi-office",
    primaryOffice: "Tehsildar",
    officeChain: ["Municipality", "Talati", "Tehsildar"],
    prefix: "CERT",
    description: "Official document listing surviving legal heirs of a deceased resident.",
    requiredDocs: ["Death Certificate (Municipal)", "Family Tree Affidavit"],
    dynamicFields: [
      { name: "deceasedName", label: "Deceased Name", type: "text", required: true },
      { name: "deathCertNo", label: "Death Certificate Registration No", type: "text", required: true },
      { name: "heirNames", label: "Names & Relations of Legal Heirs", type: "text", required: true }
    ]
  },

  // --- 4. Revenue Office Services ---
  "land-revenue-collection": {
    serviceId: "land-revenue-collection",
    title: "Land Revenue Collection & Digital Receipts",
    category: "Land Records",
    serviceType: "single-office",
    primaryOffice: "Revenue",
    officeChain: ["Revenue"],
    prefix: "APP",
    description: "Direct payment of annual land revenue taxes and instant digital receipt generation.",
    requiredDocs: ["Latest Land Revenue Receipt"],
    dynamicFields: [
      { name: "surveyNumber", label: "Survey / Parcel Number", type: "text", required: true },
      { name: "villageCode", label: "Village Code", type: "text", required: true }
    ]
  },
  "property-land-mutation": {
    serviceId: "property-land-mutation",
    title: "Property / Land Mutation (Ownership Transfer)",
    category: "Land Records",
    serviceType: "multi-office",
    primaryOffice: "Revenue",
    officeChain: ["Talati", "Revenue", "Municipality"],
    prefix: "APP",
    description: "Land title transfer requiring Talati village land register update and Municipality tax linkage.",
    requiredDocs: ["Registered Sale Deed / Gift Deed", "7/12 Extract"],
    dynamicFields: [
      { name: "surveyNumber", label: "Survey Number", type: "text", required: true },
      { name: "oldOwnerName", label: "Previous Owner Name", type: "text", required: true },
      { name: "newOwnerName", label: "New Owner Name", type: "text", required: true }
    ]
  },
  "encumbrance-certificate": {
    serviceId: "encumbrance-certificate",
    title: "Encumbrance Certificate (Loan/Mortgage History)",
    category: "Land Records",
    serviceType: "single-office",
    primaryOffice: "Revenue",
    officeChain: ["Revenue"],
    prefix: "CERT",
    description: "Official record showing bank loans or registered mortgages on a land survey parcel.",
    requiredDocs: ["Index II / Sale Deed"],
    dynamicFields: [
      { name: "surveyNumber", label: "Survey Number", type: "text", required: true },
      { name: "periodYears", label: "Search Period (e.g. 12 Years / 30 Years)", type: "number", required: true }
    ]
  },

  // --- 5. Talati Office Services ---
  "7-12-extract": {
    serviceId: "7-12-extract",
    title: "7/12 Extract (Land Ownership Record) Issuance",
    category: "Land Records",
    serviceType: "single-office",
    primaryOffice: "Talati",
    officeChain: ["Talati"],
    prefix: "CERT",
    description: "Village land ownership and crop cultivation record extract issued with Talati digital signature.",
    requiredDocs: ["Aadhaar Proof"],
    dynamicFields: [
      { name: "surveyNumber", label: "Survey / Gut Number", type: "text", required: true },
      { name: "villageName", label: "Village Name", type: "text", required: true }
    ]
  },
  "8-a-extract": {
    serviceId: "8-a-extract",
    title: "8-A Extract Issuance",
    category: "Land Records",
    serviceType: "single-office",
    primaryOffice: "Talati",
    officeChain: ["Talati"],
    prefix: "CERT",
    description: "Consolidated holding summary of land parcels under a single landholder in the village.",
    requiredDocs: ["Aadhaar Proof"],
    dynamicFields: [
      { name: "khataNumber", label: "Khata / Account Number", type: "text", required: true }
    ]
  },
  "crop-loss-verification": {
    serviceId: "crop-loss-verification",
    title: "Crop Loss Field Verification & Relief Certificate",
    category: "Village Services",
    serviceType: "multi-office",
    primaryOffice: "Talati",
    officeChain: ["Talati", "Tehsildar"],
    prefix: "CERT",
    description: "On-field crop damage survey by Talati followed by Tehsildar relief disbursement approval.",
    requiredDocs: ["Damaged Crop Geo-tagged Photo", "7/12 Extract"],
    dynamicFields: [
      { name: "surveyNumber", label: "Survey Number", type: "text", required: true },
      { name: "cropType", label: "Affected Crop (Cotton/Soybean/Wheat)", type: "text", required: true },
      { name: "damagePercentage", label: "Estimated Damage (%)", type: "number", required: true }
    ]
  }
};

// 📊 Realistic Master Datasets for Federated Cross-Office Queries
export const MASTER_DATASETS = {
  // Dues Ledger shared across exchange layer
  duesLedger: [
    {
      surveyOrPropertyId: "PROP-MH-402",
      aadhaarId: "9876-5432-1000",
      officeName: "Municipality",
      dueType: "Property Tax Arrears FY 2025-26",
      amount: 3400,
      isPaid: false
    },
    {
      surveyOrPropertyId: "SRV-103",
      aadhaarId: "9876-5432-1002",
      officeName: "Revenue",
      dueType: "Unpaid Land Revenue Cess",
      amount: 1850,
      isPaid: false
    }
  ],

  // Talati Village Land Register (7/12)
  talatiLandRegister: [
    { surveyNumber: "SRV-101", ownerName: "Pavan Kumar", aadhaarId: "9876-5432-1000", areaAcres: 3.5, crop: "Sugarcane", status: "Verified Clear" },
    { surveyNumber: "SRV-102", ownerName: "Rajesh Patil", aadhaarId: "9876-5432-1001", areaAcres: 2.1, crop: "Cotton", status: "Verified Clear" },
    { surveyNumber: "SRV-103", ownerName: "Suresh Deshmukh", aadhaarId: "9876-5432-1002", areaAcres: 4.8, crop: "Soybean", status: "Dues Pending" },
    { surveyNumber: "SRV-104", ownerName: "Anita Sharma", aadhaarId: "9876-5432-1003", areaAcres: 1.5, crop: "Wheat", status: "Field Visit Scheduled" }
  ],

  // Tehsildar Income Records
  tehsildarIncomeRecords: [
    { aadhaarId: "9876-5432-1000", declaredIncome: 85000, category: "Low Income Group (LIG)", verified: true },
    { aadhaarId: "9876-5432-1001", declaredIncome: 140000, category: "Middle Income Group", verified: true },
    { aadhaarId: "9876-5432-1002", declaredIncome: 60000, category: "BPL Category", verified: true }
  ],

  // Municipal Property Tax Records
  municipalPropertyMaster: [
    { propertyId: "PROP-MH-401", ownerName: "Pavan Kumar", builtUpArea: 1200, taxValue: 12500, taxStatus: "Paid" },
    { propertyId: "PROP-MH-402", ownerName: "Pavan Kumar", builtUpArea: 850, taxValue: 3400, taxStatus: "Pending", pendingAmount: 3400 }
  ]
};

// ⚙️ Core Section 0 Routing Function
export const runOfficeRoutingCheck = (serviceId, applicantDetails) => {
  const serviceConfig = SERVICE_OFFICE_MAP[serviceId] || {
    serviceId,
    title: "Government Service",
    category: "General",
    serviceType: "single-office",
    primaryOffice: "Municipality",
    officeChain: ["Municipality"],
    prefix: "APP"
  };

  const chain = serviceConfig.officeChain;
  const initialOffice = chain[0];
  const isMultiOffice = serviceConfig.serviceType === "multi-office";

  // Check if applicant or linked property/survey has pending dues in DuesLedger
  const targetId = applicantDetails.surveyNumber || applicantDetails.propertyId || applicantDetails.aadhaarId;
  const matchedDue = MASTER_DATASETS.duesLedger.find(
    (d) => !d.isPaid && (d.surveyOrPropertyId === targetId || d.aadhaarId === applicantDetails.aadhaarId)
  );

  const stageVerifications = chain.map((off, idx) => ({
    officeName: off,
    stageName: `Step ${idx + 1}: ${off} Verification`,
    status: idx === 0 ? (matchedDue ? "dues_pending" : "pending") : "pending",
    officerRemarks: idx === 0 && matchedDue ? `Pending dues found at ${matchedDue.officeName}: ₹${matchedDue.amount}` : "Queued",
    verifiedBy: null,
    verifiedAt: null
  }));

  let status = "Submitted";
  if (matchedDue) {
    status = "Revenue Dues Pending";
  } else if (isMultiOffice) {
    status = `${initialOffice} Verification Pending`;
  } else {
    status = "Under Verification";
  }

  return {
    routingType: serviceConfig.serviceType,
    officeChain: chain,
    primaryOffice: serviceConfig.primaryOffice,
    currentOffice: initialOffice,
    currentStageIndex: 0,
    stageVerifications,
    pendingDues: matchedDue
      ? {
          officeName: matchedDue.officeName,
          dueType: matchedDue.dueType,
          amount: matchedDue.amount,
          surveyOrPropertyId: matchedDue.surveyOrPropertyId,
          isPaid: false
        }
      : { amount: 0, isPaid: false },
    status
  };
};
