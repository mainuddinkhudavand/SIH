import mongoose from "mongoose";

// Master Data Management (MDM): Single Source of Truth for Identifiers
const MdmRecordSchema = new mongoose.Schema(
  {
    citizenId: {
      type: String,
      unique: true,
      required: true,
      index: true
    },
    businessId: {
      type: String,
      unique: true,
      sparse: true
    },
    primaryUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    verifiedName: { type: String, required: true },
    verifiedEmail: { type: String, required: true },
    verifiedPhone: { type: String, required: true },
    nationalIdentityHash: { type: String }, // Aadhaar/Tax ID cryptographic hash
    linkedModules: [
      {
        moduleName: { type: String }, // e.g. "School", "Hospital", "Mall", "Cinema", "Certificates"
        linkedRecordId: { type: String },
        linkedAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: ["Active", "Flagged", "Merged", "Archived"],
      default: "Active"
    }
  },
  { timestamps: true }
);

export default mongoose.model("MdmRecord", MdmRecordSchema);
