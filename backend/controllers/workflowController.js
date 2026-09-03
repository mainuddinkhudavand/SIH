import WorkflowTemplate from "../models/WorkflowTemplate.js";

// Register / Configure Process Workflow Pipeline
export const createWorkflowTemplate = async (req, res) => {
  try {
    const { departmentName, serviceType, description, stages, requiredDocuments } = req.body;

    const targetService = serviceType || `${departmentName} Core Service`;
    let existing = await WorkflowTemplate.findOne({ serviceType: targetService });
    if (existing) {
      existing.departmentName = departmentName || existing.departmentName;
      existing.description = description || existing.description;
      existing.stages = stages || existing.stages;
      existing.requiredDocuments = requiredDocuments || existing.requiredDocuments;
      await existing.save();
      return res.json({ message: "Workflow pipeline updated successfully", workflow: existing });
    }

    const workflow = new WorkflowTemplate({
      departmentName,
      serviceType: targetService,
      description,
      stages: stages || [
        { stageName: "Application Intake", stageOrder: 1, slaHours: 24 },
        { stageName: "GovConnect Data & Document Verification", stageOrder: 2, slaHours: 48 },
        { stageName: "Official Approval & Certificate Issuance", stageOrder: 3, slaHours: 24, isFinal: true }
      ],
      requiredDocuments: requiredDocuments || ["Proof of Address", "Identity Document"]
    });

    await workflow.save();
    return res.status(201).json({ message: "Workflow pipeline created successfully!", workflow });
  } catch (error) {
    return res.status(500).json({ message: "Error creating workflow pipeline", error: error.message });
  }
};

// Fetch All Configured Workflows
export const getAllWorkflows = async (req, res) => {
  try {
    const workflows = await WorkflowTemplate.find().sort({ departmentName: 1 });
    return res.json(workflows);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching workflows" });
  }
};

// Fetch Workflow for Service Type
export const getWorkflowByService = async (req, res) => {
  try {
    const { serviceType } = req.params;
    const workflow = await WorkflowTemplate.findOne({ serviceType });

    if (!workflow) {
      return res.json({
        serviceType,
        departmentName: "GovConnect Standard Department",
        stages: [
          { stageName: "Submitted", stageOrder: 1, slaHours: 24 },
          { stageName: "Under Review", stageOrder: 2, slaHours: 48 },
          { stageName: "Approved / Completed", stageOrder: 3, slaHours: 24, isFinal: true }
        ]
      });
    }

    return res.json(workflow);
  } catch (error) {
    return res.status(500).json({ message: "Error fetching workflow" });
  }
};

// Delete Workflow Template
export const deleteWorkflowTemplate = async (req, res) => {
  try {
    const { identifier } = req.params;
    await WorkflowTemplate.deleteMany({
      $or: [{ _id: identifier }, { serviceType: identifier }, { departmentName: identifier }]
    });
    return res.json({ message: "Workflow pipeline removed successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Error deleting workflow", error: error.message });
  }
};
