import express from "express";
import { 
  workerLogin, 
  getMyTasks, 
  completeTask,
  getWorkerProfile,  // 🚀 NEW
  updateWorkerProfile // 🚀 NEW
} from "../controllers/workerController.js";
import auth from "../middleware/auth.js"; // Ensures they are logged in
import { upload } from "../middleware/upload.js"; // 🚀 Brings in Multer for the photo upload

const router = express.Router();

// 1. Worker Authentication
router.post("/login", workerLogin);

// 2. Worker fetches their assigned jobs
router.get("/my-tasks", auth, getMyTasks);

// 3. Worker marks job as complete (REQUIRES LIVE PHOTO)
// 🚀 Notice upload.single("image") intercepts the photo before the controller!
router.put("/complaints/:id/complete", auth, upload.single("image"), completeTask);

// 4. Worker Profile details & image upload
router.get("/profile", auth, getWorkerProfile);
router.put("/profile", auth, upload.single("profilePicture"), updateWorkerProfile);

export default router;