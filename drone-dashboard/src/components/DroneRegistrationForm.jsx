import { useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material"; // Import necessary components
import { useFormik } from "formik";
import * as Yup from "yup";
import { registerDrone } from "../api/api";

const DroneRegistrationForm = () => {
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      model: "",
      weightLimit: "",
    },
    validationSchema: Yup.object({
      model: Yup.string().required("Model is required"),
      weightLimit: Yup.number().required("Weight limit is required").positive("Weight limit must be positive"),
    }),
    onSubmit: async (values) => {
      try {
        const droneData = {
          ...values,
          batteryCapacity: 100,
        };
        await registerDrone(droneData);
        setRegistrationSuccess(true);
        formik.resetForm();
      } catch (error) {
        console.error("Error registering drone:", error);
      }
    },
  });

  return (
    <Container maxWidth="sm"> {/* Use Container for better layout */}
      <Box mt={4} mb={4}> {/* Add margin for spacing */}
        <Typography variant="h4" align="center" gutterBottom>
          Drone Registration
        </Typography>
        {registrationSuccess && (
          <Typography variant="body1" align="center" color="success.main" gutterBottom>
            Drone registered successfully!
          </Typography>
        )}
        <form onSubmit={formik.handleSubmit}>
          <Box mb={2}> {/* Add margin between fields */}
            <TextField
              fullWidth
              label="Model"
              name="model"
              value={formik.values.model}
              onChange={formik.handleChange}
              error={formik.touched.model && Boolean(formik.errors.model)}
              helperText={formik.touched.model && formik.errors.model}
            />
          </Box>
          <Box mb={2}>
            <TextField
              fullWidth
              label="Weight Limit"
              name="weightLimit"
              type="number"
              value={formik.values.weightLimit}
              onChange={formik.handleChange}
              error={formik.touched.weightLimit && Boolean(formik.errors.weightLimit)}
              helperText={formik.touched.weightLimit && formik.errors.weightLimit}
            />
          </Box>
          <Box mt={3} display="flex" justifyContent="center"> {/* Center the button */}
            <Button variant="contained" type="submit">
              Register
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default DroneRegistrationForm;