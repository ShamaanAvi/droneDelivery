const mongoose = require("mongoose");
const BatteryLog = require("../models/batteryLogModel");

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

module.exports.getBatteryLogs = async (event) => {
  try {
    await connectToDatabase();
    const { startTime, endTime } = event.queryStringParameters || {};

    if (!startTime || !endTime) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "startTime and endTime are required in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)" }),
      };
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start) || isNaN(end)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)" }),
      };
    }

    const logs = await BatteryLog.find({
      createdAt: { $gte: start, $lte: end },
    }).sort({ createdAt: -1 }).populate('drone', 'droneId model'); // Populate drone field

    return {
      statusCode: 200,
      body: JSON.stringify({ logs }),
    };
  } catch (error) {
    console.error("Error fetching battery logs:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};