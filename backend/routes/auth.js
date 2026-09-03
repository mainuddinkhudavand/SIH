import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail, sendOtpEmail } from "../utils/email.js";
import { ssoCallback } from "../controllers/authController.js";

const router = express.Router();

function validatePassword(password) {
  return password.length >= 6;
}

// 🌐 Federated Identity & SSO Callback Route (/api/auth/sso)
router.post("/sso", ssoCallback);

// Register -> create user with Citizen ID, Business ID & Role
router.post("/register", async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long."
    });
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "An account with this email or phone already exists. Please log in." });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = "" + Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    const validRoles = ["citizen", "municipal_officer", "revenue_officer", "health_officer", "admin"];
    const userRole = validRoles.includes(role) ? role : "citizen";

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      role: userRole,
      otp,
      otpExpires,
      ssoProvider: { provider: "local" }
    });

    let emailSent = true;
    try {
      const mailRes = await sendOtpEmail(email, otp);
      if (!mailRes || mailRes.messageId === "mock_id_set_app_password") {
        emailSent = false;
      }
    } catch (emailErr) {
      console.error("Failed to send OTP email:", emailErr.message);
      emailSent = false;
    }

    return res.json({
      message: emailSent ? "Registration successful! OTP sent to your email." : "Registration successful! Enter your OTP to verify.",
      userId: user._id,
      citizenId: user.citizenId,
      businessId: user.businessId,
      role: user.role,
      otp: otp,
      emailSent
    });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Server error during registration", error: err.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ message: "Missing parameter" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.json({ message: "Already verified", citizenId: user.citizenId });

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ message: "Email verified", citizenId: user.citizenId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Login with email or phone - returns JWT with Role, Citizen ID, Business ID
router.post("/login", async (req, res) => {
  const identifier = req.body.identifier || req.body.email || req.body.phone;
  const password = req.body.password;
  if (!identifier || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }]
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const tokenPayload = {
      id: user._id,
      role: user.role || "citizen",
      citizenId: user.citizenId,
      businessId: user.businessId
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "egram_secret_key", {
      expiresIn: "7d"
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "citizen",
        citizenId: user.citizenId,
        businessId: user.businessId,
        kycCompleted: user.kycCompleted,
        ssoProvider: user.ssoProvider
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password Endpoint
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required." });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
    const mailHtml = `
      <h3>Reset Your Password</h3>
      <p>Please click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
    `;

    let emailSent = true;
    try {
      await sendEmail(user.email, "Reset Password Request - GovConnect Platform", mailHtml);
    } catch (mailErr) {
      emailSent = false;
    }

    return res.json({ message: emailSent ? "Reset link sent to your email successfully!" : `Reset URL generated: ${resetUrl}` });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// Reset Password Endpoint
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Token and password are required." });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    return res.json({ message: "Password updated successfully!" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;