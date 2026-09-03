import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ["Notice", "Public Event", "Urgent Alert", "Civic Announcement"],
      default: "Notice"
    },
    content: {
      type: String,
      required: true
    },
    publishedBy: {
      type: String,
      default: "Municipal Administration"
    },
    targetAudience: {
      type: String,
      default: "All Citizens"
    },
    eventDate: {
      type: Date
    },
    isPinned: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export default mongoose.model("Notice", NoticeSchema);
