"use client";

import React from "react";
import MapboxMap from "@/components/MapboxMap";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">
        Fires & Person Map (Mapbox Satellite)
      </h1>
      {/* Here we pass custom dimensions */}
      <MapboxMap width="400px" height="400px" center={[-118.0, 33.5]} zoom={7} />
    </div>
  );
}
