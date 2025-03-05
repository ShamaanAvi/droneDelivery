import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { fetchDrones } from "../api/api";
import { Card, CardContent, Typography, CircularProgress, Alert } from "@mui/material";

const BatteryChart = ({ refreshInterval = 30000 }) => {
  const [batteryData, setBatteryData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lowBatteryDrones, setLowBatteryDrones] = useState();
  const [failedDrones, setFailedDrones] = useState();

  useEffect(() => {
    const loadBatteryData = async () => {
      setLoading(true);
      setError(null);
      try {
        const drones = await fetchDrones();
        if (drones && Array.isArray(drones)) {
          const formattedData = drones.map((drone) => ({
            key: drone._id,
            name: drone.droneId,
            battery: drone.batteryCapacity,
          }));
          setBatteryData(formattedData);

          setLowBatteryDrones(drones.filter((drone) => drone.batteryCapacity < 15));
          setFailedDrones(drones.filter((drone) => drone.state === "FAILED"));
        } else {
          setError("Invalid data from API");
        }
      } catch (err) {
        setError("Failed to load battery data.");
      } finally {
        setLoading(false);
      }
    };

    loadBatteryData(); // Initial fetch

    const intervalId = setInterval(loadBatteryData, refreshInterval);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [refreshInterval]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Drone Battery Levels
        </Typography>
        {/* Alert for low battery drones */}
        {lowBatteryDrones.length > 0 && (
          <Alert severity="warning">
            {lowBatteryDrones.map((drone) => (
              <Typography key={drone._id}>
                Warning: Drone {drone.droneId} battery low!
              </Typography>
            ))}
          </Alert>
        )}
        {/* Alert for failed drones */}
        {failedDrones.length > 0 && (
          <Alert severity="error">
            {failedDrones.map((drone) => (
              <Typography key={drone._id}>
                Error: Drone {drone.droneId} has failed!
              </Typography>
            ))}
          </Alert>
        )}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={batteryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="battery" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default BatteryChart;