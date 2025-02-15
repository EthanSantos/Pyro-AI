"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type {
  FeatureCollection,
  Feature,
  Point,
  Polygon,
} from "geojson";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN

type FireProperties = {
  Name: string;
  Location: string;
  County: string;
  AcresBurned: number;
  Url: string;
}

/**
 * Fire data typed with specific FireProperties
 */
const fireData: FeatureCollection<Point, FireProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-118.47541, 34.0968] as [number, number],
      },
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
      geometry: {
        type: "Point",
        coordinates: [-117.237, 32.8622] as [number, number],
      },
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
      geometry: {
        type: "Point",
        coordinates: [-116.964339, 33.708601] as [number, number],
      },
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

type PersonProperties = {
  Name: string;
}

/**
 * Person data with specific PersonProperties
 */
const personData: FeatureCollection<Point, PersonProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-117.227, 32.8722] as [number, number],
      },
      properties: {
        Name: "My Person",
      },
    },
  ],
};

/**
 * buildCirclePolygons
 * - Takes an array of point features
 * - Generates a 2 km radius polygon around each point using Turf.js
 * - Returns a FeatureCollection of Polygons
 */
function buildCirclePolygons(
    pointFeatures: Feature<Point, FireProperties>[],
    radiusKm: number
  ): FeatureCollection<Polygon, FireProperties & { radiusKm: number }> {
    const circles = pointFeatures.map((feature) => {
      const coords = feature.geometry.coordinates as [number, number];
      const circle = turf.circle(coords, radiusKm, {
        steps: 64,
        units: "kilometers",
      });
      
      circle.properties = {
        ...feature.properties!,
        radiusKm,
      };
      
      return circle as Feature<Polygon, FireProperties & { radiusKm: number }>;
    });
  
    return {
      type: "FeatureCollection",
      features: circles,
    };
  }

// 2 km radius for each fire
const fireCirclesData = buildCirclePolygons(fireData.features, 2);

interface MapboxMapProps {
  width?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  width = "100%",
  height = "600px",
  center = [-117.237, 32.8622],
  zoom = 14,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize the map (satellite style)
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center,
      zoom,
    });

    map.on("load", () => {
      // 1. Add a GeoJSON source for the fire data (Points)
      map.addSource("fires", {
        type: "geojson",
        data: fireData,
      });

      // 2. Add red markers for each fire
      fireData.features.forEach((feature) => {
        const coords = feature.geometry.coordinates as [number, number];
        const { Name, Location, County, AcresBurned, Url } = feature.properties;

        const popupContent = `
          <h3>${Name}</h3>
          <p><strong>Location:</strong> ${Location}</p>
          <p><strong>County:</strong> ${County}</p>
          <p><strong>Acres Burned:</strong> ${AcresBurned}</p>
          <p><a href="${Url}" target="_blank">More Info</a></p>
        `;

        new mapboxgl.Marker({ color: "red" })
          .setLngLat(coords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map);
      });

      // 3. Add a source for the fire circles (Polygon)
      map.addSource("fire-circles", {
        type: "geojson",
        data: fireCirclesData,
      });

      // 4. Add a fill layer for the circle polygons (2 km radius)
      map.addLayer({
        id: "fire-circles-fill",
        type: "fill",
        source: "fire-circles",
        paint: {
          "fill-color": "rgba(255, 0, 0, 0.2)",
          "fill-outline-color": "red",
        },
      });

      // 5. Add a source for our person's location (Point)
      map.addSource("person", {
        type: "geojson",
        data: personData,
      });

      // 6. Create a custom marker for the person, Apple Maps style, draggable
      const personEl = document.createElement("div");
      personEl.style.width = "20px";
      personEl.style.height = "20px";
      personEl.style.backgroundColor = "#007aff";
      personEl.style.border = "2px solid white";
      personEl.style.borderRadius = "50%";
      personEl.style.boxShadow = "0 0 10px rgba(0,0,0,0.15)";

      new mapboxgl.Marker({ element: personEl, draggable: true })
        .setLngLat(personData.features[0].geometry.coordinates as [number, number])
        .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML("<h3>My Person</h3>"))
        .addTo(map);
    });

    // Cleanup on unmount
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