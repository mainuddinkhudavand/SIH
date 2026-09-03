import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";

// Revenue Portal Services: Land Registration, Income Certificate, Asset Verification, Stamp Duty
export const getRevenueApplications = async (req, res) => {
  try {
    const apps = await Application.find({ portal: "revenue" }).populate("user", "name email phone citizenId").sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, applications: apps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRevenueApplication = async (req, res) => {
  try {
    const { serviceType, title, applicantDetails, documents } = req.body;
    const userId = req.user?.id || req.body.userId;

    const newApp = await Application.create({
      user: userId,
      portal: "revenue",
      serviceType: serviceType || "Land Registration",
      title: title || `${serviceType} Application`,
      applicantDetails,
      documents,
      status: "Submitted",
      timeline: [
        {
          stage: "Submission",
          status: "Submitted to Revenue Portal",
          updatedBy: "Citizen",
          note: "Application received at Revenue Department Interoperability Node."
        }
      ]
    });

    await AuditLog.create({
      action: "REVENUE_APP_CREATED",
      performedBy: userId,
      entity: "Application",
      details: `Created Revenue application ${newApp.applicationId} for ${serviceType}`,
      ipAddress: req.ip || "127.0.0.1"
    });

    res.status(201).json({ success: true, application: newApp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processRevenueApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, assignedOfficer } = req.body;

    const app = await Application.findById(id);
    if (!app) return res.status(404).json({ success: false, message: "Application not found" });

    if (status) app.status = status;
    if (remarks) app.remarks = remarks;
    if (assignedOfficer) app.assignedOfficer = assignedOfficer;

    app.timeline.push({
      stage: status || "Review",
      status: status || "Updated",
      updatedBy: req.user?.name || "Revenue Officer",
      note: remarks || `Revenue status updated to ${status}`
    });

    if (status === "Approved") {
      app.approvalDate = new Date();
    }

    await app.save();

    await AuditLog.create({
      action: "REVENUE_APP_PROCESSED",
      performedBy: req.user?.id || "Revenue Officer",
      entity: "Application",
      details: `Processed Revenue App ${app.applicationId} -> ${status}`,
      ipAddress: req.ip || "127.0.0.1"
    });

    res.json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
