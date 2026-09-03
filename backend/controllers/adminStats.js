import Application from "../models/Application.js";

// Monthly + status breakdown
export const getMonthlyStats = async (req, res) => {
  try {
    const { year } = req.query;
    const match = {};

    if (year) {
      const start = new Date(`${year}-01-01T00:00:00.000Z`);
      const end = new Date(`${year}-12-31T23:59:59.999Z`);
      match.createdAt = { $gte: start, $lte: end };
    }

    const apps = await Application.find(match).sort({ createdAt: 1 });

    const monthlyCounts = Array(12).fill(0);
    apps.forEach((a) => {
      if (a.createdAt) {
        const monthIndex = new Date(a.createdAt).getMonth();
        monthlyCounts[monthIndex]++;
      }
    });

    const statusCounts = { Submitted: 0, "Under Review": 0, Approved: 0, Rejected: 0 };
    apps.forEach((a) => {
      if (statusCounts[a.status] !== undefined) {
        statusCounts[a.status]++;
      }
    });

    res.json({ monthlyCounts, statusCounts });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};