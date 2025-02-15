"use client"

import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import MapboxMap from "@/components/MapboxMap"
import { AnimatedNumber } from "@/components/AnimatedNumber"
import { Wind, Shield, Flame } from "lucide-react"
import { SidePanel } from "@/components/SidePanel"

function getSafetyColor(score: number): string {
  if (score < 25) return "text-red-600"
  if (score < 50) return "text-orange-500"
  if (score < 75) return "text-yellow-500"
  return "text-green-600"
}

export default function Dashboard() {
  const [riskValue, setRiskValue] = useState<string>("N/A")
  const [safetyScore, setSafetyScore] = useState<number | null>(null)

  const aqi = 157

  return (
    <div className="flex flex-col h-screen bg-white text-gray-800">
      {/* Page Header */}
      <header className="flex-none p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">Wildfire Monitoring Dashboard</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0 bg-slate-100">
        {/* Left side: Map and Cards */}
        <div className="w-3/4 p-4 flex flex-col min-h-0">
          {/* Top Row: Three Cards */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Air Quality Index Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Air Quality Index</CardTitle>
                <Wind className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{aqi}</div>
                <p className="text-xs text-muted-foreground">Unhealthy</p>
              </CardContent>
            </Card>

            {/* Safety Score Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${safetyScore !== null ? getSafetyColor(safetyScore) : ""}`}>
                  {safetyScore !== null ? <AnimatedNumber value={safetyScore} duration={200} /> : "N/A"}
                </div>
                <p className="text-xs text-muted-foreground">Updated from map</p>
              </CardContent>
            </Card>

            {/* Risk Level Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Wildfire Risk Level</CardTitle>
                <Flame className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{riskValue}</div>
                <p className="text-xs text-muted-foreground">Updated from map</p>
              </CardContent>
            </Card>
          </div>

          {/* Map Section */}
          <div className="flex-1 min-h-0 bg-white border border-gray-200 shadow-sm rounded-md overflow-hidden">
            <MapboxMap 
              width="100%" 
              height="100%" 
              onRiskChange={setRiskValue} 
              onSafetyScoreChange={setSafetyScore} 
            />
          </div>
        </div>

        {/* Right side: SidePanel */}
        <div className="w-1/4 p-4 min-h-0">
          <div className="h-full">
            <SidePanel />
          </div>
        </div>
      </div>
    </div>
  )
}