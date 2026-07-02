import Department from "../models/Department.js";
import Complaint from "../models/Complaint.js";
import Worker from "../models/Worker.js";
import jwt from "jsonwebtoken";

// ✅ Department Login
export const departmentLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const department = await Department.findOne({ email });
    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Use the method we built into the schema
    const isMatch = await department.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a token so the department stays logged in
    const token = jwt.sign(
      { id: department._id, role: "department" },
      process.env.JWT_SECRET || "your_super_secret_key", // Make sure this matches your .env
      { expiresIn: "1d" }
    );

    res.status(200).json({ message: "Login successful", token, departmentId: department._id });
  } catch (error) {
    console.error("Department Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get Complaints assigned to this specific Department
export const getMyComplaints = async (req, res) => {
  try {
    // req.departmentId will come from our authentication middleware later
    const departmentId = req.departmentId; 

    const complaints = await Complaint.find({ department: departmentId })
      .populate("user", "name phone") // Get citizen info
      .sort({ createdAt: -1 }); // Newest first

    res.status(200).json({ complaints });
  } catch (error) {
    console.error("Fetch Department Complaints Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update Complaint Status & Add Message
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params; // Complaint ID
    const { status, departmentMessage } = req.body;

    const complaint = await Complaint.findByIdAndUpdate(
      id,
      { status, departmentMessage },
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Status updated successfully", complaint });
  } catch (error) {
    console.error("Update Status Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 🚀 Get all workers for this Department
export const getDepartmentWorkers = async (req, res) => {
  try {
    const workers = await Worker.find({ department: req.user._id }).select("-password");
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching workers" });
  }
};

export const createWorker = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    
    console.log("1. Request received for:", email);
    console.log("2. Department ID making request:", req.user?._id);

    const workerExists = await Worker.findOne({ email });
    if (workerExists) return res.status(400).json({ message: "Worker email already exists" });

    console.log("3. About to create worker in DB...");
    
    const worker = await Worker.create({
      name, email, password, phone,
      department: req.user._id 
    });
    
    console.log("4. Worker successfully created!");
    res.status(201).json({ message: "Worker created successfully", worker });
    
  } catch (error) {
    // 🔥 THIS PRINTS THE EXACT CRASH REASON TO YOUR TERMINAL
    console.error("🔥 CRASH IN createWorker:", error);
    res.status(500).json({ message: "Error creating worker", error: error.message });
  }
};

// 🚀 NEW: Assign complaint to a Worker
export const assignToWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const { workerId } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.worker = workerId;
    // We keep status as "Assigned" or change to "In Progress" depending on your preference
    await complaint.save();
    
    res.json({ message: "Assigned to worker successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: "Error assigning worker" });
  }
};

// 🚀 NEW: Department verifies the Worker's photo and confirms completion
export const verifyWorkerCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id);
    
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.isDepartmentConfirmed = true;
    // We leave status as "Completed" so Admin sees it and can do the final confirmation
    await complaint.save();

    res.json({ message: "Worker completion verified successfully", complaint });
  } catch (error) {
    res.status(500).json({ message: "Error verifying completion" });
  }
};