import { Container } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import DroneRegistrationForm from "./components/DroneRegistrationForm.jsx";
import LoadMedicine from "./components/LoadMedicine.jsx"; // Import LoadMedicine component

function App() {
  return (
    <BrowserRouter>
      <Container>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/register-drone" element={<DroneRegistrationForm />} />
          <Route path="/load-medicine" element={<LoadMedicine />} /> {/* New route for LoadMedicine */}
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;