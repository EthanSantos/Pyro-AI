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
  // Main shelters
  const pasadenaShelter: EvacShelter = {
    id: 40396,
    name: "Evacuation Shelter - Pasadena Convention Center",
    address: "300 E Green St, Pasadena, CA 91101, USA",
    information: `An evacuation shelter is available at the Pasadena Convention Center Exhibition Hall, 300 East Green Street, Pasadena, CA 91101 per the LA County website.

Parking is available at the parking structure across the street from the Convention Center, located at 155 E. Green St. Please enter from Marengo Ave.

Parking is also available at the Paseo parking structure, located at 360 E. Colorado Blvd. You are able to enter the structure from Colorado Blvd. or Green St.

The Humane Society is on-site to accept pets for boarding. Service animals will be allowed inside the Convention Center.

Residents are able to call 211 for information regarding shelters, and social and health services.`,
    lat: 34.14386382028022,
    lng: -118.14422219569809,
    date_created: "2025-01-08T06:01:28Z",
    regions: [{
      id: 22,
      display_name: "Los Angeles County",
      state: "CA",
      evac_zone_style: "order_warning_advisory"
    }],
    evacZoneStatuses: []
  };

  const westwoodShelter: EvacShelter = {
    id: 40348,
    name: "Evacuation Shelter - Westwood Recreation Center",
    address: "1350 S Sepulveda Blvd, Los Angeles, CA 90025, USA",
    information: `An Evacuation Shelter is located at Westwood Recreation Center, per LAFD. Small animals are accepted. Residents may remain overnight.

LADWP will be distributing bottled water to affected customers at the Westwood Recreation Center. The distribution is open 24 hours in coordination with American Red Cross.`,
    lat: 34.0532429,
    lng: -118.4484711,
    date_created: "2025-01-07T20:23:05Z",
    regions: [{
      id: 22,
      display_name: "Los Angeles County",
      state: "CA",
      evac_zone_style: "order_warning_advisory"
    }],
    evacZoneStatuses: []
  };

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

  return [pasadenaShelter, westwoodShelter, ...suggestedShelters];
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