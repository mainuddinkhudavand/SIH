import jwt from "jsonwebtoken";
import User from "../models/User.js";

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  // Default demo fallback user if no token or demo token passed
  const demoFallbackUser = {
    _id: "64b0f9999999999999999999",
    name: "Pavan",
    email: "pavan@govconnect.gov.in",
    phone: "9876543210",
    role: "citizen",
    citizenId: "C101"
  };

  if (!token) {
    req.user = demoFallbackUser;
    return next();
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "egram_secret_key");

    if (payload.id) {
      const user = await User.findById(payload.id).catch(() => null);
      if (!user) {
        req.user = demoFallbackUser;
      } else {
        req.user = user;
        req.user.role = payload.role || user.role || "citizen";
      }
    } else if (payload.admin) {
      req.admin = true;
      req.user = { role: "admin", name: "System Administrator" };
    } else {
      req.user = demoFallbackUser;
    }

    next();
  } catch (err) {
    // If token verification fails (e.g. demo token), seamlessly attach demo user
    req.user = demoFallbackUser;
    next();
  }
};

// 🛡 Role-Based Access Control (RBAC) Middleware Generator
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (req.admin && allowedRoles.includes("admin")) {
      return next();
    }

    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied. Role permission required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Requires one of roles: [${allowedRoles.join(", ")}]. Current role: ${req.user.role}`
      });
    }

    next();
  };
};

export default auth;