const mongoose = require("mongoose");

const projectDataSchema = new mongoose.Schema({
  // Core Fields
  clientRef: { type: String, required: true },
  clientName: { type: String, required: true },
  siteLocation: { type: String, required: true },
  systemSize: { type: String, required: true },

  // ✅ NEW: Fields for Direct Cloud Links & Details
  category: { type: String, default: "Industrial" },
  details: { type: String }, // Description
  imgThumb: { type: String }, // Thumbnail Image Link
  imgLarge: { type: String }, // Large Image Link
  date: { type: Date },

}, { timestamps: true });

// Prevent "OverwriteModelError"
module.exports = mongoose.models.ProjectData || mongoose.model("ProjectData", projectDataSchema);