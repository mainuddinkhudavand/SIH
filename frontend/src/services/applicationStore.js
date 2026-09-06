import API from "./api";

// 🏛️ Centralized Store Key for LocalStorage
const STORAGE_KEY = "egram_applications_master";
const SYNC_EVENT = "egram_application_updated";

// Initial Master Applications Data covering all 4 offices with Approved & Rejected Services
const INITIAL_MASTER_APPLICATIONS = [
  // 🏢 MUNICIPALITY OFFICE APPLICATIONS
  {
    _id: "muni-101",
    applicationId: "APP-401928",
    title: "Streetlight Installation & Repair Request",
    serviceId: "streetlight-repair",
    serviceType: "Civic Utilities",
    governmentFee: { amount: 20, isPaid: true },
    applicantDetails: { fullName: "Ramesh Patil", phone: "+91 98765 43210", aadhaarId: "9876-5432-1001", wardCode: "WARD-02", address: "Plot 18, Ward 2, City Center" },
    status: "Municipal Review Pending",
    primaryOffice: "Municipality",
    currentOffice: "Municipality",
    officeChain: ["Municipality"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Municipality", stageName: "Step 1: Municipal Engineering Audit", status: "pending", officerRemarks: "Inspection scheduled." }
    ],
    documents: [{ docType: "Pole Location Photo", fileUrl: "/uploads/pole_photo.jpg" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "muni-102",
    applicationId: "APP-509124",
    title: "Building Plan Sanction & Zoning Clearance",
    serviceId: "building-plan-sanction",
    serviceType: "Civic Utilities",
    governmentFee: { amount: 750, isPaid: true },
    applicantDetails: { fullName: "Anita Sharma", phone: "+91 98765 43211", aadhaarId: "9876-5432-1003", surveyNumber: "SRV-104", address: "Plot 42, Sector 1, Industrial Zone" },
    status: "Municipal Review Pending",
    primaryOffice: "Municipality",
    currentOffice: "Municipality",
    officeChain: ["Talati", "Municipality"],
    currentStageIndex: 1,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Talati Land-Use Check", status: "cleared", officerRemarks: "Land boundary & 7/12 extract verified clear.", verifiedBy: "Talati Officer Patil" },
      { officeName: "Municipality", stageName: "Step 2: Municipal Zoning Approval", status: "pending" }
    ],
    documents: [{ docType: "Architect Blueprints", fileUrl: "/uploads/architect_plan.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "muni-103",
    applicationId: "CERT-102948",
    title: "Birth Certificate Registration & Digital Issuance",
    serviceId: "birth-certificate",
    serviceType: "Certificates",
    governmentFee: { amount: 25, isPaid: true },
    applicantDetails: { fullName: "Pavan Kumar", phone: "+91 98765 43210", aadhaarId: "9876-5432-1000", deceasedName: "Baby of Pavan", address: "Ward 4 Civil Hospital" },
    status: "Municipal Verification Pending",
    primaryOffice: "Municipality",
    currentOffice: "Municipality",
    officeChain: ["Municipality"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Municipality", stageName: "Step 1: Municipal Registrar Verification", status: "pending" }
    ],
    documents: [{ docType: "Hospital Birth Slip", fileUrl: "/uploads/hospital_slip.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "muni-104",
    applicationId: "APP-884920",
    title: "Trade & Business License Sanction",
    serviceId: "trade-license",
    serviceType: "Licenses",
    governmentFee: { amount: 500, isPaid: true },
    applicantDetails: { fullName: "Sanjay Gupta", phone: "+91 98765 88990", aadhaarId: "9876-5432-8811", wardCode: "WARD-05", address: "Shop 12, Main Market" },
    status: "Approved",
    primaryOffice: "Municipality",
    currentOffice: "Completed",
    officeChain: ["Municipality"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Municipality", stageName: "Step 1: Municipal Approval", status: "cleared", officerRemarks: "Commercial trade license approved & issued.", verifiedBy: "Municipal Health Officer" }
    ],
    approvalDate: new Date().toISOString(),
    issuedCertificate: {
      certificateId: "CERT-TL-99410",
      issuedAt: new Date().toISOString(),
      digitalSignature: "SIG-DIGI-MUNI-LIC-884920",
      qrCodeData: "https://egram.gov.in/verify/APP-884920"
    },
    documents: [{ docType: "Store Lease Agreement", fileUrl: "/uploads/lease.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "muni-105",
    applicationId: "APP-302910",
    title: "Water Connection Pipe Line Extension",
    serviceId: "water-connection",
    serviceType: "Civic Utilities",
    governmentFee: { amount: 200, isPaid: true },
    applicantDetails: { fullName: "Vikas Verma", phone: "+91 98765 11223", aadhaarId: "9876-5432-9900", wardCode: "WARD-01", address: "House 90, Ward 1" },
    status: "Rejected",
    primaryOffice: "Municipality",
    currentOffice: "Municipality",
    rejectionReason: "Commercial line request submitted under residential tariff category.",
    officeChain: ["Municipality"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Municipality", stageName: "Step 1: Water Dept Verification", status: "rejected", officerRemarks: "Incorrect tariff category requested." }
    ],
    documents: [{ docType: "House Tax Receipt", fileUrl: "/uploads/house_tax.pdf" }],
    createdAt: new Date().toISOString()
  },

  // ⚖️ TEHSILDAR OFFICE APPLICATIONS
  {
    _id: "teh-101",
    applicationId: "CERT-847291",
    title: "Domicile & Permanent Residence Certificate",
    serviceId: "domicile-certificate",
    serviceType: "Certificates",
    governmentFee: { amount: 50, isPaid: true },
    applicantDetails: { fullName: "Pavan Kumar", phone: "+91 98765 43210", aadhaarId: "9876-5432-1000", address: "Plot 14, Green Valley, Dist Nashik" },
    status: "Pending Citizen Dues Payment",
    primaryOffice: "Tehsildar",
    currentOffice: "Tehsildar",
    officeChain: ["Talati", "Revenue", "Tehsildar"],
    currentStageIndex: 1,
    pendingDues: {
      required: true,
      amount: 450,
      reason: "Property Tax & Civic Water Arrears",
      surveyOrPropertyId: "PROP-99201",
      isPaid: false
    },
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Land Record Audit", status: "cleared", officerRemarks: "7/12 land extract verified.", verifiedBy: "Talati Officer" },
      { officeName: "Revenue", stageName: "Step 2: Revenue Dues Audit", status: "dues_pending", officerRemarks: "Arrears ₹450 pending payment by applicant." },
      { officeName: "Tehsildar", stageName: "Step 3: Executive Approval", status: "pending" }
    ],
    documents: [{ docType: "Aadhaar Card", fileUrl: "/uploads/aadhaar.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "teh-102",
    applicationId: "CERT-672910",
    title: "Annual Family Income Certificate",
    serviceId: "income-certificate",
    serviceType: "Certificates",
    governmentFee: { amount: 30, isPaid: true },
    applicantDetails: { fullName: "Suresh Deshmukh", phone: "+91 98220 11223", aadhaarId: "9876-5432-4411", address: "At Post Rahuri, Taluka Rahuri" },
    status: "Tehsildar Verification Pending",
    primaryOffice: "Tehsildar",
    currentOffice: "Tehsildar",
    officeChain: ["Talati", "Tehsildar"],
    currentStageIndex: 1,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Village Crop & Income Audit", status: "cleared", officerRemarks: "Verified annual crop yield income ₹75,000.", verifiedBy: "Talati Officer" },
      { officeName: "Tehsildar", stageName: "Step 2: Income Sanction", status: "pending" }
    ],
    documents: [{ docType: "ITR / Income Affidavit", fileUrl: "/uploads/affidavit.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "teh-103",
    applicationId: "CERT-908123",
    title: "Caste Certificate & Tribe Verification",
    serviceId: "caste-certificate",
    serviceType: "Certificates",
    governmentFee: { amount: 50, isPaid: true },
    applicantDetails: { fullName: "Pooja Kadam", phone: "+91 98331 44556", aadhaarId: "9876-5432-7722", address: "Ward 3, Village Shirdi" },
    status: "Approved",
    primaryOffice: "Tehsildar",
    currentOffice: "Completed",
    officeChain: ["Talati", "Tehsildar"],
    currentStageIndex: 1,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Ancestral Record Check", status: "cleared", officerRemarks: "School leaving certificate from 1967 verified.", verifiedBy: "Talati Officer" },
      { officeName: "Tehsildar", stageName: "Step 2: Sub-Divisional Approval", status: "cleared", officerRemarks: "Caste Certificate Issued.", verifiedBy: "Tehsildar Executive" }
    ],
    approvalDate: new Date().toISOString(),
    issuedCertificate: {
      certificateId: "CERT-CAST-55201",
      issuedAt: new Date().toISOString(),
      digitalSignature: "SIG-DIGI-TEH-CAST-908123",
      qrCodeData: "https://egram.gov.in/verify/CERT-908123"
    },
    documents: [{ docType: "School Leaving Certificate", fileUrl: "/uploads/school_lc.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "teh-104",
    applicationId: "CERT-441092",
    title: "Solvency & Financial Worth Certificate",
    serviceId: "solvency-certificate",
    serviceType: "Certificates",
    governmentFee: { amount: 100, isPaid: true },
    applicantDetails: { fullName: "Rohan Sawant", phone: "+91 98440 99887", aadhaarId: "9876-5432-3399", address: "Main Road, Sangamner" },
    status: "Rejected",
    primaryOffice: "Tehsildar",
    currentOffice: "Tehsildar",
    rejectionReason: "Property valuation report missing government engineer certification seal.",
    officeChain: ["Revenue", "Tehsildar"],
    currentStageIndex: 1,
    stageVerifications: [
      { officeName: "Revenue", stageName: "Step 1: Asset Valuation Check", status: "cleared", officerRemarks: "Asset records found.", verifiedBy: "Revenue Inspector" },
      { officeName: "Tehsildar", stageName: "Step 2: Solvency Issue", status: "rejected", officerRemarks: "Missing certified valuation report." }
    ],
    documents: [{ docType: "Property Valuation Document", fileUrl: "/uploads/valuation.pdf" }],
    createdAt: new Date().toISOString()
  },

  // 🌾 REVENUE OFFICE APPLICATIONS
  {
    _id: "rev-101",
    applicationId: "APP-602918",
    title: "Property Tax Assessment & Annual Mutation",
    serviceId: "property-tax-assessment",
    serviceType: "Revenue & Taxes",
    governmentFee: { amount: 150, isPaid: true },
    applicantDetails: { fullName: "Sunil Pawar", phone: "+91 97654 32109", aadhaarId: "9876-5432-2200", propertyId: "PROP-88120", address: "Gat No 45, Revenue Block A" },
    status: "Revenue Verification Pending",
    primaryOffice: "Revenue",
    currentOffice: "Revenue",
    officeChain: ["Revenue"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Revenue", stageName: "Step 1: Revenue Assessment Audit", status: "pending" }
    ],
    documents: [{ docType: "Sale Deed Copy", fileUrl: "/uploads/saledeed.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "rev-102",
    applicationId: "APP-718290",
    title: "Land Revenue Cess Clearance & NOC",
    serviceId: "land-revenue-clearance",
    serviceType: "Revenue & Taxes",
    governmentFee: { amount: 100, isPaid: true },
    applicantDetails: { fullName: "Mahesh Bhosale", phone: "+91 97654 99112", aadhaarId: "9876-5432-6633", surveyNumber: "SRV-309", address: "Post Akole, Survey 309" },
    status: "Pending Citizen Dues Payment",
    primaryOffice: "Revenue",
    currentOffice: "Revenue",
    officeChain: ["Talati", "Revenue"],
    currentStageIndex: 1,
    pendingDues: {
      required: true,
      amount: 1250,
      reason: "Unpaid Agricultural Land Cess Arrears (2024-2025)",
      surveyOrPropertyId: "SRV-309",
      isPaid: false
    },
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Land Crop Inspection", status: "cleared", officerRemarks: "Land boundaries verified.", verifiedBy: "Talati Officer" },
      { officeName: "Revenue", stageName: "Step 2: Cess Dues Verification", status: "dues_pending", officerRemarks: "Pending Land Cess ₹1,250." }
    ],
    documents: [{ docType: "Land Receipt 2023", fileUrl: "/uploads/land_receipt.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "rev-103",
    applicationId: "CERT-334910",
    title: "Agricultural Land Holder Status Certificate",
    serviceId: "agri-land-certificate",
    serviceType: "Certificates",
    governmentFee: { amount: 50, isPaid: true },
    applicantDetails: { fullName: "Ganpat Jadhav", phone: "+91 97654 00011", aadhaarId: "9876-5432-1144", address: "Gat 112, Kopargaon" },
    status: "Approved",
    primaryOffice: "Revenue",
    currentOffice: "Completed",
    officeChain: ["Talati", "Revenue"],
    currentStageIndex: 1,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Village Extract Verification", status: "cleared", officerRemarks: "7/12 extract matches agricultural land registry.", verifiedBy: "Talati Officer" },
      { officeName: "Revenue", stageName: "Step 2: Revenue Clearance & Issue", status: "cleared", officerRemarks: "Agricultural Farmer Status Certificate Issued.", verifiedBy: "Revenue Officer" }
    ],
    approvalDate: new Date().toISOString(),
    issuedCertificate: {
      certificateId: "CERT-AGRI-10293",
      issuedAt: new Date().toISOString(),
      digitalSignature: "SIG-DIGI-REV-AGRI-334910",
      qrCodeData: "https://egram.gov.in/verify/CERT-334910"
    },
    documents: [{ docType: "7/12 Extract Copy", fileUrl: "/uploads/712_extract.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "rev-104",
    applicationId: "APP-554109",
    title: "Non-Agricultural (NA) Land Conversion Permission",
    serviceId: "na-land-conversion",
    serviceType: "Revenue & Taxes",
    governmentFee: { amount: 1000, isPaid: true },
    applicantDetails: { fullName: "Kiran Shinde", phone: "+91 97654 77889", aadhaarId: "9876-5432-5588", address: "Plot 88, Revenue Circle 2" },
    status: "Rejected",
    primaryOffice: "Revenue",
    currentOffice: "Revenue",
    rejectionReason: "Proposed land falls within protected green-belt eco-zone.",
    officeChain: ["Talati", "Revenue", "Tehsildar"],
    currentStageIndex: 1,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Boundary Measurement", status: "cleared", officerRemarks: "Boundaries measured.", verifiedBy: "Talati Officer" },
      { officeName: "Revenue", stageName: "Step 2: Eco Zone Audit", status: "rejected", officerRemarks: "Falls under Eco-Sensitive Zone boundary." }
    ],
    documents: [{ docType: "Site Map & Blueprint", fileUrl: "/uploads/sitemap.pdf" }],
    createdAt: new Date().toISOString()
  },

  // 🚩 TALATI OFFICE APPLICATIONS
  {
    _id: "tal-101",
    applicationId: "APP-709123",
    title: "7/12 & 8A Land Rights Extracts Digital Verification",
    serviceId: "land-extract-712",
    serviceType: "Land Records",
    governmentFee: { amount: 15, isPaid: true },
    applicantDetails: { fullName: "Kavita More", phone: "+91 99887 65432", aadhaarId: "9876-5432-5500", surveyNumber: "SRV-201", address: "Village Chinchwad, Gat No 201" },
    status: "Talati Verification Pending",
    primaryOffice: "Talati",
    currentOffice: "Talati",
    officeChain: ["Talati"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Talati Digital Signature", status: "pending" }
    ],
    documents: [{ docType: "Old Record Copy", fileUrl: "/uploads/old_record.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "tal-102",
    applicationId: "APP-829104",
    title: "Legal Heirship & Family Succession Certification",
    serviceId: "heirship-certificate",
    serviceType: "Land Records",
    governmentFee: { amount: 100, isPaid: true },
    applicantDetails: { fullName: "Vikram Salunkhe", phone: "+91 99887 11223", aadhaarId: "9876-5432-3311", address: "At Post Loni, Taluka Rahata" },
    status: "Talati Verification Pending",
    primaryOffice: "Talati",
    currentOffice: "Talati",
    officeChain: ["Talati"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Panchnama & Village Inquiry", status: "pending" }
    ],
    documents: [{ docType: "Death Certificate of Deceased", fileUrl: "/uploads/death_cert.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "tal-103",
    applicationId: "CERT-771029",
    title: "Varai & Mutation Register Certificate (Haqq Mutation)",
    serviceId: "varai-mutation",
    serviceType: "Land Records",
    governmentFee: { amount: 50, isPaid: true },
    applicantDetails: { fullName: "Santosh Thorat", phone: "+91 99887 44332", aadhaarId: "9876-5432-9988", address: "Village Babhaleshwar" },
    status: "Approved",
    primaryOffice: "Talati",
    currentOffice: "Completed",
    officeChain: ["Talati"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Village Extract Confirmation", status: "cleared", officerRemarks: "Mutation entry #441 verified & confirmed in village register.", verifiedBy: "Talati Officer Sawant" }
    ],
    approvalDate: new Date().toISOString(),
    issuedCertificate: {
      certificateId: "CERT-VARAI-99102",
      issuedAt: new Date().toISOString(),
      digitalSignature: "SIG-DIGI-TAL-MUT-771029",
      qrCodeData: "https://egram.gov.in/verify/CERT-771029"
    },
    documents: [{ docType: "Mutation Entry Form", fileUrl: "/uploads/mutation_form.pdf" }],
    createdAt: new Date().toISOString()
  },
  {
    _id: "tal-104",
    applicationId: "APP-119283",
    title: "Boundary Dispute & Encroachment Spot Inspection",
    serviceId: "boundary-dispute",
    serviceType: "Land Records",
    governmentFee: { amount: 200, isPaid: true },
    applicantDetails: { fullName: "Dipak Wagh", phone: "+91 99887 55443", aadhaarId: "9876-5432-6611", address: "Survey 40, Gram Panchayat Circle" },
    status: "Rejected",
    primaryOffice: "Talati",
    currentOffice: "Talati",
    rejectionReason: "Applicant failed to produce original survey map from Land Records Office.",
    officeChain: ["Talati"],
    currentStageIndex: 0,
    stageVerifications: [
      { officeName: "Talati", stageName: "Step 1: Spot Measurement Audit", status: "rejected", officerRemarks: "Original land survey map missing." }
    ],
    documents: [{ docType: "Uncertified Sketch", fileUrl: "/uploads/sketch.pdf" }],
    createdAt: new Date().toISOString()
  }
];

// Helper to get master applications from LocalStorage or initialize default
export const getAllApplicationsFromStore = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error("Error loading application store:", err);
  }
  // Initialize LocalStorage with default applications
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MASTER_APPLICATIONS));
  return INITIAL_MASTER_APPLICATIONS;
};

// Helper to filter applications for a specific office portal ("Municipality", "Tehsildar", "Revenue", "Talati")
export const getOfficeApplicationsFromStore = (officeName) => {
  const allApps = getAllApplicationsFromStore();
  return allApps.filter(
    (app) =>
      app.currentOffice === officeName ||
      app.primaryOffice === officeName ||
      (Array.isArray(app.officeChain) && app.officeChain.includes(officeName))
  );
};

// Helper to find a specific application by ID or custom applicationId
export const getApplicationByIdFromStore = (id) => {
  const allApps = getAllApplicationsFromStore();
  const searchId = (id || "").toString().trim().toLowerCase();
  return (
    allApps.find(
      (a) =>
        (a._id && a._id.toString().toLowerCase() === searchId) ||
        (a.applicationId && a.applicationId.toString().toLowerCase() === searchId)
    ) || null
  );
};

// Helper to update application status & stage verifications seamlessly
export const updateApplicationInStore = (appId, updatePayload, notifyBackend = true) => {
  const allApps = getAllApplicationsFromStore();
  let updatedApp = null;

  const action = updatePayload.action;
  const officerRemarks = updatePayload.officerRemarks || updatePayload.note || "";
  const verifiedBy = updatePayload.verifiedBy || `${updatePayload.officeName || "Office"} Officer`;

  const updatedApps = allApps.map((item) => {
    if (item._id === appId || item.applicationId === appId) {
      const stageIdx = item.currentStageIndex || 0;
      const officeChain = item.officeChain || [item.currentOffice || "Municipality"];

      let updatedVerifications = (item.stageVerifications || []).map((s, idx) => {
        if (idx === stageIdx || s.officeName === item.currentOffice) {
          return {
            ...s,
            status: action === "approve" ? "cleared" : action === "discrepancy" ? "discrepancy" : "rejected",
            officerRemarks: officerRemarks || s.officerRemarks || `Officer Action: ${action ? action.toUpperCase() : "UPDATED"}`,
            verifiedBy: verifiedBy,
            verifiedAt: new Date().toISOString()
          };
        }
        return s;
      });

      let nextStatus = item.status;
      let nextOffice = item.currentOffice;
      let nextStageIdx = stageIdx;
      let approvalDate = item.approvalDate;
      let issuedCertificate = item.issuedCertificate;
      let rejectionReason = item.rejectionReason;

      if (action === "approve") {
        const nextIdx = stageIdx + 1;
        if (nextIdx < officeChain.length) {
          nextStageIdx = nextIdx;
          nextOffice = officeChain[nextIdx];
          nextStatus = `${nextOffice} Verification Pending`;
        } else {
          // Final office clearance -> Application fully Approved
          nextOffice = "Completed";
          nextStatus = "Approved";
          approvalDate = new Date().toISOString();
          issuedCertificate = item.issuedCertificate || {
            certificateId: `CERT-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
            issuedAt: new Date().toISOString(),
            digitalSignature: `SIG-DIGI-OFFICIAL-EGRAM-${Date.now()}`,
            qrCodeData: `https://egram.gov.in/verify/${item.applicationId}`
          };
        }
      } else if (action === "discrepancy") {
        nextStatus = "Discrepancy Found";
        rejectionReason = officerRemarks || "Discrepancy flagged by officer during verification.";
      } else if (action === "reject") {
        nextStatus = "Rejected";
        rejectionReason = officerRemarks || "Application rejected during office review.";
      }

      updatedApp = {
        ...item,
        ...updatePayload,
        status: action ? nextStatus : (updatePayload.status || item.status),
        currentOffice: action ? nextOffice : (updatePayload.currentOffice || item.currentOffice),
        currentStageIndex: nextStageIdx,
        stageVerifications: updatedVerifications,
        approvalDate: approvalDate,
        issuedCertificate: issuedCertificate,
        rejectionReason: rejectionReason,
        updatedAt: new Date().toISOString()
      };
      return updatedApp;
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedApps));

  // Dispatch custom event to notify all active UI components for instant re-render
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { appId, updatedApp } }));

  // Also sync with backend asynchronously if backend is available
  if (notifyBackend && appId && action) {
    API.put(`/applications/${appId}/verify-stage`, {
      action,
      officerRemarks,
      verifiedBy
    }).catch((err) => console.warn("Backend sync notice (offline mode active):", err.message));
  }

  return updatedApp;
};

// Helper for Citizen Dues Payment
export const payDuesInStore = (appId, paymentPayload) => {
  const allApps = getAllApplicationsFromStore();
  let updatedApp = null;
  const receiptNo = `PAY-RC-${Math.floor(100000 + Math.random() * 900000)}`;

  const updatedApps = allApps.map((item) => {
    if (item._id === appId || item.applicationId === appId) {
      const nextIdx = (item.currentStageIndex || 0) + 1;
      const nextOffice = item.officeChain?.[nextIdx] || "Completed";

      const updatedVerifications = (item.stageVerifications || []).map((s) => {
        if (s.status === "dues_pending" || s.officeName === item.currentOffice) {
          return {
            ...s,
            status: "cleared",
            officerRemarks: `Dues ₹${item.pendingDues?.amount || 450} paid via ${paymentPayload.paymentMethod} (${paymentPayload.bankName || "Online Bank"}). Receipt: ${receiptNo}`,
            verifiedBy: "Online Dues Engine",
            verifiedAt: new Date().toISOString()
          };
        }
        return s;
      });

      const isFinal = nextIdx >= (item.officeChain?.length || 1);

      updatedApp = {
        ...item,
        status: isFinal ? "Approved" : `${nextOffice} Verification Pending`,
        currentOffice: isFinal ? "Completed" : nextOffice,
        currentStageIndex: nextIdx,
        approvalDate: isFinal ? new Date().toISOString() : item.approvalDate,
        issuedCertificate: isFinal
          ? {
              certificateId: `CERT-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
              issuedAt: new Date().toISOString(),
              digitalSignature: `SIG-DIGI-OFFICIAL-EGRAM-${Date.now()}`,
              qrCodeData: `https://egram.gov.in/verify/${item.applicationId}`
            }
          : item.issuedCertificate,
        pendingDues: {
          ...item.pendingDues,
          isPaid: true,
          paymentMethod: paymentPayload.paymentMethod,
          bankName: paymentPayload.bankName,
          accountNumber: paymentPayload.accountNumber,
          accountHolderName: paymentPayload.accountHolderName,
          ifscCode: paymentPayload.ifscCode,
          upiId: paymentPayload.upiId,
          cardType: paymentPayload.cardType,
          paymentReceiptNo: receiptNo,
          paidAt: new Date().toISOString()
        },
        stageVerifications: updatedVerifications,
        updatedAt: new Date().toISOString()
      };
      return updatedApp;
    }
    return item;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedApps));
  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { appId, updatedApp } }));

  // Asynchronously attempt backend sync
  API.post(`/applications/${appId}/pay-dues`, paymentPayload).catch((err) =>
    console.warn("Backend dues payment sync notice (offline mode active):", err.message)
  );

  return updatedApp;
};

// Helper to create & insert a new application into the central store seamlessly
export const createNewApplicationInStore = (payload) => {
  const serviceId = payload.serviceId || "custom-service";
  const isCert = serviceId.includes("certificate") || serviceId.includes("extract") || serviceId.includes("cert");
  const prefix = isCert ? "CERT" : "APP";
  const applicationId = `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;

  let primaryOffice = "Municipality";
  let officeChain = ["Municipality"];

  if (serviceId.includes("income") || serviceId.includes("caste") || serviceId.includes("domicile") || serviceId.includes("residence") || serviceId.includes("solvency") || serviceId.includes("heir")) {
    primaryOffice = "Tehsildar";
    officeChain = ["Talati", "Tehsildar"];
  } else if (serviceId.includes("land") || serviceId.includes("mutation") || serviceId.includes("revenue") || serviceId.includes("tax")) {
    primaryOffice = "Revenue";
    officeChain = ["Talati", "Revenue"];
  } else if (serviceId.includes("7-12") || serviceId.includes("8-a") || serviceId.includes("crop") || serviceId.includes("extract")) {
    primaryOffice = "Talati";
    officeChain = ["Talati"];
  }

  const newApp = {
    _id: `app-local-${Date.now()}`,
    applicationId,
    serviceId,
    serviceType: payload.serviceType || "E-Governance Public Service",
    title: payload.title || payload.serviceTitle || `${serviceId.replace("-", " ").toUpperCase()} Request`,
    primaryOffice,
    currentOffice: officeChain[0],
    officeChain,
    currentStageIndex: 0,
    governmentFee: {
      amount: payload.governmentFee || 50,
      isPaid: true
    },
    status: `${officeChain[0]} Verification Pending`,
    applicantDetails: {
      fullName: payload.applicantDetails?.fullName || "Citizen Resident",
      phone: payload.applicantDetails?.phone || "+91 98765 43210",
      email: payload.applicantDetails?.email || "citizen@egram.gov.in",
      aadhaarId: payload.applicantDetails?.aadhaarId || "9876-5432-1000",
      address: payload.applicantDetails?.address || "Village Ward #2, Gram Panchayat Zone",
      ...payload.applicantDetails
    },
    documents: payload.documents || [
      { docType: "Aadhaar Identity Proof", fileUrl: "/uploads/aadhaar.pdf" },
      { docType: "Address Verification Slip", fileUrl: "/uploads/proof.pdf" }
    ],
    stageVerifications: officeChain.map((off, idx) => ({
      officeName: off,
      stageName: `Step ${idx + 1}: ${off} Verification Audit`,
      status: "pending"
    })),
    createdAt: new Date().toISOString()
  };

  const allApps = getAllApplicationsFromStore();
  const updatedApps = [newApp, ...allApps];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedApps));

  window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: { appId: applicationId, updatedApp: newApp } }));

  // Asynchronously attempt backend API creation if connected
  API.post("/applications/submit", payload).catch((err) =>
    console.warn("Backend API submit notice (offline local store active):", err.message)
  );

  return newApp;
};

// Subscribe helper for components to re-render automatically on updates
export const subscribeToAppStore = (callback) => {
  const handler = (e) => callback(e.detail);
  window.addEventListener(SYNC_EVENT, handler);
  return () => window.removeEventListener(SYNC_EVENT, handler);
};
