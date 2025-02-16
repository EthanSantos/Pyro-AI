"use client"

import React from "react";
import { useState } from "react"
import MapboxMap from "@/components/MapboxMap";

export default function Home() {
  const [message, setMessage] = useState("");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">
        Home Page
      </h1>
    </div>
  )
}
