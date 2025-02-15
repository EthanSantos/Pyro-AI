"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import MapboxMap from "@/components/MapboxMap";

export default function Dashboard() {
  return (
    <div className="bg-white text-gray-800 flex flex-col min-h-screen">
      {/* Page Header */}
      <header className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Wildfire Monitoring Dashboard</h1>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-4 flex-1">
        {/* Container for cards and map, left-aligned */}
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
                <p className="text-2xl font-bold text-red-600">157</p>
                <p className="text-xs text-gray-500 mt-1">Unhealthy</p>
              </CardContent>
            </Card>

            {/* Weather Card */}
            <Card className="shadow-sm border border-gray-200 rounded-md">
              <CardHeader className="p-4 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Weather
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-2xl font-bold">86°F</p>
                <p className="text-xs text-gray-500 mt-1">
                  Wind: 10 mph SE • Humidity: 45%
                </p>
              </CardContent>
            </Card>

            {/* Risk Level Card */}
            <Card className="shadow-sm border border-gray-200 rounded-md">
              <CardHeader className="p-4 border-b border-gray-100">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Risk Level
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-red-600">High</p>
                <p className="text-xs text-gray-500 mt-1">+2.5% from last week</p>
              </CardContent>
            </Card>
          </div>

          {/* Map Section */}
          <div className="bg-white border border-gray-200 shadow-sm rounded-md">
            <MapboxMap width="100%" height="600px" />
          </div>
        </div>
      </main>
    </div>
  );
}
