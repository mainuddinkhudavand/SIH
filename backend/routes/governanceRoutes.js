import express from "express";
import auth from "../middleware/auth.js";
import {
  getMdmProfile,
  getMyConsents,
  grantConsent,
  revokeConsent,
  verifyInterModuleConsent
} from "../controllers/governanceController.js";

const router = express.Router();

// Master Data Management (MDM) Endpoint
router.get("/mdm/:identifier", auth, getMdmProfile);

// Consent-Based Data Sharing Endpoints
router.get("/consent/my-consents", auth, getMyConsents);
router.post("/consent/grant", auth, grantConsent);
router.put("/consent/revoke/:id", auth, revokeConsent);

// API Gateway Inter-Module Consent Verification
router.post("/consent/verify-intermodule", verifyInterModuleConsent);

export default router;
