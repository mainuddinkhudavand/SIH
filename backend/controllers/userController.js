import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ✅ Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const secret = process.env.JWT_SECRET || "egram_secret_key";
      const decoded = jwt.verify(token, secret);

      // Attach user (without password) to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      next();
      return;
    } catch (error) {
      console.error("JWT Verification Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

// ✅ Controller to get user profile
export const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({ message: "Not authorized, no user in request" });
    }

    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      kycCompleted: user.kycCompleted || false,
      aadhaarNumber: user.aadhaarNumber || null,
      address: user.address || null,
      profilePictureUrl: user.profilePictureUrl || null,
      citizenId: user.citizenId || `RES-2026-${user._id.toString().slice(-6).toUpperCase()}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};