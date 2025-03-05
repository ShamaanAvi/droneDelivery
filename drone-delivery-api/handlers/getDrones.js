const mongoose = require("mongoose");
const Drone = require("../models/droneModel");

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

module.exports.getDrones = async (event) => {
  try {
    await connectToDatabase();
    const drones = await Drone.find({});
    return {
      statusCode: 200,
      body: JSON.stringify(drones),
    };
  } catch (error) {
    console.error("Error getting drones:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};