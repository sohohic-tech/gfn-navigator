import { NextResponse } from 'next/server';

// SECURE: Reads from .env.local on server-side only. 
// Never exposed to client-to-client browser.
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'search' or 'videos'
  const q = searchParams.get('q');       // query string
  const channelId = searchParams.get('channelId');

  // fallback results for development (if no API Key provided)
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_ACTUAL_API_KEY_HERE") {
    console.warn("YouTube API Key is missing or invalid in .env.local. Running in MOCK mode.");
    
    if (type === 'search') {
      return NextResponse.json({
        items: [{
          id: { channelId: `mock-ch-${q}` },
          snippet: {
            title: `${q} Official (MOCK)`,
            description: "Please set your YOUTUBE_API_KEY in .env.local to see real data.",
            thumbnails: { high: { url: `https://api.dicebear.com/7.x/identicon/svg?seed=${q}` } }
          }
        }]
      });
    }
    return NextResponse.json({ items: [] });
  }

  // REAL API CALL (Hidden from Browser)
  try {
    let url = "";
    if (type === 'search') {
      // Find channels by name
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=5&q=${encodeURIComponent(q || "")}&key=${YOUTUBE_API_KEY}`;
    } else if (type === 'videos') {
      // Get latest 50 videos from specific channel
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=date&maxResults=50&type=video&key=${YOUTUBE_API_KEY}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
       console.error("YouTube API error response:", data.error);
       return NextResponse.json({ error: data.error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Internal Server Error fetching YouTube data:", error);
    return NextResponse.json({ error: "Failed to fetch from YouTube" }, { status: 500 });
  }
}
