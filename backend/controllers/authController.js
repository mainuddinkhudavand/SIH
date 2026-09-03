import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { sendEmail, sendOtpEmail } from "../utils/email.js";

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  return regex.test(password);
}

// 👤 Signup (Citizen / Official Registration)
export const signup = async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Missing required registration fields" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      message: "Password must be at least 6 characters long, include uppercase, lowercase, a number, and a symbol."
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const userRole = ["citizen", "official", "admin"].includes(role) ? role : "citizen";

    const user = await User.create({
      name,
      email,
      phone: phone || `+91-${Math.floor(6000000000 + Math.random() * 3999999999)}`,
      password: hashedPassword,
      role: userRole,
      otp,
      otpExpires: Date.now() + 10 * 60 * 1000,
      ssoProvider: { provider: "local" }
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (e) {
      console.log("Email dispatch fallback, OTP:", otp);
    }

    return res.json({
      message: "Account created successfully. OTP sent for verification.",
      citizenId: user.citizenId,
      businessId: user.businessId,
      role: user.role,
      otp
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during registration", error: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.otp === otp) {
      user.isVerified = true;
      user.otp = null;
      await user.save();
      return res.json({ message: "Account verified successfully", citizenId: user.citizenId });
    }
    return res.status(400).json({ message: "Invalid or expired OTP" });
  } catch (err) {
    return res.status(500).json({ message: "Server error during OTP verification" });
  }
};

// 🔑 Login (JWT Generation with Role, Citizen ID, Business ID)
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or user not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      citizenId: user.citizenId,
      businessId: user.businessId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "egram_secret_key", {
      expiresIn: "7d"
    });

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        citizenId: user.citizenId,
        businessId: user.businessId,
        ssoProvider: user.ssoProvider
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// 🌐 Federated Identity & Single Sign-On (SSO) Extension Handler
export const ssoCallback = async (req, res) => {
  const { provider, providerId, email, name, ssoToken } = req.body;

  if (!provider || !email) {
    return res.status(400).json({ message: "Missing SSO provider details" });
  }

  try {
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        role: "citizen",
        isVerified: true,
        ssoProvider: {
          provider,
          providerId: providerId || ssoToken,
          lastLogin: new Date()
        }
      });
    } else {
      user.ssoProvider = {
        provider,
        providerId: providerId || ssoToken,
        lastLogin: new Date()
      };
      await user.save();
    }

    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,
      citizenId: user.citizenId,
      businessId: user.businessId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || "egram_secret_key", {
      expiresIn: "7d"
    });

    return res.json({
      message: `Single Sign-On authenticated via ${provider}`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        citizenId: user.citizenId,
        businessId: user.businessId,
        ssoProvider: user.ssoProvider
      }
    });
  } catch (err) {
    console.error("SSO Error:", err);
    return res.status(500).json({ message: "Federated SSO authentication failed", error: err.message });
  }
};