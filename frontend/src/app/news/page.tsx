'use client'

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";

const categories = ["All", "Alerts", "Evacuations", "Weather", "General"];

const mockNews = [
  {
    id: 1,
    title: "New Evacuation Orders Issued for Northern California",
    summary: "Mandatory evacuations have been ordered for residents in the Paradise Pine area due to rapidly spreading wildfire.",
    category: "Evacuations",
    source: "CalFire",
    time: "5 minutes ago",
    imageUrl: "https://example.com/wildfire.jpg",
    isNew: true,
  },
  {
    id: 2,
    title: "High Wind Advisory: Increased Fire Risk",
    summary: "Weather service warns of strong winds up to 45mph, creating dangerous fire conditions in affected areas.",
    category: "Weather",
    source: "National Weather Service",
    time: "30 minutes ago",
    imageUrl: null,
    isNew: true,
  },
  {
    id: 3,
    title: "Fire Containment Reaches 45% in Sierra Forest",
    summary: "Firefighters make progress containing the wildfire that has burned over 5,000 acres.",
    category: "General",
    source: "US Forest Service",
    time: "2 hours ago",
    imageUrl: "https://example.com/containment.jpg",
    isNew: false,
  },
];

const NewsCard = ({ news }: { news: any }) => {
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
          <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-1">
            <Badge variant="secondary">{news.category}</Badge>
            <span>{news.source}</span>
            <span>•</span>
            <span>{news.time}</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsBookmarked(!isBookmarked)}
        >
          {isBookmarked ? (
            <BookmarkCheck className="h-4 w-4 text-info" />
          ) : (
            <Bookmark className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      <p className={`text-sm text-muted-foreground mt-2 ${
        isExpanded ? '' : 'line-clamp-2'
      }`}>
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
        <Button variant="ghost" size="icon" asChild>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </Card>
  );
};

export default function NewsSection(): React.ReactElement {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredNews = activeCategory === "All"
    ? mockNews
    : mockNews.filter(news => news.category === activeCategory);

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
