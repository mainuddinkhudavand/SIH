import express from "express";
import auth from "../middleware/auth.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getServicesList,
  createApplication,
  payApplicationDues,
  verifyOfficeStage,
  getOfficeQueue,
  getUserApplications,
  getApplicationById,
  getCertificateData
} from "../controllers/applicationController.js";

const router = express.Router();

// 📋 Public / Citizen Services Lookup Map
router.get("/services", getServicesList);

// 📝 Citizen Submit & Route Application
router.post("/submit", auth, createApplication);
router.get("/my-applications", auth, getUserApplications);

// 💳 Integrated Dues Payment Gateway & Auto-Clearance
router.post("/:id/pay-dues", auth, payApplicationDues);

// 🏛️ Office Internal Workflow Queue & Stage Verification
router.get("/office-queue/:officeName", getOfficeQueue);
router.put("/:id/verify-stage", verifyOfficeStage);

// 📄 Certificate Download Payload
router.get("/certificate/:id", getCertificateData);

// 🔍 Unified Application & Certificate Tracker Lookup
router.get("/track/:id", getApplicationById);

export default router;
