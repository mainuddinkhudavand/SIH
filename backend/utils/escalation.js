import Complaint from "../models/Complaint.js";
import Manager from "../models/Manager.js";

/**
 * Runs the automatic escalation checker to shift complaint status:
 * 1. Assigned to department for >48h (unresolved) -> Escalate to Manager.
 * 2. Escalated to manager for >48h (no action taken) -> Escalate to Admin.
 */
export const runEscalationCheck = async () => {
  try {
    const now = new Date();
    
    // Default escalation limit is 48 hours, but can be set via env for testing (e.g., 60000ms = 1 min)
    const ESCALATION_LIMIT_MS = parseInt(process.env.ESCALATION_LIMIT_MS) || 48 * 60 * 60 * 1000;
    const thresholdDate = new Date(now.getTime() - ESCALATION_LIMIT_MS);

    // =========================================================================
    // PHASE 1: Escalate unresolved complaints from Department to District Manager
    // =========================================================================
    // Find complaints that:
    // - are Assigned to a department
    // - assignedAt is older than threshold
    // - isEscalatedToManager is false
    const toEscalateToManager = await Complaint.find({
      status: "Assigned",
      department: { $exists: true, $ne: null },
      assignedAt: { $lte: thresholdDate },
      isEscalatedToManager: false
    });

    for (let complaint of toEscalateToManager) {
      const districtName = complaint.address?.district;
      
      // Find active manager for this district and department
      const manager = await Manager.findOne({
        district: new RegExp(`^${districtName}$`, "i"),
        isRemoved: false
      });

      complaint.isEscalatedToManager = true;
      complaint.escalatedToManagerAt = now;
      if (manager) {
        complaint.escalatedManager = manager._id;
      }
      await complaint.save();
      console.log(`[ESCALATION] Complaint "${complaint.title}" (${complaint._id}) escalated to Manager of ${districtName}`);
    }

    // =========================================================================
    // PHASE 2: Escalate unresolved complaints from Manager to Admin
    // =========================================================================
    // Find complaints that:
    // - are escalated to a manager
    // - escalatedToManagerAt is older than threshold
    // - isEscalatedToAdmin is false
    // - status is not Completed (since only action manager takes is to resend back,
    //   if they did not resend back, it is still isEscalatedToManager: true)
    const toEscalateToAdmin = await Complaint.find({
      isEscalatedToManager: true,
      escalatedToManagerAt: { $lte: thresholdDate },
      isEscalatedToAdmin: false,
      status: { $ne: "Completed" }
    });

    for (let complaint of toEscalateToAdmin) {
      complaint.isEscalatedToAdmin = true;
      complaint.escalatedToAdminAt = now;
      await complaint.save();
      console.log(`[ESCALATION] Complaint "${complaint.title}" (${complaint._id}) escalated to Admin due to Manager inaction`);
    }
  } catch (err) {
    console.error("[ESCALATION ERROR] Failed to run escalation check:", err);
  }
};
