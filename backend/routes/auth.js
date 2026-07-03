import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"; // 🚀 NEW: Import crypto
import User from "../models/User.js";
import Manager from "../models/Manager.js"; // 🚀 NEW: Import Manager
import Worker from "../models/Worker.js"; // 🚀 NEW: Import Worker
import Department from "../models/Department.js"; // 🚀 NEW: Import Department
import { sendEmail } from "../utils/email.js";

const router = express.Router();

// ✅ Password validation function (only 6+ characters)
function validatePassword(password) {
  return password.length >= 6;
}

// Register -> create user, send OTP
router.post("/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  // ✅ Enforce password rule (6+ chars only)
  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long.",
    });
  }

  try {
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res
        .status(400)
        .json({ message: "User with email or phone exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const otp = "" + Math.floor(100000 + Math.random() * 900000);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const user = await User.create({
      name,
      email,
      phone,
      password: hashed,
      otp,
      otpExpires,
    });

    let emailSent = true;
    try {
      await sendEmail(
        email,
        "Your OTP for Municipality",
        `<p>Your OTP is <b>${otp}</b>. It expires in 10 minutes.</p>`
      );
    } catch (emailErr) {
      console.error("SMTP Error: Failed to send OTP email:", emailErr);
      emailSent = false;
    }

    return res.json({
      message: emailSent ? "Registered. OTP sent to email" : "Registered. (OTP email failed to send)",
      userId: user._id,
      otp: emailSent ? undefined : otp
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ message: "Missing" });
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.json({ message: "Already verified" });

    if (user.otp !== otp || user.otpExpires < new Date()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    return res.json({ message: "Email verified" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// Login with email or phone
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // identifier = email or phone
  if (!identifier || !password) {
    return res.status(400).json({ message: "Missing" });
  }

  try {
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        kycCompleted: user.kycCompleted,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// 🚀 NEW: Forgot Password Endpoint for all roles
router.post("/forgot-password", async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ message: "Email and role are required." });
  }

  try {
    let userModel;
    if (role === "citizen") userModel = User;
    else if (role === "manager") userModel = Manager;
    else if (role === "worker") userModel = Worker;
    else if (role === "department") userModel = Department;
    else if (role === "admin") {
      if (email.toLowerCase() === process.env.ADMIN_EMAIL.toLowerCase()) {
        return res.status(400).json({ message: "Admin credentials must be modified in the server .env variables." });
      }
      return res.status(404).json({ message: "Admin email not found." });
    } else {
      return res.status(400).json({ message: "Invalid role specified." });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User with this email not found." });
    }

    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour

    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3000/reset-password?token=${token}&role=${role}`;
    const mailHtml = `
      <h3>Reset Your Password</h3>
      <p>You requested to reset your password. Please click the link below to set a new password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>If you did not request this, you can ignore this email safely.</p>
    `;

    let emailSent = true;
    try {
      await sendEmail(user.email, "Reset Password Request - E-Gram Panchayat", mailHtml);
    } catch (mailErr) {
      console.error("Forgot password email delivery failed:", mailErr);
      emailSent = false;
    }

    if (!emailSent) {
      return res.json({ 
        message: `Reset link generated successfully! (Note: Email delivery failed due to SMTP credentials. For testing, your reset URL is: ${resetUrl})` 
      });
    }

    return res.json({ message: "Reset link sent to your email successfully!" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

// 🚀 NEW: Reset Password Endpoint for all database roles
router.post("/reset-password", async (req, res) => {
  const { token, role, password } = req.body;
  if (!token || !role || !password) {
    return res.status(400).json({ message: "Token, role, and password are required." });
  }

  try {
    let userModel;
    if (role === "citizen") userModel = User;
    else if (role === "manager") userModel = Manager;
    else if (role === "worker") userModel = Worker;
    else if (role === "department") userModel = Department;
    else return res.status(400).json({ message: "Invalid role specified." });

    const user = await userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token is invalid or has expired." });
    }

    if (role === "citizen") {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    } else {
      user.password = password;
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    return res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;