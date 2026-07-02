import express from "express";
import auth from "../middleware/auth.js";
import Complaint from "../models/Complaint.js";
import { upload } from "../middleware/upload.js"; // 🚀 Import the multer middleware we created

const router = express.Router();

// Raise complaint - Now with Image Upload and Camera/GPS focus
// 🚀 Added upload.single("image") middleware
router.post("/", auth, upload.single("image"), async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  if (!req.user.kycCompleted) {
    return res.status(403).json({ message: "Complete KYC to raise complaints" });
  }

  // When using FormData, req.body fields arrive as strings
  const { grievance, title, description, address, location } = req.body;

  try {
    // 🚀 Validate that an image was actually captured/uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Live camera photo is required." });
    }

    // Prepare image path for DB
    const imageUrl = `/uploads/${req.file.filename}`;

    // ✅ Parse address and location from JSON strings (since FormData sends strings)
    const parsedAddress = typeof address === 'string' ? JSON.parse(address) : address;
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    // ✅ Normalize location safely
    let geoLocation = { type: "Point", coordinates: [0, 0] };
    if (parsedLocation) {
      // Handle array format [lng, lat] or object format {lat, lon}
      if (parsedLocation.type === "Point" && Array.isArray(parsedLocation.coordinates)) {
        geoLocation = parsedLocation;
      } else if (parsedLocation.lat !== undefined && (parsedLocation.lon !== undefined || parsedLocation.lng !== undefined)) {
        geoLocation = { 
          type: "Point", 
          coordinates: [parsedLocation.lon || parsedLocation.lng, parsedLocation.lat] 
        };
      }
    }

    const complaint = await Complaint.create({
      user: req.user._id,
      grievance, 
      title,
      description,
      imageUrl, // 🚀 Save the image path
      address: {
        street: parsedAddress?.street || "",
        town: parsedAddress?.town || "",
        district: parsedAddress?.district || "",
        state: parsedAddress?.state || "",
        pin: parsedAddress?.pin || ""
      },
      location: geoLocation,
    });

    return res.json({ message: "Complaint created successfully with photo evidence", complaint });
  } catch (err) {
    console.error("Complaint creation failed:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ... (Rest of your routes: /mine, /:id/feedback, /admin/all remain the same)

// My complaints
router.get("/mine", auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json({ complaints });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// ✅ Submit feedback for a complaint
router.post("/:id/feedback", auth, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });
  const { feedback, rating } = req.body;
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Rating 1-5 required" });
    
    complaint.feedbacks.push({
      user: req.user._id,
      text: feedback,
      rating,
      createdAt: new Date(),
    });
    await complaint.save({ validateBeforeSave: false });
    return res.json({ message: "Feedback submitted", complaint });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;