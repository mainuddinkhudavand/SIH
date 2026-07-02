import Complaint from "../models/Complaint.js";

// Monthly + status breakdown
export const getMonthlyStats = async (req, res) => {
  try {
    const { year } = req.query;
    const match = {};

    // Optional year filter
    if (year) {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      match.createdAt = { $gte: start, $lte: end };
    }

    // Fetch complaints
    const complaints = await Complaint.find(match).sort({ createdAt: 1 });

    // --- Monthly counts ---
    const monthlyCounts = Array(12).fill(0);
    complaints.forEach((c) => {
      if (c.createdAt) {
        const monthIndex = new Date(c.createdAt).getMonth(); // 0 = Jan
        monthlyCounts[monthIndex]++;
      }
    });

    // --- Status breakdown ---
    const statusCounts = { Pending: 0, Accepted: 0, Rejected: 0, Completed: 0 };
    complaints.forEach((c) => {
      if (statusCounts[c.status] !== undefined) {
        statusCounts[c.status]++;
      }
    });

    res.json({ monthlyCounts, statusCounts });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};