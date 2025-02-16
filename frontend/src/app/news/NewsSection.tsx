"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";

const categories = ["All", "Alerts", "Evacuations", "Weather", "General"];

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  source: string;
  time: string;
  imageUrl: string | null;
  isNew: boolean;
  embedUrl: string | null;
}

const NewsCard = ({ news }: { news: NewsItem }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className={`p-4 glass-card relative ${news.isNew ? 'animate-fade-in' : ''}`}>
      {news.isNew && (
        <Badge className="absolute top-3 right-3 bg-info hover:bg-info">New</Badge>
      )}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold">{news.title}</h3>
          <div className="flex gap-2 text-sm text-muted-foreground">
            <span>{news.source}</span>
            <span>•</span>
            <span>{news.time}</span>
          </div>
        </div>
      </div>

      <p className={`mt-2 text-sm ${isExpanded ? '' : 'line-clamp-3'}`}>
        {news.summary}
      </p>
      
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Show less" : "Read more"}
        </Button>
        {news.embedUrl && (
          <Button variant="ghost" size="icon" asChild>
            <a href={news.embedUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default function NewsSection() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchNews() {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
          setNewsItems(prev => {
            // Combine new items with existing ones, avoiding duplicates
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

    // Fetch immediately
    fetchNews();
    
    // Then set up the interval for subsequent fetches
    intervalId = setInterval(fetchNews, 5 * 60 * 1000); // Poll every 5 minutes

    // Cleanup on unmount
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  const filteredNews = activeCategory === "All"
    ? newsItems
    : newsItems.filter(news => news.category === activeCategory);

  if (loading) {
    return <div>Loading news updates...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="All" className="w-full">
        <TabsList>
          {categories.map(category => (
            <TabsTrigger
              key={category}
              value={category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-4 pr-4">
          {filteredNews.map(news => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
} 