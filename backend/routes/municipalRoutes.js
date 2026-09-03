import express from "express";
import { getMunicipalApplications, createMunicipalApplication, processMunicipalApplication } from "../controllers/municipalController.js";

const router = express.Router();

router.get("/applications", getMunicipalApplications);
router.post("/applications", createMunicipalApplication);
router.put("/applications/:id", processMunicipalApplication);

export default router;
