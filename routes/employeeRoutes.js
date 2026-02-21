const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/* ================= GET ALL EMPLOYEES ================= */
router.get("/", async (req, res) => {
  try {
    // ✅ FIX: Access the model INSIDE the function (Lazy Loading)
    // This prevents the "undefined" error because the model is defined in server.js
    const Employee = mongoose.models.Employee;

    if (!Employee) {
      return res.status(500).json({ error: "Employee model is not initialized yet" });
    }

    const employees = await Employee.find().sort({ joinedDate: -1 });
    res.json(employees);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

/* ================= DELETE EMPLOYEE ================= */
router.delete("/:id", async (req, res) => {
  try {
    const Employee = mongoose.models.Employee; // ✅ Access here
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;