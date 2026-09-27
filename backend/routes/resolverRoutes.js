import express from "express";
import { getOfficerProfiles, updateOfficerProfile, sendNegligenceNotice } from "../controllers/resolverController.js";

const router = express.Router();

// 📋 Get Officer Registry by Location (State, District, City)
router.get("/officers", getOfficerProfiles);

// 📝 Update Officer Profile Jurisdiction
router.post("/officers", updateOfficerProfile);

// 🚨 Dispatch Negligence Warning Email & Notice
router.post("/send-negligence-notice", sendNegligenceNotice);

export default router;
