import AuditLog from "../models/AuditLog.js";

/**
 * Reusable Audit Logging Helper
 * Writes immutable audit log entries to MongoDB for all system transactions.
 */
export const logAuditEvent = async ({
  userId,
  user,
  performedBy,
  userRole = "Citizen/Official",
  action,
  resourceType = "System",
  entity,
  resourceId = "N/A",
  details = "",
  changesSnapshot = {},
  ipAddress = "127.0.0.1",
  status = "SUCCESS"
}) => {
  try {
    const rawUser = userId || user || performedBy;
    const finalUserId = rawUser && String(rawUser).match(/^[0-9a-fA-F]{24}$/) ? rawUser : null;
    const finalResourceType = resourceType || entity || "Application";
    const finalDetails = details || (typeof changesSnapshot === "string" ? changesSnapshot : "");

    const log = new AuditLog({
      user: finalUserId,
      userRole: userRole || "Citizen/Official",
      action: action || "SYSTEM_EVENT",
      resourceType: finalResourceType,
      resourceId: String(resourceId || "N/A"),
      changesSnapshot: typeof changesSnapshot === "object" ? changesSnapshot : { detailNote: String(changesSnapshot) },
      details: finalDetails,
      ipAddress: ipAddress || "127.0.0.1",
      status
    });

    await log.save();
    console.log(`[AUDIT LOG] ${action} on ${finalResourceType}:${resourceId} by ${userRole}`);
    return log;
  } catch (err) {
    console.error("[AUDIT LOG ERROR] Failed to record audit log:", err.message);
    return null;
  }
};

export const logTransaction = logAuditEvent;
export default logAuditEvent;
