import mongoose from "mongoose";

const CertificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    certificateType: {
      type: String,
      required: true,
      enum: [
        "Birth Certificate",
        "Death Certificate",
        "Income Certificate",
        "Caste Certificate",
        "Residence Certificate"
      ]
    },
    applicantDetails: {
      fullName: { type: String, required: true },
      fatherOrSpouseName: { type: String },
      dob: { type: Date },
      address: { type: String, required: true },
      mobile: { type: String, required: true },
      aadhaarNumber: { type: String },
      purpose: { type: String }
    },
    supportingDocUrl: { type: String },
    status: {
      type: String,
      enum: ["Submitted", "In Verification", "Approved", "Rejected"],
      default: "Submitted"
    },
    issuedCertificate: {
      certificateNumber: { type: String },
      digitalSealToken: { type: String },
      issueDate: { type: Date },
      validUntil: { type: Date },
      pdfUrl: { type: String }
    },
    remarks: { type: String },
    rejectionReason: { type: String },
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

export default mongoose.model("Certificate", CertificateSchema);
