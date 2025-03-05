const mongoose = require("mongoose");
const Drone = require("../models/droneModel");
const BatteryLog = require("../models/batteryLogModel");
const ErrorLog = require("../models/errorLogModel");

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

module.exports.simulateBatteryDrain = async () => {
    try {
        await connectToDatabase();
        const drainingDrones = await Drone.find({ state: { $in: ["DELIVERING", "RETURNING"] } });

        if (drainingDrones.length === 0) {
            return { statusCode: 200, body: JSON.stringify({ message: "No drones in motion" }) };
        }

        const updatedDrones = [];
        for (const drone of drainingDrones) {
            // Drain battery by a random percentage (e.g., 5-15%) to simulate real-world conditions
            const drainAmount = Math.floor(Math.random() * 11) + 5;
            let newBattery = Math.max(0, drone.batteryCapacity - drainAmount); // Ensure battery doesn't go below 0

            // Check for low battery and switch to RETURNING (25%)
            if (newBattery < 25 && drone.state === "DELIVERING") {
                console.log(`🚨 Drone ${drone.droneId} battery low! Switching to RETURNING.`);
                drone.state = "RETURNING";
                drone.isEmergencyReturn = true;

                // Log the error
                await ErrorLog.create({ drone: drone._id, errorType: "LOW_BATTERY" });

            }
            // Check for critical low battery and switch to FAILED (5%)
            else if (newBattery < 5 && (drone.state === "DELIVERING" || drone.state === "RETURNING")) {
                console.log(`🚨 Drone ${drone.droneId} FAILED! Battery below 5%.`);
                drone.state = "FAILED";
                drone.isEmergencyReturn = true;

                // Log the error
                await ErrorLog.create({ drone: drone._id, errorType: "FAILED" });
            }

            drone.batteryCapacity = newBattery;
            await drone.save();

            // Log the battery status
            const log = new BatteryLog({
                drone: drone._id, // Reference the Drone model
                batteryLevel: drone.batteryCapacity,
            });
            await log.save();

            updatedDrones.push({ droneId: drone.droneId, newBattery: drone.batteryCapacity });
        }

        return { statusCode: 200, body: JSON.stringify({ message: "Battery drain simulation complete", updatedDrones }) };
    } catch (error) {
        console.error("Error simulating battery drain:", error);
        return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
    }
};