"use client";

import React from "react";
import MapboxMap from "@/components/MapboxMap";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-4">Fire Map Dashboard</h1>
      <MapboxMap width="100%" height="600px" />
    </div>
  );
}
