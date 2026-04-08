require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in environment variables.");
}

const app = express();
const PORT = process.env.PORT || 5000;

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start backend:", error.message);
    process.exit(1);
  }
};

start();
