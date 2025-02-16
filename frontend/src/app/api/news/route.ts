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
  notification_type: string;
  media: any[];
  embed_url: string;
}

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

// Category classification based on keywords
function classifyMessage(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('evacuate') || 
      lowerMessage.includes('leave') || 
      lowerMessage.includes('shelter') ||
      lowerMessage.includes('escape route')) {
    return 'Evacuations';
  }
  
  if (lowerMessage.includes('alert') || 
      lowerMessage.includes('warning') || 
      lowerMessage.includes('danger') ||
      lowerMessage.includes('emergency')) {
    return 'Alerts';
  }
  
  if (lowerMessage.includes('wind') || 
      lowerMessage.includes('weather') || 
      lowerMessage.includes('temperature') ||
      lowerMessage.includes('humidity') ||
      lowerMessage.includes('forecast')) {
    return 'Weather';
  }
  
  return 'General';
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
      category: classifyMessage(report.message),
      source: report.user_created.headline,
      time: new Date(report.date_created).toLocaleString(),
      imageUrl: report.media[0]?.url || null,
      isNew: false,
      embedUrl: report.embed_url || null
    }));

  return news;
}

export async function GET() {
  try {
    const news = await fetchWatchDutyUpdates();
    return NextResponse.json({ success: true, news });
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch news updates' },
      { status: 500 }
    );
  }
} 