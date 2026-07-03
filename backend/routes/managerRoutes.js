import express from "express";
import jwt from "jsonwebtoken";
import Manager from "../models/Manager.js";
import Complaint from "../models/Complaint.js";
import auth from "../middleware/auth.js";
import { sendEmail } from "../utils/email.js";
import Department from "../models/Department.js";

const router = express.Router();

// ==========================================
// MANAGER LOGIN PORTAL
// ==========================================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Find manager for this email, making sure they are not removed
    const manager = await Manager.findOne({
      email: email.toLowerCase(),
      isRemoved: false
    });

    if (!manager) {
      return res.status(401).json({ message: "Invalid credentials or manager does not exist" });
    }

    // Compare password
    const isMatch = await manager.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: manager._id, role: "manager" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Manager login successful",
      token,
      manager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        district: manager.district
      }
    });
  } catch (error) {
    console.error("Manager Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// GET MANAGER ESCALATED COMPLAINTS
// ==========================================
router.get("/my-complaints", auth, async (req, res) => {
  try {
    const manager = req.user;
    if (!manager) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Fetch complaints that are escalated to this manager (matching district)
    // and are not yet completed.
    const complaints = await Complaint.find({
      isEscalatedToManager: true,
      status: { $ne: "Completed" },
      "address.district": new RegExp(`^${manager.district}$`, "i")
    })
    .populate("user", "name phone email")
    .populate("department", "name")
    .sort({ escalatedToManagerAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Fetch Escalated Complaints Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ==========================================
// ACTION: INTIMATE & RESEND COMPLAINT TO DEPT
// ==========================================
router.put("/complaints/:id/warn-resend", auth, async (req, res) => {
  try {
    const manager = req.user;
    const { id } = req.params;
    const { warningMessage } = req.body;

    if (!manager) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const complaint = await Complaint.findById(id).populate("user").populate("department");
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Reset escalation flags and restart 48-hour department timer
    complaint.isEscalatedToManager = false;
    complaint.escalatedToManagerAt = null;
    complaint.isEscalatedToAdmin = false;
    complaint.escalatedToAdminAt = null;
    
    // Reset assignment clock and record manager's warning
    complaint.assignedAt = new Date();
    complaint.status = "Assigned";
    complaint.managerWarningMessage = warningMessage || "Warning: Action required within 48 hours.";

    await complaint.save();

    // Send warning email to the department
    try {
      await sendEmail(
        complaint.department.email,
        `⚠️ ESCALATED WARNING: Complaint Resent by District Manager`,
        `<p>Dear Department Officers,</p>
         <p>District Manager <b>${manager.name}</b> has resent complaint titled <b>"${complaint.title}"</b> back to your queue with a warning:</p>
         <p style="background:#fef2f2; color:#b91c1c; padding:12px; border-radius:6px; border-left:4px solid #ef4444; font-weight:600;">
           "${complaint.managerWarningMessage}"
         </p>
         <p>You have been granted another <b>48 hours</b> to resolve this complaint. Please take action immediately to avoid administrative sanctions.</p>`
      );
    } catch (mailErr) {
      console.error("Email to department failed:", mailErr);
    }

    // Notify user that their complaint is resent with warning
    try {
      await sendEmail(
        complaint.user.email,
        "Complaint Status Update: District Manager Warns Department",
        `<p>Dear ${complaint.user.name},</p>
         <p>Your complaint titled <b>"${complaint.title}"</b> has been reviewed by District Manager <b>${manager.name}</b>.</p>
         <p>The manager has officially warned the <b>${complaint.department.name}</b> department and resent the case back to their queue. They have been given another 48 hours to complete it.</p>`
      );
    } catch (mailErr) {
      console.error("Email to citizen failed:", mailErr);
    }

    res.status(200).json({ message: "Complaint resent to department with warning successfully", complaint });
  } catch (error) {
    console.error("Warn & Resend Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
