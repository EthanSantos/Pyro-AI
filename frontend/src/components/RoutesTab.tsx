"use client"

import React, { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import UnifiedTabContent from "./UnifiedTabContent"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2, AlertTriangle, MapPin, Navigation, AlertCircle } from "lucide-react"
import axios from "axios"
import * as turf from "@turf/turf"
import polyline from "@mapbox/polyline"
import { useWildfireContext } from "@/context/WildfireContext"
import type { FeatureCollection, Point, Polygon, MultiPolygon } from "geojson"

/* -------------------- Fire Data & Route Interfaces -------------------- */

interface FireProperties {
  Name: string
  Location: string
  County: string
  AcresBurned: number
  Url: string
}

interface RouteStep {
  distance: number
  duration: number
  maneuver: {
    instruction: string
  }
}

interface RouteLeg {
  steps: RouteStep[]
}

interface RouteGeoJSON {
  type: "LineString"
  coordinates: [number, number][]
}

export interface RouteData {
  distance: number
  duration: number
  legs: RouteLeg[]
  geometry: RouteGeoJSON
}

/* -------------------- Sample Fire Data (2 km Danger Zones) -------------------- */

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
}

/**
 * Creates 2 km circles around each fire and combines them into a single geometry.
 */
function buildFireAvoidPolygon(): Polygon | MultiPolygon {
  const circles = fireData.features.map((feat) =>
    turf.circle(feat.geometry.coordinates as [number, number], 2, {
      steps: 16,
      units: "kilometers",
    }),
  )

  const combined = turf.combine({
    type: "FeatureCollection",
    features: circles,
  })

  return combined.features[0].geometry as Polygon | MultiPolygon
}

/* -------------------- Directions Timeline Component -------------------- */

interface DirectionsTimelineProps {
  steps: RouteStep[]
}

/**
 * Randomly determines whether to display a warning and, if so,
 * randomly picks one of the warning messages.
 */
function getWarningData() {
  const warnings = ["Fire approaching from east", "Smoke affecting visibility", "Heavy traffic"]
  if (Math.random() < 0.5) {
    return { showWarning: false, details: "" }
  } else {
    const randomIndex = Math.floor(Math.random() * warnings.length)
    return { showWarning: true, details: warnings[randomIndex] }
  }
}

const DirectionsTimeline: React.FC<DirectionsTimelineProps> = ({ steps }) => {
  return (
    <div className="relative">
      <h4 className="text-base font-semibold mb-4">Turn-by-Turn Directions</h4>
      <div className="border-l-2 border-gray-300 ml-4">
        {steps.map((step, index) => {
          const warningData = getWarningData()
          return (
            <div key={index} className="relative pl-8 pb-6">
              <div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold shadow-md">
                {index + 1}
              </div>
              <div className="mb-1 font-semibold text-gray-800">{step.maneuver.instruction}</div>
              <div className="text-sm text-gray-600 mb-2">
                {(step.distance / 1609.34).toFixed(2)} miles &bull; {Math.round(step.duration / 60)} mins
              </div>
              {warningData.showWarning && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-yellow-700">{warningData.details}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* -------------------- Main RoutesTab Component -------------------- */

const RoutesTab: React.FC = () => {
  const {
    userCoordinates,
    setRouteData,
    routeData,
    selectedAddress,
    setSelectedAddress,
    shouldAutoSearch,
    setShouldAutoSearch
  } = useWildfireContext()

  const [addressQuery, setAddressQuery] = useState<string>("")
  const [suggestions, setSuggestions] = useState<any[]>([])

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")
  const [warning, setWarning] = useState<string>("")

  useEffect(() => {
    if (shouldAutoSearch && selectedAddress) {
      handleFindRoute();
      setShouldAutoSearch(false);
    }
  }, [shouldAutoSearch, selectedAddress]);

  useEffect(() => {
    if (addressQuery.length < 3) {
      setSuggestions([])
      return
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
          },
        )
        setSuggestions(response.data.features)
      } catch (err) {
        console.error("Error fetching suggestions", err)
      }
    }
    const t = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(t)
  }, [addressQuery])

  const handleFindRoute = React.useCallback(async () => {
    setError("")
    setWarning("")
    setRouteData(null)

    if (!userCoordinates) {
      setError("User location not set.")
      return
    }
    if (!selectedAddress) {
      setError("Please select a valid address from suggestions.")
      return
    }

    setLoading(true)

    try {
      const destCoords = selectedAddress.center as [number, number]
      const avoidPolygons = buildFireAvoidPolygon()

      // Check if destination is inside the avoid polygon.
      const destPoint = turf.point(destCoords)
      if (turf.booleanPointInPolygon(destPoint, avoidPolygons)) {
        setError("Destination is in a dangerous area. No safe route found.")
        setLoading(false)
        return
      }

      // Check if starting point is inside the danger zone.
      const startPoint = turf.point(userCoordinates)
      const startInside = turf.booleanPointInPolygon(startPoint, avoidPolygons)

      let orsBody: any
      if (startInside) {
        orsBody = {
          coordinates: [
            [userCoordinates[0], userCoordinates[1]],
            [destCoords[0], destCoords[1]],
          ],
          instructions: true,
          geometry: true,
        }
      } else {
        orsBody = {
          coordinates: [
            [userCoordinates[0], userCoordinates[1]],
            [destCoords[0], destCoords[1]],
          ],
          instructions: true,
          geometry: true,
          options: {
            avoid_polygons: avoidPolygons,
          },
        }
      }

      const orsUrl = "https://api.openrouteservice.org/v2/directions/driving-car"
      const orsRes = await axios.post(orsUrl, orsBody, {
        headers: {
          Authorization: process.env.NEXT_PUBLIC_ORS_API_KEY || "",
          "Content-Type": "application/json",
        },
      })

      if (!orsRes.data || !orsRes.data.routes || orsRes.data.routes.length === 0) {
        setError("No route found from ORS.")
        setLoading(false)
        return
      }

      const firstRoute = orsRes.data.routes[0]
      const distance: number = firstRoute.summary.distance
      const duration: number = firstRoute.summary.duration

      const stepsRaw = firstRoute.segments?.[0]?.steps || []
      const steps: RouteStep[] = stepsRaw.map((s: any) => ({
        distance: s.distance,
        duration: s.duration,
        maneuver: { instruction: s.instruction },
      }))

      // Decode polyline and swap [lat, lng] to [lng, lat]
      const decodedCoords: Array<[number, number]> = polyline.decode(firstRoute.geometry, 5)
      const routeCoordinates: [number, number][] = decodedCoords.map(([lat, lng]: [number, number]) => [lng, lat])

      const routeGeoJSON: RouteGeoJSON = {
        type: "LineString",
        coordinates: routeCoordinates,
      }

      const routeObj: RouteData = {
        distance,
        duration,
        legs: [{ steps }],
        geometry: routeGeoJSON,
      }

      setRouteData(routeObj)
      setWarning("ORS route succeeded!")
    } catch (err: any) {
      console.error("Error with ORS directions:", err.response?.data || err)
      setError("Error fetching directions from ORS. See console for details.")
    } finally {
      setLoading(false)
    }
  }, [userCoordinates, selectedAddress, setRouteData]);

  const metersToMiles = (m: number) => (m / 1609.34).toFixed(2)
  const secondsToMinutes = (s: number) => Math.round(s / 60)

  return (
    <UnifiedTabContent header={<h2 className="text-lg font-semibold">ROUTES</h2>}>
      <Card className="p-6 mb-6 shadow-sm">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Navigation className="h-6 w-6 text-blue-500" />
            Find Safe Route
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 pb-0">
          <div className="relative mb-4">
            <Input
              type="text"
              placeholder="Enter destination"
              value={selectedAddress ? selectedAddress.place_name : addressQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setAddressQuery(e.target.value);
                setSelectedAddress(null);
              }}
              className="pr-10"
            />
            <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />

            {suggestions.length > 0 && !selectedAddress && (
              <div className="absolute left-0 right-0 top-full mt-1 rounded-md bg-white border border-gray-200 shadow-lg max-h-60 overflow-y-auto z-20">
                <ul>
                  {suggestions.map((feature: any) => (
                    <li
                      key={feature.id}
                      onClick={() => {
                        setSelectedAddress(feature);
                        setSuggestions([]);
                        setAddressQuery(feature.place_name);
                      }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      {feature.place_name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {warning && (
            <Alert className="mt-4" variant="success">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Safe route found!</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2 mt-4">
            <Button
              onClick={handleFindRoute}
              disabled={loading || !selectedAddress}
              className="w-full"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" /> Finding...
                </span>
              ) : (
                "Go"
              )}
            </Button>
          </div>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Couldn't find a safe route. Please try again.
              </AlertDescription>
            </Alert>
          )}

          {routeData && (
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium text-lg mb-2">Route Summary</h4>
              <p className="text-sm text-gray-700 mb-4">
                Distance: {metersToMiles(routeData.distance)} miles | Duration:{" "}
                {secondsToMinutes(routeData.duration)} minutes
              </p>
              <DirectionsTimeline steps={routeData.legs[0].steps} />
            </div>
          )}
        </CardContent>
      </Card>
    </UnifiedTabContent>

  )
}

export default React.memo(RoutesTab)

