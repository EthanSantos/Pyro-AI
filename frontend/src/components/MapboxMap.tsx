"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

interface MapboxMapProps {
  width?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  width = "300px",
  height = "300px",
  center = [-74.5, 40],
  zoom = 9,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/satellite-v9",
        center,
        zoom,
      });

      // Clean up on unmount
      return () => map.remove();
    }
  }, [center, zoom]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width, height }}
      className="border rounded"
    />
  );
};

export default MapboxMap;
