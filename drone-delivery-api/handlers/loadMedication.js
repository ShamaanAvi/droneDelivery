const mongoose = require("mongoose");
const Drone = require("../models/droneModel");
const Medication = require("../models/medicationModel");
const DroneMedicationLog = require("../models/droneMedicationLogModel");

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

module.exports.loadMedication = async (event) => {
  try {
    await connectToDatabase();
    const { droneId } = event.pathParameters;
    const { medicationCodes } = JSON.parse(event.body);

    if (!medicationCodes || !Array.isArray(medicationCodes) || medicationCodes.length === 0) {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid medication codes array" }) };
    }

    // Find the drone
    const drone = await Drone.findById(droneId);
    if (!drone) {
      return { statusCode: 404, body: JSON.stringify({ message: "Drone not found" }) };
    }

    // Fetch medication details using medication codes
    console.log("Medication find query:", { code: { $in: medicationCodes } });
    const medications = await Medication.find({ code: { $in: medicationCodes } });

    // if (medications.length !== medicationCodes.length) {
    //   return { statusCode: 404, body: JSON.stringify({ message: "Some medications not found" }) };
    // }

    // // Calculate total weight
    // if (totalWeight > drone.weightLimit) {
    //   return { statusCode: 400, body: JSON.stringify({ message: "Medications exceed drone weight limit" }) };
    // }

    if (drone.batteryCapacity < 25) {
      return { statusCode: 400, body: JSON.stringify({ message: "Drone battery too low to load medications" }) };
    }

    // Use a transaction for atomic operations
    const session = await mongoose.startSession();
    session.startTransaction();
    let log;

    try {
      // Update drone state to LOADING
      // Note: Since drone validation is removed, this might fail if droneId is invalid
      const drone = await Drone.findById(droneId);
      if (drone) {
        drone.state = "LOADING";
        await drone.save({ session });
      }

      // Log the loaded medications
      // Note: This might log medication IDs even if they don't exist
      log = new DroneMedicationLog({ drone: droneId, medicationCodes });
      await log.save({ session });

      await session.commitTransaction();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

    return { statusCode: 200, body: JSON.stringify({ message: "Medications loaded successfully", log }) };
  } catch (error) {
    console.error("Error loading medications:", error);
    if (error.name === "CastError" && error.kind === "ObjectId") {
      return { statusCode: 400, body: JSON.stringify({ message: "Invalid droneId or medicationCode" }) };
    }
    return { statusCode: 500, body: JSON.stringify({ message: "Internal server error" }) };
  }
};