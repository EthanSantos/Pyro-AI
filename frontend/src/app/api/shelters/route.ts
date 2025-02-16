import { NextResponse } from 'next/server';

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

const shelters: Shelter[] = [
  {
    id: 1,
    name: "San Diego Emergency Center",
    address: "4000 La Jolla Village Dr",
    region: "La Jolla",
    lat: 32.8700,
    lng: -117.2200,
    capacity: 250,
    information: "Full medical facilities available",
    date_created: new Date().toISOString()
  },
  {
    id: 2,
    name: "Hemet Community Shelter",
    address: "1200 State Street",
    region: "Hemet",
    lat: 33.7100,
    lng: -116.9700,
    capacity: 200,
    information: "Pet-friendly facility",
    date_created: new Date().toISOString()
  },
  {
    id: 3,
    name: "UCSD Evacuation Site",
    address: "9500 Gilman Dr",
    region: "La Jolla",
    lat: 32.8800,
    lng: -117.2350,
    capacity: 500,
    information: "Large capacity facility with medical support",
    date_created: new Date().toISOString()
  },
  {
    id: 4,
    name: "Pasadena Emergency Shelter",
    address: "285 E Walnut St",
    region: "Pasadena",
    lat: 34.1478,
    lng: -118.1445,
    capacity: 200,
    information: "24/7 emergency services available",
    date_created: new Date().toISOString()
  },
  {
    id: 5,
    name: "Westwood Community Center",
    address: "1350 S Sepulveda Blvd",
    region: "Westwood",
    lat: 34.0635,
    lng: -118.4452,
    capacity: 150,
    information: "Food and medical supplies available",
    date_created: new Date().toISOString()
  },
  {
    id: 6,
    name: "Downtown LA Shelter",
    address: "1400 S Main St",
    region: "Downtown",
    lat: 34.0522,
    lng: -118.2437,
    capacity: 300,
    information: "Large capacity emergency shelter",
    date_created: new Date().toISOString()
  },
  {
    id: 7,
    name: "Valley Emergency Center",
    address: "15100 Valley Blvd",
    region: "San Fernando Valley",
    lat: 34.1478,
    lng: -118.3568,
    capacity: 250,
    information: "Family-friendly facility",
    date_created: new Date().toISOString()
  },
  {
    id: 8,
    name: "Long Beach Safe Haven",
    address: "2100 Ocean Blvd",
    region: "Long Beach",
    lat: 33.9283,
    lng: -118.1157,
    capacity: 175,
    information: "Coastal evacuation center",
    date_created: new Date().toISOString()
  },
  {
    id: 9,
    name: "Pasadena Community Center",
    address: "1750 N Altadena Dr",
    region: "Pasadena",
    lat: 34.1675,
    lng: -118.1309,
    capacity: 225,
    information: "Full emergency services and medical care",
    date_created: new Date().toISOString()
  },
  {
    id: 10,
    name: "Rose Bowl Emergency Shelter",
    address: "1001 Rose Bowl Dr",
    region: "Pasadena",
    lat: 34.1613,
    lng: -118.1676,
    capacity: 400,
    information: "Large capacity venue with full amenities",
    date_created: new Date().toISOString()
  },
  {
    id: 11,
    name: "San Diego Convention Center",
    address: "111 W Harbor Dr, San Diego, CA 92101",
    region: "San Diego",
    lat: 32.7113,
    lng: -117.1625,
    capacity: 1000,
    information: "Large capacity shelter with medical support",
    date_created: new Date().toISOString()
  },
  {
    id: 12,
    name: "San Diego High School",
    address: "1700 12th Ave, San Diego, CA 92101",
    region: "San Diego",
    lat: 32.7110,
    lng: -117.1570,
    capacity: 500,
    information: "Emergency shelter with food and supplies",
    date_created: new Date().toISOString()
  },
  {
    id: 13,
    name: "San Diego State University Shelter",
    address: "5500 Campanile Dr, San Diego, CA 92182",
    region: "San Diego",
    lat: 32.7743,
    lng: -117.0710,
    capacity: 600,
    information: "Emergency shelter with food and medical supplies",
    date_created: new Date().toISOString()
  },
  {
    id: 14,
    name: "Mission Valley Shelter",
    address: "12345 Mission Valley Rd, San Diego, CA 92120",
    region: "San Diego",
    lat: 32.7750,
    lng: -117.1500,
    capacity: 400,
    information: "Shelter with full amenities and support services",
    date_created: new Date().toISOString()
  },
  {
    id: 15,
    name: "Chula Vista Community Center",
    address: "276 Fourth Ave, Chula Vista, CA 91910",
    region: "San Diego",
    lat: 32.6401,
    lng: -117.0842,
    capacity: 300,
    information: "Community center serving as an emergency shelter",
    date_created: new Date().toISOString()
  }
];

function findNearestShelters(lat: number, lng: number, maxDistance: number = 20) {
  return shelters.filter(shelter => {
    const distance = calculateDistance(lat, lng, shelter.lat, shelter.lng);
    return distance <= maxDistance;
  }).map(shelter => ({
    ...shelter,
    distance: calculateDistance(lat, lng, shelter.lat, shelter.lng)
  }));
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get('lat') || '0');
  const lng = parseFloat(searchParams.get('lng') || '0');

  if (lat && lng) {
    const nearestShelters = findNearestShelters(lat, lng);
    return NextResponse.json({ shelters: nearestShelters });
  }

  return NextResponse.json({ shelters });
} 