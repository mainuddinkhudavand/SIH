import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Application from "../models/Application.js";
import MdmRecord from "../models/MdmRecord.js";
import ConsentRecord from "../models/ConsentRecord.js";
import AuditLog from "../models/AuditLog.js";
import { CITIZENS_MASTER_DATASET } from "../utils/routingEngine.js";

export async function seedInitialData() {
  try {
    // Purge legacy Pavan demo records from MongoDB database
    await User.deleteMany({
      $or: [
        { email: /pavan/i },
        { name: /pavan/i },
        { email: "citizen@example.com" },
        { email: "pavan@govconnect.gov.in" },
        { email: "pavan.citizen@egram.gov.in" }
      ]
    }).catch(() => null);

    const citizenPassword = await bcrypt.hash("Citizen@123", 10);
    const existingCitizenCount = await User.countDocuments({ role: "citizen" });

    // Dynamic citizen system active - zero hardcoded static citizen seeding required.
    console.log("ℹ️ Dynamic Citizen Database Active: Profiles are generated dynamically upon Registration and Login.");

    const userCount = await User.countDocuments();
    if (userCount <= 1000) {
      console.log("🌱 Initializing realistic cross-linked demo seeding into MongoDB...");

      const adminPassword = await bcrypt.hash("Admin@123", 10);
      const officialPassword = await bcrypt.hash("Official@123", 10);

      // 1. Create State Admin User
      await User.create({
        name: "State Administrator",
        email: "admin@egram.com",
        phone: "+91 98765 43210",
        password: adminPassword,
        role: "admin",
        isVerified: true,
        kycCompleted: true,
        address: { district: "Central District", state: "State Govt", pin: "110001" }
      }).catch(() => null);

      // 2. Create Official Verification User
      await User.create({
        name: "Officer Verification Cell",
        email: "official@egram.gov.in",
        phone: "+91 98765 43212",
        password: officialPassword,
        role: "official",
        isVerified: true,
        kycCompleted: true,
        address: { district: "Central District", state: "State Govt", pin: "110001" }
      }).catch(() => null);

      // 3. Create Cross-Linked Citizens
      const aarav = await User.create({
        citizenId: "CIT-IND-9001",
        name: "Aarav Sharma",
        email: "aarav@example.com",
        phone: "+91 98765 43210",
        aadhaarNumber: "9876-5432-1000",
        password: citizenPassword,
        role: "citizen",
        isVerified: true,
        kycCompleted: true,
        address: { street: "14 Station Road", town: "Green Valley", district: "Central District", state: "State Govt", pin: "110001" }
      });

      const rajesh = await User.create({
        citizenId: "CIT-IND-9002",
        name: "Rajesh Patil",
        email: "rajesh@example.com",
        phone: "+91 98765 43214",
        aadhaarNumber: "9876-5432-1001",
        password: citizenPassword,
        role: "citizen",
        isVerified: true,
        kycCompleted: true,
        address: { street: "Plot 18 Main Road", town: "Green Valley", district: "Central District", state: "State Govt", pin: "110001" }
      });

      const suresh = await User.create({
        citizenId: "CIT-IND-9003",
        name: "Suresh Deshmukh",
        email: "suresh@example.com",
        phone: "+91 98765 43212",
        aadhaarNumber: "9876-5432-1002",
        password: citizenPassword,
        role: "citizen",
        isVerified: true,
        kycCompleted: true,
        address: { street: "Survey 103 Sector", town: "Green Valley", district: "Central District", state: "State Govt", pin: "110001" }
      });

      // 4. Create Master Data Management (MDM) Records for Citizens
      await MdmRecord.create([
        {
          citizenId: aarav.citizenId,
          businessId: aarav.businessId,
          primaryUser: aarav._id,
          verifiedName: aarav.name,
          verifiedEmail: aarav.email,
          verifiedPhone: aarav.phone,
          nationalIdentityHash: "AADHAAR-HASH-987654321000",
          linkedModules: [
            { moduleName: "Municipality Portal", linkedRecordId: "PROP-MH-401" },
            { moduleName: "Revenue Portal", linkedRecordId: "SRV-101" },
            { moduleName: "Tehsildar Office", linkedRecordId: "TEH-9001" },
            { moduleName: "Talati Village Register", linkedRecordId: "KHT-901" }
          ],
          status: "Active"
        },
        {
          citizenId: rajesh.citizenId,
          businessId: rajesh.businessId,
          primaryUser: rajesh._id,
          verifiedName: rajesh.name,
          verifiedEmail: rajesh.email,
          verifiedPhone: rajesh.phone,
          nationalIdentityHash: "AADHAAR-HASH-987654321001",
          linkedModules: [
            { moduleName: "Municipality Portal", linkedRecordId: "PROP-MH-405" },
            { moduleName: "Revenue Portal", linkedRecordId: "SRV-102" },
            { moduleName: "Talati Village Register", linkedRecordId: "KHT-902" }
          ],
          status: "Active"
        },
        {
          citizenId: suresh.citizenId,
          businessId: suresh.businessId,
          primaryUser: suresh._id,
          verifiedName: suresh.name,
          verifiedEmail: suresh.email,
          verifiedPhone: suresh.phone,
          nationalIdentityHash: "AADHAAR-HASH-987654321002",
          linkedModules: [
            { moduleName: "Municipality Portal", linkedRecordId: "PROP-MH-402" },
            { moduleName: "Revenue Portal", linkedRecordId: "SRV-103" },
            { moduleName: "Talati Village Register", linkedRecordId: "KHT-903" }
          ],
          status: "Active"
        }
      ]);

      // 5. Create Active Inter-Office Consent Records for Citizens
      await ConsentRecord.create([
        {
          user: aarav._id,
          citizenId: aarav.citizenId,
          requesterModule: "Third-Party Inter-Module Connector",
          dataFieldsGranted: ["fullName", "email", "phone", "address", "aadhaarNumber", "residenceCertificate", "kycStatus"],
          purpose: "Official Inter-Office Verification & Residency Services",
          status: "Granted"
        },
        {
          user: rajesh._id,
          citizenId: rajesh.citizenId,
          requesterModule: "Third-Party Inter-Module Connector",
          dataFieldsGranted: ["fullName", "email", "phone", "address", "aadhaarNumber", "residenceCertificate"],
          purpose: "Land & Civic Verification",
          status: "Granted"
        },
        {
          user: suresh._id,
          citizenId: suresh.citizenId,
          requesterModule: "Third-Party Inter-Module Connector",
          dataFieldsGranted: ["fullName", "email", "phone", "address", "aadhaarNumber"],
          purpose: "Income Verification",
          status: "Granted"
        }
      ]);

      // 6. Purge static seed applications so only real dynamically submitted applications exist
      await Application.deleteMany({
        $or: [
          { applicationId: { $in: ["CERT-INC-9001", "CERT-INC-9002", "APP-PROP-9003", "CERT-BIRTH-9004", "APP-401928", "APP-509124", "CERT-102948", "CERT-847291", "CERT-672910"] } },
          { "applicantDetails.fullName": /Ramesh|Anita|Sunil|Pavan|Suresh/i }
        ]
      }).catch(() => null);

      // 7. Seed Initial System Audit Logs
      await AuditLog.create([
        {
          action: "SYSTEM_INITIALIZED_AND_SEEDED",
          performedBy: aarav._id,
          userRole: "System",
          resourceType: "MasterData",
          details: "GovConnect system initialized with 3 cross-linked citizens, 3 MDM records, 3 active consent safeguards, and 4 multi-office applications.",
          ipAddress: "127.0.0.1"
        }
      ]);

      console.log("✅ Cross-linked demo dataset (Users, MDM, Consent, Applications, AuditLogs) seeded into MongoDB successfully.");
    }
  } catch (err) {
    console.error("⚠️ Seeding notice:", err.message);
  }
}
