"use client"; // For Next.js (App Router)

import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import type {
    FeatureCollection,
    Feature,
    Point,
    Polygon,
} from "geojson";

// ---------------------
// 1) Mapbox Access Token
// ---------------------
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";

// ---------------------
// 2) Fire Data
// ---------------------
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

// ---------------------
// 3) Person Data
// ---------------------
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

// ---------------------
// 4) Build Fire Circles (2 km radius)
// ---------------------
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

    return { type: "FeatureCollection", features: circles };
}

const fireCirclesData = buildCirclePolygons(fireData.features, 2);

// ---------------------
// 5) Safety Logic
// ---------------------
function evaluatePersonSafety(
    person: Feature<Point>,
    fireCircles: Feature<Polygon, { radiusKm: number }>[]
): { isInside: boolean; minDistance: number } {
    let isInside = false;
    let minDistance = Infinity;

    for (const circle of fireCircles) {
        // 1) Check if inside polygon
        if (turf.booleanPointInPolygon(person, circle)) {
            isInside = true;
        }
        // 2) Distance to center (approx via turf.center())
        const center = turf.center(circle);
        const distanceKm = turf.distance(person, center, { units: "kilometers" });
        if (distanceKm < minDistance) {
            minDistance = distanceKm;
        }
    }
    return { isInside, minDistance };
}

function getSafetyScore(
    isInside: boolean,
    minDistance: number,
    circleRadius: number = 2
): number {
    // If inside polygon, score=0
    if (isInside) return 0;

    // If outside, scale from 2km => 20 up to 10km => 100
    if (minDistance <= circleRadius) {
        return 20;
    } else if (minDistance <= 10) {
        const fraction = (minDistance - circleRadius) / (10 - circleRadius);
        return 20 + fraction * 80; // 20..100
    }
    return 100; // >10km => fully safe
}

// ---------------------
// 6) Map Component
// ---------------------
interface MapboxMapProps {
    width?: string;
    height?: string;
    // If you really need to accept center/zoom from outside,
    // ensure you do NOT place them in the effect's dependencies 
    // if you don't want re-init on changes.
    center?: [number, number];
    zoom?: number;
}

export default function MapboxMap({
    width = "100%",
    height = "600px",
    center = [-117.237, 32.8622],
    zoom = 12,
}: MapboxMapProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<mapboxgl.Map | null>(null);

    // We'll store the safety score and message in React state
    const [safetyScore, setSafetyScore] = useState<number>(0);
    const [safetyMessage, setSafetyMessage] = useState<string>("");

    useEffect(() => {
        // If there's no container or we already created a map, do nothing
        if (!mapContainerRef.current || mapRef.current) return;

        // 1) Create the map exactly once
        mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/satellite-v9",
            center,
            zoom,
        });

        // 2) On map load, add layers & markers
        mapRef.current.on("load", () => {
            const map = mapRef.current!;
            //
            // A) Fire Markers
            //
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

                // Create a fire icon element
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
               viewBox="0 0 24 24" fill="none" stroke="white"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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

            //
            // B) Fire Circles (fill layer)
            //
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

            //
            // C) Person Marker (draggable)
            //
            map.addSource("person", { type: "geojson", data: personData });
            const personMarkerEl = document.createElement("div");
            personMarkerEl.style.width = "20px";
            personMarkerEl.style.height = "20px";
            personMarkerEl.style.backgroundColor = "#007aff";
            personMarkerEl.style.border = "2px solid white";
            personMarkerEl.style.borderRadius = "50%";
            personMarkerEl.style.boxShadow = "0 0 10px rgba(0,0,0,0.15)";

            const personMarker = new mapboxgl.Marker({
                element: personMarkerEl,
                draggable: true,
            })
                .setLngLat(personData.features[0].geometry.coordinates as [number, number])
                .addTo(map);

            //
            // D) Safety Check Function
            //
            const checkSafety = () => {
                // 1) Update person's coordinates
                const lngLat = personMarker.getLngLat();
                personData.features[0].geometry.coordinates = [lngLat.lng, lngLat.lat];

                // 2) Evaluate
                const { isInside, minDistance } = evaluatePersonSafety(
                    personData.features[0],
                    fireCirclesData.features
                );

                // 3) Calculate Score
                const score = getSafetyScore(isInside, minDistance, 2);
                setSafetyScore(score);

                // 4) Determine Message
                if (isInside) {
                    setSafetyMessage("⚠️ INSIDE the fire zone! Evacuate immediately!");
                } else if (score < 50) {
                    setSafetyMessage(
                        `⚠️ Very close to fire (~${minDistance.toFixed(2)} km). Stay vigilant.`
                    );
                } else if (score < 100) {
                    setSafetyMessage(
                        `Relatively safe: ~${minDistance.toFixed(2)} km away. Keep monitoring.`
                    );
                } else {
                    setSafetyMessage("✅ More than 10 km away. You appear safe.");
                }
            };

            // Initial safety check
            checkSafety();

            // Re-check whenever the marker is dragged
            personMarker.on("dragend", () => {
                checkSafety();
            });
        });

        // Cleanup on unmount
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []); // No dependencies => runs once

    // ---------------------
    // Render
    // ---------------------
    return (
        <div>
            <div
                ref={mapContainerRef}
                style={{ width, height }}
                className="border rounded shadow"
            />
            <div style={{ marginTop: "1rem" }}>
                <h3>Safety Score: {safetyScore.toFixed(1)}</h3>
                <p>{safetyMessage}</p>
            </div>
        </div>
    );
}
