"use client"

import { useState, useEffect } from "react"
import NewsCard from "@/components/ui/NewsCard"
import { Button } from "@/components/ui/button"
import { FaSearch } from "react-icons/fa"
import { Input } from "@/components/ui/input"

function SearchNews() {  
  const [isFocused, setIsFocused] = useState<Boolean>(false)

  return(
    <div className="relative w-[400px]">
      <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isFocused ? "text-[#DD5A2B]" : "text-muted-foreground"}`}/>
      <Input
        type="text"
        placeholder="Search news..."
        className="p-2 pl-10 focus-visible:ring-[#DD5A2B]"
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
      />
    </div>
  )
}

function FilterBar({setFilter} : {setFilter: Function}) {
  const filters = ["All", "Alerts", "Evacuations", "Weather", "General"]

  return(
    <div className="min-w-auto border rounded-md space-x-4 p-1 mb-6">
      {filters.map((filter) => (
        <Button
          key={filter}
          size='sm'
          onClick={() => setFilter(filter)}
        >
          {filter}
        </Button>
      ))}
    </div>
  )
}

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
      link: "https://www.google.com/search?q=pigs&rlz=1C5CHFA_enUS973US973&oq=pigs&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIGCAEQRRg8MgYIAhBFGDzSAQc1MTNqMGo3qAIIsAIB&sourceid=chrome&ie=UTF-8#vhid=NxbLQ-iqV2JCnM&vssid=l",
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

  const [filter, setFilter] = useState<String>("All")
  const [displayedNews, setDisplayedNews] = useState<Array<{id: number, title: String, tag: String, source: String, date: String, content: String, link: String}>>(allNews)

  useEffect(() => {
    if (filter !== "All") {
      const filteredNews = allNews.filter((news) => news.tag === filter)
      setDisplayedNews(filteredNews)
    } else {
      setDisplayedNews(allNews)
    }
  }, [filter])

  return (
    <div className="min-h-screen flex flex-col items-start justify-start p-8 space-y-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl font-bold">Wildfire News & Updates</h1>
        <SearchNews />
      </div>

      <div>
       <FilterBar setFilter={setFilter}/>
      </div>

      {displayedNews.map((news) => (
        <NewsCard
          key={news.id}
          title={news.title}
          tag={news.tag}
          source={news.source}
          date={news.date}
          content={news.content}
          link={news.link}
        />
      ))}

    </div>
  )
}
