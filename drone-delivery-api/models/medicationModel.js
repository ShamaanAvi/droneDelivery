const mongoose = require("mongoose");

const MedicationSchema = new mongoose.Schema({
  code: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9_-]+$/.test(v); // Ensure the name consists of letters, spaces, or hyphens
      },
      message: props => `${props.value} is not a valid medication code!`
    }
  },
  name: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[A-Za-z\s-]+$/.test(v); // Ensure the name consists of letters, spaces, or hyphens
      },
      message: props => `${props.value} is not a valid medication name!`
    }
  },
  weight: {
    type: Number,
    required: true,
    min: 0, // Ensure weight is non-negative
    validate: {
        validator: Number.isInteger,
        message: props => `${props.value} is not an integer weight!`
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Medication", MedicationSchema);