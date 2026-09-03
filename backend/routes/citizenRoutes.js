import express from "express";
import auth from "../middleware/auth.js";
import {
  getCitizenDashboard,
  trackCitizenRecord,
  submitCitizenApplication,
  submitCitizenCertificate
} from "../controllers/citizenController.js";

const router = express.Router();

// Citizen Services Routes (/api/citizen)
router.get("/dashboard", auth, getCitizenDashboard);
router.get("/applications", auth, getCitizenDashboard); // Alias route to handle /api/citizen/applications GET
router.get("/track/:id", trackCitizenRecord);

// POST Application Routes (both singular and plural)
router.post("/application", auth, submitCitizenApplication);
router.post("/applications", auth, submitCitizenApplication);

// POST Certificate Routes
router.post("/certificate", auth, submitCitizenCertificate);
router.post("/certificates", auth, submitCitizenCertificate);

export default router;
