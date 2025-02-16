import { NextResponse } from 'next/server';

// Type definitions
interface WatchDutyReport {
  id: number;
  message: string;
  date_created: string;
  date_modified: string;
  user_created: {
    display_name: string;
    headline: string;
  };
  media: any[];
  embed_url: string;
}

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  formattedSummary: string;
  category: string;
  source: string;
  time: string;
  imageUrl: string | null;
  isNew: boolean;
  embedUrl: string | null;
}

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

interface Shelter {
  id: number;
  name: string;
  address: string;
  region: string;
  lat: number;
  lng: number;
  capacity: number;
  information: string;
  date_created: string;
}

// Category classification based on keywords
function classifyMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('alert') || 
      lowerMessage.includes('warning') || 
      lowerMessage.includes('danger') ||
      lowerMessage.includes('emergency')) {
    return 'Alerts';
  }
  
  return 'General';
}

function formatMessage(message: string): string {
  // Handle WCK meal distribution lists
  if (message.includes('World Central Kitchen (WCK)')) {
    const locations = message.split('Location:').filter(Boolean);
    const intro = locations.shift() || '';
    
    const formattedLocations = locations.map(loc => {
      const [nameAndTime, ...addressParts] = loc.split('\n');
      const [name, timeService] = nameAndTime.split('Time of Service:');
      const address = addressParts.join(' ').trim();
      const hasWater = address.includes('*Water');
      const waterNote = hasWater ? 
        `<div class="text-info text-sm mt-1">* Water distribution available at this location</div>` : '';

      return `
        <div class="mb-4 p-3 border rounded-md">
          <div class="font-medium">${name.trim()}</div>
          <div class="text-sm text-muted-foreground">
            Hours: ${timeService.trim()}
          </div>
          <div class="text-sm mt-1">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}" 
               target="_blank" 
               class="text-blue-500 hover:underline">
              ${address.replace('*', '')}
            </a>
          </div>
          ${waterNote}
        </div>`;
    }).join('');

    return `
      <div>
        <p class="mb-4">${intro.trim()}</p>
        <div class="grid gap-4 md:grid-cols-2">
          ${formattedLocations}
        </div>
      </div>
    `;
  }

  // Handle general messages with links
  return message
    .split('\n')
    .filter(line => line.trim())
    .map(line => {
      // Convert URLs to clickable links
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const lineWithLinks = line.replace(urlRegex, url => 
        `<a href="${url}" target="_blank" class="text-blue-500 hover:underline">${url}</a>`
      );
      
      // Add paragraph tags
      return `<p class="mb-2">${lineWithLinks}</p>`;
    })
    .join('');
}

async function fetchWatchDutyUpdates(): Promise<NewsItem[]> {
  const response = await fetch(
    'https://api.watchduty.org/api/v1/reports/?geo_event_id=40335&is_moderated=true&is_active=true&limit=20&offset=0',
    { next: { revalidate: 300 } } // Cache for 5 minutes
  );

  if (!response.ok) {
    throw new Error('Failed to fetch updates');
  }

  const data = await response.json();
  
  // Calculate date 2 weeks ago
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  // Transform and filter the reports to only show last 2 weeks
  const news: NewsItem[] = data.results
    .filter((report: WatchDutyReport) => {
      const reportDate = new Date(report.date_created);
      return reportDate >= twoWeeksAgo;
    })
    .map((report: WatchDutyReport) => ({
      id: report.id,
      title: `Update from ${report.user_created.display_name}`,
      summary: report.message,
      formattedSummary: formatMessage(report.message),
      category: classifyMessage(report.message),
      source: report.user_created.headline,
      time: new Date(report.date_created).toLocaleString(),
      imageUrl: report.media[0]?.url || null,
      isNew: false,
      embedUrl: report.embed_url || null
    }));

  return news;
}

async function fetchEvacShelters(): Promise<EvacShelter[]> {
  // Suggested nearby shelters
  const suggestedShelters: EvacShelter[] = [
    {
      id: 40398,
      name: "Palm Springs Convention Center",
      address: "277 N Avenida Caballeros, Palm Springs, CA 92262",
      information: "",
      lat: 33.8303,
      lng: -116.5453,
      date_created: "2025-01-08T06:01:28Z",
      regions: [],
      evacZoneStatuses: []
    },
    {
      id: 40399,
      name: "Beaumont Civic Center",
      address: "550 E 6th St, Beaumont, CA 92223",
      information: "",
      lat: 33.9293,
      lng: -116.9773,
      date_created: "2025-01-08T06:01:28Z",
      regions: [],
      evacZoneStatuses: []
    },
    {
      id: 40400,
      name: "Banning Community Center",
      address: "789 N San Gorgonio Ave, Banning, CA 92220",
      information: "",
      lat: 33.9272,
      lng: -116.8765,
      date_created: "2025-01-08T06:01:28Z",
      regions: [],
      evacZoneStatuses: []
    }
  ];

  // Main shelters
  const shelters: EvacShelter[] = [
    {
      id: 1,
      name: "Pasadena Emergency Shelter",
      address: "285 E Walnut St, Pasadena",
      regions: [{
        id: 22,
        display_name: "Los Angeles County",
        state: "CA",
        evac_zone_style: "order_warning_advisory"
      }],
      information: "24/7 emergency services available",
      lat: 34.1478,
      lng: -118.1445,
      date_created: new Date().toISOString(),
      capacity: 200,
      evacZoneStatuses: []
    },
    {
      id: 2,
      name: "Pasadena Community Center",
      address: "1750 N Altadena Dr",
      regions: [{
        id: 22,
        display_name: "Los Angeles County",
        state: "CA",
        evac_zone_style: "order_warning_advisory"
      }],
      information: "Full emergency services and medical care",
      lat: 34.1675,
      lng: -118.1309,
      capacity: 225,
      evacZoneStatuses: []
    },
    {
      id: 3,
      name: "Rose Bowl Emergency Shelter",
      address: "1001 Rose Bowl Dr",
      regions: [{
        id: 22,
        display_name: "Los Angeles County",
        state: "CA",
        evac_zone_style: "order_warning_advisory"
      }],
      information: "Large capacity venue with full amenities",
      lat: 34.1613,
      lng: -118.1676,
      capacity: 400,
      evacZoneStatuses: []
    },
    {
      id: 4,
      name: "Evacuation Shelter - Pasadena Convention Center",
      address: "300 E Green St, Pasadena, CA 91101",
      regions: [{
        id: 22,
        display_name: "Los Angeles County",
        state: "CA",
        evac_zone_style: "order_warning_advisory"
      }],
      information: "Large convention center with full facilities",
      lat: 34.1436,
      lng: -118.1386,
      capacity: 1000,
      evacZoneStatuses: []
    },
    {
      id: 5,
      name: "Evacuation Shelter - Westwood Recreation Center",
      address: "1350 S Sepulveda Blvd, Los Angeles, CA 90025",
      regions: [{
        id: 22,
        display_name: "Los Angeles County",
        state: "CA",
        evac_zone_style: "order_warning_advisory"
      }],
      information: "Recreation center with emergency services",
      lat: 34.0532,
      lng: -118.4484,
      capacity: 300,
      evacZoneStatuses: []
    },
    // Keep existing shelters
    ...suggestedShelters
  ];

  return shelters;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

export async function GET() {
  try {
    const [news, shelters] = await Promise.all([
      fetchWatchDutyUpdates(),
      fetchEvacShelters()
    ]);
    return NextResponse.json({ 
      success: true, 
      news,
      shelters 
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch updates' },
      { status: 500 }
    );
  }
} 