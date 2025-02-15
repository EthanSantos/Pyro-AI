"use client";

import React from "react";
import MapboxMap from "@/components/MapboxMap";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">
        Wildfire Map
      </h1>
      {/* Using the MapboxMap component with custom width and height */}
      <MapboxMap width="750px" height="750px" center={[-74.5, 40]} zoom={9} />
    </div>
  );
}
