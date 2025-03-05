import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { fetchDrones } from "../api/api";
import { Card, CardContent, Typography, CircularProgress } from "@mui/material";

const DroneStateChart = ({ refreshInterval = 30000 }) => {
  const [stateData, setStateData] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadStateData = async () => {
      setLoading(true);
      setError(null);
      try {
        const drones = await fetchDrones();
        if (drones && Array.isArray(drones)) {
          const stateCounts = drones.reduce((acc, drone) => {
            acc[drone.state] = (acc[drone.state] || 0) + 1;
            return acc;
          }, {});

          const formattedData = Object.keys(stateCounts).map((state) => ({
            key: state,
            name: state,
            count: stateCounts[state],
          }));

          setStateData(formattedData);
        } else {
          setError("Invalid data from API");
        }
      } catch (err) {
        setError("Failed to load drone states.");
      } finally {
        setLoading(false);
      }
    };

    loadStateData(); // Initial fetch

    const intervalId = setInterval(loadStateData, refreshInterval);
    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [refreshInterval]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Drone States
        </Typography>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={stateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default DroneStateChart;