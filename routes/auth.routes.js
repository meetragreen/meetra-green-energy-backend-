const express = require("express");
const router = express.Router();
const User = require("../models/User");

/* ================= LOGIN ================= */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let user;

    // 🔍 Check if identifier looks like email
    if (identifier.includes("@")) {
      user = await User.findOne({ email: identifier.toLowerCase() });
    } else {
      // Otherwise treat it as employeeId
      user = await User.findOne({ employeeId: identifier });
    }

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // ⚠️ Plain password check (upgrade to bcrypt later)
    if (user.password !== password) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // ✅ Send correct user object
    res.json({
      user: {
        _id: user._id,
        fullName: user.name,
        email: user.email,
        employeeId: user.employeeId || null,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

/* ================= SIGNUP ================= */
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: "user", // default role
    });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
      user: {
        _id: newUser._id,
        fullName: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

module.exports = router;
