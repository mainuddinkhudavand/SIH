import SectorService from "../models/SectorService.js";

// Citizen: Submit Sector Service Request (School, Hospital, Mall, Cinema, Utilities)
export const createSectorRequest = async (req, res) => {
  try {
    const { sector, serviceName, details } = req.body;
    const userId = req.user._id;

    const requestId = `SEC-${sector.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    const sectorRequest = new SectorService({
      requestId,
      user: userId,
      sector,
      serviceName,
      details,
      status: "Submitted",
      timeline: [
        {
          stage: "Request Received",
          status: "Submitted",
          note: `Sector request for ${sector} (${serviceName}) recorded.`,
          timestamp: new Date()
        }
      ]
    });

    await sectorRequest.save();
    return res.status(201).json({ message: "Sector service request submitted", sectorRequest });
  } catch (error) {
    console.error("Error creating sector request:", error);
    return res.status(500).json({ message: "Server error creating sector request", error: error.message });
  }
};

// Citizen: Get My Sector Requests
export const getUserSectorRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await SectorService.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    console.error("Error fetching user sector requests:", error);
    return res.status(500).json({ message: "Server error fetching sector requests" });
  }
};

// Official / Admin: Get All Sector Requests
export const getAllSectorRequests = async (req, res) => {
  try {
    const { sector, status } = req.query;
    let query = {};
    if (sector) query.sector = sector;
    if (status) query.status = status;

    const requests = await SectorService.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    return res.json(requests);
  } catch (error) {
    console.error("Error fetching all sector requests:", error);
    return res.status(500).json({ message: "Server error fetching sector requests" });
  }
};

// Official / Admin: Update Sector Request Status
export const updateSectorRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const sectorRequest = await SectorService.findById(id);
    if (!sectorRequest) {
      return res.status(404).json({ message: "Sector request not found" });
    }

    sectorRequest.status = status;
    if (remarks) sectorRequest.remarks = remarks;

    sectorRequest.timeline.push({
      stage: `Stage: ${status}`,
      status: status,
      note: remarks || `Request status updated to ${status}`,
      timestamp: new Date()
    });

    await sectorRequest.save();
    return res.json({ message: "Sector request status updated", sectorRequest });
  } catch (error) {
    console.error("Error updating sector request status:", error);
    return res.status(500).json({ message: "Server error updating sector request" });
  }
};

// Official / Admin: Get Sector Analytics Summary
export const getSectorStats = async (req, res) => {
  try {
    const totalRequests = await SectorService.countDocuments();
    const schoolCount = await SectorService.countDocuments({ sector: "School" });
    const hospitalCount = await SectorService.countDocuments({ sector: "Hospital" });
    const mallCount = await SectorService.countDocuments({ sector: "Mall" });
    const cinemaCount = await SectorService.countDocuments({ sector: "Cinema" });
    const utilitiesCount = await SectorService.countDocuments({ sector: "Utilities" });

    const pendingCount = await SectorService.countDocuments({ status: { $in: ["Submitted", "In Review"] } });
    const approvedCount = await SectorService.countDocuments({ status: { $in: ["Approved", "Completed"] } });

    return res.json({
      totalRequests,
      schoolCount,
      hospitalCount,
      mallCount,
      cinemaCount,
      utilitiesCount,
      pendingCount,
      approvedCount
    });
  } catch (error) {
    console.error("Error fetching sector stats:", error);
    return res.status(500).json({ message: "Server error fetching sector stats" });
  }
};
