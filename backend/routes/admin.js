import express from "express";
import {
  adminLogin,
  getAllComplaints,
  updateComplaintStatus,
  getAllUsers,
  getUserComplaintCount,
  getMonthlyStats,
  getComplaintById,
  assignComplaintToDepartment,
  confirmComplaintCompletion
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminLogin);

// APPLICATIONS & PORTAL REQUESTS
router.get("/complaints", getAllComplaints);
router.get("/complaints/monthly-status", getMonthlyStats);
router.put("/complaints/:id/assign", assignComplaintToDepartment);
router.put("/complaints/:id/confirm", confirmComplaintCompletion);
router.put("/complaints/:id", updateComplaintStatus);
router.get("/complaints/:id", getComplaintById);

// USERS & RESIDENTS
router.get("/users", getAllUsers);
router.get("/users/:id/complaints-count", getUserComplaintCount);

export default router;