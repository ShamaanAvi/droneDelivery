const mongoose = require("mongoose");
const Medication = require("../models/medicationModel");

// Reuse database connection
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && cachedDb.readyState === 1) {
    return cachedDb;
  }
  const db = await mongoose.connect(process.env.MONGO_URI);
  cachedDb = db.connection;
  return cachedDb;
}

module.exports.addMedication = async (event) => {
  try {
    await connectToDatabase();
    const { code, name, weight } = JSON.parse(event.body);

    if (!code || !name || weight === undefined) {
      return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields: code, name, weight" }) };
    }

    if (typeof code !== 'string' || typeof name !== 'string' || typeof weight !== 'number') {
        return { statusCode: 400, body: JSON.stringify({ message: "Invalid field types: code (string), name (string), weight (number)" }) };
    }

    const existingMedication = await Medication.findOne({ code });
    if (existingMedication) {
      return { statusCode: 400, body: JSON.stringify({ message: "Medication with this code already exists" }) };
    }

    const medication = new Medication({ code, name, weight });
    await medication.save();

    return { statusCode: 201, body: JSON.stringify({ message: "Medication added successfully", medication }) };
  } catch (error) {
    console.error("Error adding medication:", error);
    if (error.name === "ValidationError") {
      return { statusCode: 400, body: JSON.stringify({ message: error.message }) };
    }
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
  }
};