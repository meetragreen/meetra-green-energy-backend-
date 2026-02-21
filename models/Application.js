const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    resumeUrl: {
      type: String, // later: Cloudinary / Firebase URL
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);
