const express = require("express");
const router = express.Router();

/* LOGIN */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  res.json({
    success: true,
    message: "Login successful",
    email,
  });
});

/* SIGNUP */
router.post("/signup", (req, res) => {
  const { name, email, password } = req.body;

  res.json({
    success: true,
    message: "Signup successful",
    name,
    email,
  });
});

module.exports = router;
