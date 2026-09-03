import mongoose from "mongoose";

const SectorServiceSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    sector: {
      type: String,
      required: true,
      enum: ["School", "Hospital", "Mall", "Cinema", "Utilities"]
    },
    serviceName: {
      type: String,
      required: true
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    status: {
      type: String,
      enum: ["Submitted", "In Review", "Approved", "Completed", "Rejected"],
      default: "Submitted"
    },
    remarks: { type: String },
    timeline: [
      {
        stage: { type: String },
        status: { type: String },
        note: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.model("SectorService", SectorServiceSchema);
