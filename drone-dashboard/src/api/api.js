import axios from "axios";

// API endpoint constants
const API_BASE_URL = "http://localhost:3000/dev"; // Or your actual base URL
const BATTERY_LOGS_ENDPOINT = `${API_BASE_URL}/batteryLogs`;
const DRONES_ENDPOINT = `${API_BASE_URL}/drones`;
const DRONE_REPORT_ENDPOINT = `${API_BASE_URL}/droneReport`;
const MEDICATIONS_ENDPOINT = `${API_BASE_URL}/medications`;
const ERROR_LOGS_ENDPOINT = `${API_BASE_URL}/errorLogs`;

let config = null;

/**
 * Loads and caches configuration from config.json.
 *
 * @returns {Promise<object>} A promise that resolves to the configuration object.
 */
async function loadConfig() {
  if (config) {
    return config;
  }

  try {
    const response = await fetch("/config.json");
    config = await response.json();
    return config;
  } catch (error) {
    console.error("Error loading config.json:", error);
    // Use a default config or throw an error
    return { API_BASE_URL }; // Fallback to default base URL
  }
}

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

/**
 * Fetches battery logs with an optional time range.
 *
 * @param {string} [startTime] - The start time for filtering logs (optional).
 * @param {string} [endTime] - The end time for filtering logs (optional).
 * @returns {Promise<Array>} A promise that resolves to an array of battery logs.
 * @throws {ApiError} If the API request fails.
 */
export const fetchBatteryLogs = async (startTime, endTime) => {
  try {
    const params = {};
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;

    const response = await axios.get(BATTERY_LOGS_ENDPOINT, { params });
    return response.data.logs;
  } catch (error) {
    // Centralized error handling
    throw new ApiError(
      "Failed to fetch battery logs.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};

/**
 * Fetches all drones.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of drones.
 * @throws {ApiError} If the API request fails.
 */
export const fetchDrones = async () => {
  try {
    const response = await axios.get(DRONES_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new ApiError(
      "Failed to fetch drones.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};

/**
 * Fetches a drone report in JSON or PDF format.
 *
 * @param {string} format - The desired format ('json' or 'pdf').
 * @param {string} [startDate] - The start date for filtering the report (optional).
 * @param {string} [endDate] - The end date for filtering the report (optional).
 * @returns {Promise<object|Blob>} A promise that resolves to the report data (JSON or PDF blob).
 * @throws {ApiError} If the API request fails.
 */
export const fetchDroneReport = async (format, startDate, endDate) => {
  try {
    const params = { format };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const response = await axios.get(DRONE_REPORT_ENDPOINT, {
      params,
      responseType: format === "pdf" ? "blob" : "json",
    });

    return response.data;
  } catch (error) {
    throw new ApiError(
      "Failed to fetch drone report.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};

/**
 * Updates the state of a drone.
 *
 * @param {string} droneId - The ID of the drone to update.
 * @param {string} state - The new state of the drone.
 * @returns {Promise<object>} A promise that resolves to the updated drone data.
 * @throws {ApiError} If the API request fails.
 */
export const updateDroneState = async (droneId, state) => {
  try {
    const response = await axios.put(
      `${DRONES_ENDPOINT}/${droneId}/state`,
      { state }
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      "Failed to update drone state.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};

/**
 * Registers a new drone.
 *
 * @param {object} droneData - The data for the new drone.
 * @returns {Promise<object>} A promise that resolves to the registered drone data.
 * @throws {ApiError} If the API request fails.
 */
export const registerDrone = async (droneData) => {
  try {
    const response = await axios.post(DRONES_ENDPOINT, droneData);
    return response.data;
  } catch (error) {
    throw new ApiError(
      "Failed to register drone.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};

/**
 * Adds a new medication.
 *
 * @param {object} medicationData - The data for the new medication.
 * @returns {Promise<object>} A promise that resolves to the added medication data.
 * @throws {ApiError} If the API request fails.
 */
export const addMedication = async (medicationData) => {
  try {
    const response = await axios.post(MEDICATIONS_ENDPOINT, medicationData);
    return response.data;
  } catch (error) {
    throw new ApiError(
      "Failed to add medication.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};

/**
 * Loads medications onto a drone.
 *
 * @param {string} droneId - The ID of the drone.
 * @param {Array<string>} medicationCodes - An array of medication codes to load.
 * @returns {Promise<object>} A promise that resolves to the response data.
 * @throws {ApiError} If the API request fails.
 */
export const loadMedications = async (droneId, medicationCodes) => {
  try {
    const response = await axios.post(
      `${DRONES_ENDPOINT}/${droneId}/medications`,
      { medicationCodes }
    );
    return response.data;
  } catch (error) {
    throw new ApiError(
      "Failed to load medications.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};

/**
 * Fetches error logs.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of error logs.
 * @throws {ApiError} If the API request fails.
 */
export const fetchErrorLogs = async () => {
  try {
    const response = await axios.get(ERROR_LOGS_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new ApiError(
      "Failed to fetch error logs.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};

/**
 * Fetches all medications.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of medications.
 * @throws {ApiError} If the API request fails.
 */
export const fetchMedications = async () => {
  try {
    const response = await axios.get(MEDICATIONS_ENDPOINT);
    return response.data;
  } catch (error) {
    throw new ApiError(
      "Failed to fetch medications.",
      error.response?.status || 500,
      error.response?.data
    );
  }
};