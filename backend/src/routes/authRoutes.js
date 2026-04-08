const express = require("express");
const { signup, login, getMe, verifyOtp, resendOtp } = require("../controllers/authController");
const { auth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.get("/me", auth, getMe);

module.exports = router;
