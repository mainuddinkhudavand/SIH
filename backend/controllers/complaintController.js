import Complaint from "../models/Complaint.js";
import User from "../models/User.js"; // 🚀 NEW: Import User model



export const createComplaint = async (req, res) => {
  try {
    // 1. Grab the text data and parsed coordinates from the request
    const { grievance, title, description, address, lng, lat } = req.body;
    
    // 2. Grab the uploaded image path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "Live photo capture is required." });
    }

    // 🚀 NEW: Fetch citizen profile to get their registered KYC district
    const user = await User.findById(req.user._id);
    if (!user || !user.kycCompleted) {
      return res.status(400).json({ message: "Complete KYC verification to raise complaints." });
    }

    let parsedAddress = {};
    if (typeof address === 'string') {
      try { parsedAddress = JSON.parse(address); } catch (e) { parsedAddress = {}; }
    } else if (typeof address === 'object' && address !== null) {
      parsedAddress = address;
    }

    // Overwrite complaint district with the citizen's selected KYC district
    if (user.address && user.address.district) {
      parsedAddress.district = user.address.district;
    }

    const lngNum = Number(lng);
    const latNum = Number(lat);

    // 3. Create the complaint
    const newComplaint = new Complaint({
      user: req.user._id, // From your auth middleware
      grievance,
      title,
      description,
      imageUrl, // 🚀 Save the image URL
      address: parsedAddress, // Parse the address string back to an object
      location: {
        type: "Point",
        coordinates: [
          isNaN(lngNum) ? 0 : Math.max(-180, Math.min(180, lngNum)),
          isNaN(latNum) ? 0 : Math.max(-90, Math.min(90, latNum))
        ]
      }
    });

    await newComplaint.save();
    res.status(201).json({ message: "Complaint raised successfully", complaint: newComplaint });

  } catch (error) {
    console.error("Create Complaint Error:", error);
    res.status(500).json({ message: "Server error while raising complaint" });
  }
};

export const myComplaints = async (req, res) => {
  const complaints = await Complaint.find({ userId: req.user._id });
  res.json(complaints);
};
