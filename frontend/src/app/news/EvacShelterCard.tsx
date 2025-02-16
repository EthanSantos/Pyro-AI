import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface Region {
  id: number;
  display_name: string;
  state: string;
  evac_zone_style: string;
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
}

export function EvacShelterCard({ shelter }: { shelter: EvacShelter }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMapClick = () => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${shelter.lat},${shelter.lng}`);
  };

  return (
    <Card 
      className="p-4 glass-card cursor-pointer hover:bg-accent/50 transition-colors"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{shelter.name}</h3>
          <p className="text-sm text-muted-foreground">{shelter.address}</p>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleMapClick();
          }}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2">
          <div className="text-sm">
            <p className="font-medium mb-1">Information:</p>
            <p className="whitespace-pre-wrap text-muted-foreground">{shelter.information}</p>
          </div>
          
          {shelter.regions.length > 0 && (
            <div className="text-sm">
              <p className="font-medium mb-1">Regions:</p>
              {shelter.regions.map(region => (
                <div key={region.id} className="ml-2 text-muted-foreground">
                  • {region.display_name}, {region.state}
                  {region.evac_zone_style && (
                    <span className="ml-2 text-xs">({region.evac_zone_style})</span>
                  )}
                </div>
              ))}
            </div>
          )}
          
          <div className="text-xs text-muted-foreground mt-4">
            <p>Opened: {new Date(shelter.date_created).toLocaleString()}</p>
          </div>
        </div>
      )}
    </Card>
  );
} 