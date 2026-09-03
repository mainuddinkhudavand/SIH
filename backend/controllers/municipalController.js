import Application from "../models/Application.js";
import AuditLog from "../models/AuditLog.js";

// Municipal Portal Services: Water Connection, Birth Certificate, Property Service, Municipal Grievance
export const getMunicipalApplications = async (req, res) => {
  try {
    let apps = await Application.find({ portal: "municipal" }).populate("user", "name email phone citizenId").sort({ createdAt: -1 });

    // Seed realistic sample application matching prompt if database is fresh
    if (apps.length === 0) {
      const sampleApp = await Application.create({
        applicationId: "GC1001",
        portal: "municipal",
        serviceType: "Water Connection",
        title: "New Water Connection Request",
        applicantDetails: {
          fullName: "Pavan",
          phone: "+91 98765 43210",
          email: "pavan@egram.gov.in",
          address: "House #14, Sector 4, Civic Zone"
        },
        status: "Pending",
        timeline: [
          {
            stage: "Submission",
            status: "Submitted at Citizen Portal",
            updatedBy: "Pavan",
            note: "Routed via GovConnect Interoperability Platform to Municipality Portal"
          }
        ]
      });
      apps = [sampleApp];
    }

    res.json({ success: true, count: apps.length, applications: apps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createMunicipalApplication = async (req, res) => {
  try {
    const { serviceType, title, applicantDetails, documents } = req.body;
    const userId = req.user?.id || req.body.userId;

    const appId = `GC${Math.floor(1000 + Math.random() * 9000)}`;

    const newApp = await Application.create({
      applicationId: appId,
      user: userId,
      portal: "municipal",
      serviceType: serviceType || "Water Connection",
      title: title || `${serviceType} Request`,
      applicantDetails,
      documents,
      status: "Pending",
      timeline: [
        {
          stage: "Submission",
          status: "Submitted at Citizen Portal",
          updatedBy: applicantDetails?.fullName || "Citizen",
          note: "Routed via GovConnect Platform to Municipality Portal"
        }
      ]
    });

    await AuditLog.create({
      action: "MUNICIPAL_APP_CREATED",
      performedBy: userId || "Citizen",
      entity: "Application",
      details: `Created Municipal app ${newApp.applicationId} for ${serviceType} via GovConnect`,
      ipAddress: req.ip || "127.0.0.1"
    });

    res.status(201).json({ success: true, application: newApp });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const processMunicipalApplication = async (req, res) => {
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
      updatedBy: req.user?.name || "Municipal Officer",
      note: remarks || `Municipal Officer updated status to ${status}`
    });

    if (status === "Approved") {
      app.approvalDate = new Date();
    }

    await app.save();

    await AuditLog.create({
      action: "MUNICIPAL_APP_PROCESSED",
      performedBy: req.user?.id || "Municipal Officer",
      entity: "Application",
      details: `Processed Municipal App ${app.applicationId} (${app.applicantDetails?.fullName}) -> ${status}`,
      ipAddress: req.ip || "127.0.0.1"
    });

    res.json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
