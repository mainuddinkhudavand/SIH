import Certificate from "../models/Certificate.js";

// Citizen: Submit Certificate Request
export const createCertificateRequest = async (req, res) => {
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
          stage: "Request Submitted",
          status: "Submitted",
          updatedBy: "Citizen",
          note: "Certificate request submitted for verification.",
          timestamp: new Date()
        }
      ]
    });

    await certificate.save();
    return res.status(201).json({ message: "Certificate request submitted", certificate });
  } catch (error) {
    console.error("Error creating certificate request:", error);
    return res.status(500).json({ message: "Server error submitting certificate request", error: error.message });
  }
};

// Citizen: Get My Certificate Requests
export const getUserCertificates = async (req, res) => {
  try {
    const userId = req.user._id;
    const certificates = await Certificate.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(certificates);
  } catch (error) {
    console.error("Error fetching user certificates:", error);
    return res.status(500).json({ message: "Server error fetching certificates" });
  }
};

// Official / Admin: Get All Certificate Requests
export const getAllCertificates = async (req, res) => {
  try {
    const { status, certificateType } = req.query;
    let query = {};
    if (status) query.status = status;
    if (certificateType) query.certificateType = certificateType;

    const certificates = await Certificate.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    return res.json(certificates);
  } catch (error) {
    console.error("Error fetching all certificates:", error);
    return res.status(500).json({ message: "Server error fetching certificates" });
  }
};

// Official / Admin: Approve/Reject and Issue Certificate
export const updateCertificateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, rejectionReason } = req.body;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate request not found" });
    }

    certificate.status = status;
    if (remarks) certificate.remarks = remarks;
    if (rejectionReason) certificate.rejectionReason = rejectionReason;

    if (status === "Approved") {
      const issueDate = new Date();
      const validUntil = new Date(issueDate.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year validity
      const certNo = `GOV-${certificate.certificateType.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-8)}`;
      const sealToken = `DIGISEAL-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      certificate.issuedCertificate = {
        certificateNumber: certNo,
        digitalSealToken: sealToken,
        issueDate: issueDate,
        validUntil: validUntil,
        pdfUrl: ""
      };
    }

    certificate.timeline.push({
      stage: `Stage: ${status}`,
      status: status,
      updatedBy: req.admin ? "Admin Official" : "Department Official",
      note: remarks || rejectionReason || `Certificate request ${status.toLowerCase()}`,
      timestamp: new Date()
    });

    await certificate.save();
    return res.json({ message: `Certificate ${status} successfully`, certificate });
  } catch (error) {
    console.error("Error updating certificate status:", error);
    return res.status(500).json({ message: "Server error updating certificate" });
  }
};

// Get single certificate request by ID or certificateId
export const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { certificateId: id }]
    }).populate("user", "name email phone");

    if (!certificate) {
      return res.status(404).json({ message: "Certificate request not found" });
    }

    return res.json(certificate);
  } catch (error) {
    console.error("Error fetching certificate details:", error);
    return res.status(500).json({ message: "Server error fetching certificate" });
  }
};
