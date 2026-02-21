const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/* ================= SURVEY MODEL ================= */
const surveySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  location: { type: String },
  propertyType: { type: String },
  status: { type: String, default: "pending" }, // pending / completed
}, { timestamps: true });

const Survey = mongoose.models.Survey || mongoose.model("Survey", surveySchema);

/* ================= 1. GET ALL INQUIRIES ================= */
// URL: GET http://localhost:5000/api/survey
router.get("/survey", async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    res.json(surveys);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch surveys" });
  }
});

/* ================= 2. UPDATE STATUS (Fixes Buttons) ================= */
// URL: PATCH http://localhost:5000/api/survey/:id
router.patch("/survey/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedSurvey = await Survey.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedSurvey) {
      return res.status(404).json({ error: "Survey not found" });
    }

    res.json(updatedSurvey);
  } catch (err) {
    console.error("Survey Update Error:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

/* ================= 3. SUBMIT SURVEY ================= */
router.post("/survey", async (req, res) => {
  try {
    const { name, phone, email, location, propertyType } = req.body;
    const newSurvey = new Survey({ name, phone, email, location, propertyType });
    await newSurvey.save();
    res.status(201).json({ message: "Survey submitted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to submit survey" });
  }
});

module.exports = router;