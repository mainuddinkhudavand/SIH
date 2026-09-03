import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";
import { triggerNotificationEvent } from "../utils/notificationEngine.js";

// Technical Pipeline Demonstration: POST /api/applications/water
// Flow: API Gateway -> Authentication -> Service Router -> Workflow Engine -> Municipality Connector -> Municipality API
export const createWaterApplication = async (req, res) => {
  try {
    const { fullName, phone, address, details } = req.body;
    const userId = req.user?._id || req.user?.id;

    const applicationId = `GC-WATER-${Math.floor(1000 + Math.random() * 9000)}`;

    const application = new Application({
      applicationId,
      user: userId,
      portal: "municipal",
      serviceType: "New Water Meter Connection",
      title: "New Water Connection Request",
      applicantDetails: {
        fullName: fullName || req.user?.name || "Pavan",
        phone: phone || req.user?.phone || "+91 98765 43210",
        address: address || "Plot #14, Sector 4, Civic Zone"
      },
      status: "Submitted",
      timeline: [
        { stage: "Frontend Submit", status: "Submitted", updatedBy: "Citizen", note: "App submitted via Citizen Portal.", timestamp: new Date() },
        { stage: "API Gateway", status: "Routed", updatedBy: "GovConnect Gateway", note: "Validated auth & rate limits.", timestamp: new Date() },
        { stage: "Workflow Engine", status: "Queued", updatedBy: "GovConnect Engine", note: "Assigned workflow pipeline GC-WATER-WF-1", timestamp: new Date() },
        { stage: "Municipality Connector", status: "Delivered", updatedBy: "Municipal Connector", note: "Dispatched payload to Municipality Portal API.", timestamp: new Date() }
      ]
    });

    await application.save();

    // Audit Log Pipeline Trace
    await AuditLog.create({
      action: "WATER_APPLICATION_PIPELINE_EXECUTED",
      performedBy: userId || "Citizen",
      entity: "Application",
      details: `POST /api/applications/water -> API Gateway -> Workflow Engine -> Municipality Connector -> Municipality API (${applicationId})`,
      ipAddress: req.ip || "127.0.0.1"
    });

    return res.status(201).json({
      success: true,
      message: "Water Connection Application dispatched to Municipality Portal via GovConnect Pipeline",
      pipelineTrace: [
        "Frontend",
        "API Gateway (gateway.js)",
        "Authentication (auth.js)",
        "Service Router (/api/applications/water)",
        "Workflow Engine (createWaterApplication)",
        "Municipality Connector",
        "Municipality API"
      ],
      application
    });
  } catch (error) {
    console.error("Error creating water application pipeline:", error);
    return res.status(500).json({ success: false, message: "Server error in water application pipeline", error: error.message });
  }
};

// Citizen: Submit Application
export const createApplication = async (req, res) => {
  try {
    const { serviceType, title, applicantDetails, documents } = req.body;
    const userId = req.user._id;

    const applicationId = `APP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const application = new Application({
      applicationId,
      user: userId,
      serviceType,
      title,
      applicantDetails,
      documents: documents || [],
      status: "Submitted",
      timeline: [
        {
          stage: "Application Submitted",
          status: "Submitted",
          updatedBy: "Citizen",
          note: "Application successfully submitted for official review.",
          timestamp: new Date()
        }
      ]
    });

    await application.save();

    // 🔔 Trigger Event Notification (Email, SMS, WhatsApp)
    triggerNotificationEvent({
      eventType: "APPLICATION_SUBMITTED",
      recipientEmail: applicantDetails?.email || req.user.email,
      recipientPhone: applicantDetails?.phone || req.user.phone,
      recipientName: applicantDetails?.fullName,
      referenceId: applicationId,
      serviceName: serviceType,
      newStatus: "Submitted"
    });

    return res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    console.error("Error creating application:", error);
    return res.status(500).json({ message: "Server error submitting application", error: error.message });
  }
};

// Citizen: Get My Applications
export const getUserApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const applications = await Application.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return res.status(500).json({ message: "Server error fetching applications" });
  }
};

// Official / Admin: Get All Applications
export const getAllApplications = async (req, res) => {
  try {
    const { status, serviceType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;

    const applications = await Application.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    return res.json(applications);
  } catch (error) {
    console.error("Error fetching all applications:", error);
    return res.status(500).json({ message: "Server error fetching applications" });
  }
};

// Official / Admin: Update Application Workflow / Approval
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, assignedOfficer, rejectionReason } = req.body;

    const application = await Application.findById(id).populate("user");
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (status) application.status = status;
    if (remarks) application.remarks = remarks;
    if (assignedOfficer) application.assignedOfficer = assignedOfficer;
    if (rejectionReason) application.rejectionReason = rejectionReason;

    if (status === "Approved") {
      application.approvalDate = new Date();
    }

    application.timeline.push({
      stage: `Stage: ${status}`,
      status: status,
      updatedBy: req.admin ? "Admin Official" : "Department Manager",
      note: remarks || rejectionReason || `Status updated to ${status}`,
      timestamp: new Date()
    });

    await application.save();

    // 🔔 Trigger Event-driven Multi-channel Notifications (Email / SMS / WhatsApp)
    triggerNotificationEvent({
      eventType: status === "Approved" ? "APPROVED" : status === "Rejected" ? "REJECTED" : "STAGE_CHANGED",
      recipientEmail: application.applicantDetails?.email || application.user?.email,
      recipientPhone: application.applicantDetails?.phone || application.user?.phone,
      recipientName: application.applicantDetails?.fullName || application.user?.name,
      referenceId: application.applicationId,
      serviceName: application.serviceType,
      newStatus: status,
      customMessage: remarks || rejectionReason
    });

    return res.json({ message: "Application status updated successfully", application });
  } catch (error) {
    console.error("Error updating application status:", error);
    return res.status(500).json({ message: "Server error updating application" });
  }
};

// Unified Track / Single Application fetch
export const getApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { applicationId: id }]
    }).populate("user", "name email phone");

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    return res.json(application);
  } catch (error) {
    console.error("Error fetching application details:", error);
    return res.status(500).json({ message: "Server error fetching application" });
  }
};
