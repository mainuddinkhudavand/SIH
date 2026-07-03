import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const ComplaintSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    grievance: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },

    imageUrl: { type: String },

    // ✅ Structured address object
    address: {
      street: { type: String },
      town: { type: String },
      district: { type: String },
      state: { type: String },
      pin: { type: String }
    },

    // ✅ GeoJSON location (for react-leaflet and geospatial queries)
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [0, 0]
      }
    },

    worker: { type: mongoose.Schema.Types.ObjectId, ref: "Worker" },
    workerMessage: { type: String, trim: true },
    
    // 🚀 NEW: Live photo captured by the worker as proof of completion
    resolutionImageUrl: { type: String },
    
    // 🚀 NEW: Department must confirm the worker's photo before Admin sees it as Completed
    isDepartmentConfirmed: { type: Boolean, default: false },

    // 🚀 NEW: Link to the assigned Department
    department: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Department" 
    },

    // 🚀 NEW: Notes from the department when they mark the job as finished
    departmentMessage: { 
      type: String,
      trim: true
    },

    // 🚀 NEW: Escalation & Warning tracking fields
    assignedAt: { type: Date },
    isEscalatedToManager: { type: Boolean, default: false },
    escalatedToManagerAt: { type: Date },
    isEscalatedToAdmin: { type: Boolean, default: false },
    escalatedToAdminAt: { type: Date },
    escalatedManager: { type: mongoose.Schema.Types.ObjectId, ref: "Manager" },
    managerWarningMessage: { type: String, trim: true },

    isAdminConfirmed: { type: Boolean, default: false },
    // 🚀 UPDATED: Added "Assigned" to the status flow
    status: {
      type: String,
      enum: ["Pending", "Accepted", "Assigned", "Rejected", "Completed"],
      default: "Pending"
    },

    feedbacks: [FeedbackSchema]
  },
  { timestamps: true }
);

// ✅ Geospatial index for location queries
ComplaintSchema.index({ location: "2dsphere" });

export default mongoose.model("Complaint", ComplaintSchema);