"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import * as turf from "@turf/turf";
import type { FeatureCollection, Feature, Point, Polygon } from "geojson";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

type FireProperties = {
  Name: string;
  Location: string;
  County: string;
  AcresBurned: number;
  Url: string;
};

const fireData: FeatureCollection<Point, FireProperties> = {
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

type PersonProperties = {
  Name: string;
};

const personData: FeatureCollection<Point, PersonProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-117.227, 32.8722] },
      properties: { Name: "My Person" },
    },
  ],
};

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
    circle.properties = { ...feature.properties!, radiusKm };
    return circle as Feature<Polygon, FireProperties & { radiusKm: number }>;
  });
  return {
    type: "FeatureCollection",
    features: circles,
  };
}

const fireCirclesData = buildCirclePolygons(fireData.features, 2);

interface MapboxMapProps {
  width?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
  onRiskChange?: (risk: string) => void;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  width = "100%",
  height = "600px",
  center = [-117.237, 32.8622],
  zoom = 12,
  onRiskChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>(
    personData.features[0].geometry.coordinates as [number, number]
  );

  const fetchSatelliteImageAndPredict = async (
    coordinates: [number, number]
  ) => {
    try {
      const [lng, lat] = coordinates;
      const radius = 0.02; // ~2km in degrees
      const bounds = [lng - radius, lat - radius, lng + radius, lat + radius];
      const imageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/[${bounds.join(
        ","
      )}]/400x400?access_token=${mapboxgl.accessToken}`;

      const { data } = await axios.post("http://127.0.0.1:5000/api/predict", {
        imageUrl,
        coordinates,
      });

      // Update risk in parent via callback.
      if (onRiskChange) {
        onRiskChange(data.risk);
      }
    } catch (error) {
      console.error("Error fetching prediction:", error);
      if (onRiskChange) {
        onRiskChange("Error getting prediction");
      }
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center,
      zoom,
    });
    mapRef.current = map;

    map.on("load", () => {
      // Add Fire Points
      map.addSource("fires", { type: "geojson", data: fireData });
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
        const fireEl = document.createElement("div");
        fireEl.style.width = "32px";
        fireEl.style.height = "32px";
        fireEl.style.borderRadius = "50%";
        fireEl.style.backgroundColor = "rgba(255, 69, 0, 0.9)";
        fireEl.style.display = "flex";
        fireEl.style.alignItems = "center";
        fireEl.style.justifyContent = "center";
        fireEl.style.boxShadow = "0 0 10px rgba(255, 69, 0, 0.5)";
        fireEl.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"
               viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12
                     c0-1.38-.5-2-1-3
                     -1.072-2.143-.224-4.054 2-6
                     .5 2.5 2 4.9 4 6.5
                     2 1.6 3 3.5 3 5.5
                     a7 7 0 1 1-14 0
                     c0-1.153.433-2.294 1-3
                     a2.5 2.5 0 0 0 2.5 2.5z"/>
          </svg>
        `;
        new mapboxgl.Marker({ element: fireEl })
          .setLngLat(coords)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map);
      });

      // Add Fire Circles
      map.addSource("fire-circles", {
        type: "geojson",
        data: fireCirclesData,
      });
      map.addLayer({
        id: "fire-circles-fill",
        type: "fill",
        source: "fire-circles",
        paint: {
          "fill-color": "rgba(255, 69, 0, 0.2)",
          "fill-outline-color": "rgb(255, 69, 0)",
        },
      });

      // Add Draggable Person Marker (blue)
      const personMarkerEl = document.createElement("div");
      personMarkerEl.style.width = "20px";
      personMarkerEl.style.height = "20px";
      personMarkerEl.style.backgroundColor = "#007aff";
      personMarkerEl.style.border = "2px solid white";
      personMarkerEl.style.borderRadius = "50%";
      personMarkerEl.style.boxShadow = "0 0 10px rgba(0,0,0,0.15)";

      const marker = new mapboxgl.Marker({
        element: personMarkerEl,
        draggable: true,
      })
        .setLngLat(selectedLocation)
        .addTo(map);

      marker.on("dragstart", () => {
        personMarkerEl.style.opacity = "0.5";
      });

      marker.on("dragend", () => {
        personMarkerEl.style.opacity = "1";
        const lngLat = marker.getLngLat();
        const newCoords: [number, number] = [lngLat.lng, lngLat.lat];
        setSelectedLocation(newCoords);
        fetchSatelliteImageAndPredict(newCoords);
      });

      // Fetch initial risk for default location
      fetchSatelliteImageAndPredict(selectedLocation);
    });

    return () => {
      map.remove();
    };
  }, []); // Run once on mount

  return (
    <div className="relative" style={{ width, height }}>
      <div
        ref={mapContainerRef}
        style={{ width: "100%", height: "100%" }}
        className="border rounded shadow"
      />
    </div>
  );
};

export default MapboxMap;
