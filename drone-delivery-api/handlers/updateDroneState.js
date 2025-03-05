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

module.exports.updateDroneState = async (event) => {
    try {
        await connectToDatabase();
        const { droneId } = event.pathParameters;
        const { state } = JSON.parse(event.body);

        if (!state) {
            return { statusCode: 400, body: JSON.stringify({ message: "State is required" }) };
        }

        const validStates = ["IDLE", "LOADING", "DELIVERING", "DELIVERED", "RETURNING"];
        if (!validStates.includes(state)) {
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid state" }) };
        }

        const drone = await Drone.findById(droneId);
        if (!drone) {
            return { statusCode: 404, body: JSON.stringify({ message: "Drone not found" }) };
        }

        // Business rule: Prevent LOADING state if battery level < 25% or drone is FAILED
        if ((state === "LOADING" && drone.batteryCapacity < 25) || drone.state === "FAILED") {
            return { statusCode: 400, body: JSON.stringify({ message: "Drone cannot be loaded." }) };
        }

        // Additional rule: If battery < 25 and current state is DELIVERING, force RETURNING
        if (drone.batteryCapacity < 25 && drone.state === "DELIVERING") {
            drone.state = "RETURNING";
            drone.isEmergencyReturn = true;
            await drone.save();
            return { statusCode: 200, body: JSON.stringify({ message: "Drone forced to RETURNING due to low battery", drone }) };
        }

        // Additional rule: If battery is 0, force FAILED state
        if (drone.batteryCapacity === 0) {
          drone.state = "FAILED";
          await drone.save();
          return { statusCode: 200, body: JSON.stringify({ message: "Drone forced to FAILED due to 0% battery", drone }) };
        }

        drone.state = state;
        await drone.save();

        return { statusCode: 200, body: JSON.stringify({ message: "Drone state updated", drone }) };
      } catch (error) {
        console.error("Error updating drone state:", error);
        if (error.name === "CastError" && error.kind === "ObjectId") {
            return { statusCode: 400, body: JSON.stringify({ message: "Invalid droneId" }) };
        }
        return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
    }
};