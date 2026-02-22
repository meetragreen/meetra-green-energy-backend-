const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/* ================= ADD EMPLOYEE ================= */
router.post("/", async (req, res) => {
  try {
    const Employee = mongoose.models.Employee;

    if (!Employee) {
      return res.status(500).json({ error: "Employee model not initialized" });
    }

    const { employeeId, name, email, password, role } = req.body;

    if (!employeeId || !name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existing = await Employee.findOne({
      $or: [{ email }, { employeeId }],
    });

    if (existing) {
      return res.status(400).json({ error: "Employee already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newEmployee = await Employee.create({
      employeeId,
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      message: "Employee added successfully",
      employee: newEmployee,
    });

  } catch (err) {
    console.error("Add Employee Error:", err);
    res.status(500).json({ error: "Server error while adding employee" });
  }
});

/* ================= GET ALL EMPLOYEES ================= */
router.get("/", async (req, res) => {
  try {
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
    const Employee = mongoose.models.Employee;
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee removed successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
