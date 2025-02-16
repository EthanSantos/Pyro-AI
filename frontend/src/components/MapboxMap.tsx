"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import * as turf from "@turf/turf";
import type { FeatureCollection, Feature, Point, Polygon } from "geojson";
import { useWildfireContext } from "@/context/WildfireContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

// Data Types
interface FireProperties {
  Name: string;
  Location: string;
  County: string;
  AcresBurned: number;
  Url: string;
}

interface PersonProperties {
  Name: string;
}

// Sample Data
const fireData: FeatureCollection<Point, FireProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.47541, 34.0968] },
      properties: {
        Name: "Sepulveda Fire",
        Location: "405 Freeway, North Sepulveda Boulevard",
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
        Location: "Gilman Drive, South of La Jolla",
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

// Helper Functions
function createFireMarkerElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = `
    <div style="width: 32px; height: 32px; background: rgba(255,69,0,0.9); 
                border-radius: 50%; display: flex; align-items: center; 
                justify-content: center; box-shadow: 0 0 10px rgba(255,69,0,0.5);">
      <svg width="20" height="20" viewBox="0 0 24 24" stroke="white" 
           fill="none" stroke-width="2">
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 
                 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3 
                 a2.5 2.5 0 0 0 2.5 2.5z"/>
      </svg>
    </div>
  `;
  return el;
}

function createPersonMarkerElement(): HTMLDivElement {
  const el = document.createElement("div");
  Object.assign(el.style, {
    width: "20px",
    height: "20px",
    backgroundColor: "#007aff",
    border: "2px solid white",
    borderRadius: "50%",
    boxShadow: "0 0 10px rgba(0,0,0,0.15)",
  });
  return el;
}

function createFirePopupContent(properties: FireProperties): string {
  return `
    <h3>${properties.Name}</h3>
    <p><strong>Location:</strong> ${properties.Location}</p>
    <p><strong>County:</strong> ${properties.County}</p>
    <p><strong>Acres Burned:</strong> ${properties.AcresBurned}</p>
    <p><a href="${properties.Url}" target="_blank">More Info</a></p>
  `;
}

function buildCirclePolygons(
  pointFeatures: Feature<Point, FireProperties>[],
  radiusKm: number
): FeatureCollection<Polygon, FireProperties & { radiusKm: number }> {
  return {
    type: "FeatureCollection",
    features: pointFeatures.map((feature) => {
      const circle = turf.circle(
        feature.geometry.coordinates as [number, number],
        radiusKm,
        { steps: 64, units: "kilometers" }
      );
      circle.properties = { ...feature.properties!, radiusKm };
      return circle as Feature<Polygon, FireProperties & { radiusKm: number }>;
    }),
  };
}

// Component Props
interface MapboxMapProps {
  width?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
  onRiskChange?: (risk: string) => void;
  onSafetyScoreChange?: (score: number) => void;
  onCoordinatesChange?: (coords: [number, number]) => void;
}

// Main Component
const MapboxMap: React.FC<MapboxMapProps> = ({
  width = "100%",
  height = "600px",
  center = [-117.237, 32.8622],
  zoom = 12,
  onRiskChange,
  onSafetyScoreChange,
  onCoordinatesChange,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<[number, number]>(
    personData.features[0].geometry.coordinates as [number, number]
  );

  const { routeData } = useWildfireContext();

  const computeSafetyScore = (coords: [number, number]): number => {
    const R = 2; // danger zone radius in km
    const scores = fireData.features.map((feature) => {
      const distance = turf.distance(
        turf.point(coords),
        turf.point(feature.geometry.coordinates),
        { units: "kilometers" }
      );
      return distance < R ? 0 : Math.min(100, Math.round((distance - R) * 20));
    });
    const score = Math.min(...scores);
    onSafetyScoreChange?.(score);
    return score;
  };

  const fetchSatelliteImageAndPredict = async (coords: [number, number]) => {
    try {
      const [lng, lat] = coords;
      const radius = 0.02;
      const bounds = [lng - radius, lat - radius, lng + radius, lat + radius];
      const imageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/[${bounds.join(
        ","
      )}]/400x400?access_token=${mapboxgl.accessToken}`;

      /*
      const { data } = await axios.post("http://127.0.0.1:5000/api/predict", {
        imageUrl,
        coordinates: coords,
      });
      */

      const { data } = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/predict`,
        {
          imageUrl,
          coordinates: coords,
        }
      );

      onRiskChange?.(data.risk);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      onRiskChange?.("Error getting prediction");
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
      // Add fire markers with popups
      fireData.features.forEach((feature) => {
        new mapboxgl.Marker({ element: createFireMarkerElement() })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              createFirePopupContent(feature.properties)
            )
          )
          .addTo(map);
      });

      // Add fire danger circles
      const fireCirclesData = buildCirclePolygons(fireData.features, 2);
      map.addSource("fire-circles", { type: "geojson", data: fireCirclesData });
      map.addLayer({
        id: "fire-circles-fill",
        type: "fill",
        source: "fire-circles",
        paint: {
          "fill-color": "rgba(255, 69, 0, 0.2)",
          "fill-outline-color": "rgb(255, 69, 0)",
        },
      });

      // Add draggable person marker
      const personMarkerEl = createPersonMarkerElement();
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
        const { lng, lat } = marker.getLngLat();
        const newCoords: [number, number] = [lng, lat];
        setSelectedLocation(newCoords);
        onCoordinatesChange?.(newCoords);
        fetchSatelliteImageAndPredict(newCoords);
        computeSafetyScore(newCoords);
      });

      // Initialize with default location
      fetchSatelliteImageAndPredict(selectedLocation);
      computeSafetyScore(selectedLocation);
      onCoordinatesChange?.(selectedLocation);
    });

    return () => map.remove();
  }, []);

  // Update route layer when routeData changes
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (routeData && routeData.geometry) {
      const geometry = routeData.geometry;
      if (
        geometry.type === "LineString" &&
        Array.isArray(geometry.coordinates) &&
        geometry.coordinates.length > 0
      ) {
        const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
          type: "Feature",
          geometry: geometry,
          properties: {},
        };
        if (map.getSource("route")) {
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData(routeGeoJSON);
        } else {
          map.addSource("route", {
            type: "geojson",
            data: routeGeoJSON,
          });
          map.addLayer({
            id: "route-layer",
            type: "line",
            source: "route",
            layout: {
              "line-join": "round",
              "line-cap": "round",
            },
            paint: {
              "line-color": "#1db7dd",
              "line-width": 5,
            },
          });
        }
        // Fit map bounds to the route
        const coordinates = geometry.coordinates;
        const bounds = coordinates.reduce(
          (bounds: mapboxgl.LngLatBounds, coord: number[]) =>
            bounds.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(
            coordinates[0] as [number, number],
            coordinates[0] as [number, number]
          )
        );
        map.fitBounds(bounds, { padding: 40 });
      } else {
        console.error("Invalid route geometry", geometry);
      }
    } else {
      if (map.getLayer("route-layer")) {
        map.removeLayer("route-layer");
      }
      if (map.getSource("route")) {
        map.removeSource("route");
      }
    }
  }, [routeData]);

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
