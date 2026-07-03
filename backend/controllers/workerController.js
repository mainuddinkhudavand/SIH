import Worker from "../models/Worker.js";
import Complaint from "../models/Complaint.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id, role: "worker" }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// 1. Worker Login
export const workerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const worker = await Worker.findOne({ email });

    if (worker && (await worker.matchPassword(password))) {
      res.json({ token: generateToken(worker._id), worker: { id: worker._id, name: worker.name, department: worker.department } });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. Get assigned complaints
export const getMyTasks = async (req, res) => {
  try {
    const complaints = await Complaint.find({ worker: req.user._id }).populate("user", "name phone").sort({ createdAt: -1 });
    res.json({ complaints });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// 3. Complete task with Live Photo
export const completeTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerMessage } = req.body;
    const complaint = await Complaint.findById(id);

    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    if (!req.file) {
      return res.status(400).json({ message: "Live resolution photo is required." });
    }

    // Update with worker's proof
    complaint.resolutionImageUrl = `/uploads/${req.file.filename}`;
    complaint.workerMessage = workerMessage;
    complaint.status = "Completed"; // This now means "Completed by worker, waiting for Dept"
    complaint.isDepartmentConfirmed = false; 

    await complaint.save();
    res.json({ message: "Task marked as completed. Pending department verification.", complaint });
  } catch (error) {
    res.status(500).json({ message: "Server error during task completion" });
  }
};

// 4. Get worker profile with rating aggregate and performance stats
export const getWorkerProfile = async (req, res) => {
  try {
    const worker = await Worker.findById(req.user._id).select("-password").populate("department", "name");
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    const complaints = await Complaint.find({ worker: req.user._id });
    let totalRating = 0;
    let ratingCount = 0;
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const recentFeedbacks = [];

    complaints.forEach(c => {
      if (c.feedbacks && c.feedbacks.length > 0) {
        c.feedbacks.forEach(f => {
          totalRating += f.rating;
          ratingCount += 1;
          if (ratingDistribution[f.rating] !== undefined) {
            ratingDistribution[f.rating] += 1;
          }
          recentFeedbacks.push({
            rating: f.rating,
            text: f.text,
            createdAt: f.createdAt,
            complaintTitle: c.title
          });
        });
      }
    });

    const averageRating = ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(2)) : 0;

    res.json({
      id: worker._id,
      name: worker.name,
      email: worker.email,
      phone: worker.phone || "",
      department: worker.department ? worker.department.name : "N/A",
      profilePictureUrl: worker.profilePictureUrl || null,
      performance: {
        averageRating,
        totalTasks: complaints.length,
        completedTasks: complaints.filter(c => c.status === "Completed" || c.isAdminConfirmed).length,
        ratingCount,
        ratingDistribution,
        recentFeedbacks: recentFeedbacks.sort((a, b) => b.createdAt - a.createdAt).slice(0, 5)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// 5. Update worker profile details & profile picture
export const updateWorkerProfile = async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const worker = await Worker.findById(req.user._id);
    if (!worker) return res.status(404).json({ message: "Worker not found" });

    if (name) worker.name = name;
    if (email) {
      if (email.toLowerCase() !== worker.email) {
        const existing = await Worker.findOne({ email: email.toLowerCase() });
        if (existing) return res.status(400).json({ message: "Email already in use" });
        worker.email = email.toLowerCase();
      }
    }
    if (phone) {
      if (phone !== worker.phone) {
        const existing = await Worker.findOne({ phone });
        if (existing) return res.status(400).json({ message: "Phone number already in use" });
        worker.phone = phone;
      }
    }

    if (req.file) {
      worker.profilePictureUrl = `/uploads/${req.file.filename}`;
    }

    await worker.save();
    res.json({ message: "Profile updated successfully", worker });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};