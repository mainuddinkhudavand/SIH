import express from "express";
import Application from "../models/Application.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/admin/analytics/heatmap - Provides application distribution & portal markers
router.get("/heatmap", async (req, res) => {
  try {
    const applications = await Application.find().populate("user", "name email phone citizenId").lean();

    const points = applications.map((app) => {
      return {
        id: app._id,
        applicationId: app.applicationId,
        title: app.title,
        portal: app.portal || "municipal",
        serviceType: app.serviceType,
        status: app.status,
        lat: 28.6139 + (Math.random() * 0.05 - 0.025),
        lng: 77.2090 + (Math.random() * 0.05 - 0.025),
        createdAt: app.createdAt
      };
    });

    const portalMarkers = [
      { id: "p-municipal", name: "Municipal Portal Gateway", portal: "municipal", lat: 28.6139, lng: 77.2090 },
      { id: "p-revenue", name: "Revenue Portal Gateway", portal: "revenue", lat: 28.6239, lng: 77.2190 },
      { id: "p-health", name: "Health Portal Gateway", portal: "health", lat: 28.6039, lng: 77.1990 }
    ];

    return res.json({
      success: true,
      count: points.length,
      points,
      departmentMarkers: portalMarkers,
      states: ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh"],
      departments: portalMarkers
    });
  } catch (err) {
    console.error("Heatmap query failed:", err);
    return res.status(500).json({ message: "Server error loading heatmap data" });
  }
});

// GET /api/admin/analytics/metrics - Aggregated metrics for GovConnect Platform
router.get("/metrics", async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const pendingCount = await Application.countDocuments({ status: "Submitted" });
    const inProgressCount = await Application.countDocuments({ status: "Under Review" });
    const completedCount = await Application.countDocuments({ status: "Approved" });
    const rejectedCount = await Application.countDocuments({ status: "Rejected" });

    const municipalApps = await Application.countDocuments({ portal: "municipal" });
    const revenueApps = await Application.countDocuments({ portal: "revenue" });
    const healthApps = await Application.countDocuments({ portal: "health" });

    return res.json({
      summary: {
        totalComplaints: totalApplications,
        pendingCount,
        inProgressCount,
        completedCount,
        rejectedCount,
        municipalApps,
        revenueApps,
        healthApps
      },
      categories: [
        { name: "Municipal Portal", count: municipalApps },
        { name: "Revenue Portal", count: revenueApps },
        { name: "Health Portal", count: healthApps }
      ]
    });
  } catch (err) {
    console.error("Analytics metrics query failed:", err);
    return res.status(500).json({ message: "Server error fetching metrics" });
  }
});

export default router;
