import express from "express";
import { getMappedData, checkConsent, getPlatformMetrics, searchMasterRecords, downloadMasterDataset } from "../controllers/interopController.js";

const router = express.Router();

router.get("/mapped-data", getMappedData);
router.post("/check-consent", checkConsent);
router.get("/metrics", getPlatformMetrics);
router.get("/master-search", searchMasterRecords);
router.get("/download-dataset", downloadMasterDataset);

export default router;
