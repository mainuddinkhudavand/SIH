import Complaint from "../models/Complaint.js";

// Get monthly complaint counts (Jan–Dec)
export const getMonthlyComplaintCounts = async () => {
  try {
    const counts = Array(12).fill(0);
    const complaints = await Complaint.find(); // You can filter by year, ward, etc. if needed

    complaints.forEach(c => {
      const month = new Date(c.createdAt).getMonth(); // 0 = Jan
      counts[month]++;
    });

    return counts;
  } catch (err) {
    console.error("Error in getMonthlyComplaintCounts:", err);
    return Array(12).fill(0); // fallback
  }
};

// Get complaint counts by status
export const getStatusBreakdown = async () => {
  try {
    const statuses = ["Pending", "Accepted", "Rejected", "Completed"];
    const result = {};

    for (const status of statuses) {
      result[status] = await Complaint.countDocuments({ status });
    }

    return result;
  } catch (err) {
    console.error("Error in getStatusBreakdown:", err);
    return { Pending: 0, Accepted: 0, Rejected: 0, Completed: 0 }; // fallback
  }
};