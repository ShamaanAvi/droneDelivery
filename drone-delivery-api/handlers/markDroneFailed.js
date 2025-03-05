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

module.exports.markDroneFailed = async (event) => {
    try {
        await connectToDatabase();
        const { droneId } = event.pathParameters;

        const drone = await Drone.findOne({ droneId: droneId });

        if (!drone) {
            return { statusCode: 404, body: JSON.stringify({ message: "Drone not found" }) };
        }

        drone.state = "FAILED";
        await drone.save();

        return { statusCode: 200, body: JSON.stringify({ message: `Drone ${drone.droneId} marked as FAILED.`, drone }) };
    } catch (error) {
        console.error("Error marking drone as FAILED:", error);
        return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
    }
};