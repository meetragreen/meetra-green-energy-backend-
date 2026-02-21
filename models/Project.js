const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  // Core Fields
  clientRef: { type: String, required: true },
  clientName: { type: String, required: true },
  siteLocation: { type: String, required: true },
  systemSize: { type: String, required: true },

  // Details
  category: { type: String, default: "Industrial" },
  details: { type: String },
  imgThumb: { type: String },
  imgLarge: { type: String },
  date: { type: Date },

  // Document Storage
  documents: {
    quotation: { type: String, default: "" },
    agreement: { type: String, default: "" },
    layout: { type: String, default: "" },
    netMeter: { type: String, default: "" },
    subsidy: { type: String, default: "" },
    commissioning: { type: String, default: "" }
  },

  // ✅ NEW: Warranty Details
  warrantyDetails: {
    panelWarranty: { type: String, default: "" }, // e.g., "25 Years Performance"
    inverterName: { type: String, default: "" },  // e.g., "SolarEdge SE10000"
    inverterWarranty: { type: String, default: "" }, // e.g., "12 Years"
    startDate: { type: String, default: "" }, // Date String or Date Object
    endDate: { type: String, default: "" }
  },

  // Progress Workflow
  progressFlow: {
    leadSurvey: { type: String, default: 'pending' },
    systemDesign: { type: String, default: 'pending' },
    approval: { type: String, default: 'pending' },
    procurement: { type: String, default: 'pending' },
    installation: { type: String, default: 'pending' },
    netMeter: { type: String, default: 'pending' },
    handover: { type: String, default: 'pending' },
  },
  
  createdBy: { type: String } 

}, { timestamps: true });

module.exports = mongoose.models.Project || mongoose.model("Project", projectSchema);