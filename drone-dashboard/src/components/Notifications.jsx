import { useState, useEffect } from "react";
import { fetchErrorLogs } from "../api/api";
import { Alert, AlertTitle, Typography } from "@mui/material";

const Notifications = () => {
  const [errorLogs, setErrorLogs] = useState([]); // Initialize to empty array

  useEffect(() => {
    const loadErrorLogs = async () => {
      try {
        const logs = await fetchErrorLogs();
        setErrorLogs(logs);
      } catch (error) {
        console.error("Error fetching error logs:", error);
      }
    };

    loadErrorLogs();
    const intervalId = setInterval(loadErrorLogs, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {errorLogs?.length > 0 && ( // Use optional chaining to prevent errors
        <Alert severity="warning">
          <AlertTitle>Drone Error Logs</AlertTitle>
          {errorLogs
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map((log) => (
              <Typography key={log._id}>
                {new Date(log.timestamp).toLocaleString()} - Drone {log.drone.droneId} - {log.errorType}
              </Typography>
            ))}
        </Alert>
      )}
    </div>
  );
};

export default Notifications;