import express from "express";
import adminMiddleware from "../middleware/adminMiddleware.js";
import {
  getOfficialDashboard,
  getOfficialApprovals,
  processOfficialAction,
  publishNotice,
  getNotices,
  deleteNotice,
  getAuditLogs,
  getComplianceMetrics
} from "../controllers/officialController.js";

const router = express.Router();

// Official Portal Routes (/api/official)
router.get("/dashboard", adminMiddleware, getOfficialDashboard);
router.get("/approvals", adminMiddleware, getOfficialApprovals);
router.post("/action", adminMiddleware, processOfficialAction);

// 📢 Notices & Events Endpoints
router.get("/notices", getNotices);
router.post("/notices", adminMiddleware, publishNotice);
router.delete("/notices/:id", adminMiddleware, deleteNotice);

// 📜 Audit Logs Ledger & Compliance Endpoints
router.get("/audit-logs", adminMiddleware, getAuditLogs);
router.get("/compliance", adminMiddleware, getComplianceMetrics);

export default router;
