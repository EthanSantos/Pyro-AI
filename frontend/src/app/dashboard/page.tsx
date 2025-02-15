"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MapboxMap from "@/components/MapboxMap";

export default function Dashboard() {
  const [riskValue, setRiskValue] = useState<string>("N/A");
  const [safetyScore, setSafetyScore] = useState<number | null>(null);

  return (
    <div className="bg-white text-gray-800 flex flex-col min-h-screen">
      <header className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Wildfire Monitoring Dashboard</h1>
      </header>

      <main className="bg-slate-100 p-4 space-y-4 flex-1">
        <div className="w-[75%] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Air Quality Index Card */}
            <Card className="shadow-sm border border-gray-200 rounded-md">
              <CardHeader className="p-4 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Air Quality Index
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-red-600">157</p>
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
                <p className="text-2xl font-bold">
                  {safetyScore !== null ? safetyScore : "N/A"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  (Updated from map)
                </p>
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
