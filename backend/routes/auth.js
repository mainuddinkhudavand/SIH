import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
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

export default router;