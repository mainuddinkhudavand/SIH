import mongoose from "mongoose";

// Audit Logs: Tracks every system transaction for security & compliance
const AuditLogSchema = new mongoose.Schema(
  {
    logId: {
      type: String,
      unique: true,
      required: true,
      default: () => `AUD-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    userRole: {
      type: String,
      default: "System/Citizen"
    },
    action: {
      type: String,
      required: true // e.g. "CREATE_APPLICATION", "APPROVE_CERTIFICATE", "GRANT_CONSENT", "UPDATE_STATUS"
    },
    resourceType: {
      type: String,
      default: "Application"
    },
    entity: {
      type: String
    },
    resourceId: {
      type: String
    },
    details: {
      type: String
    },
    performedBy: {
      type: mongoose.Schema.Types.Mixed
    },
    changesSnapshot: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String,
      default: "127.0.0.1"
    },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "WARNING"],
      default: "SUCCESS"
    }
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", AuditLogSchema);
