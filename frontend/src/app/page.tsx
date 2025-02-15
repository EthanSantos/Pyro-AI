"use client";

import { useState } from "react"
import NewsCard from "@/components/ui/NewsCard"

export default function Home() {

  const allNews = [
    {
      id: 1,
      title: "New Evacuation Orders Issued for Northern California",
      tag: "Evacuations",
      source: "CalFire",
      date: "5 minutes ago",
      content: "Mandatory evacuations have been ordered for residents in the Paradise Pine area due to rapidly spreading wildfire.",
      link: "https://example.com/wildfire.jpg",
    },
    {
      id: 2,
      title: "High Wind Advisory: Increased Fire Risk",
      tag: "Weather",
      source: "National Weather Service",
      date: "30 minutes ago",
      content: "Weather service warns of strong winds up to 45mph, creating dangerous fire conditions in affected areas.",
      link: null,
    },
    {
      id: 3,
      title: "Fire Containment Reaches 45% in Sierra Forest",
      tag: "General",
      source: "US Forest Service",
      date: "2 hours ago",
      content: "Firefighters make progress containing the wildfire that has burned over 5,000 acres.",
      link: "https://example.com/containment.jpg",
    },
  ]

  const [filter, setFilter] = useState<String | null>(null)
  const [filteredNews, setFilteredNews] = useState<Array<{id: number, title: String, tag: String, source: String, date: String, content: String, link: String | null}>>(allNews)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">
        [PLACEHOLDER] Next.js App Router with Axios, shadcn UI & Flask
      </h1>
      
      <NewsCard 
        title="New Evacuation Orders Issued for Northern California"
        tag="Evacuations"
        source="CalFire"
        date="5 minutes ago"
        content="Mandatory evacuations have been ordered for residents in the Paradise Pine area due to rapidly spreading wildfire."
        link="https://example.com/wildfire.jpg"
      />
      
    </div>
  );
}
