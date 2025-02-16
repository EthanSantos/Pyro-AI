"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { EvacShelterCard } from './EvacShelterCard';
import { Input } from "@/components/ui/input";

const categories = ["All", "Alerts", "General", "Shelters"];

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
  formattedSummary: string;
}

interface EvacShelter {
  id: number;
  name: string;
  address: string;
  information: string;
  lat: number;
  lng: number;
  date_created: string;
  regions: Region[];
  evacZoneStatuses: string[];
  region: string;
  capacity: number;
  distance?: number;
}

interface Region {
  id: number;
  display_name: string;
  state: string;
  evac_zone_style: string;
}

const NewsCard = ({ news }: { news: NewsItem }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldShowToggle, setShouldShowToggle] = useState(false);
  const maxHeight = 100; // Reduced from 200px to 100px

  useEffect(() => {
    if (contentRef.current) {
      setShouldShowToggle(contentRef.current.scrollHeight > maxHeight);
    }
  }, [news.formattedSummary]);

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

      <div className="relative">
        <div 
          ref={contentRef}
          className={`mt-2 text-sm overflow-hidden transition-all duration-200`}
          style={{ maxHeight: isExpanded ? `${contentRef.current?.scrollHeight}px` : `${maxHeight}px` }}
          dangerouslySetInnerHTML={{ __html: news.formattedSummary }}
        />
        {shouldShowToggle && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
        )}
      </div>
      
      <div className="flex justify-between items-center mt-4">
        {shouldShowToggle && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? "Show less" : "Read more"}
          </Button>
        )}
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
  const [shelters, setShelters] = useState<EvacShelter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchData() {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();
        
        if (data.success) {
          setNewsItems(prev => {
            const newItems = data.news.filter(
              (item: NewsItem) => !prev.some(p => p.id === item.id)
            );
            return [...newItems, ...prev];
          });
          setShelters(data.shelters);
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

  useEffect(() => {
    async function fetchShelters() {
      try {
        // Fetch shelters for both fire locations
        const [response1, response2] = await Promise.all([
          fetch('/api/shelters?lat=32.8622&lng=-117.237'),  // Gilman Fire
          fetch('/api/shelters?lat=33.708601&lng=-116.964339')  // Gibbel Fire
        ]);
        
        const data1 = await response1.json();
        const data2 = await response2.json();
        
        // Combine and deduplicate shelters
        const allShelters = [...data1.shelters, ...data2.shelters];
        const uniqueShelters = Array.from(
          new Map(allShelters.map(shelter => [shelter.id, shelter])).values()
        );
        
        // Sort by distance if available
        const sortedShelters = uniqueShelters.sort((a, b) => 
          (a.distance || 0) - (b.distance || 0)
        );
        
        setShelters(sortedShelters);
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    }

    fetchShelters();
  }, []);

  const filteredNews = activeCategory === "All"
    ? newsItems
    : newsItems.filter(news => news.category === activeCategory);

  const filteredShelters = shelters.filter(shelter => 
    (shelter.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (shelter.address?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

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

      {activeCategory === "Shelters" && (
        <Input
          placeholder="Search shelters by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      )}

      <ScrollArea className="h-[calc(100vh-220px)]">
        <div className="space-y-4 pr-4">
          {activeCategory === "Shelters" ? (
            filteredShelters.map(shelter => (
              <EvacShelterCard 
                key={shelter.id} 
                shelter={shelter} 
                distance={shelter.distance}
              />
            ))
          ) : (
            filteredNews.map(news => (
              <NewsCard key={news.id} news={news} />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 