const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Project = require("../models/Project"); 
const multer = require("multer");
const path = require("path");
const fs = require("fs");

/* ================= MULTER SETUP (FILE UPLOAD) ================= */
// 1. Ensure 'uploads' directory exists
const uploadDir = path.join(__dirname, "../../uploads"); 
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. Configure Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Save files in the 'uploads' folder at root
  },
  filename: function (req, file, cb) {
    // Generate unique filename: docType-Date-OriginalName
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

/* ================= 1. GET ALL PROJECTS ================= */
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

/* ================= 2. CREATE PROJECT ================= */
router.post("/", async (req, res) => {
  try {
    const { clientRef, clientName, siteLocation, systemSize, category, details, imgThumb, imgLarge, date, createdBy } = req.body;
    
    const newProject = new Project({
      clientRef, clientName, siteLocation, systemSize, category, details, imgThumb, imgLarge, date, createdBy
    });

    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ error: "Failed to create project" });
  }
});

/* ================= 3. UPDATE PROGRESS ================= */
router.patch("/staff/update-progress/:id", async (req, res) => {
  try {
    const { stage, value } = req.body;
    
    console.log(`Updating Project: ${req.params.id} | Stage: ${stage} | Value: ${value}`);

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { [`progressFlow.${stage}`]: value }, 
      { new: true, runValidators: true }
    );

    if (!updatedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(updatedProject);
  } catch (err) {
    console.error("Update Progress Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================= 4. GET PROJECT FOR CLIENT ================= */
router.get("/client/:id", async (req, res) => {
  try {
    const project = await Project.findOne({ clientRef: req.params.id });
    if (!project) return res.status(404).json({ message: "No project found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch client project" });
  }
});

/* ================= 5. DELETE PROJECT ================= */
router.delete("/:id", async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    
    if (!deletedProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

/* ================= 6. UPLOAD DOCUMENT ROUTE ================= */
router.post("/:id/upload", upload.single("file"), async (req, res) => {
  try {
    const projectId = req.params.id;
    const docType = req.body.docType; // e.g., 'quotation', 'agreement'
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Create file URL (e.g., /uploads/filename.pdf)
    const fileUrl = `/uploads/${file.filename}`;

    // Find Project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Update the specific document field
    if (!project.documents) project.documents = {}; 
    project.documents[docType] = fileUrl;

    await project.save();

    res.json(project); // Return updated project so frontend refreshes
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Server upload failed" });
  }
});

/* ================= 7. ✅ UPDATE WARRANTY DETAILS (NEW) ================= */
router.patch("/:id/warranty", async (req, res) => {
  try {
    const { panelWarranty, inverterName, inverterWarranty, startDate, endDate } = req.body;
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      {
        warrantyDetails: {
          panelWarranty,
          inverterName,
          inverterWarranty,
          startDate,
          endDate
        }
      },
      { new: true } // Return the updated document so UI updates immediately
    );

    if (!updatedProject) return res.status(404).json({ error: "Project not found" });

    res.json(updatedProject);
  } catch (err) {
    console.error("Warranty Update Error:", err);
    res.status(500).json({ error: "Failed to update warranty details" });
  }
});

module.exports = router;