import express from "express";
import {
  departmentLogin,
  getMyComplaints,
  updateComplaintStatus,
  createWorker,           // 🚀 NEW
  getDepartmentWorkers,   // 🚀 NEW
  assignToWorker,         // 🚀 NEW
  verifyWorkerCompletion  // 🚀 NEW
} from "../controllers/departmentController.js";
import auth from "../middleware/auth.js"; // ✅ Import the universal auth middleware

const router = express.Router();

// Public Route
router.post("/login", departmentLogin);

// Protected Routes (Using your updated auth middleware)
router.get("/my-complaints", auth, getMyComplaints);
router.put("/complaints/:id/status", auth, updateComplaintStatus);

// Create a new field worker
router.post("/workers", auth, createWorker);

// Get a list of all workers in this department
router.get("/workers", auth, getDepartmentWorkers);

// Assign a specific complaint to a worker
router.put("/complaints/:id/assign", auth, assignToWorker);

// Department verifies the worker's live photo and confirms the job is done
router.put("/complaints/:id/verify", auth, verifyWorkerCompletion);

export default router;