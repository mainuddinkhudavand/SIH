import express from "express";
import auth from "../middleware/auth.js";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  createSectorRequest,
  getUserSectorRequests,
  getAllSectorRequests,
  updateSectorRequestStatus,
  getSectorStats
} from "../controllers/sectorController.js";

const router = express.Router();

// Citizen routes
router.post("/request", auth, createSectorRequest);
router.get("/my-requests", auth, getUserSectorRequests);

// Official / Admin routes
router.get("/all", adminMiddleware, getAllSectorRequests);
router.get("/stats", adminMiddleware, getSectorStats);
router.put("/:id/status", adminMiddleware, updateSectorRequestStatus);

export default router;
