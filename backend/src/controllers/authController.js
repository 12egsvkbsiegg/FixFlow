const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signToken } = require("../services/tokenService");
const { sendOtpMail } = require("../services/emailService");

const isValidGmail = (email) => {
  return /^[A-Z0-9._%+-]+@gmail\.com$/i.test(email || "");
};

const OTP_EXPIRY_MINUTES = 3;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_RESEND_LIMIT = 3;
const OTP_RESEND_WINDOW_MINUTES = 10;

const generateOtp = () => {
  return String(Math.floor(1000 + Math.random() * 9000));
};

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "name, email and password are required." });
    }

    if (!isValidGmail(email)) {
      return res.status(400).json({ message: "Please use a valid Gmail address." });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = generateOtp();
    const now = new Date();
    const otpExpiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const otpResendResetAt = new Date(now.getTime() + OTP_RESEND_WINDOW_MINUTES * 60 * 1000);

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      if (existing.isVerified) {
        return res.status(409).json({ message: "Email is already registered." });
      }

      existing.name = name.trim();
      existing.email = normalizedEmail;
      existing.password = hashedPassword;
      existing.role = role === "admin" ? "admin" : "user";
      existing.otpCode = otpCode;
      existing.otpExpiresAt = otpExpiresAt;
      existing.otpLastSentAt = now;
      existing.otpResendCount = 0;
      existing.otpResendResetAt = otpResendResetAt;
      await existing.save();

      await sendOtpMail({ to: normalizedEmail, otpCode, expiryMinutes: OTP_EXPIRY_MINUTES });

      return res.json({
        message: "Account already exists but is not verified. A new OTP has been sent.",
        email: normalizedEmail
      });
    }

    await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role === "admin" ? "admin" : "user",
      isVerified: false,
      otpCode,
      otpExpiresAt,
      otpLastSentAt: now,
      otpResendCount: 0,
      otpResendResetAt
    });

    await sendOtpMail({ to: email, otpCode, expiryMinutes: OTP_EXPIRY_MINUTES });

    return res.status(201).json({
      message: "OTP sent to your email. Please verify to continue.",
      email: normalizedEmail
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to signup.",
      error: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required." });
    }

    if (!isValidGmail(email)) {
      return res.status(400).json({ message: "Please use a valid Gmail address." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Email not verified. Please verify with OTP.", needsVerification: true });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to login.",
      error: error.message
    });
  }
};

const getMe = async (req, res) => {
  return res.json({ user: req.user });
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "email and otp are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP not found. Please resend OTP." });
    }

    if (user.otpCode !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    if (user.otpExpiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "OTP expired. Please resend OTP." });
    }

    user.isVerified = true;
    user.otpCode = "";
    user.otpExpiresAt = null;
    user.otpLastSentAt = null;
    user.otpResendCount = 0;
    user.otpResendResetAt = null;
    await user.save();

    const token = signToken(user);

    return res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to verify OTP.",
      error: error.message
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "email is required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified." });
    }

    const now = new Date();

    if (user.otpLastSentAt) {
      const secondsSinceLast = (now.getTime() - user.otpLastSentAt.getTime()) / 1000;
      if (secondsSinceLast < OTP_RESEND_COOLDOWN_SECONDS) {
        const waitSeconds = Math.ceil(OTP_RESEND_COOLDOWN_SECONDS - secondsSinceLast);
        return res.status(429).json({ message: `Please wait ${waitSeconds}s before resending OTP.` });
      }
    }

    if (!user.otpResendResetAt || user.otpResendResetAt.getTime() < now.getTime()) {
      user.otpResendCount = 0;
      user.otpResendResetAt = new Date(now.getTime() + OTP_RESEND_WINDOW_MINUTES * 60 * 1000);
    }

    if (user.otpResendCount >= OTP_RESEND_LIMIT) {
      return res.status(429).json({ message: "OTP resend limit reached. Please try again later." });
    }

    const otpCode = generateOtp();
    const otpExpiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);

    user.otpCode = otpCode;
    user.otpExpiresAt = otpExpiresAt;
    user.otpLastSentAt = now;
    user.otpResendCount += 1;
    await user.save();

    await sendOtpMail({ to: user.email, otpCode, expiryMinutes: OTP_EXPIRY_MINUTES });

    return res.json({ message: "OTP resent to your email.", email: user.email });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to resend OTP.",
      error: error.message
    });
  }
};

module.exports = { signup, login, getMe, verifyOtp, resendOtp };
