const mongoose = require("mongoose");

const DroneSchema = new mongoose.Schema({
    droneId: {
        type: String,
        unique: true,
        required: [true, "Drone ID is required"],
        trim: true,
    },
    model: {
        type: String,
        required: [true, "Model is required"],
        trim: true,
    },
    weightLimit: {
        type: Number,
        required: [true, "Weight limit is required"],
        min: [0, "Weight limit must be a positive number"],
    },
    batteryCapacity: {
        type: Number,
        required: [true, "Battery capacity is required"],
        min: [0, "Battery capacity must be a positive number"],
        max: [100, "Battery capacity cannot exceed 100"],
    },
    state: {
        type: String,
        enum: {
            values: ["IDLE", "LOADING", "DELIVERING", "DELIVERED", "RETURNING", "FAILED"],
            message: "{VALUE} is not a valid drone state",
        },
        default: "IDLE",
    },
}, { timestamps: true });

async function generateDroneId() {
    const latestDrone = await mongoose.model("Drone").findOne().sort({ droneId: -1 });
    const lastId = latestDrone ? parseInt(latestDrone.droneId.substring(1)) : 0;
    const nextId = (lastId + 1).toString().padStart(3, '0');
    return `D${nextId}`;
}

// Error handling middleware
DroneSchema.post("save", function (error, doc, next) {
    if (error.name === "MongoServerError" && error.code === 11000) {
        next(new Error("Drone ID already exists"));
    } else {
        next(error);
    }
});

// Error handling middleware for update operations
DroneSchema.post("findOneAndUpdate", function (error, doc, next) {
    if (error && error.name === "ValidationError") {
        next(new Error(error.message));
    } else {
        next(error);
    }
});

module.exports = mongoose.model("Drone", DroneSchema);
module.exports.generateDroneId = generateDroneId;