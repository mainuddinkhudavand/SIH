import express from "express";
import auth from "../middleware/auth.js";
import { getSectorModuleServices, submitSectorAction } from "../controllers/moduleController.js";

const router = express.Router();

// Sector Workflow Routes (/api/modules)
router.get("/", getSectorModuleServices);
router.post("/action", auth, submitSectorAction);

export default router;
