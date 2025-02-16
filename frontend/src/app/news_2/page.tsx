"use client"

import { useState, useEffect } from "react"
import NewsCard from "@/app/news_2/NewsCard"
import { FaSearch } from "react-icons/fa"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NewsItem } from "@/app/news_2/NewsCard"

function SearchNews({setSubmittedQuery} : {setSubmittedQuery: React.SetStateAction<any>}) {  
  const [isFocused, setIsFocused] = useState<Boolean>(false)
  const [query, setQuery] = useState<any>("")

  return(
    <div className="relative w-[400px] pr-4">
      <FaSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${isFocused ? "text-[#DD5A2B]" : "text-muted-foreground"}`}/>
      <Input
        type="text"
        placeholder="Search news..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setSubmittedQuery(e.target.value)
        }}
        className="p-2 pl-10 focus-visible:ring-[#DD5A2B]"
        onBlur={() => setIsFocused(false)}
        onFocus={() => setIsFocused(true)}
      />
    </div>
  )
}

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [filter, setFilter] = useState<String>("General")
  const [displayedNews, setDisplayedNews] = useState<NewsItem[]>([])
  const [submittedQuery, setSubmittedQuery] = useState<any>("")

  const filters = ["General", "Alerts", "Evacuations", "Weather"]

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchData() {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
          setAllNews(prev => {
            const newItems = data.news.filter(
              (item: NewsItem) => !prev.some(p => p.id === item.id)
            );
            return [...newItems, ...prev];
          });
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    intervalId = setInterval(fetchData, 5 * 60 * 1000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);
  
  // Filter results based on selected tag.
  useEffect(() => {
    if (submittedQuery) {
      const searchQuery = submittedQuery.toLowerCase();
      const filteredNews = allNews.filter((news) => 
        news.title.toLowerCase().includes(searchQuery) || 
        news.summary.toLowerCase().includes(searchQuery) ||
        news.source.toLowerCase().includes(searchQuery)
      );
      
      // Apply category filter to search results if not in General
      if (filter !== "General") {
        const categoryFiltered = filteredNews.filter(news => news.category === filter);
        setDisplayedNews(categoryFiltered);
      } else {
        setDisplayedNews(filteredNews);
      }
    } else {
      // When search is empty, show category filtered results
      if (filter === "General") {
        setDisplayedNews(allNews);
      } else {
        const filteredNews = allNews.filter((news) => news.category === filter);
        setDisplayedNews(filteredNews);
      }
    }
  }, [submittedQuery, filter, allNews]);

  if (loading) {
    return(
      <div className="min-h-screen flex flex-col items-start justify-start p-8 space-y-4">
        <div className="flex items-center justify-between w-full">
          <h1 className="text-3xl font-bold">Wildfire News & Updates</h1>
          <SearchNews setSubmittedQuery={setSubmittedQuery}/>
        </div>

        <Tabs defaultValue="General" className="w-full">
          <TabsList
            className="bg-[#DD5A2B] text-white"
          >
            {filters.map((filter) => (
              <TabsTrigger
                key={filter}
                value={filter}
                onClick={() => setFilter(filter)}
                className="data-[state=active]:bg-[#faded4]"
              >
                {filter}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-start justify-start p-8 space-y-4">
      <div className="flex items-center justify-between w-full">
        <h1 className="text-3xl font-bold">Wildfire News & Updates</h1>
        <SearchNews setSubmittedQuery={setSubmittedQuery}/>
      </div>

      <Tabs defaultValue="General" className="w-full">
        <TabsList
          className="bg-[#DD5A2B] text-white"
        >
          {filters.map((filter) => (
            <TabsTrigger
              key={filter}
              value={filter}
              onClick={() => setFilter(filter)}
              className="data-[state=active]:bg-[#faded4]"
            >
              {filter}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[calc(100vh-220px)] w-full">
        <div className="space-y-4 pr-4">
          {displayedNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </ScrollArea>

    </div>
  )
}
