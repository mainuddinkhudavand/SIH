import mongoose from "mongoose";

// Configurable Workflow Engine Schema: Each department plugs in its own custom stages & SLA
const WorkflowTemplateSchema = new mongoose.Schema(
  {
    departmentName: {
      type: String,
      required: true
    },
    serviceType: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String
    },
    stages: [
      {
        stageName: { type: String, required: true },
        stageOrder: { type: Number, required: true },
        assignedRole: { type: String, default: "Department Officer" },
        slaHours: { type: Number, default: 48 },
        isFinal: { type: Boolean, default: false }
      }
    ],
    requiredDocuments: [{ type: String }],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("WorkflowTemplate", WorkflowTemplateSchema);
