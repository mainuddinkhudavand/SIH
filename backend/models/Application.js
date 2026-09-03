import mongoose from "mongoose";

const ApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      unique: true,
      required: true,
      default: () => `APP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    portal: {
      type: String,
      enum: ["municipal", "revenue", "health"],
      required: true,
      default: "municipal"
    },
    serviceType: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    applicantDetails: {
      fullName: { type: String, required: true },
      phone: { type: String, required: true },
      email: { type: String },
      address: { type: String, required: true },
      identityNumber: { type: String }
    },
    documents: [
      {
        docType: { type: String },
        fileUrl: { type: String },
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ["Submitted", "Under Review", "GovConnect Verification", "Field Verification", "Approved", "Rejected"],
      default: "Submitted"
    },
    assignedOfficer: { type: String },
    remarks: { type: String },
    rejectionReason: { type: String },
    approvalDate: { type: Date },
    interopDataVerified: { type: Boolean, default: false },
    interopLogs: [
      {
        sourcePortal: { type: String },
        targetPortal: { type: String },
        action: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
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
