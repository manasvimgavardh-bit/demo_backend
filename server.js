const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const API_KEY = process.env.DEVICE_API_KEY;

// Temporary memory storage: no MongoDB required
let latestReading = null;

// Test backend
app.get("/", (req, res) => {
  res.send("Temperature Monitoring Backend is Running");
});

// ESP32 sends temperature here
app.post("/api/temperature", (req, res) => {
  const receivedKey = req.headers["x-api-key"];

  if (!API_KEY || receivedKey !== API_KEY) {
    return res.status(401).json({
      success: false,
      message: "Invalid API key"
    });
  }

  const { device, temperature } = req.body;

  if (
    typeof temperature !== "number" ||
    !Number.isFinite(temperature)
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid temperature"
    });
  }

  latestReading = {
    device: device || "ESP32_001",
    temperature: temperature,
    unit: "°C",
    timestamp: new Date().toISOString()
  };

  console.log("New temperature:", latestReading);

  res.status(201).json({
    success: true,
    message: "Temperature received",
    data: latestReading
  });
});

// React dashboard gets the latest reading
app.get("/api/temperature", (req, res) => {
  res.json({
    success: true,
    data: latestReading
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});