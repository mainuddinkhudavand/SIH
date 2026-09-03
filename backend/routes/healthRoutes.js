import express from "express";
import { getHealthApplications, createHealthApplication, processHealthApplication } from "../controllers/healthController.js";

const router = express.Router();

router.get("/applications", getHealthApplications);
router.post("/applications", createHealthApplication);
router.put("/applications/:id", processHealthApplication);

export default router;
