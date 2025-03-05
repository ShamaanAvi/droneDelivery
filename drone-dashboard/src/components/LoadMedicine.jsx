import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Box,
  FormHelperText,
} from "@mui/material";
import { fetchDrones, loadMedications } from "../api/api";

const LoadMedicine = () => {
  const [drones, setDrones] = useState();
  const [selectedDrone, setSelectedDrone] = useState("");
  const [medicationCodes, setMedicationCodes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const dronesData = await fetchDrones();
        setDrones(dronesData);
      } catch (err) {
        setError("Failed to load drones.");
        console.error("Error fetching drones:", err);
      }
    };
    fetchData();
  },);

  const handleDroneChange = (event) => {
    setSelectedDrone(event.target.value);
  };

  const handleMedicationCodesChange = (event) => {
    setMedicationCodes(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const codesArray = medicationCodes.split(",").map((code) => code.trim());

    console.log("Selected Drone:", selectedDrone);
    console.log("Medication Codes:", codesArray);

    try {
      await loadMedications(selectedDrone, codesArray);
      setSuccess("Medications loaded successfully!");
      setMedicationCodes("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load medications.");
      console.error("Error loading medications:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4} mb={4}>
        <Typography variant="h4" align="center" gutterBottom>
          Load Medicine to Drone
        </Typography>

        {error && (
          <Typography variant="body2" color="error" align="center">
            {error}
          </Typography>
        )}

        {success && (
          <Typography variant="body2" color="success" align="center">
            {success}
          </Typography>
        )}

        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel id="drone-select-label">Select Drone</InputLabel>
            <Select
              labelId="drone-select-label"
              id="drone-select"
              value={selectedDrone}
              onChange={handleDroneChange}
              error={!!error}
            >
              {drones && drones.length > 0 ? ( // Check if drones is not undefined and has items
                drones.map((drone) => (
                  <MenuItem key={drone.droneId} value={drone.droneId}>
                    {drone.droneId}
                  </MenuItem>
                ))
              ) : (
                <MenuItem disabled>Loading drones...</MenuItem> // Display a loading message
              )}
            </Select>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </FormControl>

          <FormControl fullWidth margin="normal">
            <TextField
              label="Medication Codes (comma-separated)"
              value={medicationCodes}
              onChange={handleMedicationCodesChange}
              multiline
              rows={4}
            />
          </FormControl>

          <Box mt={3} display="flex" justifyContent="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
            >
              {loading ? "Loading..." : "Load Medications"}
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default LoadMedicine;