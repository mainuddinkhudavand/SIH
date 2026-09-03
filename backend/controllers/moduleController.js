import SectorService from "../models/SectorService.js";

// Sector Workflows & Module Data Handler (/api/modules)
export const getSectorModuleServices = async (req, res) => {
  try {
    const { sector } = req.query; // School, Hospital, Mall, Cinema, Utilities
    const query = sector ? { sector } : {};
    const requests = await SectorService.find(query).populate("user", "name email phone").sort({ createdAt: -1 });

    const sectorCatalog = {
      School: [
        { name: "School Admission Application", description: "Request enrollment in local public/grant-in-aid schools." },
        { name: "School Transfer Certificate", description: "Apply for official student transfer certification." },
        { name: "Scholarship Registration", description: "Apply for municipal merit & financial assistance grants." }
      ],
      Hospital: [
        { name: "Hospital OPD Appointment", description: "Book outpatient department doctor appointment." },
        { name: "Emergency Ambulance Assistance", description: "Request urgent medical dispatch." },
        { name: "Bed Status Inquiry", description: "Inquire about ICU & general ward bed availability." }
      ],
      Mall: [
        { name: "Commercial Trader Permit", description: "Commercial space registration & operational permit." },
        { name: "Mall Vendor Allotment", description: "Register for temporary or permanent retail stall space." }
      ],
      Cinema: [
        { name: "Event & Public Screening Permit", description: "Apply for film screening & public assembly permissions." },
        { name: "Venue Safety Clearance", description: "Request fire & structural safety inspection certificate." }
      ],
      Utilities: [
        { name: "Streetlight Outage Repair", description: "Report broken electrical fixtures & streetlights." },
        { name: "Water Pipeline Fix", description: "Report water leakages & supply interruptions." }
      ]
    };

    return res.json({
      catalog: sector ? sectorCatalog[sector] || [] : sectorCatalog,
      requests
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching sector module data" });
  }
};

// Submit Sector Workflow Action
export const submitSectorAction = async (req, res) => {
  try {
    const { sector, serviceName, details } = req.body;
    const userId = req.user ? req.user._id : req.body.userId;

    const requestId = `SEC-${sector.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`;

    const sectorService = new SectorService({
      requestId,
      user: userId,
      sector,
      serviceName,
      details,
      status: "Submitted",
      timeline: [
        { stage: "Request Received", status: "Submitted", note: `Workflow initiated for ${sector} (${serviceName}).`, timestamp: new Date() }
      ]
    });

    await sectorService.save();
    return res.status(201).json({ message: "Sector workflow request initiated", record: sectorService });
  } catch (error) {
    return res.status(500).json({ message: "Error submitting sector action", error: error.message });
  }
};
