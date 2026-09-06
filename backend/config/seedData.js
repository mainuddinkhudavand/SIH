import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Application from "../models/Application.js";

export async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Database empty. Initializing automatic demo seeding...");

      const adminPassword = await bcrypt.hash("Admin@123", 10);
      const citizenPassword = await bcrypt.hash("Citizen@123", 10);
      const officialPassword = await bcrypt.hash("Official@123", 10);

      // 1. Create State Admin User
      const admin = await User.create({
        name: "State Administrator",
        email: "admin@egram.com",
        phone: "+91-9876543210",
        password: adminPassword,
        role: "admin",
        isVerified: true,
        kycCompleted: true,
        address: { district: "Central District", state: "State Govt", pin: "110001" }
      });

      // 2. Create Sample Citizen User
      const citizen = await User.create({
        name: "Rajesh Kumar",
        email: "citizen@example.com",
        phone: "+91-9876543211",
        password: citizenPassword,
        role: "citizen",
        isVerified: true,
        kycCompleted: true,
        address: { street: "Station Road", town: "Green Valley", district: "Central District", state: "State Govt", pin: "110001" }
      });

      // 3. Create Sample Official User
      const official = await User.create({
        name: "Officer Verification Cell",
        email: "official@egram.gov.in",
        phone: "+91-9876543212",
        password: officialPassword,
        role: "official",
        isVerified: true,
        kycCompleted: true,
        address: { district: "Central District", state: "State Govt", pin: "110001" }
      });

      // 4. Create Sample Applications for testing
      await Application.create([
        {
          applicationId: `APP-${Date.now()}-101`,
          user: citizen._id,
          serviceId: "SRV-RES-01",
          serviceType: "Residency Certificate",
          title: "Application for Domicile & Residency Certificate",
          routingType: "multi-office",
          officeChain: ["Talati", "Tehsildar", "Revenue"],
          primaryOffice: "Talati",
          currentOffice: "Talati",
          status: "Submitted",
          applicantDetails: {
            fullName: citizen.name,
            phone: citizen.phone,
            email: citizen.email,
            address: "123 Station Road, Green Valley, Central District, State Govt - 110001",
            aadhaarId: "9999-8888-7777",
            annualIncome: "350000",
            reason: "Educational admission and domicile verification"
          },
          governmentFee: { amount: 50, isPaid: true },
          timeline: [
            { stage: "Submitted", status: "Submitted", note: "Application submitted by citizen", timestamp: new Date() }
          ]
        },
        {
          applicationId: `APP-${Date.now()}-102`,
          user: citizen._id,
          serviceId: "SRV-MUN-02",
          serviceType: "Property Tax Assessment",
          title: "Property Assessment & Tax Clearance",
          routingType: "single-office",
          primaryOffice: "Municipality",
          currentOffice: "Municipality",
          status: "Under Verification",
          applicantDetails: {
            fullName: citizen.name,
            phone: citizen.phone,
            email: citizen.email,
            address: "Plot 45, Green Valley Colony",
            aadhaarId: "9999-8888-7777",
            propertyId: "PROP-GV-2024-88",
            reason: "Annual municipal tax assessment"
          },
          governmentFee: { amount: 100, isPaid: true },
          timeline: [
            { stage: "Submitted", status: "Submitted", note: "Application received", timestamp: new Date() },
            { stage: "Under Verification", status: "In Progress", note: "Assigned to Municipal inspector", timestamp: new Date() }
          ]
        }
      ]);

      console.log("✅ Initial demo dataset seeded successfully into database.");
    }
  } catch (err) {
    console.error("⚠️ Seeding notice:", err.message);
  }
}
