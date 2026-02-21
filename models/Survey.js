const mongoose = require("mongoose");

const SurveySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  location: { type: String, required: true },
  propertyType: { type: String, required: true },
  status: { type: String, default: "pending" }, // <-- NEW
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Survey", SurveySchema);
