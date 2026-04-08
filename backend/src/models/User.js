const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    otpCode: {
      type: String,
      default: ""
    },
    otpExpiresAt: {
      type: Date,
      default: null
    },
    otpLastSentAt: {
      type: Date,
      default: null
    },
    otpResendCount: {
      type: Number,
      default: 0
    },
    otpResendResetAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
