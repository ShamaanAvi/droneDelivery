const mongoose = require("mongoose");
const Drone = require("../models/droneModel");

let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb && cachedDb.readyState === 1) {
        return cachedDb;
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI environment variable is not defined");
    }

    console.log("MONGO_URI from config.json:", process.env.MONGO_URI);

    const db = await mongoose.connect(process.env.MONGO_URI);

    cachedDb = db.connection;
    return cachedDb;
}

module.exports.registerDrone = async (event) => {
    try {
        await connectToDatabase();
        const { model, weightLimit, batteryCapacity } = JSON.parse(event.body);

        if (!model || !weightLimit || !batteryCapacity) {
            return { statusCode: 400, body: JSON.stringify({ message: "Missing required fields" }) };
        }

        // Generate the droneId
        const droneId = await Drone.generateDroneId();

        const newDrone = new Drone({ droneId, model, weightLimit, batteryCapacity });

        await newDrone.save();

        return { statusCode: 201, body: JSON.stringify(newDrone) };
    } catch (error) {
        if (error.name === "ValidationError") {
            return { statusCode: 422, body: JSON.stringify({ message: error.message }) };
        } else if (error.message === "Drone ID already exists") {
            return { statusCode: 422, body: JSON.stringify({ message: error.message }) };
        } else {
            console.error("Error registering drone:", error);
            return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
        }
    }
};