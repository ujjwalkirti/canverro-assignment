"use client";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Loader from "../components/Loader";
import styles from "./page.module.css";
import Image from "next/image";

type WeatherDataResponse = {
  location: string;
  temperature: number;
  conditions: string;
};

const weathers = {
  summer: {
    sunMoonURl: "/assets/sun.svg",
    backgroundColor: "#C7E3FF",
    birdImageURl: "/assets/birds.svg",
  },
  mildSummer: {
    sunMoonURl: "/assets/sun.svg",
    backgroundColor: "#FFDBC7",
  },
  nightTime: {
    sunMoonURl: "/assets/moon.svg",
    backgroundColor: "#472B97",
  },
  rainy: {
    sunMoonURl: "/assets/rainy-cloud.svg",
    backgroundColor: "#183655",
  },
  snowyCloud: {
    sunMoonURl: "/assets/snowy-cloud.svg",
    snowFlakeImageURl: "/assets/snowy-flake.svg",
    backgroundColor: "#637281",
  },
};

function isDay() {
  let date = new Date();
  let hours = date.getHours();

  if (hours >= 6 && hours < 18) {
    return true;
  }
  return false;
}

function Page() {
  const [weatherData, setWeatherData] = useState<WeatherDataResponse | null>(
    null
  );
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [weather, setWeather] = useState<any>(null);

  useEffect(() => {
    // Create WebSocket connection.
    const websocket = new WebSocket("ws://localhost:8999");

    // Connection opened
    websocket.addEventListener("open", (event) => {
      console.log("Connected to WebSocket server");

      // Get the current coordinates of the device
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // Send the coordinates to the server
            websocket.send(
              JSON.stringify({
                longitude: position.coords.longitude,
                latitude: position.coords.latitude,
              })
            );
          },
          (error) => {
            toast("Error obtaining geolocation, please check the permissions.");
          }
        );
      } else {
        toast("Geolocation is not supported by this browser");
      }
    });

    // Listen for messages
    websocket.addEventListener("message", (event) => {
      setWeatherData(JSON.parse(event.data));

      if (event.data.rain) {
        setWeather(weathers.rainy);
        return;
      }

      if (isDay()) {
        if (event.data.temperature >= 30) {
          setWeather(weathers.summer);
          return;
        }
        if (event.data.temperature >= 12) {
          setWeather(weathers.mildSummer);
          return;
        }
        setWeather(weathers.snowyCloud);
      }

      setWeather(weathers.nightTime);
    });

    setWs(websocket);

    // Connection closed
    websocket.addEventListener("close", (event) => {
      // console.log("Disconnected from WebSocket server");
      toast("Disconnected from WebSocket server");
    });

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return (
    <div className={styles.parent}>
      {weatherData ? (
        <section
          style={{
            backgroundColor: weather.backgroundColor,
          }}
          className="h-full"
        >
          <div className="h-1/2 w-full lg:w-2/3 lg:mx-auto flex flex-col md:flex-row items-center gap-4 text-white relative pt-10 px-1">
            <div className="relative w-1/3 h-2/5">
              <Image
                src={weather.sunMoonURl}
                fill
                alt="image of sun or moon based on weather conditions"
              />
            </div>
            <div className="w-2/3 text-md flex flex-col justify-center items-center">
              <div className="flex items-center gap-3">
                <p className="font-semibold text-4xl">
                  {weatherData.temperature} <sup>o</sup>C
                </p>
                <div>
                  <p>
                    H: {weatherData.main.temp_max} <sup>o</sup>C
                  </p>
                  <p>
                    L: {weatherData.main.temp_min} <sup>o</sup>C
                  </p>
                </div>
              </div>
              <div className=" mt-10 text-center">
                <p>{weatherData.location}</p>
              </div>
            </div>
          </div>
          <div className="h-1/2">
            <Image
              src={`/assets/clouds.svg`}
              alt="Several tall buildings standing next to each other"
              className="w-screen  h-1/2"
              width={300}
              height={400}
            />
            <Image
              src={`/assets/buildings.svg`}
              alt="Several tall buildings standing next to each other"
              className="w-screen h-1/2"
              width={300}
              height={400}
            />
          </div>
        </section>
      ) : (
        <div className={styles["loader-container"]}>
          <h2>Loading weather data...</h2>
          <p>Please wait while we fetch the weather data.</p>
          <p>If this takes too long, please refresh the page.</p>
          <Loader />
        </div>
      )}
    </div>
  );
}

export default Page;
