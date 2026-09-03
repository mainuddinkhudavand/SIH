import express from "express";
import auth from "../middleware/auth.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  createApplication,
  createWaterApplication,
  getUserApplications,
  getAllApplications,
  updateApplicationStatus,
  getApplicationById
} from "../controllers/applicationController.js";

const router = express.Router();

// 🌟 Technical Pipeline Demonstration: POST /api/applications/water
// Flow: API Gateway -> Authentication -> Service Router -> Workflow Engine -> Municipality Connector -> Municipality API
router.post("/water", auth, createWaterApplication);

// Citizen routes
router.post("/submit", auth, createApplication);
router.get("/my-applications", auth, getUserApplications);

// Official / Admin routes
router.get("/all", adminMiddleware, getAllApplications);
router.put("/:id/status", adminMiddleware, updateApplicationStatus);

// Tracking / single application lookup (Public or auth)
router.get("/track/:id", getApplicationById);

export default router;
