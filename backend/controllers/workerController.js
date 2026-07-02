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