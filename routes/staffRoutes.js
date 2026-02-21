const express = require("express");
const mongoose = require("mongoose");
// Make sure this path is correct for your ProjectData model
const ProjectData = require("../models/ProjectData"); 

const router = express.Router();

/* 🔥 TEST ROUTE (To check if it works) */
router.get("/test", (req, res) => {
  res.send("STAFF ROUTE WORKING");
});

/* ================= CREATE PROJECT ================= */
router.post("/create-project", async (req, res) => {
  try {
    const {
      clientRef,
      clientName,
      siteLocation,
      systemSize,
      createdBy,
    } = req.body;

    if (!clientRef || !clientName || !siteLocation || !systemSize || !createdBy) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const project = await ProjectData.create({
      clientRef,
      clientName,
      siteLocation,
      systemSize,
      createdBy,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ✅ FINAL FIX: Export using module.exports
module.exports = router;