import Complaint from "../models/Complaint.js";
import User from "../models/User.js";
import Department from "../models/Department.js"; // ✅ IMPORTED NEW MODEL
import Manager from "../models/Manager.js";
import { sendEmail } from "../utils/email.js";

// Admin login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASS) {
    return res.json({ message: "Admin login successful", isAdmin: true });
  } else {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }
};

// Get all complaints (with location and assigned department)
export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user", "name phone email")
      .populate("department", "name") // ✅ ADDED: Fetch department info too
      .populate("escalatedManager", "name email district") // 🚀 NEW: Fetch escalated manager info
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get single complaint by ID (with location)
export const getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("user", "name phone email")
      .populate("department", "name") // ✅ ADDED: Fetch department info too
      .populate("escalatedManager", "name email district"); // 🚀 NEW: Fetch escalated manager info
      
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.json(complaint);
  } catch (err) {
    console.error("Error fetching complaint:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update complaint status and send email
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const complaint = await Complaint.findById(id).populate("user");
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    // Notify user via email safely
    if (complaint.user && complaint.user.email) {
      try {
        await sendEmail(
          complaint.user.email,
          "Complaint Status Updated",
          `<p>Dear ${complaint.user.name || "Citizen"},</p>
           <p>Your complaint titled <b>${complaint.title}</b> status is now set to <b>${status}</b>.</p>`
        );
      } catch (mailErr) {
        console.error("Email send failed (non-blocking):", mailErr);
      }
    }

    return res.json({ message: "Complaint updated successfully", complaint });
  } catch (err) {
    console.error("Update complaint status error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get complaint count for a user
export const getUserComplaintCount = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const count = await Complaint.countDocuments({ user: userId });
    res.json({ count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Month-wise + status breakdown (returns `stats` for frontend compatibility)
export const getMonthlyStats = async (req, res) => {
  try {
    const months = [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ];

    const stats = months.map((m) => ({
      month: m,
      Pending: 0,
      Accepted: 0,
      Assigned: 0, // ✅ ADDED: Track new Assigned status
      Rejected: 0,
      Completed: 0,
      complaints: []
    }));

    const { year } = req.query;
    const match = {};
    if (year) {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      match.createdAt = { $gte: start, $lte: end };
    }

    const complaints = await Complaint.find(match)
      .populate("user", "name phone email")
      .sort({ createdAt: 1 });

    complaints.forEach((c) => {
      if (!c.createdAt) return;
      const monthIndex = new Date(c.createdAt).getMonth();
      stats[monthIndex].complaints.push(c);

      if (c.status === "Pending") stats[monthIndex].Pending++;
      else if (c.status === "Accepted") stats[monthIndex].Accepted++;
      else if (c.status === "Assigned") stats[monthIndex].Assigned++; // ✅ ADDED
      else if (c.status === "Rejected") stats[monthIndex].Rejected++;
      else if (c.status === "Completed") stats[monthIndex].Completed++;
    });

    res.json({ stats });
  } catch (err) {
    console.error("Error in getMonthlyStats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};

// ==========================================
// 🚀 NEW: DEPARTMENT MANAGEMENT ENDPOINTS
// ==========================================

// Create a new Department (Admin only)
export const createDepartment = async (req, res) => {
  try {
    const { name, email, password, description } = req.body;

    const existingDept = await Department.findOne({ email });
    if (existingDept) {
      return res.status(400).json({ message: "Department with this email already exists" });
    }

    const department = new Department({ name, email, password, description });
    await department.save(); // Password hashes via schema hook

    res.status(201).json({ message: "Department created successfully", department });
  } catch (error) {
    console.error("Create Department Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all Departments (For the Admin dropdown)
export const getAllDepartments = async (req, res) => {
  try {
    // We only need the name and ID for the dropdown
    const departments = await Department.find({}, "name _id email");
    res.status(200).json(departments);
  } catch (error) {
    console.error("Fetch Departments Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Assign Complaint to a Department
export const assignComplaintToDepartment = async (req, res) => {
  try {
    const { id } = req.params; // Complaint ID
    const { departmentId } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { 
        department: departmentId, 
        status: "Assigned",
        assignedAt: new Date(),
        isEscalatedToManager: false,
        escalatedToManagerAt: null,
        isEscalatedToAdmin: false,
        escalatedToAdminAt: null,
        escalatedManager: null,
        managerWarningMessage: null
      },
      { new: true }
    ).populate("user").populate("department", "name");

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    // Send an email safely
    if (complaint.user && complaint.user.email) {
      try {
        const deptName = complaint.department?.name || "Department";
        await sendEmail(
          complaint.user.email,
          "Complaint Assigned to Department",
          `<p>Dear ${complaint.user.name || "Citizen"},</p>
           <p>Your complaint titled <b>${complaint.title}</b> has been assigned to <b>${deptName}</b> and is currently being processed.</p>`
        );
      } catch (mailErr) {
        console.error("Email send failed (non-blocking):", mailErr);
      }
    }

    return res.status(200).json({ message: "Complaint assigned successfully", complaint });
  } catch (error) {
    console.error("Assign Complaint Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Confirm Complaint Completion (Admin confirms the department's work)
export const confirmComplaintCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the complaint and populate the user so we can email them
    const complaint = await Complaint.findById(id).populate("user");
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // 🚀 THE PERMANENT FIX: Set this to true in the database
    complaint.isAdminConfirmed = true; 
    complaint.status = "Completed";
    
    await complaint.save();

    // Send a final resolution email safely
    if (complaint.user && complaint.user.email) {
      try {
        await sendEmail(
          complaint.user.email,
          "Grievance Officially Resolved 🎉",
          `<p>Dear ${complaint.user.name || "Citizen"},</p>
           <p>Good news! Your complaint titled <b>${complaint.title}</b> has been successfully resolved by the assigned department and confirmed by the administration.</p>
           <p>Thank you for helping us keep our community great!</p>`
        );
      } catch (mailErr) {
        console.error("Email send failed (non-blocking):", mailErr);
      }
    }

    return res.status(200).json({ message: "Completion confirmed successfully", complaint });
  } catch (error) {
    console.error("Confirm Completion Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ==========================================
// 🚀 NEW: MANAGER MANAGEMENT ENDPOINTS
// ==========================================

// Create a new Manager (Admin only)
export const createManager = async (req, res) => {
  try {
    const { name, email, password, district, latitude, longitude } = req.body;

    const existing = await Manager.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "Manager with this email already exists" });
    }

    const manager = new Manager({
      name,
      email,
      password,
      district,
      latitude: parseFloat(latitude) || 0,
      longitude: parseFloat(longitude) || 0
    });

    await manager.save();
    res.status(201).json({ message: "Manager created successfully", manager });
  } catch (error) {
    console.error("Create Manager Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all active Managers (Admin only)
export const getAllManagers = async (req, res) => {
  try {
    const managers = await Manager.find({ isRemoved: false });
    res.status(200).json(managers);
  } catch (error) {
    console.error("Fetch Managers Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Remove a Manager (Admin only)
export const removeManager = async (req, res) => {
  try {
    const { id } = req.params;

    const manager = await Manager.findByIdAndUpdate(id, { isRemoved: true }, { new: true });
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }

    // Clear escalation logs that were assigned to this manager
    await Complaint.updateMany(
      { escalatedManager: id, status: { $ne: "Completed" } },
      { 
        isEscalatedToManager: false, 
        escalatedToManagerAt: null,
        isEscalatedToAdmin: false, 
        escalatedToAdminAt: null,
        escalatedManager: null
      }
    );

    res.status(200).json({ message: "Manager removed successfully and escalated cases cleared", manager });
  } catch (error) {
    console.error("Remove Manager Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};