import express from "express";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  createWorkflowTemplate,
  getAllWorkflows,
  getWorkflowByService,
  deleteWorkflowTemplate
} from "../controllers/workflowController.js";

const router = express.Router();

// Configurable Department Workflow Engine Routes (/api/workflows)
router.get("/all", getAllWorkflows);
router.get("/service/:serviceType", getWorkflowByService);
router.post("/configure", adminMiddleware, createWorkflowTemplate);
router.delete("/delete/:identifier", adminMiddleware, deleteWorkflowTemplate);

export default router;
