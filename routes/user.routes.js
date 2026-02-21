const express = require("express");
const router = express.Router();

/* GET ALL USERS */
router.get("/", (req, res) => {
  res.json({
    success: true,
    users: [],
  });
});

/* GET USER BY ID */
router.get("/:id", (req, res) => {
  res.json({
    success: true,
    userId: req.params.id,
  });
});

module.exports = router;
