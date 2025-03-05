const Medication = require("./models/medicationModel");

module.exports.getMedications = async (event) => {
  try {
    const medications = await Medication.find(); // Fetch all medications from the database
    return {
      statusCode: 200,
      body: JSON.stringify(medications),
    };
  } catch (error) {
    console.error("Error fetching medications:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to fetch medications" }),
    };
  }
};