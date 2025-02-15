"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MapboxMap from "@/components/MapboxMap";

// A simple animated number component that animates from the previous value to the new one.
interface AnimatedNumberProps {
  value: number;
  duration?: number; // duration in ms
  className?: string;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 300,
  className,
}) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const diff = value - displayValue;
    if (diff === 0) return;

    const steps = Math.floor(duration / 20);
    const stepIncrement = diff / steps;
    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      setDisplayValue((prev) => {
        const next = prev + stepIncrement;
        if (currentStep >= steps) {
          clearInterval(interval);
          return value;
        }
        return next;
      });
    }, 20);
    return () => clearInterval(interval);
  }, [value, duration, displayValue]);

  return <span className={className}>{Math.round(displayValue)}</span>;
};

// Function to pick a color based on safety score.
function getSafetyColor(score: number): string {
  if (score < 25) return "text-red-600";
  if (score < 50) return "text-orange-500";
  if (score < 75) return "text-yellow-500";
  return "text-green-600";
}

export default function Dashboard() {
  // State to hold the risk value coming from MapboxMap
  const [riskValue, setRiskValue] = useState<string>("N/A");
  // State to hold the safety score from MapboxMap
  const [safetyScore, setSafetyScore] = useState<number | null>(null);

  // For Air Quality Index we'll assume a fixed value for now.
  const aqi = 157; // Example value

  return (
    <div className="bg-white text-gray-800 flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Wildfire Monitoring Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="bg-slate-100 p-4 space-y-4 flex-1">
        <div className="w-[75%] space-y-4">
          {/* Top Row: Three Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Air Quality Index Card */}
            <Card className="shadow-sm border border-gray-200 rounded-md">
              <CardHeader className="p-4 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Air Quality Index
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-red-600">{aqi}</p>
                <p className="text-xs text-gray-500 mt-1">Unhealthy</p>
              </CardContent>
            </Card>

            {/* Safety Score Card */}
            <Card className="shadow-sm border border-gray-200 rounded-md">
              <CardHeader className="p-4 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Safety Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p
                  className={`text-2xl font-bold ${
                    safetyScore !== null ? getSafetyColor(safetyScore) : ""
                  }`}
                >
                  {safetyScore !== null ? (
                    <AnimatedNumber value={safetyScore} duration={200} />
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="text-xs text-gray-500 mt-1">(Updated from map)</p>
              </CardContent>
            </Card>

            {/* Risk Level Card */}
            <Card className="shadow-sm border border-gray-200 rounded-md">
              <CardHeader className="p-4 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Wildfire Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-red-600">{riskValue}</p>
                <p className="text-xs text-gray-500 mt-1">(Updated from map)</p>
              </CardContent>
            </Card>
          </div>

          {/* Map Section */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-md">
            <MapboxMap
              width="100%"
              height="600px"
              onRiskChange={setRiskValue}
              onSafetyScoreChange={setSafetyScore}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
