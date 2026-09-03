import Application from "../models/Application.js";
import Certificate from "../models/Certificate.js";

// Citizen Services Dashboard Data
export const getCitizenDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const [applications, certificates] = await Promise.all([
      Application.find({ user: userId }).sort({ createdAt: -1 }),
      Certificate.find({ user: userId }).sort({ createdAt: -1 })
    ]);

    return res.json({
      summary: {
        totalApplications: applications.length,
        totalCertificates: certificates.length
      },
      applications,
      certificates
    });
  } catch (error) {
    console.error("Error fetching citizen dashboard:", error);
    return res.status(500).json({ message: "Server error fetching citizen dashboard" });
  }
};

// Unified Citizen Tracking (/api/citizen/track/:id)
export const trackCitizenRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const term = id.trim();

    // 1. Check Application
    const app = await Application.findOne({
      $or: [{ applicationId: term }, { _id: term.match(/^[0-9a-fA-F]{24}$/) ? term : null }]
    }).populate("user", "name email phone");

    if (app) {
      return res.json({ type: "Application", record: app });
    }

    // 2. Check Certificate
    const cert = await Certificate.findOne({
      $or: [{ certificateId: term }, { _id: term.match(/^[0-9a-fA-F]{24}$/) ? term : null }]
    }).populate("user", "name email phone");

    if (cert) {
      return res.json({ type: "Certificate", record: cert });
    }

    return res.status(404).json({ message: "No matching record found for this tracking ID." });
  } catch (error) {
    console.error("Error tracking citizen record:", error);
    return res.status(500).json({ message: "Server error tracking record" });
  }
};

// Submit Citizen Application
export const submitCitizenApplication = async (req, res) => {
  try {
    const { serviceType, title, applicantDetails, documents, portal } = req.body;
    const userId = req.user._id;

    const applicationId = `APP-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const application = new Application({
      applicationId,
      user: userId,
      portal: portal || "municipal",
      serviceType,
      title: title || `${serviceType} Application`,
      applicantDetails,
      documents: documents || [],
      status: "Submitted",
      timeline: [
        {
          stage: "Submitted",
          status: "Submitted",
          updatedBy: "Citizen",
          note: "Application filed through Citizen Portal via GovConnect SSO.",
          timestamp: new Date()
        }
      ]
    });

    await application.save();
    return res.status(201).json({ message: "Application submitted successfully", application });
  } catch (error) {
    return res.status(500).json({ message: "Error submitting application", error: error.message });
  }
};

// Submit Citizen Certificate Request
export const submitCitizenCertificate = async (req, res) => {
  try {
    const { certificateType, applicantDetails, supportingDocUrl } = req.body;
    const userId = req.user._id;

    const certificateId = `CERT-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const certificate = new Certificate({
      certificateId,
      user: userId,
      certificateType,
      applicantDetails,
      supportingDocUrl: supportingDocUrl || "",
      status: "Submitted",
      timeline: [
        {
          stage: "Submitted",
          status: "Submitted",
          updatedBy: "Citizen",
          note: "Certificate request submitted through Citizen Portal.",
          timestamp: new Date()
        }
      ]
    });

    await certificate.save();
    return res.status(201).json({ message: "Certificate request submitted successfully", certificate });
  } catch (error) {
    return res.status(500).json({ message: "Error submitting certificate request", error: error.message });
  }
};
