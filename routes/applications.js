const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  jobTitle: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  resumeUrl: { type: String, required: true },
  status: { type: String, default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Application", applicationSchema);
