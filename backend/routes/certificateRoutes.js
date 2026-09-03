import express from "express";
import auth from "../middleware/auth.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  createCertificateRequest,
  getUserCertificates,
  getAllCertificates,
  updateCertificateStatus,
  getCertificateById
} from "../controllers/certificateController.js";

const router = express.Router();

// Citizen routes
router.post("/request", auth, createCertificateRequest);
router.get("/my-certificates", auth, getUserCertificates);
router.get("/mine", auth, getUserCertificates);

// Official / Admin routes
router.get("/all", adminMiddleware, getAllCertificates);
router.put("/:id/status", adminMiddleware, updateCertificateStatus);

// Tracking / lookup
router.get("/track/:id", getCertificateById);

export default router;
