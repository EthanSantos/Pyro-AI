"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";

// Set your Mapbox API key (ensure it's in your .env.local file)
mapboxgl.accessToken =
  process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || "YOUR_FALLBACK_API_TOKEN";

// Full fire data (GeoJSON) with important properties
const fireData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.47541, 34.0968] },
      properties: {
        Name: "Sepulveda Fire",
        Location:
          "Near 405 Freeway in the area of North Sepulveda Boulevard and Getty Center Drive",
        County: "Los Angeles",
        AcresBurned: 45,
        Url: "https://www.fire.ca.gov/incidents/2025/1/23/sepulveda-fire/",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-117.237, 32.8622] },
      properties: {
        Name: "Gilman Fire",
        Location: "Gilman Drive and Via Alicante, South of La Jolla",
        County: "San Diego",
        AcresBurned: 2,
        Url: "https://www.fire.ca.gov/incidents/2025/1/23/gilman-fire/",
      },
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-116.964339, 33.708601] },
      properties: {
        Name: "Gibbel Fire",
        Location: "State Street and Gibbel Road, Hemet",
        County: "Riverside",
        AcresBurned: 15,
        Url: "https://www.fire.ca.gov/incidents/2025/1/23/gibbel-fire/",
      },
    },
  ],
};

// Generate geodesic circle polygons using Turf.js (2 km radius)
function buildCirclePolygons(features: any, radiusKm: number) {
  const circles = features.map((feature: any) => {
    const coords = feature.geometry.coordinates; // [lng, lat]
    const circle = turf.circle(coords, radiusKm, {
      steps: 64,
      units: "kilometers",
    });
    circle.properties = { ...feature.properties, radiusKm };
    return circle;
  });
  return { type: "FeatureCollection", features: circles };
}

// Create polygon circles with a fixed 2 km radius for each fire.
const fireCirclesData = buildCirclePolygons(fireData.features, 2);

// Define our person's location as a GeoJSON point near the Gilman Fire.
const personData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-117.227, 32.8722] },
      properties: { Name: "My Person" },
    },
  ],
};

interface MapboxMapProps {
  width?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  width = "100%",
  height = "600px",
  // Start centered near the Gilman Fire (San Diego)
  center = [-117.237, 32.8622],
  zoom = 14,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize the map with a satellite style
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center,
      zoom,
    });

    map.on("load", () => {
      // 1. Add a GeoJSON source for the fire data
      map.addSource("fires", { type: "geojson", data: fireData });

      // 2. Add markers for each fire with detailed popups
      fireData.features.forEach((feature) => {
        const { coordinates } = feature.geometry;
        const { Name, Location, County, AcresBurned, Url } = feature.properties;
        const popupContent = `
          <h3>${Name}</h3>
          <p><strong>Location:</strong> ${Location}</p>
          <p><strong>County:</strong> ${County}</p>
          <p><strong>Acres Burned:</strong> ${AcresBurned}</p>
          <p><a href="${Url}" target="_blank">More Info</a></p>
        `;
        new mapboxgl.Marker({ color: "red" })
          .setLngLat(coordinates as [number, number])
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map);
      });

      // 3. Add a source for the fire circles (geodesic polygons)
      map.addSource("fire-circles", { type: "geojson", data: fireCirclesData });

      // 4. Add a fill layer to display the circle polygons (representing a 2 km radius)
      map.addLayer({
        id: "fire-circles-fill",
        type: "fill",
        source: "fire-circles",
        paint: {
          "fill-color": "rgba(255, 0, 0, 0.2)",
          "fill-outline-color": "red",
        },
      });

      // 5. Add a source for our person's location
      map.addSource("person", { type: "geojson", data: personData });

      // 6. Create a custom person marker styled like Apple Maps, make it draggable, and with a thinner border
      const personEl = document.createElement("div");
      personEl.style.width = "20px";
      personEl.style.height = "20px";
      personEl.style.backgroundColor = "#007aff";
      personEl.style.border = "2px solid white"; // Thinner white border
      personEl.style.borderRadius = "50%";
      personEl.style.boxShadow = "0 0 10px rgba(0,0,0,0.15)";

      new mapboxgl.Marker({ element: personEl, draggable: true })
        .setLngLat(personData.features[0].geometry.coordinates as [number, number])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<h3>My Person</h3>"))
        .addTo(map);
    });

    return () => map.remove();
  }, [center, zoom]);

  return (
    <div
      ref={mapContainerRef}
      style={{ width, height }}
      className="border rounded shadow"
    />
  );
};

export default MapboxMap;
