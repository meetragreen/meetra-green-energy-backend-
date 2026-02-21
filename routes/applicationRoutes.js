const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/* ================= APPLICATION MODEL ================= */
const applicationSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String },
  status: { type: String, default: "pending" }, // pending / reviewed
}, { timestamps: true });

const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema);

/* ================= 1. GET ALL APPLICATIONS ================= */
router.get("/", async (req, res) => {
  try {
    const apps = await Application.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch applications" });
  }
});

/* ================= 2. UPDATE STATUS (Fixes Buttons) ================= */
// URL: PATCH http://localhost:5000/api/applications/:id
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    
    // Validate Status
    if (!["pending", "reviewed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status update" });
    }

    const updatedApp = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true } // Return the updated document
    );

    if (!updatedApp) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(updatedApp);
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

/* ================= 3. SUBMIT APPLICATION ================= */
router.post("/apply", async (req, res) => {
  try {
    const { jobTitle, name, email, phone, resumeUrl } = req.body;
    const newApp = new Application({ jobTitle, name, email, phone, resumeUrl });
    await newApp.save();
    res.status(201).json({ success: true, application: newApp });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to submit" });
  }
});

module.exports = router;