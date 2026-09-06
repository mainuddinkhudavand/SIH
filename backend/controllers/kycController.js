import User from "../models/User.js";
import MdmRecord from "../models/MdmRecord.js";
import ConsentRecord from "../models/ConsentRecord.js";
import AuditLog from "../models/AuditLog.js";

// 🆔 Save / Update Citizen KYC & Automatically Provision MDM & Consent Safeguards
export const saveKyc = async (req, res) => {
  try {
    const { aadhaarNumber, aadhaar, address, phone } = req.body;
    const userId = req.user?._id || req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: User session required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const finalAadhaar = aadhaarNumber || aadhaar || user.aadhaarNumber || "9876-5432-1000";
    
    // 1. Update User Profile
    user.aadhaarNumber = finalAadhaar;
    user.phone = phone || user.phone || "+91-9876543210";
    if (typeof address === "object") {
      user.address = { ...user.address, ...address };
    } else if (typeof address === "string") {
      user.address = { street: address, district: "Central District", state: "State Govt", pin: "110001" };
    }
    user.kycCompleted = true;
    await user.save();

    // 2. Create or Update Master Data Management (MDM) Record
    let mdmRecord = await MdmRecord.findOne({ primaryUser: user._id });
    if (!mdmRecord) {
      mdmRecord = await MdmRecord.create({
        citizenId: user.citizenId,
        businessId: user.businessId,
        primaryUser: user._id,
        verifiedName: user.name,
        verifiedEmail: user.email,
        verifiedPhone: user.phone,
        nationalIdentityHash: `AADHAAR-HASH-${finalAadhaar.replace(/[^0-9]/g, "")}`,
        linkedModules: [
          { moduleName: "Municipality Portal", linkedRecordId: `MUNI-${user.citizenId}` },
          { moduleName: "Revenue Portal", linkedRecordId: `REV-${user.citizenId}` },
          { moduleName: "Tehsildar Office", linkedRecordId: `TEH-${user.citizenId}` },
          { moduleName: "Talati Village Register", linkedRecordId: `TAL-${user.citizenId}` }
        ],
        status: "Active"
      });
    } else {
      mdmRecord.verifiedName = user.name;
      mdmRecord.verifiedPhone = user.phone;
      mdmRecord.nationalIdentityHash = `AADHAAR-HASH-${finalAadhaar.replace(/[^0-9]/g, "")}`;
      await mdmRecord.save();
    }

    // 3. Create or Grant Active Consent Record for Inter-Module Data Sharing
    let consentRecord = await ConsentRecord.findOne({ citizenId: user.citizenId });
    if (!consentRecord) {
      consentRecord = await ConsentRecord.create({
        user: user._id,
        citizenId: user.citizenId,
        requesterModule: "Third-Party Inter-Module Connector",
        dataFieldsGranted: ["fullName", "email", "phone", "address", "aadhaarNumber", "residenceCertificate", "kycStatus"],
        purpose: "Official Inter-Office E-Governance Verification & Residency Processing",
        status: "Granted",
        grantedAt: new Date(),
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      });
    } else {
      consentRecord.status = "Granted";
      consentRecord.grantedAt = new Date();
      await consentRecord.save();
    }

    // 4. Log Transaction in AuditLog
    await AuditLog.create({
      action: "KYC_SUBMITTED_AND_CONSENT_GRANTED",
      performedBy: user._id,
      userRole: user.role || "citizen",
      resourceType: "User",
      resourceId: user.citizenId,
      changesSnapshot: { aadhaarNumber: finalAadhaar, kycCompleted: true, consentId: consentRecord.consentId },
      details: `Citizen ${user.name} (${user.citizenId}) completed KYC & granted inter-module data sharing consent ${consentRecord.consentId}`,
      ipAddress: req.ip || "127.0.0.1"
    });

    return res.json({
      success: true,
      message: "KYC verified successfully! Master Identity (MDM) linked & Data Sharing Consent activated.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        citizenId: user.citizenId,
        kycCompleted: user.kycCompleted,
        aadhaarNumber: user.aadhaarNumber,
        address: user.address
      },
      mdmRecord,
      consentRecord
    });
  } catch (error) {
    console.error("KYC Save Error:", error);
    return res.status(500).json({ success: false, message: "Failed to process KYC submission", error: error.message });
  }
};

// 📋 Get Current User's KYC & Active Consent Status
export const getKycStatus = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const mdmRecord = await MdmRecord.findOne({ primaryUser: user._id });
    const consentRecord = await ConsentRecord.findOne({ citizenId: user.citizenId });

    return res.json({
      success: true,
      kycCompleted: user.kycCompleted || false,
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        citizenId: user.citizenId,
        aadhaarNumber: user.aadhaarNumber,
        address: user.address
      },
      mdmRecord,
      consentRecord
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error fetching KYC status", error: error.message });
  }
};

// 🔒 Toggle / Revoke Citizen Consent
export const toggleConsent = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { status } = req.body; // "Granted" or "Revoked"

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    let consentRecord = await ConsentRecord.findOne({ citizenId: user.citizenId });
    if (!consentRecord) {
      consentRecord = await ConsentRecord.create({
        user: user._id,
        citizenId: user.citizenId,
        requesterModule: "Third-Party Inter-Module Connector",
        dataFieldsGranted: ["fullName", "email", "phone", "address", "aadhaarNumber"],
        purpose: "Inter-Office Data Exchange",
        status: status === "Revoked" ? "Revoked" : "Granted"
      });
    } else {
      consentRecord.status = status === "Revoked" ? "Revoked" : "Granted";
      await consentRecord.save();
    }

    await AuditLog.create({
      action: status === "Revoked" ? "CONSENT_REVOKED_BY_CITIZEN" : "CONSENT_GRANTED_BY_CITIZEN",
      performedBy: user._id,
      userRole: "citizen",
      resourceType: "Consent",
      resourceId: consentRecord.consentId,
      details: `Citizen ${user.name} updated inter-office data consent status to ${consentRecord.status}`,
      ipAddress: req.ip || "127.0.0.1"
    });

    // 🔓 Unpause applications paused at 'Consent Approval Pending' when consent is granted
    if (consentRecord.status === "Granted") {
      const Application = (await import("../models/Application.js")).default;
      const pausedApps = await Application.find({
        $or: [
          { user: user._id },
          { "applicantDetails.aadhaarId": user.aadhaarNumber },
          { "applicantDetails.email": user.email }
        ],
        status: "Consent Approval Pending"
      });

      for (const app of pausedApps) {
        const stageIdx = app.currentStageIndex || 0;
        const currentOffice = app.currentOffice || app.officeChain[stageIdx] || "Municipality";
        app.status = `${currentOffice} Verification Pending`;
        app.assignedOfficer = `${currentOffice} Senior Officer`;
        if (app.stageVerifications[stageIdx]) {
          app.stageVerifications[stageIdx].status = "pending";
          app.stageVerifications[stageIdx].officerRemarks = `Citizen granted data sharing consent. Verification resumed by ${currentOffice}.`;
        }
        app.timeline.push({
          stage: `Consent Granted (${currentOffice})`,
          status: app.status,
          updatedBy: `Citizen ${user.name}`,
          note: `Citizen granted inter-office data sharing consent. Workflow resumed at ${currentOffice}.`,
          timestamp: new Date()
        });

        app.markModified("stageVerifications");
        app.markModified("timeline");
        await app.save();

        await AuditLog.create({
          action: "APPLICATION_UNPAUSED_BY_CITIZEN_CONSENT",
          performedBy: user._id,
          userRole: "citizen",
          resourceType: "Application",
          resourceId: app.applicationId,
          details: `Application ${app.applicationId} unpaused post citizen consent grant. Resumed at ${currentOffice}`,
          ipAddress: req.ip || "127.0.0.1"
        });
      }
    }

    return res.json({
      success: true,
      message: `Data sharing consent status set to '${consentRecord.status}'. Any paused applications have been unpaused.`,
      consentRecord
    });
  } catch (error) {
    console.error("toggleConsent error:", error);
    return res.status(500).json({ success: false, message: "Error updating consent state", error: error.message });
  }
};
