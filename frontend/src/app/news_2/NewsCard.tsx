import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { SquareArrowOutUpRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useState, useEffect, useRef } from "react"

export interface NewsItem {
    id: number;
    title: string;
    summary: string;
    category: string;
    source: string;
    time: string;
    imageUrl: string | null;
    embedUrl: string | null;
    formattedSummary: string;
}

const NewsCard = ({ news }: { news: NewsItem }) => {
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
        <Card className="glass-card relative">
        <CardHeader className="pb-4">
            <CardTitle className="text-xl pb-1">{news.title}</CardTitle>
            <div className="flex items-center space-x-2">
                <Badge variant="outline">{news.category}</Badge>
                <CardDescription>{news.source}</CardDescription>
                <CardDescription>•</CardDescription>
                <CardDescription>{news.time}</CardDescription>
            </div>
        </CardHeader>
  
        <CardContent className="w-[95%]">
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
        </CardContent>
        
        <CardFooter className="items-start justify-between">
            <div>
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

            <SquareArrowOutUpRight /> {/** TODO: Make this icon clickable + link it to website with more info. */}
        </CardFooter>

      </Card>
    );
};  

export default NewsCard