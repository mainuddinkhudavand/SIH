import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false
    },
    serviceId: {
      type: String,
      required: true
    },
    serviceType: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    routingType: {
      type: String,
      enum: ["single-office", "multi-office"],
      default: "single-office"
    },
    officeChain: [
      {
        type: String // e.g. ["Talati", "Tehsildar", "Revenue"]
      }
    ],
    primaryOffice: {
      type: String,
      enum: ["Municipality", "Tehsildar", "Revenue", "Talati"],
      default: "Municipality"
    },
    currentOffice: {
      type: String,
      enum: ["Municipality", "Tehsildar", "Revenue", "Talati", "Completed"],
      default: "Municipality"
    },
    currentStageIndex: {
      type: Number,
      default: 0
    },
    governmentFee: {
      amount: { type: Number, default: 50 },
      isPaid: { type: Boolean, default: true }
    },
    applicantDetails: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String, required: true },
      aadhaarId: { type: String, required: true },
      surveyNumber: { type: String },
      propertyId: { type: String },
      wardCode: { type: String },
      annualIncome: { type: String },
      casteCategory: { type: String },
      deceasedName: { type: String },
      businessName: { type: String },
      reason: { type: String }
    },
    documents: [
      {
        docType: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    stageVerifications: [
      {
        officeName: { type: String },
        stageName: { type: String },
        status: {
          type: String,
          enum: ["pending", "cleared", "dues_pending", "discrepancy", "approved", "rejected"],
          default: "pending"
        },
        officerRemarks: { type: String },
        verifiedBy: { type: String },
        verifiedAt: { type: Date }
      }
    ],
    pendingDues: {
      officeName: { type: String },
      dueType: { type: String },
      amount: { type: Number, default: 0 },
      surveyOrPropertyId: { type: String },
      isPaid: { type: Boolean, default: false },
      paymentMethod: { type: String },
      bankName: { type: String },
      accountNumber: { type: String },
      accountHolderName: { type: String },
      ifscCode: { type: String },
      paymentReceiptNo: { type: String },
      paidAt: { type: Date }
    },
    issuedCertificate: {
      certificateId: { type: String },
      issuedAt: { type: Date },
      digitalSignature: { type: String },
      qrCodeData: { type: String },
      downloadUrl: { type: String }
    },
    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Verification",
        "Talati Verification Pending",
        "Tehsildar Verification Pending",
        "Revenue Dues Pending",
        "Municipal Review Pending",
        "Field Visit Scheduled",
        "Approved",
        "Discrepancy Found",
        "Rejected"
      ],
      default: "Submitted"
    },
    assignedOfficer: { type: String },
    remarks: { type: String },
    rejectionReason: { type: String },
    approvalDate: { type: Date },
    timeline: [
      {
        stage: { type: String },
        status: { type: String },
        updatedBy: { type: String },
        note: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("Application", ApplicationSchema);
