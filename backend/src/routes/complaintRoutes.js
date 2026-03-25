const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  updateComplaintStatus,
  updateMyComplaint,
  deleteMyComplaint
} = require("../controllers/complaintController");
const { auth, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Only image files are allowed."));
  }
});

router.post("/", auth, upload.single("image"), createComplaint);
router.get("/my", auth, getMyComplaints);
router.get("/", auth, allowRoles("admin"), getAllComplaints);
router.patch("/:id/status", auth, allowRoles("admin"), updateComplaintStatus);
router.patch("/:id", auth, updateMyComplaint);
router.delete("/:id", auth, deleteMyComplaint);

module.exports = router;
