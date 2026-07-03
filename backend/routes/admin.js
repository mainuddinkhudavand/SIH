import express from "express";
import {
  adminLogin,
  getAllComplaints,
  updateComplaintStatus,
  getAllUsers,
  getUserComplaintCount,
  getMonthlyStats, // monthly + status breakdown
  getComplaintById, // ✅ new controller for single complaint
  // 🚀 NEW IMPORTS for Departments:
  createDepartment,
  getAllDepartments,
  assignComplaintToDepartment,
  confirmComplaintCompletion,
  // 🚀 NEW IMPORTS for Managers:
  createManager,
  getAllManagers,
  removeManager
} from "../controllers/adminController.js";

const router = express.Router();

router.post("/login", adminLogin);

// ==========================================
// COMPLAINTS
// ==========================================
router.get("/complaints", getAllComplaints);

// ✅ Place monthly-status BEFORE the :id route
router.get("/complaints/monthly-status", getMonthlyStats);

// 🚀 NEW: Assign complaint to department (Placed here to avoid :id conflicts)
router.put("/complaints/:id/assign", assignComplaintToDepartment);

router.put("/complaints/:id/confirm", confirmComplaintCompletion);

router.put("/complaints/:id", updateComplaintStatus);
router.get("/complaints/:id", getComplaintById); // single complaint route

// ==========================================
// USERS
// ==========================================
router.get("/users", getAllUsers);
router.get("/users/:id/complaints-count", getUserComplaintCount);

// ==========================================
// 🚀 DEPARTMENTS
// ==========================================
router.get("/departments", getAllDepartments); // Fetch for dropdown
router.post("/departments", createDepartment); // Create new department

// ==========================================
// 🚀 MANAGERS
// ==========================================
router.get("/managers", getAllManagers); // Fetch all managers
router.post("/managers", createManager); // Create new manager
router.delete("/managers/:id", removeManager); // Remove manager

export default router;