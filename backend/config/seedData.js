import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Department from "../models/Department.js";
import Complaint from "../models/Complaint.js";

export async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const userPassword = await bcrypt.hash("user123", 10);

      // Create Admin User
      await User.create({
        name: "State Admin",
        email: "admin@egram.com",
        phone: "9999999999",
        password: hashedPassword,
        isVerified: true,
        kycCompleted: true,
        address: { district: "Central District", state: "State Govt" }
      });

      // Create Sample Citizen User
      const citizen = await User.create({
        name: "Rajesh Kumar",
        email: "citizen@example.com",
        phone: "9876543210",
        password: userPassword,
        isVerified: true,
        kycCompleted: true,
        address: { street: "Station Road", town: "Green Valley", district: "Central District", state: "State Govt", pin: "110001" }
      });

      // Create Sample Departments
      const waterDept = await Department.create({
        name: "Water Supply & Sanitation Dept",
        district: "Central District",
        state: "State Govt",
        pincode: "110001",
        email: "water@district.gov.in",
        password: hashedPassword
      });

      const powerDept = await Department.create({
        name: "Electricity Board & Utility Dept",
        district: "Central District",
        state: "State Govt",
        pincode: "110001",
        email: "power@district.gov.in",
        password: hashedPassword
      });

      // Create Sample Complaints with spatial coordinates for Heatmap
      const now = new Date();
      const sla24 = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await Complaint.create([
        {
          user: citizen._id,
          grievance: "Water supply/leakages",
          utilityCategory: "Water supply/leakages",
          title: "Main Pipeline Burst on Station Road",
          description: "Severe water leakage disrupting main supply to residential Block B.",
          imageUrl: "/uploads/sample_water.jpg",
          urgency: "High",
          slaDueDate: sla24,
          status: "Assigned",
          department: waterDept._id,
          assignedAt: now,
          address: { street: "Station Road", town: "Green Valley", district: "Central District", state: "State Govt", pin: "110001" },
          location: { type: "Point", coordinates: [77.2090, 28.6139] },
          aiVerification: { status: "PASS", confidenceScore: 98, flags: [] }
        },
        {
          user: citizen._id,
          grievance: "Streetlights/ Electricity",
          utilityCategory: "Streetlights/ Electricity",
          title: "Transformer Fault & Power Outage",
          description: "Transformer sparking near Market Complex causing complete blackout.",
          imageUrl: "/uploads/sample_power.jpg",
          urgency: "Critical",
          slaDueDate: new Date(now.getTime() + 12 * 60 * 60 * 1000),
          status: "Pending",
          address: { street: "Market Complex", town: "Green Valley", district: "Central District", state: "State Govt", pin: "110001" },
          location: { type: "Point", coordinates: [77.2150, 28.6180] },
          aiVerification: { status: "PASS", confidenceScore: 92, flags: [] }
        },
        {
          user: citizen._id,
          grievance: "Roads/potholes",
          utilityCategory: "Roads/potholes",
          title: "Deep Pothole Hazard on Highway Crossing",
          description: "Large pothole causing vehicle damage and traffic slowdown.",
          imageUrl: "/uploads/sample_road.jpg",
          urgency: "Medium",
          slaDueDate: new Date(now.getTime() + 48 * 60 * 60 * 1000),
          status: "Completed",
          department: powerDept._id,
          assignedAt: now,
          address: { street: "Highway Crossing", town: "Green Valley", district: "Central District", state: "State Govt", pin: "110001" },
          location: { type: "Point", coordinates: [77.2200, 28.6100] },
          aiVerification: { status: "PASS", confidenceScore: 95, flags: [] },
          feedbacks: [{ user: citizen._id, text: "Fixed promptly by field crew. Thank you!", rating: 5 }]
        }
      ]);


      console.log("Database seeded successfully with default Admin, Citizen, Departments & Heatmap Complaints.");
    }
  } catch (err) {
    console.error("Seed error:", err.message);
  }
}
