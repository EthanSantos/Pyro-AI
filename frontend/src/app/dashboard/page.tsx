"use client"

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MapboxMap from "@/components/MapboxMap";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Wind, Shield, Flame } from "lucide-react";
import { SidePanel } from "@/components/SidePanel";
import { WildfireProvider } from "@/context/WildfireContext";

// Define helper function for safety color
function getSafetyColor(score: number): string {
  if (score < 25) return "text-red-600";
  if (score < 50) return "text-orange-500";
  if (score < 75) return "text-yellow-500";
  return "text-green-600";
}

// --- API Interfaces and helper function for weather and AQI ---
interface WeatherResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    time: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    wind_speed_10m: number[];
    relative_humidity_2m: number[];
  };
}

interface AirQualityResponse {
  hourly: {
    time: string[];
    us_aqi: number[];
  };
}

async function getWeatherAndAQI(latitude: number, longitude: number) {
  // Weather data endpoint
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m&hourly=temperature_2m,wind_speed_10m,relative_humidity_2m`;

  // Air quality endpoint
  const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${latitude}&longitude=${longitude}&hourly=us_aqi`;

  try {
    const [weatherResponse, aqiResponse] = await Promise.all([
      fetch(weatherUrl),
      fetch(aqiUrl)
    ]);

    const weatherData: WeatherResponse = await weatherResponse.json();
    const aqiData: AirQualityResponse = await aqiResponse.json();

    return {
      weather: weatherData,
      airQuality: aqiData
    };
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export default function Dashboard() {
  // State variables for wildfire data
  const [riskValue, setRiskValue] = useState<string>("N/A");
  const [safetyScore, setSafetyScore] = useState<number | null>(null);
  const [userCoordinates, setUserCoordinates] = useState<[number, number] | null>(null);
  const [routeData, setRouteData] = useState<any>(null);

  // New state for AQI (Air Quality Index)
  const [aqi, setAqi] = useState<number | null>(null);

  // Sample fireData array used in the chat prompt.
  const fireData = [
    {
      Name: "Sepulveda Fire",
      Location: "405 Freeway, North Sepulveda Boulevard",
      County: "Los Angeles",
      AcresBurned: 45,
      Url: "https://www.fire.ca.gov/incidents/2025/1/23/sepulveda-fire/",
    },
    {
      Name: "Gilman Fire",
      Location: "Gilman Drive, South of La Jolla",
      County: "San Diego",
      AcresBurned: 2,
      Url: "https://www.fire.ca.gov/incidents/2025/1/23/gilman-fire/",
    },
    {
      Name: "Gibbel Fire",
      Location: "State Street and Gibbel Road, Hemet",
      County: "Riverside",
      AcresBurned: 15,
      Url: "https://www.fire.ca.gov/incidents/2025/1/23/gibbel-fire/",
    }
  ];

  // Update AQI whenever userCoordinates changes
  useEffect(() => {
    async function updateAQI() {
      if (userCoordinates) {
        try {
          const { airQuality } = await getWeatherAndAQI(userCoordinates[1], userCoordinates[0]);
          // We use the first hourly AQI value from the API response
          if (airQuality.hourly && airQuality.hourly.us_aqi.length > 0) {
            setAqi(airQuality.hourly.us_aqi[0]);
          }
        } catch (error) {
          console.error("Error updating AQI:", error);
        }
      }
    }
    updateAQI();
  }, [userCoordinates]);

  const aqiDisplay = aqi !== null ? aqi : "N/A";

  return (
    <WildfireProvider
      safetyScore={safetyScore}
      riskValue={riskValue}
      userCoordinates={userCoordinates}
      fireData={fireData}
      routeData={routeData}
      setSafetyScore={setSafetyScore}
      setRiskValue={setRiskValue}
      setUserCoordinates={setUserCoordinates}
      setRouteData={setRouteData}
    >
      <div className="flex flex-col h-screen bg-white text-gray-800">
        {/* Page Header */}
        <header className="flex-none p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold">WILDFIRE MONITORING DASHBOARD</h1>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0 bg-slate-100">
          {/* Left side: Map and Cards */}
          <div className="w-3/4 p-4 flex flex-col min-h-0">
            {/* Top Row: Three Cards */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              {/* Air Quality Index Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AIR QUALITY INDEX</CardTitle>
                  <Wind className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{aqiDisplay}</div>
                  <p className="text-xs text-muted-foreground">Current AQI</p>
                </CardContent>
              </Card>

              {/* Safety Score Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">SAFETY SCORE</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${safetyScore !== null ? getSafetyColor(safetyScore) : ""}`}>
                    {safetyScore !== null ? <AnimatedNumber value={safetyScore} duration={200} /> : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">Updated from map</p>
                </CardContent>
              </Card>

              {/* Risk Level Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">WILDFIRE RISK LEVEL</CardTitle>
                  <Flame className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{riskValue}</div>
                  <p className="text-xs text-muted-foreground">Updated from map</p>
                </CardContent>
              </Card>
            </div>

            {/* Map Section */}
            <div className="flex-1 min-h-0 bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
              <MapboxMap
                width="100%"
                height="100%"
                onRiskChange={setRiskValue}
                onSafetyScoreChange={setSafetyScore}
                onCoordinatesChange={setUserCoordinates}
              />
            </div>
          </div>

          {/* Right side: SidePanel */}
          <div className="w-1/4 p-4 min-h-0">
            <div className="h-full">
              <SidePanel />
            </div>
          </div>
        </div>
      </div>
    </WildfireProvider>
  );
}
