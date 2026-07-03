import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Worker from "../models/Worker.js"; // 🚀 NEW: Import the Worker model

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // 🏢 1. DEPARTMENT TOKEN CHECK
    if (payload.role === "department") {
      const department = await Department.findById(payload.id);
      if (!department) return res.status(401).json({ message: "Department not found" });
      
      // 🔥 THE FIX: Standardize by attaching to req.user
      req.user = department; 
      req.departmentId = department._id; // Keep this just in case old code relies on it
      return next();
    }

    // 👷 2. WORKER TOKEN CHECK (New!)
    if (payload.role === "worker") {
      const worker = await Worker.findById(payload.id);
      if (!worker) return res.status(401).json({ message: "Worker not found" });
      
      req.user = worker; // Standardize by attaching to req.user
      return next();
    }

    // 🤵 3. MANAGER TOKEN CHECK
    if (payload.role === "manager") {
      const Manager = (await import("../models/Manager.js")).default;
      const manager = await Manager.findById(payload.id);
      if (!manager || manager.isRemoved) {
        return res.status(401).json({ message: "Manager not found or removed" });
      }
      req.user = manager;
      return next();
    }

    // 👤 4. CITIZEN / ADMIN TOKEN CHECK (Existing Logic)
    if (payload.id) {
      const user = await User.findById(payload.id);
      if (!user) return res.status(401).json({ message: "User not found" });
      req.user = user;
    } else if (payload.admin) {
      req.admin = true;
    }
    
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default auth;