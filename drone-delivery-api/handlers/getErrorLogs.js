const mongoose = require("mongoose");
const ErrorLog = require("../models/errorLogModel");
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

module.exports.getErrorLogs = async (event) => {
    try {
        await connectToDatabase();
        const errorLogs = await ErrorLog.find().populate("drone", "droneId"); // Populate droneId from Drone model
        return {
            statusCode: 200,
            body: JSON.stringify(errorLogs),
        };
    } catch (error) {
        console.error("Error getting error logs:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};