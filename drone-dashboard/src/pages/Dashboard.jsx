import React, { useState, useEffect } from "react";
import {
  Grid,
  Button,
  Typography,
  Container,
  Menu,
  MenuItem,
  TextField,
} from "@mui/material";
import BatteryChart from "../components/BatteryChart";
import DroneStateChart from "../components/DroneStateChart";
import Notifications from "../components/Notifications";
import { useNavigate } from "react-router-dom";
import { fetchDroneReport } from "../api/api";

const Dashboard = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const handleRegisterDrone = () => {
    navigate("/register-drone");
  };

  const handleLoadMedicine = () => {
    navigate("/load-medicine");
  };

  const handleReportMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleReportMenuClose = () => {
    setAnchorEl(null);
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await fetchDroneReport("pdf", startDate, endDate);
      const blob = new Blob([response], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "drone_report.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
    handleReportMenuClose();
  };

  const buttonStyle = {
    marginRight: "10px",
    marginLeft: "0px",
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      // This will re-render the component every 30 seconds
    }, 30000);

    return () => clearInterval(intervalId);
  },);

  return (
    <Container>
      <Typography variant="h4" align="center" sx={{ my: 4 }}>
        Drone Monitoring Dashboard
      </Typography>
      <Grid container spacing={3} style={{ height: "100vh", width: "100vw" }}>
        <Grid
          item
          xs={12}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Notifications />
          <div>
            <Button
              variant="contained"
              onClick={handleRegisterDrone}
              style={buttonStyle}
            >
              Register Drone
            </Button>
            <Button
              variant="contained"
              onClick={handleLoadMedicine}
              style={buttonStyle}
            >
              Load Medicine
            </Button>
            <Button
              variant="contained"
              onClick={handleReportMenuOpen}
              style={{ ...buttonStyle, marginLeft: "10px" }}
            >
              Generate Report
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleReportMenuClose}
            >
              <MenuItem>
                <TextField
                  type="date"
                  label="Start Date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </MenuItem>
              <MenuItem>
                <TextField
                  type="date"
                  label="End Date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </MenuItem>
              <MenuItem>
                <Button variant="contained" onClick={handleGeneratePDF}>
                  Generate PDF
                </Button>
              </MenuItem>
            </Menu>
          </div>
        </Grid>
        <Grid item xs={12} md={6} style={{ height: "50vh" }}>
          <BatteryChart />
        </Grid>
        <Grid item xs={12} md={6} style={{ height: "50vh" }}>
          <DroneStateChart />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;