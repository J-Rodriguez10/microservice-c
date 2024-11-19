// Import required modules
const express = require("express");
const axios = require("axios");
require("dotenv").config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Basic route
app.get("/", (req, res) => {
  res.send("Welcome to the NASA DONKI Microservice!");
});


const messageTypeDetails = {
  FLR: { fullName: "Solar Flare", description: "An intense burst of radiation from the sun." },
  SEP: { fullName: "Solar Energetic Particle", description: "High-energy particles emitted by the sun during solar events." },
  CME: { fullName: "Coronal Mass Ejection", description: "A large expulsion of plasma and magnetic field from the sun's corona." },
  IPS: { fullName: "Interplanetary Shock", description: "A shock wave caused by solar wind or coronal mass ejections." },
  MPC: { fullName: "Magnetopause Crossing", description: "A crossing of the Earth's magnetopause boundary." },
  GST: { fullName: "Geomagnetic Storm", description: "A disturbance in Earth's magnetosphere caused by solar wind." },
  RBE: { fullName: "Radiation Belt Enhancement", description: "Increased particle density in Earth's radiation belts." },
  HSS: { fullName: "High-Speed Stream", description: "A fast stream of solar wind originating from coronal holes." },
  report: { fullName: "Report", description: "General space weather report or analysis." },
  all: { fullName: "All Types", description: "Includes all types of space weather notifications." }
};

async function fetchDONKIData(type = "all") {
  const nasaApiUrl = "https://api.nasa.gov/DONKI/notifications"; // DONKI notifications endpoint
  const apiKey = process.env.NASA_API_KEY;

  // Get today's date in 'yyyy-MM-dd' format
  const today = new Date().toISOString().split('T')[0];

  try {
    // Fetch data from the NASA DONKI API with today's date as both start and end
    const response = await axios.get(nasaApiUrl, {
      params: {
        startDate: today,
        endDate: today,  // Both dates are today's date
        type: type,      // Use the passed type, defaulting to "all"
        api_key: apiKey  // Use your NASA API key
      }
    });

    const data = response.data;

    // Enrich the data with additional properties
    const enrichedData = data.map(notification => {
      const details = messageTypeDetails[notification.messageType] || {};
      return {
        ...notification,
        fullName: details.fullName || "Unknown Type",
        description: details.description || "No description available."
      };
    });

    return enrichedData;

  } catch (error) {
    console.error("Error fetching DONKI data:", error.message);
    throw new Error("Failed to retrieve DONKI data.");
  }
}

app.get("/donki-notifications", async (req, res) => {
  const { type } = req.query; // Extract the 'type' parameter from the query string

  console.log("FETCH REQUEST RECEIVED for DONKI notifications");

  try {
    // Call fetchDONKIData with the provided type, defaulting to "all" if not specified
    const notifications = await fetchDONKIData(type);

    // Enrich and respond with the data
    console.log("Returning DONKI notifications data:", notifications);
    res.json(notifications);

  } catch (error) {
    console.error("Error in /donki-notifications route:", error.message);
    res.status(500).json({ error: "Failed to retrieve DONKI notifications" });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log("Now waiting for a fetch request...");
});
