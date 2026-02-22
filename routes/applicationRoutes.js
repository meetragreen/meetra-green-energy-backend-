const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");

/* ================= Multer Setup ================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

/* ================= APPLICATION MODEL ================= */
const applicationSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String },
  status: { type: String, default: "pending" },
}, { timestamps: true });

const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

/* ================= SUBMIT APPLICATION WITH FILE ================= */
router.post("/apply", upload.single("resume"), async (req, res) => {
  try {
    const { jobTitle, name, email, phone } = req.body;

    if (!jobTitle || !name || !email || !phone || !req.file) {
      return res.status(400).json({ success: false, message: "All fields including resume are required" });
    }

    const resumeUrl = `/uploads/${req.file.filename}`; // Save relative path
    const newApp = new Application({ jobTitle, name, email, phone, resumeUrl });
    await newApp.save();

    res.status(201).json({ success: true, application: newApp });
  } catch (err) {
    console.error("Application Error:", err);
    res.status(500).json({ success: false, message: "Failed to submit application" });
  }
});

module.exports = router;
