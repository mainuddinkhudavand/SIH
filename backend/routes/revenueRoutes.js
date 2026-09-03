import express from "express";
import { getRevenueApplications, createRevenueApplication, processRevenueApplication } from "../controllers/revenueController.js";

const router = express.Router();

router.get("/applications", getRevenueApplications);
router.post("/applications", createRevenueApplication);
router.put("/applications/:id", processRevenueApplication);

export default router;
