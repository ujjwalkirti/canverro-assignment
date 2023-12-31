// Import required modules
const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const axios = require("axios");
require("dotenv").config();
// Initialize an Express application
const app = express();

// Initialize a simple http server
const server = http.createServer(app);

// Initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });
// AIzaSyC-SFKr_xcpCDZL4nH07AHivjEXb-6qkSw

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;

// Function to get location name from latitude and longitude
async function getLocationName(lat, lng) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
    );
    if (response.data.results && response.data.results.length > 0) {
      // Extract the city name
      const cityName = response.data.results[0].address_components.find(
        (component) => component.types.includes("locality")
      ).long_name;
      console.log("City name: ", cityName);
      return cityName;
    } else {
      throw new Error("No results found");
    }
  } catch (error) {
    console.error("Error getting city name: ", error);
    return null;
  }
}

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.on("message", async (message) => {
    const coordinates = JSON.parse(message);
    const locationName = await getLocationName(
      coordinates.latitude,
      coordinates.longitude
    );

    // Call the weather API every 30 seconds
    setInterval(() => {
      axios
        .get(
          `http://api.openweathermap.org/data/2.5/weather?q=${locationName}&appid=${OPEN_WEATHER_API_KEY}&units=metric`
        )
        .then((response) => {
          // Format the weather data
          const weatherData = {
            location: locationName,
            temperature: response.data.main.temp,
            conditions: response.data.weather[0].description,
            ...response.data,
          };

          // Send the formatted weather data to the client
          ws.send(JSON.stringify(weatherData));
        })
        .catch((error) => {
          console.log(error);
        });
      console.log("request resent.");
    }, 30 * 1000);
  });

  ws.on("close", () => console.log("Client disconnected"));
});

// Start the server
server.listen(process.env.PORT || 8999, () => {
  console.log(`Server started on port ${server.address().port}`);
});
