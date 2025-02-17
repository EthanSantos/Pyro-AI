import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';

interface EvacShelter {
  name: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  capacity: number;
  information?: string;
  date_created: string;
}

export function EvacShelterCard({ shelter, distance }: { shelter: EvacShelter; distance?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="p-4 glass-card cursor-pointer hover:bg-accent/50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{shelter.name}</h3>
          <p className="text-sm text-muted-foreground">{shelter.address}</p>
          {distance && (
            <p className="text-xs text-orange-500 mt-1">
              {distance.toFixed(1)} km away
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            window.open(`https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`);
          }}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <p className="font-medium mb-1">Capacity:</p>
            <p className="text-muted-foreground">{shelter.capacity} people</p>
          </div>
          
          <div className="text-sm">
            <p className="font-medium mb-1">Region:</p>
            <p className="text-muted-foreground">{shelter.region}</p>
          </div>
          
          <div className="text-xs text-muted-foreground mt-4">
            <p>Updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      )}
    </Card>
  );
} 