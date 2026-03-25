const Complaint = require("../models/Complaint");

const getDashboardStats = async (_req, res) => {
  try {
    const [total, pending, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: "Resolved" })
    ]);

    return res.json({
      total,
      pending,
      resolved
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch dashboard stats.",
      error: error.message
    });
  }
};

module.exports = { getDashboardStats };
