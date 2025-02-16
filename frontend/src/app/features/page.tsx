"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Navigation, Flame, Radio, Brain, Route, Bell, Shield } from "lucide-react";

export default function Features() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-950">
      {/* Navigation */}
      <nav className="p-4">
        <div className="container mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center text-gray-300 hover:text-orange-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6">
              Cutting-Edge Features
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Advanced technology working around the clock to keep communities safe
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Feature 1: Evacuation Planning */}
            <div className="bg-black/30 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 shadow-xl 
                          transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <Route className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Automated Evacuation</h3>
              </div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-2">
                  <Navigation className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>Real-time route optimization based on fire spread</span>
                </li>
                <li className="flex items-start gap-2">
                  <Bell className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>Instant alerts for evacuation orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>Safe shelter location guidance</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Fire Detection */}
            <div className="bg-black/30 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 shadow-xl 
                          transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <Flame className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Smart Detection</h3>
              </div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-2">
                  <Radio className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>24/7 satellite monitoring and early detection</span>
                </li>
                <li className="flex items-start gap-2">
                  <Brain className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>AI-powered fire spread prediction</span>
                </li>
                <li className="flex items-start gap-2">
                  <Flame className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>Real-time fire behavior analysis</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Information Access */}
            <div className="bg-black/30 rounded-2xl p-8 backdrop-blur-sm border border-gray-800 shadow-xl 
                          transform transition-all duration-300 hover:scale-105">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-orange-500/10 p-3 rounded-lg">
                  <Brain className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-2xl font-semibold text-white">Instant Access</h3>
              </div>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-start gap-2">
                  <Navigation className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>Live evacuation maps and shelter locations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Bell className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>Emergency alerts and notifications</span>
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-orange-400 mt-1 flex-shrink-0" />
                  <span>Community safety resources and guidelines</span>
                </li>
              </ul>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <Link href="/dashboard">
              <Button 
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 
                          text-white px-8 py-6 text-lg rounded-lg transform transition hover:scale-105 shadow-lg"
              >
                Experience PYRO.AI →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 