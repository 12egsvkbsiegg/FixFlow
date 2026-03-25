const Complaint = require("../models/Complaint");
const { sendComplaintMail } = require("../services/emailService");

const createComplaint = async (req, res) => {
  try {
    const { complaintText, state, city, address, pincode, category } = req.body;

    if (!complaintText) {
      return res.status(400).json({ message: "complaintText is required." });
    }

    if (!state || !city || !address || !pincode) {
      return res.status(400).json({ message: "Location details are required." });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const complaint = await Complaint.create({
      user: req.user._id,
      name: req.user.name,
      email: req.user.email,
      complaintText,
      category: category || "General",
      status: "Pending",
      imageUrl,
      location: {
        state,
        city,
        address,
        pincode
      }
    });

    await sendComplaintMail({
      to: req.user.email,
      subject: "Complaint submitted",
      text: `Your complaint has been registered with status Pending. Complaint ID: ${complaint._id}`
    });

    return res.status(201).json(complaint);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create complaint.",
      error: error.message
    });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id }).sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch complaints.",
      error: error.message
    });
  }
};

const getAllComplaints = async (_req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    return res.json(complaints);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch complaints.",
      error: error.message
    });
  }
};

const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ["Pending", "In Progress", "Resolved", "Rejected"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Status must be Pending, In Progress, Resolved, or Rejected." });
    }

    const complaint = await Complaint.findById(id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    complaint.status = status;
    complaint.resolvedAt = status === "Resolved" ? new Date() : null;
    await complaint.save();

    await sendComplaintMail({
      to: complaint.email,
      subject: `Complaint status updated to ${status}`,
      text: `Your complaint (${complaint._id}) status is now ${status}.`
    });

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update complaint status.",
      error: error.message
    });
  }
};

const updateMyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { complaintText } = req.body;

    if (!complaintText || !complaintText.trim()) {
      return res.status(400).json({ message: "complaintText is required." });
    }

    const complaint = await Complaint.findOne({ _id: id, user: req.user._id });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    complaint.complaintText = complaintText.trim();
    await complaint.save();

    return res.json(complaint);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to update complaint.",
      error: error.message
    });
  }
};

const deleteMyComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOneAndDelete({ _id: id, user: req.user._id });

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    return res.json({ message: "Complaint deleted." });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete complaint.",
      error: error.message
    });
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  updateMyComplaint,
  deleteMyComplaint
};
