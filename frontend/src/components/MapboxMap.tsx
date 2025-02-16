"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import axios from "axios";
import * as turf from "@turf/turf";
import type { FeatureCollection, Feature, Point, Polygon } from "geojson";
import { useWildfireContext } from "@/context/WildfireContext";
import VideoFeed from "./VideoFeed"; // Updated import using the new UI
import { Home } from 'lucide-react';
import { Button } from "@/components/ui/button";

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

interface ShelterProperties {
  name: string;
  address: string;
  region: string;
  capacity: number;
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
      geometry: { type: "Point", coordinates: [-117.21704198973998, 32.87748192417993] },
      properties: { Name: "My Person" },
    },
  ],
};

const shelterData: FeatureCollection<Point, ShelterProperties> = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.1445, 34.1478] },
      properties: {
        name: "Pasadena Emergency Shelter",
        address: "285 E Walnut St, Pasadena",
        region: "Pasadena",
        capacity: 200
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.4452, 34.0635] },
      properties: {
        name: "Westwood Community Center",
        address: "1350 S Sepulveda Blvd",
        region: "Westwood",
        capacity: 150
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.1309, 34.1675] },
      properties: {
        name: "Pasadena Community Center",
        address: "1750 N Altadena Dr",
        region: "Pasadena",
        capacity: 225
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.1676, 34.1613] },
      properties: {
        name: "Rose Bowl Emergency Shelter",
        address: "1001 Rose Bowl Dr",
        region: "Pasadena",
        capacity: 400
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-116.9700, 33.7100] },
      properties: {
        name: "Hemet Community Shelter",
        address: "1200 State Street",
        region: "Hemet",
        capacity: 200
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-117.2200, 32.8700] },
      properties: {
        name: "San Diego Emergency Center",
        address: "4000 La Jolla Village Dr",
        region: "La Jolla",
        capacity: 250
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.2437, 34.0522] },
      properties: {
        name: "Downtown LA Shelter",
        address: "1400 S Main St",
        region: "Downtown",
        capacity: 300
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.3568, 34.1478] },
      properties: {
        name: "Valley Emergency Center",
        address: "15100 Valley Blvd",
        region: "San Fernando Valley",
        capacity: 250
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-118.1157, 33.9283] },
      properties: {
        name: "Long Beach Safe Haven",
        address: "2100 Ocean Blvd",
        region: "Long Beach",
        capacity: 175
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-117.0710, 32.7743] },
      properties: {
        name: "San Diego State University Shelter",
        address: "5500 Campanile Dr, San Diego, CA 92182",
        region: "San Diego",
        capacity: 600
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-117.1500, 32.7750] },
      properties: {
        name: "Mission Valley Shelter",
        address: "12345 Mission Valley Rd, San Diego, CA 92120",
        region: "San Diego",
        capacity: 400
      }
    },
    {
      type: "Feature",
      geometry: { type: "Point", coordinates: [-117.0842, 32.6401] },
      properties: {
        name: "Chula Vista Community Center",
        address: "276 Fourth Ave, Chula Vista, CA 91910",
        region: "San Diego",
        capacity: 300
      }
    }
  ]
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

/**
 * Create the popup content for a fire feature.
 * Added a link to open the video modal.
 */
function createShelterMarkerElement(): HTMLDivElement {
  const el = document.createElement("div");
  el.innerHTML = `
    <div style="width: 28px; height: 28px; background: white; 
                border-radius: 50%; display: flex; align-items: center; 
                justify-content: center; border: 2px solid #2563eb;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <svg width="14" height="14" viewBox="0 0 24 24" stroke="#2563eb" 
           fill="none" stroke-width="2" stroke-linecap="round" 
           stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    </div>
  `;
  return el;
}

function createFirePopupContent(properties: FireProperties): string {
  return `
    <div style="
      position: relative;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 300px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      color: #333;
      line-height: 1.5;
    ">
      <button 
        onclick="this.closest('.mapboxgl-popup').remove()"
        style="
          position: absolute;
          top: 10px;
          right: 10px;
          background: transparent;
          border: none;
          font-size: 24px;
          font-weight: bold;
          cursor: pointer;
          line-height: 1;
          color: #999;
        ">
        &times;
      </button>
      <h3 style="
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 20px;
        line-height: 1.2;
        color: #222;
      ">${properties.Name}</h3>
      <ul style="
        list-style: none;
        padding: 0;
        margin: 10px 0;
        font-size: 14px;
      ">
        <li style="margin-bottom: 5px;"><strong>Location:</strong> ${properties.Location}</li>
        <li style="margin-bottom: 5px;"><strong>County:</strong> ${properties.County}</li>
        <li style="margin-bottom: 5px;"><strong>Acres Burned:</strong> ${properties.AcresBurned}</li>
      </ul>
      <p style="margin: 10px 0; font-size: 14px;">
        <a 
          href="${properties.Url}" 
          target="_blank" 
          rel="noopener noreferrer"
          style="text-decoration: none; color: #007BFF;">
          More Info
        </a>
      </p>
      <p style="margin: 10px 0; font-size: 14px;">
        <a 
          href="#" 
          onclick="openVideoModal()" 
          style="text-decoration: underline; color: #007BFF;">
          Watch Video Feed
        </a>
      </p>
    </div>
  `;
}

function createShelterPopupContent(properties: ShelterProperties, coordinates: [number, number]): string {
  return `
    <div class="p-2">
      <h3 class="font-bold text-sm mb-1">${properties.name}</h3>
      <p class="text-sm text-gray-600">${properties.address}</p>
      <p class="text-xs text-blue-600 mt-1">${properties.region} Region</p>
      <button 
        onclick="window.showRouteToShelter(${coordinates[1]}, ${coordinates[0]})"
        class="mt-3 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Get Directions
      </button>
    </div>
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

// Modal Component for Video Feed
// Now using the improved VideoFeed component which has its own close button (X) and toggle.
const VideoModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded shadow-lg w-11/12 max-w-3xl p-4">
        {/* VideoFeed now handles its own close action via the onClose prop */}
        <VideoFeed onClose={onClose} />
      </div>
    </div>
  );
};

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
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [showShelters, setShowShelters] = useState(false);
  const shelterMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const { routeData } = useWildfireContext();

  // Compute safety score based on distance from fires
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

  // Fetch satellite image and run prediction via backend
  const fetchSatelliteImageAndPredict = async (coords: [number, number]) => {
    try {
      const [lng, lat] = coords;
      const radius = 0.02;
      const bounds = [lng - radius, lat - radius, lng + radius, lat + radius];
      const imageUrl = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/[${bounds.join(
        ","
      )}]/400x400?access_token=${mapboxgl.accessToken}`;

      const { data } = await axios.post("http://127.0.0.1:5000/api/predict", {
        imageUrl,
        coordinates: coords,
      });

      onRiskChange?.(data.risk);
    } catch (error) {
      console.error("Error fetching prediction:", error);
      onRiskChange?.("Error getting prediction");
    }
  };

  // Set up the global function to open the video modal.
  // This function will be called from the inline popup link.
  useEffect(() => {
    (window as any).openVideoModal = () => setVideoModalOpen(true);
  }, []);

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
            new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(
              createFirePopupContent(feature.properties)
            ))
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
        console.log(newCoords)
      });

      // Create shelter markers but don't add them to map yet
      shelterMarkersRef.current = shelterData.features.map((shelter) => {
        return new mapboxgl.Marker({ element: createShelterMarkerElement() })
          .setLngLat(shelter.geometry.coordinates as [number, number])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(createShelterPopupContent(
                shelter.properties,
                shelter.geometry.coordinates as [number, number]
              ))
          );
      });

      // Initialize with default location
      fetchSatelliteImageAndPredict(selectedLocation);
      computeSafetyScore(selectedLocation);
      onCoordinatesChange?.(selectedLocation);
    });

    return () => {
      // Remove markers on cleanup
      shelterMarkersRef.current.forEach(marker => marker.remove());
      map.remove();
    };
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
          (map.getSource("route") as mapboxgl.GeoJSONSource).setData(
            routeGeoJSON
          );
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

  // Modify the shelter visibility effect
  useEffect(() => {
    if (!mapRef.current) return;

    shelterMarkersRef.current.forEach(marker => marker.remove());

    if (showShelters) {
      shelterMarkersRef.current.forEach(marker => marker.addTo(mapRef.current!));
    }
  }, [showShelters]);

  // Add function to show route
  const showRouteToShelter = async (destLat: number, destLng: number) => {
    if (!mapRef.current || !selectedLocation) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/` +
        `${selectedLocation[0]},${selectedLocation[1]};${destLng},${destLat}` +
        `?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
      );

      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
          type: "Feature",
          properties: {},
          geometry: route.geometry
        };

        // Remove existing route if any
        if (mapRef.current.getLayer("route-layer")) {
          mapRef.current.removeLayer("route-layer");
        }
        if (mapRef.current.getSource("route")) {
          mapRef.current.removeSource("route");
        }

        // Add new route
        mapRef.current.addSource("route", {
          type: "geojson",
          data: routeGeoJSON
        });

        mapRef.current.addLayer({
          id: "route-layer",
          type: "line",
          source: "route",
          layout: {
            "line-join": "round",
            "line-cap": "round"
          },
          paint: {
            "line-color": "#1db7dd",
            "line-width": 5
          }
        });

        // Fit map to show the entire route
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce(
          (bounds: mapboxgl.LngLatBounds, coord: number[]) =>
            bounds.extend(coord as [number, number]),
          new mapboxgl.LngLatBounds(coordinates[0] as [number, number], coordinates[0] as [number, number])
        );
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    } catch (error) {
      console.error("Error getting directions:", error);
    }
  };

  // Add the function to the window object so the popup button can access it
  useEffect(() => {
    (window as any).showRouteToShelter = showRouteToShelter;
    return () => {
      delete (window as any).showRouteToShelter;
    };
  }, [selectedLocation]);

  return (
    <>
      <div className="relative" style={{ width, height }}>
        <div
          ref={mapContainerRef}
          style={{ width: "100%", height: "100%" }}
          className="border rounded shadow"
        />
        {/* Video Modal */}
        <VideoModal isOpen={videoModalOpen} onClose={() => setVideoModalOpen(false)} />
        <Button
          className="absolute top-4 right-4 bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 shadow-lg"
          onClick={() => setShowShelters(!showShelters)}
        >
          {showShelters ? "Hide Shelters" : "Show Nearest Shelters"}
        </Button>
      </div>
    </>
  );
};

export default MapboxMap;
