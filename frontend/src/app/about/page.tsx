"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame } from "lucide-react";

export default function About() {
  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-red-950 overflow-hidden flex flex-col">
      {/* Navigation */}
      <nav className="p-3">
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
      <div className="flex-1 flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Mission Header */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <Flame className="h-10 w-10 text-orange-500" />
              <h1 className="text-4xl font-bold text-white">Our Mission</h1>
            </div>

            {/* Story Section */}
            <div className="flex justify-center mb-8">
              <div className="bg-black/30 rounded-xl p-8 backdrop-blur-sm border border-gray-800 shadow-xl w-[95%]">
                <h2 className="text-2xl font-semibold text-orange-400 mb-4">
                  The Catalyst for Change
                </h2>
                <p className="text-gray-300 leading-relaxed mb-6 text-lg">
                  In January 2025, the world watched in horror as devastating wildfires engulfed Los Angeles, 
                  with the Palisades and Eaton fires consuming over 37,000 acres, destroying more than 16,000 
                  structures, and tragically claiming at least 29 lives. For weeks, these fires dominated global 
                  headlines, exposing critical gaps in wildfire detection, risk assessment, and evacuation planning.
                </p>
                <div className="border-l-4 border-orange-500 pl-6 py-2">
                  <p className="text-xl text-white italic">
                    It is clear that now more than ever, there is an urgent need for proactive and smarter 
                    wildfire management systems.
                  </p>
                </div>
              </div>
            </div>

            {/* Info Sections */}
            <div className="flex justify-center mb-8">
              <div className="grid md:grid-cols-2 gap-6 w-[95%]">
                <div className="bg-black/20 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-orange-400 mb-3">Our Solution</h3>
                  <p className="text-gray-300 text-lg">
                    PYRO.AI combines cutting-edge artificial intelligence with real-time data to provide 
                    early detection, accurate risk assessment, and life-saving evacuation guidance.
                  </p>
                </div>
                <div className="bg-black/20 rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-orange-400 mb-3">Our Impact</h3>
                  <p className="text-gray-300 text-lg">
                    By leveraging advanced technology and data analytics, we're working to ensure that 
                    communities are better prepared and protected from the threat of wildfires.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <Link href="/dashboard">
                <Button 
                  className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 
                            text-white px-8 py-6 text-xl rounded-lg transform transition hover:scale-105 shadow-lg"
                >
                  Join Us in Making a Difference →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}