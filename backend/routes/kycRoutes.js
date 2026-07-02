// backend/routes/kycRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { saveKyc } from "../controllers/kycController.js";

const router = express.Router();
router.post("/", protect, saveKyc);

export default router;
