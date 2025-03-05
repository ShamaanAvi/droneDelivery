const mongoose = require("mongoose");
const Medication = require("./medicationModel");
const Drone = require("./droneModel");

const DroneMedicationLogSchema = new mongoose.Schema({
  drone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Drone',
    required: true,
    validate: {
      validator: async function(value) {
        return await Drone.findById(value);
      },
      message: props => `Drone with id ${props.value} does not exist!`
    }
  },
  medicationCodes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medication',
    required: true,
    validate: {
      validator: async function(value) {
        return await Medication.findById(value);
      },
      message: props => `Medication with id ${props.value} does not exist!`
    }
  }],
  timestamp: { type: Date, default: Date.now },
  droneState: { type: String, enum: ["LOADING", "LOADED", "DELIVERING"] }
}, {
  timestamps: true
});

module.exports = mongoose.model("DroneMedicationLog", DroneMedicationLogSchema);