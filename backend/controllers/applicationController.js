import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";
import { SERVICE_OFFICE_MAP, runOfficeRoutingCheck, MASTER_DATASETS, CITIZENS_MASTER_DATASET } from "../utils/routingEngine.js";
import { triggerNotificationEvent } from "../utils/notificationEngine.js";

// 📋 Get List of All Categorized E-Governance Services
export const getServicesList = async (req, res) => {
  try {
    return res.json({
      success: true,
      services: Object.values(SERVICE_OFFICE_MAP)
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching services list" });
  }
};

// 👨‍👩‍👧‍👦 Get Full Citizen Master Directory across all 4 Offices
export const getCitizensMasterDirectory = async (req, res) => {
  try {
    return res.json({
      success: true,
      count: CITIZENS_MASTER_DATASET.length,
      citizens: CITIZENS_MASTER_DATASET
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching citizens master dataset" });
  }
};

// 📝 Citizen Submit Application (Triggers Section 0 Routing)
export const createApplication = async (req, res) => {
  try {
    const { serviceId, applicantDetails, documents } = req.body;
    const userId = req.user?._id || req.user?.id;

    const serviceConfig = SERVICE_OFFICE_MAP[serviceId] || {
      serviceId: serviceId || "custom-service",
      title: "Government Civic Application",
      category: "General Services",
      serviceType: "single-office",
      primaryOffice: "Municipality",
      officeChain: ["Municipality"],
      prefix: "APP"
    };

    const isCertificate = serviceConfig.prefix === "CERT" || serviceConfig.category === "Certificates";
    const prefix = isCertificate ? "CERT" : "APP";
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const applicationId = `${prefix}-${randomCode}`;

    // Execute Section 0 Routing Engine Logic
    const routingResult = runOfficeRoutingCheck(serviceId, applicantDetails);

    const application = new Application({
      applicationId,
      user: userId,
      serviceId,
      serviceType: serviceConfig.category,
      title: serviceConfig.title,
      routingType: routingResult.routingType,
      officeChain: routingResult.officeChain,
      primaryOffice: routingResult.primaryOffice,
      currentOffice: routingResult.currentOffice,
      currentStageIndex: routingResult.currentStageIndex,
      applicantDetails: {
        fullName: applicantDetails.fullName || req.user?.name || "Citizen Resident",
        phone: applicantDetails.phone || req.user?.phone || "+91 9876543210",
        email: applicantDetails.email || req.user?.email || "citizen@egram.gov.in",
        address: applicantDetails.address || "Village Ward #2, Gram Panchayat Zone",
        aadhaarId: applicantDetails.aadhaarId || "9876-5432-1000",
        surveyNumber: applicantDetails.surveyNumber || "",
        propertyId: applicantDetails.propertyId || "",
        wardCode: applicantDetails.wardCode || "",
        annualIncome: applicantDetails.annualIncome || "",
        casteCategory: applicantDetails.casteCategory || "",
        deceasedName: applicantDetails.deceasedName || "",
        businessName: applicantDetails.businessName || "",
        reason: applicantDetails.reason || ""
      },
      documents: documents || [
        { docType: "Aadhaar Identity Proof", fileUrl: "/uploads/sample_aadhaar.pdf" },
        { docType: "Address / Domicile Proof", fileUrl: "/uploads/sample_proof.pdf" }
      ],
      stageVerifications: routingResult.stageVerifications,
      pendingDues: routingResult.pendingDues,
      status: routingResult.status,
      assignedOfficer: `${routingResult.currentOffice} Officer-In-Charge`,
      timeline: [
        {
          stage: "Step 0.1: Service Selected",
          status: "Submitted",
          updatedBy: "Citizen",
          note: `Selected service: ${serviceConfig.title}. Application ID ${applicationId} generated.`,
          timestamp: new Date()
        },
        {
          stage: "Step 0.3: Sequential Office Routing",
          status: routingResult.status,
          updatedBy: "GovConnect Exchange Layer",
          note: `Routed to ${routingResult.currentOffice}. Verification Chain: ${routingResult.officeChain.join(" → ")}.`,
          timestamp: new Date()
        }
      ]
    });

    await application.save();

    await AuditLog.create({
      action: "APPLICATION_SUBMITTED_AND_ROUTED",
      performedBy: userId,
      entity: "Application",
      details: `Application ${applicationId} created for ${serviceConfig.title} and routed to ${routingResult.currentOffice}`,
      ipAddress: req.ip || "127.0.0.1"
    });

    return res.status(201).json({
      success: true,
      message: "Application successfully created and routed through office exchange layer.",
      application
    });
  } catch (error) {
    console.error("Error creating application:", error);
    return res.status(500).json({ success: false, message: "Failed to submit application", error: error.message });
  }
};

// 💳 Step 1.8: Integrated Dues Payment & Auto-Clearance Endpoint
export const payApplicationDues = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentMethod, bankName, accountNumber, accountHolderName, ifscCode } = req.body;

    const application = await Application.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { applicationId: id }
      ]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    if (!application.pendingDues || application.pendingDues.isPaid) {
      return res.status(400).json({ success: false, message: "No active unpaid dues found for this application." });
    }

    const receiptNo = `PAY-RC-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    // Store complete Bank & Payment Info
    application.pendingDues.isPaid = true;
    application.pendingDues.paymentMethod = paymentMethod || "NetBanking";
    application.pendingDues.bankName = bankName || "State Bank of India";
    application.pendingDues.accountNumber = accountNumber ? `XXXX-${accountNumber.slice(-4)}` : "XXXX-4892";
    application.pendingDues.accountHolderName = accountHolderName || application.applicantDetails.fullName;
    application.pendingDues.ifscCode = ifscCode || "SBIN0001420";
    application.pendingDues.paymentReceiptNo = receiptNo;
    application.pendingDues.paidAt = new Date();

    // Clear matching entry in shared Dues Ledger
    const targetId = application.pendingDues.surveyOrPropertyId;
    const dueIndex = MASTER_DATASETS.duesLedger.findIndex(
      (d) => d.surveyOrPropertyId === targetId || d.aadhaarId === application.applicantDetails.aadhaarId
    );
    if (dueIndex !== -1) {
      MASTER_DATASETS.duesLedger[dueIndex].isPaid = true;
    }

    // Mark current office stage verification as CLEARED
    const stageIdx = application.currentStageIndex;
    if (application.stageVerifications[stageIdx]) {
      application.stageVerifications[stageIdx].status = "cleared";
      application.stageVerifications[stageIdx].officerRemarks = `Dues ₹${application.pendingDues.amount} paid via ${paymentMethod || "NetBanking"} (${bankName || "SBI"}). Receipt: ${receiptNo}`;
      application.stageVerifications[stageIdx].verifiedBy = "Online Payment Engine";
      application.stageVerifications[stageIdx].verifiedAt = new Date();
    }

    // Also clear any other stageVerifications marked "dues_pending"
    application.stageVerifications.forEach((stg) => {
      if (stg.status === "dues_pending") {
        stg.status = "cleared";
        stg.officerRemarks = `Dues ₹${application.pendingDues.amount} paid & cleared. Receipt: ${receiptNo}`;
        stg.verifiedAt = new Date();
      }
    });

    // Advance to next office in verification chain or mark approved
    const nextIndex = stageIdx + 1;
    if (nextIndex < application.officeChain.length) {
      application.currentStageIndex = nextIndex;
      application.currentOffice = application.officeChain[nextIndex];
      application.status = `${application.currentOffice} Verification Pending`;
      application.assignedOfficer = `${application.currentOffice} Officer-In-Charge`;
    } else {
      application.currentOffice = "Completed";
      application.status = "Approved";
      application.approvalDate = new Date();
      application.issuedCertificate = {
        certificateId: `CERT-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
        issuedAt: new Date(),
        digitalSignature: `SIG-DIGI-OFFICIAL-EGRAM-${Date.now()}`,
        qrCodeData: `https://egram.gov.in/verify/${application.applicationId}`,
        downloadUrl: `/api/applications/${application._id}/download`
      };
    }

    application.timeline.push({
      stage: "Step 1.8: Online Bank Payment & Dues Clearance",
      status: "Dues Cleared",
      updatedBy: "Citizen Payment Gateway",
      note: `Paid ₹${application.pendingDues.amount} via ${paymentMethod || "NetBanking"} (${bankName || "SBI"}). Receipt: ${receiptNo}. Cleared across all connected offices.`,
      timestamp: new Date()
    });

    application.markModified("pendingDues");
    application.markModified("stageVerifications");
    application.markModified("timeline");

    await application.save();

    return res.json({
      success: true,
      message: `Payment of ₹${application.pendingDues.amount} successful! Dues flag cleared across all connected offices.`,
      receiptNo,
      application
    });
  } catch (error) {
    console.error("Error processing dues payment:", error);
    return res.status(500).json({ success: false, message: "Payment processing failed", error: error.message });
  }
};

// 🏛️ Office Internal Workflow: Approve / Reject / Flag Discrepancy (Sections 2.2, 3.2, 4.2, 5.2)
export const verifyOfficeStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, officerRemarks, verifiedBy } = req.body; // action: "approve", "discrepancy", "reject"

    const application = await Application.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { applicationId: id }
      ]
    });

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    const currentOffice = application.currentOffice;
    const stageIdx = application.currentStageIndex;

    if (action === "approve") {
      if (application.stageVerifications[stageIdx]) {
        application.stageVerifications[stageIdx].status = "cleared";
        application.stageVerifications[stageIdx].officerRemarks = officerRemarks || `Verified & Approved by ${currentOffice} Officer.`;
        application.stageVerifications[stageIdx].verifiedBy = verifiedBy || `${currentOffice} Officer`;
        application.stageVerifications[stageIdx].verifiedAt = new Date();
      }

      const nextIdx = stageIdx + 1;
      if (nextIdx < application.officeChain.length) {
        application.currentStageIndex = nextIdx;
        application.currentOffice = application.officeChain[nextIdx];
        application.status = `${application.currentOffice} Verification Pending`;
        application.assignedOfficer = `${application.currentOffice} Senior Officer`;
      } else {
        // Final Office Approval -> Generate Digitally Signed Certificate
        application.currentOffice = "Completed";
        application.status = "Approved";
        application.approvalDate = new Date();
        application.issuedCertificate = {
          certificateId: `CERT-DOC-${Math.floor(100000 + Math.random() * 900000)}`,
          issuedAt: new Date(),
          digitalSignature: `SIG-DIGI-OFFICIAL-EGRAM-${Date.now()}`,
          qrCodeData: `https://egram.gov.in/verify/${application.applicationId}`,
          downloadUrl: `/api/applications/${application._id}/download`
        };
      }

      application.timeline.push({
        stage: `Office Clearance (${currentOffice})`,
        status: application.status,
        updatedBy: verifiedBy || `${currentOffice} Officer`,
        note: officerRemarks || `${currentOffice} office verification completed successfully.`,
        timestamp: new Date()
      });
    } else if (action === "discrepancy") {
      if (application.stageVerifications[stageIdx]) {
        application.stageVerifications[stageIdx].status = "discrepancy";
        application.stageVerifications[stageIdx].officerRemarks = officerRemarks || "Discrepancy found in records.";
      }
      application.status = "Discrepancy Found";
      application.rejectionReason = officerRemarks || "Document discrepancy noted by officer.";

      application.timeline.push({
        stage: `Discrepancy Flagged (${currentOffice})`,
        status: "Discrepancy Found",
        updatedBy: verifiedBy || `${currentOffice} Officer`,
        note: `Officer Action: ${officerRemarks}. Action required from citizen.`,
        timestamp: new Date()
      });
    } else if (action === "reject") {
      if (application.stageVerifications[stageIdx]) {
        application.stageVerifications[stageIdx].status = "rejected";
      }
      application.status = "Rejected";
      application.rejectionReason = officerRemarks || "Application rejected during office review.";

      application.timeline.push({
        stage: `Application Rejected (${currentOffice})`,
        status: "Rejected",
        updatedBy: verifiedBy || `${currentOffice} Officer`,
        note: `Rejection reason: ${officerRemarks}`,
        timestamp: new Date()
      });
    }

    application.markModified("stageVerifications");
    application.markModified("timeline");
    application.markModified("pendingDues");

    await application.save();

    return res.json({
      success: true,
      message: `Office stage verified successfully (${action})`,
      application
    });
  } catch (error) {
    console.error("Error verifying office stage:", error);
    return res.status(500).json({ success: false, message: "Error verifying office stage", error: error.message });
  }
};

// 🏢 Get Office Queue (Applications assigned to a specific office)
export const getOfficeQueue = async (req, res) => {
  try {
    const { officeName } = req.params; // "Municipality", "Tehsildar", "Revenue", "Talati"
    const applications = await Application.find({
      $or: [
        { currentOffice: officeName },
        { primaryOffice: officeName },
        { "officeChain": officeName }
      ]
    }).sort({ createdAt: -1 });

    return res.json({ success: true, count: applications.length, applications });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching office queue" });
  }
};

// 📄 Citizen Applications List
export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const applications = await Application.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error fetching user applications" });
  }
};

// 🔍 Unified Application Search / Tracker (Step 1.6)
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({
      $or: [
        { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null },
        { applicationId: id }
      ]
    }).populate("user", "name email phone");

    if (!application) {
      return res.status(404).json({ success: false, message: "Application not found" });
    }

    return res.json(application);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error fetching application details" });
  }
};

// 📥 Digital Signed Certificate Download / Data Payload (Step 1.10)
export const getCertificateData = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id);

    if (!application) {
      return res.status(404).json({ success: false, message: "Certificate application not found" });
    }

    if (application.status !== "Approved") {
      return res.status(400).json({ success: false, message: "Certificate not approved yet." });
    }

    return res.json({
      success: true,
      certificate: {
        certificateId: application.issuedCertificate?.certificateId || `CERT-${application.applicationId}`,
        title: application.title,
        applicantName: application.applicantDetails.fullName,
        aadhaarId: application.applicantDetails.aadhaarId,
        address: application.applicantDetails.address,
        issueDate: application.approvalDate || new Date(),
        digitalSignature: application.issuedCertificate?.digitalSignature || `SIG-OFFICIAL-${application._id}`,
        qrCodePayload: application.issuedCertificate?.qrCodeData || `EGRAM-VERIFIED-${application.applicationId}`,
        verifyingOffices: application.officeChain
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error generating certificate download" });
  }
};
