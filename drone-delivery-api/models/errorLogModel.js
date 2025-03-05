const mongoose = require("mongoose");

const errorLogSchema = new mongoose.Schema({
  drone: { type: mongoose.Schema.Types.ObjectId, ref: "Drone", required: true },
  errorType: { type: String, enum: ["LOW_BATTERY", "FAILED"], required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("ErrorLog", errorLogSchema);