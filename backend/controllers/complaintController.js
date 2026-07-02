import Complaint from "../models/Complaint.js";



export const createComplaint = async (req, res) => {
  try {
    // 1. Grab the text data and parsed coordinates from the request
    const { grievance, title, description, address, lng, lat } = req.body;
    
    // 2. Grab the uploaded image path
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!imageUrl) {
      return res.status(400).json({ message: "Live photo capture is required." });
    }

    // 3. Create the complaint
    const newComplaint = new Complaint({
      user: req.user._id, // From your auth middleware
      grievance,
      title,
      description,
      imageUrl, // 🚀 Save the image URL
      address: JSON.parse(address), // Parse the address string back to an object
      location: {
        type: "Point",
        coordinates: [parseFloat(lng), parseFloat(lat)] // MongoDB needs [Longitude, Latitude]
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
