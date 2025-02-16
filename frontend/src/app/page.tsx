"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900">
      {/* Navigation */}
      <nav className="p-4">
        <div className="container mx-auto flex justify-end items-center">
          <div className="space-x-6">
            <Link
              href="/about"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              About Us
            </Link>
            <Link
              href="/features"
              className="text-gray-300 hover:text-orange-400 transition-colors"
            >
              Features
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 flex items-center min-h-[85vh]">
        <div className="max-w-4xl pl-12">
          <h1 className="text-6xl font-bold text-white mb-6">Meet PYRO.AI!</h1>
          <h2 className="text-7xl font-bold mb-8 animate-gradient tracking-tight">
            Stay Ahead of the Flames
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl">
            Your real-time AI companion in wildfire safety. We're here to help protect what matters most,
            providing critical updates and personalized evacuation guidance when every moment counts.
          </p>
          <Link href="/dashboard">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-lg transform transition hover:scale-105 shadow-lg">
              Get Started →
            </Button>
          </Link>
        </div>

        {/* MacBook Preview with Glowing Effect */}
        <div className="flex-1 ml-[-10%] scale-[1.50] origin-center mr-[-15%] relative">
          {/* Glowing effect */}
          <div
            className="absolute top-[14%] left-[23.3%] w-[60%] h-[63.7%] bg-orange-500 rounded-2xl blur-3xl opacity-30 z-0"
            style={{ filter: "blur(60px)" }}
          />
          {/* Map overlay */}
          <img
            src="/map.jpg"
            alt="Dashboard Map"
            className="absolute top-[14%] left-[23.3%] w-[60%] h-[63.7%] object-cover rounded-2xl z-20"
          />
          {/* MacBook frame */}
          <img
            src="/mac-background.png"
            alt="PYRO.AI Dashboard Preview"
            className="w-full h-auto object-contain relative z-10"
          />
        </div>
      </div>
    </div>
  );
}
