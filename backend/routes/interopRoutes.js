import express from "express";
import { getMappedData, checkConsent, getPlatformMetrics } from "../controllers/interopController.js";

const router = express.Router();

router.get("/mapped-data", getMappedData);
router.post("/check-consent", checkConsent);
router.get("/metrics", getPlatformMetrics);

export default router;
