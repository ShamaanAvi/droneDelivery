const mongoose = require("mongoose");
const Drone = require("../models/droneModel");
const BatteryLog = require("../models/batteryLogModel");
const PDFDocument = require("pdfkit");
const stream = require("stream");

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

module.exports.getDroneReport = async (event) => {
  try {
    await connectToDatabase();
    const { format, startDate, endDate } = event.queryStringParameters || {};

    const drones = await Drone.find({});

    let batteryLogQuery = {};
    if (startDate && endDate) {
      batteryLogQuery = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    let batteryLogs = await BatteryLog.aggregate([
      { $match: batteryLogQuery },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$drone", latestBattery: { $first: "$batteryLevel" } } },
    ]);

    const batteryMap = {};
    batteryLogs.forEach((log) => (batteryMap[log._id.toString()] = log.latestBattery));

    const reportData = drones.map((drone) => ({
      droneId: drone.droneId,
      model: drone.model,
      weightLimit: drone.weightLimit,
      batteryCapacity: batteryMap[drone._id.toString()] || "N/A",
      state: drone.state,
    }));

    if (!format || format === "json") {
      return {
        statusCode: 200,
        body: JSON.stringify({ report: reportData }),
      };
    }

    if (format === "pdf") {
      const pdfStream = new stream.PassThrough();
      const doc = new PDFDocument();
      doc.pipe(pdfStream);

      doc.fontSize(20).text("Drone Fleet Report", { align: "center" }).moveDown();
      reportData.forEach((drone) => {
        doc.fontSize(14).text(`Drone ID: ${drone.droneId}`).moveDown();
        doc.text(`Model: ${drone.model}`);
        doc.text(`Weight Limit: ${drone.weightLimit}g`);
        doc.text(`Battery Capacity: ${drone.batteryCapacity}%`);
        doc.text(`State: ${drone.state}`).moveDown();
      });

      doc.end();

      return new Promise((resolve) => {
        pdfStream.on("finish", () => {
          resolve({
            statusCode: 200,
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": "attachment; filename=drone_report.pdf",
            },
            body: pdfStream.read().toString("base64"),
            isBase64Encoded: true,
          });
        });
      });
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid format. Use 'json' or 'pdf'." }),
    };
  } catch (error) {
    console.error("Error generating drone report:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};