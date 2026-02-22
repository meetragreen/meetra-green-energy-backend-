const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

/* ================= GET ALL EMPLOYEES ================= */
router.get("/", async (req, res) => {
  try {
    const Employee = mongoose.models.Employee;

    if (!Employee) {
      return res.status(500).json({ error: "Employee model not found" });
    }

    const employees = await Employee.find()
      .select("-password")
      .sort({ joinedDate: -1 });

    res.json(employees);
  } catch (err) {
    console.error("GET Employees Error:", err);
    res.status(500).json({ error: "Failed to fetch employees" });
  }
});

/* ================= ADD EMPLOYEE ================= */
router.post("/", async (req, res) => {
  try {
    const Employee = mongoose.models.Employee;
    const bcrypt = require("bcryptjs");

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
      employee: {
        _id: newEmployee._id,
        employeeId: newEmployee.employeeId,
        name: newEmployee.name,
        email: newEmployee.email,
        role: newEmployee.role,
      },
    });
  } catch (err) {
    console.error("POST Employee Error:", err);
    res.status(500).json({ error: "Failed to add employee" });
  }
});

/* ================= DELETE EMPLOYEE ================= */
router.delete("/:id", async (req, res) => {
  try {
    const Employee = mongoose.models.Employee;

    const deleted = await Employee.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.json({ message: "Employee removed successfully" });
  } catch (err) {
    console.error("DELETE Employee Error:", err);
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;
