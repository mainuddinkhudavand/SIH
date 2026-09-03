import AuditLog from "../models/AuditLog.js";

// Utility to record immutable audit logs for every system transaction
export const logTransaction = async ({
  userId,
  userRole,
  action,
  resourceType,
  resourceId,
  changesSnapshot,
  ipAddress,
  status = "SUCCESS"
}) => {
  try {
    const log = new AuditLog({
      user: userId || null,
      userRole: userRole || "Citizen/Official",
      action,
      resourceType,
      resourceId: resourceId || "N/A",
      changesSnapshot: changesSnapshot || {},
      ipAddress: ipAddress || "127.0.0.1",
      status
    });
    await log.save();
    console.log(`[AUDIT LOG] ${action} on ${resourceType}:${resourceId} by ${userRole}`);
    return log;
  } catch (err) {
    console.error("[AUDIT LOG ERROR] Failed to record audit log:", err.message);
  }
};

export default logTransaction;
