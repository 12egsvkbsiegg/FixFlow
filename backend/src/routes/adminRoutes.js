const express = require("express");
const { getDashboardStats } = require("../controllers/adminController");
const { auth, allowRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", auth, allowRoles("admin"), getDashboardStats);

module.exports = router;
