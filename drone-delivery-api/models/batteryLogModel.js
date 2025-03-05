const mongoose = require("mongoose");
const Drone = require("./droneModel");

const batteryLogSchema = new mongoose.Schema({
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
  batteryLevel: { type: Number, required: true },
}, {
  timestamps: true // Add createdAt and updatedAt timestamps
});

module.exports = mongoose.model("BatteryLog", batteryLogSchema);