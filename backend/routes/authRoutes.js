import express from "express";
import { signup, verifyOtp, login } from "../controllers/authController.js";

const router = express.Router();

// ✅ Password validation function (only 6+ characters)
function validatePassword(password) {
  return password && password.length >= 6;
}

// Wrap signup to enforce password rules
router.post("/signup", async (req, res, next) => {
  const { password } = req.body;
  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long.",
    });
  }
  // Pass control to controller
  return signup(req, res, next);
});

router.post("/verify-otp", verifyOtp);
router.post("/login", login);

export default router;