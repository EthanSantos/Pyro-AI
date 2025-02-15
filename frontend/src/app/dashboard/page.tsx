"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MapboxMap from "@/components/MapboxMap";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { Wind, Shield, Flame } from 'lucide-react';

// Function to pick a color based on safety score.
function getSafetyColor(score: number): string {
  if (score < 25) return "text-red-600";
  if (score < 50) return "text-orange-500";
  if (score < 75) return "text-yellow-500";
  return "text-green-600";
}

export default function Dashboard() {
  const [riskValue, setRiskValue] = useState<string>("N/A");
  const [safetyScore, setSafetyScore] = useState<number | null>(null);

  const aqi = 157;

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
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
                <Wind className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{aqi}</div>
                <p className="text-xs text-muted-foreground">Unhealthy</p>
              </CardContent>
            </Card>

            {/* Safety Score Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${safetyScore !== null ? getSafetyColor(safetyScore) : ""}`}>
                  {safetyScore !== null ? (
                    <AnimatedNumber value={safetyScore} duration={200} />
                  ) : (
                    "N/A"
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Updated from map</p>
              </CardContent>
            </Card>

            {/* Risk Level Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wildfire Risk Level</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{riskValue}</div>
                <p className="text-xs text-muted-foreground">Updated from map</p>
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
