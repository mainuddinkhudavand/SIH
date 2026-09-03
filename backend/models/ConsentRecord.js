import mongoose from "mongoose";

// Consent-based Data Sharing: Citizens control what data is shared between modules
const ConsentRecordSchema = new mongoose.Schema(
  {
    consentId: {
      type: String,
      unique: true,
      required: true,
      default: () => `CNS-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    citizenId: {
      type: String,
      required: true
    },
    requesterModule: {
      type: String,
      required: true,
      enum: [
        "School Admission Module",
        "Hospital Healthcare Module",
        "Commercial Mall Module",
        "Cinema & Events Module",
        "Banking & Welfare Partner",
        "Third-Party Inter-Module Connector"
      ]
    },
    dataFieldsGranted: [
      {
        type: String,
        enum: [
          "fullName",
          "email",
          "phone",
          "address",
          "aadhaarNumber",
          "incomeCertificate",
          "casteCertificate",
          "residenceCertificate",
          "kycStatus"
        ]
      }
    ],
    purpose: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Granted", "Revoked", "Expired"],
      default: "Granted"
    },
    grantedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // Default 180 days consent
    },
    consentToken: {
      type: String,
      default: () => `TOKEN-${Math.random().toString(36).substring(2, 12).toUpperCase()}`
    }
  },
  { timestamps: true }
);

export default mongoose.model("ConsentRecord", ConsentRecordSchema);
