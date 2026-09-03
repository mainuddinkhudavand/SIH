import User from "../models/User.js";
import Application from "../models/Application.js";
import jwt from "jsonwebtoken";

// Admin & Official Manual Credentials Login (.env configured)
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const validOfficialEmail = process.env.OFFICIAL_ADMIN_EMAIL || "admin@egram.gov.in";
    const validOfficialPass = process.env.OFFICIAL_ADMIN_PASSWORD || "Admin@Eg123";

    const legacyEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    const legacyPass = process.env.ADMIN_PASS || "adminpassword";

    const isMatch = (email === validOfficialEmail && password === validOfficialPass) ||
                    (email === legacyEmail && password === legacyPass);

    if (isMatch) {
      const token = jwt.sign(
        { admin: true, role: "admin", email },
        process.env.JWT_SECRET || "supersecretjwtkey123",
        { expiresIn: "7d" }
      );

      return res.json({
        message: "Official Administrator login successful",
        isAdmin: true,
        token,
        user: {
          name: "Official Administrator",
          email,
          role: "admin"
        }
      });
    }

    return res.status(401).json({ message: "Invalid Official Administrator credentials. Please check .env settings." });
  } catch (error) {
    return res.status(500).json({ message: "Server error during official login", error: error.message });
  }
};

// Get all applications
export const getAllComplaints = async (req, res) => {
  try {
    const apps = await Application.find()
      .populate("user", "name phone email citizenId")
      .sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single application by ID
export const getComplaintById = async (req, res) => {
  try {
    const app = await Application.findById(req.params.id)
      .populate("user", "name phone email citizenId");
      
    if (!app) {
      return res.status(404).json({ message: "Application not found" });
    }
    res.json(app);
  } catch (err) {
    console.error("Error fetching application:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update application status
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.status = status;
    if (remarks) app.remarks = remarks;
    await app.save();

    res.json({ message: "Application status updated successfully", application: app });
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Confirm Completion
export const confirmComplaintCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.status = "Approved";
    await app.save();

    res.json({ message: "Application confirmed as approved successfully", application: app });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Assign Complaint / Application
export const assignComplaintToDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedOfficer } = req.body;

    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ message: "Application not found" });

    app.assignedOfficer = assignedOfficer || "GovConnect Admin";
    app.status = "Under Review";
    await app.save();

    res.json({ message: "Application assigned successfully", application: app });
  } catch (err) {
    res.status(500).json({ message: "Server error assigning officer" });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get user application count
export const getUserComplaintCount = async (req, res) => {
  try {
    const count = await Application.countDocuments({ user: req.params.id });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get monthly + status breakdown stats
export const getMonthlyStats = async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};