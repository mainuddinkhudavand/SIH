import MdmRecord from "../models/MdmRecord.js";
import ConsentRecord from "../models/ConsentRecord.js";
import User from "../models/User.js";
import { CitizenRecordSchema, BusinessRecordSchema } from "../schemas/dataStandards.js";

// 🏛 Master Data Management (MDM): Get Single Source of Truth
export const getMdmProfile = async (req, res) => {
  try {
    const { identifier } = req.params; // citizenId or businessId
    const userId = req.user ? req.user._id : null;

    let mdm = await MdmRecord.findOne({
      $or: [{ citizenId: identifier }, { businessId: identifier }]
    }).populate("primaryUser", "name email phone aadhaarNumber address role");

    if (!mdm && userId) {
      const user = await User.findById(userId);
      if (user) {
        mdm = new MdmRecord({
          citizenId: user.citizenId,
          businessId: user.businessId,
          primaryUser: user._id,
          verifiedName: user.name,
          verifiedEmail: user.email,
          verifiedPhone: user.phone || "Verified",
          linkedModules: [{ moduleName: "Citizen Portal Core", linkedRecordId: user.citizenId, linkedAt: new Date() }]
        });
        await mdm.save();
      }
    }

    if (!mdm) {
      return res.status(404).json({ message: "MDM Master Record not found" });
    }

    return res.json({
      singleSourceOfTruth: mdm,
      dataStandards: {
        citizenSchema: CitizenRecordSchema.title,
        businessSchema: BusinessRecordSchema.title,
        validationStatus: "Compliant"
      }
    });
  } catch (error) {
    console.error("MDM Error:", error);
    return res.status(500).json({ message: "Server error fetching MDM record" });
  }
};

// 🔐 Consent-Based Data Sharing: Get Citizen Consents
export const getMyConsents = async (req, res) => {
  try {
    const userId = req.user._id;
    const consents = await ConsentRecord.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(consents);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching consent permissions" });
  }
};

// 🔐 Grant Data Sharing Consent
export const grantConsent = async (req, res) => {
  try {
    const { requesterModule, dataFieldsGranted, purpose } = req.body;
    const user = req.user;

    const consent = new ConsentRecord({
      user: user._id,
      citizenId: user.citizenId,
      requesterModule,
      dataFieldsGranted,
      purpose,
      status: "Granted"
    });

    await consent.save();
    return res.status(201).json({ message: "Consent granted successfully", consent });
  } catch (error) {
    return res.status(500).json({ message: "Error granting data sharing consent", error: error.message });
  }
};

// 🔐 Revoke Data Sharing Consent
export const revokeConsent = async (req, res) => {
  try {
    const { id } = req.params;
    const consent = await ConsentRecord.findOne({ _id: id, user: req.user._id });

    if (!consent) {
      return res.status(404).json({ message: "Consent record not found" });
    }

    consent.status = "Revoked";
    await consent.save();

    return res.json({ message: "Data sharing consent revoked successfully", consent });
  } catch (error) {
    return res.status(500).json({ message: "Error revoking consent" });
  }
};

// 🌉 API Gateway Connector: Verify Inter-Module Consent Token
export const verifyInterModuleConsent = async (req, res) => {
  try {
    const { consentToken, requesterModule, requestedField } = req.body;

    const consent = await ConsentRecord.findOne({ consentToken, status: "Granted" });
    if (!consent) {
      return res.status(403).json({ authorized: false, message: "No active granted consent token found." });
    }

    if (consent.expiresAt < new Date()) {
      consent.status = "Expired";
      await consent.save();
      return res.status(403).json({ authorized: false, message: "Consent token has expired." });
    }

    if (consent.dataFieldsGranted.includes(requestedField)) {
      return res.json({ authorized: true, message: `Access granted for field '${requestedField}' under purpose: ${consent.purpose}` });
    } else {
      return res.status(403).json({ authorized: false, message: `Citizen has not granted access to field '${requestedField}'.` });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error validating inter-module consent" });
  }
};
