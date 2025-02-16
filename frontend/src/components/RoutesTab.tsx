import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import UnifiedTabContent from './UnifiedTabContent';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from 'axios';
import * as turf from '@turf/turf';
import polyline from '@mapbox/polyline';
import { useWildfireContext } from '@/context/WildfireContext';
import type { FeatureCollection, Feature, Point, Polygon, MultiPolygon, Geometry } from "geojson";

interface FireProperties {
  Name: string;
  Location: string;
  County: string;
  AcresBurned: number;
  Url: string;
}

// 1) Your fire data remains the same.
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

// 2) Build 2 km circles around each fire with 16 steps and combine into a MultiPolygon.
function buildFireAvoidPolygon(): Geometry {
  // Create a circle for each fire with 16 steps
  const circles = fireData.features.map((feat) =>
    turf.circle(feat.geometry.coordinates as [number, number], 2, {
      steps: 16,
      units: "kilometers",
    })
  );

  // Combine circles into a single geometry
  const combined = turf.combine({
    type: "FeatureCollection",
    features: circles,
  });

  // Return the geometry directly from the first feature.
  return combined.features[0].geometry;
}

const RoutesTab = () => {
  const { userCoordinates, setRouteData, routeData } = useWildfireContext();

  // For Mapbox address auto‑complete:
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<any>(null);

  // UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");

  // 3) Fetch suggestions from Mapbox for auto-complete
  useEffect(() => {
    if (addressQuery.length < 3) {
      setSuggestions([]);
      return;
    }
    const fetchSuggestions = async () => {
      try {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(addressQuery)}.json`,
          {
            params: {
              access_token: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
              autocomplete: true,
              limit: 5,
            },
          }
        );
        setSuggestions(response.data.features);
      } catch (err) {
        console.error("Error fetching suggestions", err);
      }
    };
    const t = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(t);
  }, [addressQuery]);

  // 4) On "Go", check destination safety then call ORS.
  const handleFindRoute = async () => {
    setError("");
    setWarning("");
    setRouteData(null);

    if (!userCoordinates) {
      setError("User location not set.");
      return;
    }
    if (!selectedAddress) {
      setError("Please select a valid address from suggestions.");
      return;
    }

    setLoading(true);

    try {
      // Use selectedAddress.center ([lng, lat]) from Mapbox
      const destCoords = selectedAddress.center as [number, number];

      // Get the avoid_polygons geometry (raw MultiPolygon or Polygon)
      const avoidPolygons = buildFireAvoidPolygon();

      // Check only if the DESTINATION is in the avoid area.
      const destPoint = turf.point(destCoords);
      if (turf.booleanPointInPolygon(destPoint, avoidPolygons)) {
        setError("Destination is in a dangerous area. No safe route found.");
        setLoading(false);
        return;
      }

      // Check if the starting point is inside the avoid area.
      const startPoint = turf.point(userCoordinates);
      const startInside = turf.booleanPointInPolygon(startPoint, avoidPolygons);

      // Prepare the ORS request.
      // If the starting point is inside the danger zone, omit avoid_polygons.
      let orsBody;
      if (startInside) {
        orsBody = {
          coordinates: [
            [userCoordinates[0], userCoordinates[1]], // Origin: [lng, lat]
            [destCoords[0], destCoords[1]],            // Destination: [lng, lat]
          ],
          instructions: true,
          geometry: true,
        };
      } else {
        orsBody = {
          coordinates: [
            [userCoordinates[0], userCoordinates[1]], // Origin: [lng, lat]
            [destCoords[0], destCoords[1]],            // Destination: [lng, lat]
          ],
          instructions: true,
          geometry: true,
          options: {
            avoid_polygons: avoidPolygons,
          },
        };
      }

      const orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car";
      const orsRes = await axios.post(orsUrl, orsBody, {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_ORS_API_KEY || "",
          "Content-Type": "application/json",
        },
      });

      if (!orsRes.data || !orsRes.data.routes || orsRes.data.routes.length === 0) {
        setError("No route found from ORS.");
        setLoading(false);
        return;
      }

      const firstRoute = orsRes.data.routes[0];
      const distance = firstRoute.summary.distance; // in meters
      const duration = firstRoute.summary.duration; // in seconds
      const steps = firstRoute.segments?.[0]?.steps || [];

      // Decode the encoded polyline returned by ORS (default precision is 5)
      const decodedCoords = polyline.decode(firstRoute.geometry, 5);
      // polyline.decode returns an array of [lat, lng]. Swap them to [lng, lat] for GeoJSON.
      const routeCoordinates = decodedCoords.map(([lat, lng]) => [lng, lat]);

      const routeGeoJSON = {
        type: "LineString",
        coordinates: routeCoordinates,
      };

      const routeObj = {
        distance,
        duration,
        legs: [
          {
            steps: steps.map((s: any) => ({
              distance: s.distance,
              duration: s.duration,
              maneuver: { instruction: s.instruction },
            })),
          },
        ],
        geometry: routeGeoJSON,
      };

      setRouteData(routeObj);
      setWarning("ORS route succeeded!");
    } catch (err: any) {
      console.error("Error with ORS directions:", err.response?.data || err);
      setError("Error fetching directions from ORS. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  // 5) Render route summary and directions timeline.
  const metersToMiles = (m: number) => (m / 1609.34).toFixed(2);
  const secondsToMinutes = (s: number) => Math.round(s / 60);

  return (
    <UnifiedTabContent header={<h2 className="text-lg font-semibold">Routes</h2>}>
      <Card className="p-4 mb-4">
        <h3 className="font-medium mb-2">Find Safe Route</h3>

        {/* Address input with suggestions */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Enter destination"
            value={selectedAddress ? selectedAddress.place_name : addressQuery}
            onChange={(e) => {
              setAddressQuery(e.target.value);
              setSelectedAddress(null);
            }}
          />
          {suggestions.length > 0 && !selectedAddress && (
            <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-60 overflow-y-auto">
              {suggestions.map((feature) => (
                <li
                  key={feature.id}
                  onClick={() => {
                    setSelectedAddress(feature);
                    setSuggestions([]);
                    setAddressQuery(feature.place_name);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                >
                  {feature.place_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {warning && <p className="text-sm text-yellow-600 mt-2">{warning}</p>}
        <div className="flex gap-2 mb-2 mt-2">
          <Button onClick={handleFindRoute} disabled={loading || !selectedAddress}>
            {loading ? "Searching..." : "Go"}
          </Button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}

        {routeData && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Route Summary</h4>
            <p>
              Distance: {metersToMiles(routeData.distance)} miles | Duration:{" "}
              {secondsToMinutes(routeData.duration)} minutes
            </p>
            <h4 className="font-medium mt-4 mb-2">Directions Timeline</h4>
            <ul className="list-decimal list-inside space-y-2 text-sm">
              {routeData.legs &&
                routeData.legs[0] &&
                routeData.legs[0].steps.map((step: any, index: number) => (
                  <li key={index}>
                    {step.maneuver.instruction} (
                    {metersToMiles(step.distance || 0)} miles,{" "}
                    {secondsToMinutes(step.duration || 0)} minutes)
                  </li>
                ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <h3 className="font-medium mb-2">Evacuation Routes</h3>
        <p className="text-sm text-muted-foreground">
          No active evacuation routes.
        </p>
      </Card>
      <div className="flex-1" />
    </UnifiedTabContent>
  );
};

export default React.memo(RoutesTab);
