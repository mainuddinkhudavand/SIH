import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Application from "../models/Application.js";
import MdmRecord from "../models/MdmRecord.js";
import ConsentRecord from "../models/ConsentRecord.js";
import AuditLog from "../models/AuditLog.js";

export async function seedInitialData() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log("🌱 Initializing realistic cross-linked demo seeding into MongoDB...");

      const adminPassword = await bcrypt.hash("Admin@123", 10);
      const citizenPassword = await bcrypt.hash("Citizen@123", 10);
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
      });

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
      });

      // 3. Create Cross-Linked Citizens
      const pavan = await User.create({
        citizenId: "CIT-IND-9001",
        name: "Pavan Kumar",
        email: "citizen@example.com",
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
          citizenId: pavan.citizenId,
          businessId: pavan.businessId,
          primaryUser: pavan._id,
          verifiedName: pavan.name,
          verifiedEmail: pavan.email,
          verifiedPhone: pavan.phone,
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
          user: pavan._id,
          citizenId: pavan.citizenId,
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

      // 6. Create Cross-Linked Applications with Real Multi-Office Chains
      await Application.create([
        {
          applicationId: "CERT-INC-9001",
          user: pavan._id,
          serviceId: "income-certificate",
          serviceType: "Certificates",
          title: "Income Certificate Application",
          routingType: "multi-office",
          officeChain: ["Talati", "Revenue", "Tehsildar"],
          primaryOffice: "Tehsildar",
          currentOffice: "Tehsildar",
          currentStageIndex: 2,
          governmentFee: { amount: 30, isPaid: true },
          applicantDetails: {
            fullName: pavan.name,
            phone: pavan.phone,
            email: pavan.email,
            address: "14 Station Road, Green Valley",
            aadhaarId: pavan.aadhaarNumber,
            annualIncome: "85000",
            reason: "Scholarship and educational concession"
          },
          documents: [
            { docType: "Salary / Income Affidavit", fileUrl: "/uploads/sample_proof.pdf" },
            { docType: "Aadhaar Identity Proof", fileUrl: "/uploads/sample_aadhaar.pdf" }
          ],
          stageVerifications: [
            { officeName: "Talati", stageName: "Step 1: Talati Village Crop & Income Check", status: "cleared", officerRemarks: "Verified annual crop yield income ₹85,000.", verifiedBy: "Talati Officer Sawant", verifiedAt: new Date() },
            { officeName: "Revenue", stageName: "Step 2: Revenue Dues Audit", status: "cleared", officerRemarks: "No pending land revenue dues found.", verifiedBy: "Revenue Inspector", verifiedAt: new Date() },
            { officeName: "Tehsildar", stageName: "Step 3: Tehsildar Final Approval", status: "pending", officerRemarks: "Queued for final executive approval." }
          ],
          status: "Tehsildar Verification Pending",
          assignedOfficer: "Tehsildar Senior Officer",
          timeline: [
            { stage: "Submitted", status: "Submitted", updatedBy: "Citizen Pavan Kumar", note: "Application submitted", timestamp: new Date(Date.now() - 3600000 * 24) },
            { stage: "Talati Clearance", status: "Cleared", updatedBy: "Talati Officer Sawant", note: "Income verified", timestamp: new Date(Date.now() - 3600000 * 12) },
            { stage: "Revenue Clearance", status: "Cleared", updatedBy: "Revenue Inspector", note: "No dues pending", timestamp: new Date(Date.now() - 3600000 * 6) }
          ]
        },
        {
          applicationId: "CERT-INC-9002",
          user: suresh._id,
          serviceId: "income-certificate",
          serviceType: "Certificates",
          title: "Annual Family Income Certificate",
          routingType: "multi-office",
          officeChain: ["Talati", "Revenue", "Tehsildar"],
          primaryOffice: "Tehsildar",
          currentOffice: "Revenue",
          currentStageIndex: 1,
          governmentFee: { amount: 30, isPaid: true },
          applicantDetails: {
            fullName: suresh.name,
            phone: suresh.phone,
            email: suresh.email,
            address: "Survey 103 Sector, Green Valley",
            aadhaarId: suresh.aadhaarNumber,
            surveyNumber: "SRV-103",
            annualIncome: "60000",
            reason: "Food security subsidy application"
          },
          pendingDues: {
            officeName: "Revenue",
            dueType: "Unpaid Land Revenue Cess & Tax",
            amount: 1850,
            surveyOrPropertyId: "SRV-103",
            isPaid: false
          },
          documents: [
            { docType: "Ration Card", fileUrl: "/uploads/sample_proof.pdf" }
          ],
          stageVerifications: [
            { officeName: "Talati", stageName: "Step 1: Talati Land Check", status: "cleared", officerRemarks: "7/12 extract checked.", verifiedBy: "Talati Officer", verifiedAt: new Date() },
            { officeName: "Revenue", stageName: "Step 2: Revenue Dues Audit", status: "dues_pending", officerRemarks: "Pending Land Revenue Cess ₹1,850. Payment required." },
            { officeName: "Tehsildar", stageName: "Step 3: Tehsildar Approval", status: "pending" }
          ],
          status: "Revenue Dues Pending",
          assignedOfficer: "Revenue Inspector",
          timeline: [
            { stage: "Submitted", status: "Submitted", updatedBy: "Citizen Suresh Deshmukh", note: "Application received", timestamp: new Date(Date.now() - 3600000 * 18) },
            { stage: "Talati Clearance", status: "Cleared", updatedBy: "Talati Officer", note: "Village land check cleared", timestamp: new Date(Date.now() - 3600000 * 10) }
          ]
        },
        {
          applicationId: "APP-PROP-9003",
          user: rajesh._id,
          serviceId: "property-tax-mutation",
          serviceType: "Civic Utilities",
          title: "Property Tax Mutation & Ownership Transfer",
          routingType: "multi-office",
          officeChain: ["Talati", "Revenue", "Municipality"],
          primaryOffice: "Municipality",
          currentOffice: "Talati",
          currentStageIndex: 0,
          governmentFee: { amount: 150, isPaid: true },
          applicantDetails: {
            fullName: rajesh.name,
            phone: rajesh.phone,
            email: rajesh.email,
            address: "Plot 18 Main Road, Green Valley",
            aadhaarId: rajesh.aadhaarNumber,
            propertyId: "PROP-MH-405",
            surveyNumber: "SRV-102",
            reason: "Ownership mutation post sale deed registration"
          },
          documents: [
            { docType: "Registered Sale Deed", fileUrl: "/uploads/sample_proof.pdf" },
            { docType: "Property Tax Receipt", fileUrl: "/uploads/sample_proof.pdf" }
          ],
          stageVerifications: [
            { officeName: "Talati", stageName: "Step 1: Talati 7/12 Extract Audit", status: "pending", officerRemarks: "Queued for village record verification." },
            { officeName: "Revenue", stageName: "Step 2: Revenue Title Clearance", status: "pending" },
            { officeName: "Municipality", stageName: "Step 3: Municipal Property Tax Register Update", status: "pending" }
          ],
          status: "Talati Verification Pending",
          assignedOfficer: "Talati Officer-In-Charge",
          timeline: [
            { stage: "Submitted", status: "Submitted", updatedBy: "Citizen Rajesh Patil", note: "Application submitted", timestamp: new Date() }
          ]
        },
        {
          applicationId: "CERT-BIRTH-9004",
          user: pavan._id,
          serviceId: "birth-certificate",
          serviceType: "Certificates",
          title: "Birth Certificate Registration",
          routingType: "single-office",
          officeChain: ["Municipality"],
          primaryOffice: "Municipality",
          currentOffice: "Completed",
          currentStageIndex: 0,
          governmentFee: { amount: 25, isPaid: true },
          applicantDetails: {
            fullName: pavan.name,
            phone: pavan.phone,
            email: pavan.email,
            address: "14 Station Road, Green Valley",
            aadhaarId: pavan.aadhaarNumber,
            reason: "Child birth registration"
          },
          stageVerifications: [
            { officeName: "Municipality", stageName: "Step 1: Municipal Registrar Approval", status: "cleared", officerRemarks: "Hospital slip verified. Birth certificate issued.", verifiedBy: "Municipal Executive Officer", verifiedAt: new Date() }
          ],
          status: "Approved",
          approvalDate: new Date(),
          issuedCertificate: {
            certificateId: "CERT-BIRTH-2026-881",
            issuedAt: new Date(),
            digitalSignature: "SIG-DIGI-MUNI-REGISTRAR-99012",
            qrCodeData: "https://egram.gov.in/verify/CERT-BIRTH-9004",
            downloadUrl: "/api/applications/download"
          },
          timeline: [
            { stage: "Submitted", status: "Submitted", updatedBy: "Citizen Pavan Kumar", note: "Application submitted", timestamp: new Date(Date.now() - 3600000 * 48) },
            { stage: "Approved", status: "Approved", updatedBy: "Municipal Registrar", note: "Certificate Issued", timestamp: new Date(Date.now() - 3600000 * 24) }
          ]
        }
      ]);

      // 7. Seed Initial System Audit Logs
      await AuditLog.create([
        {
          action: "SYSTEM_INITIALIZED_AND_SEEDED",
          performedBy: pavan._id,
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
