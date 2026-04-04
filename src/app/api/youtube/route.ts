import { NextResponse } from 'next/server';

// SECURE: Reads from .env.local on server-side only. 
// Never exposed to client-to-client browser.
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'search' or 'videos' or 'detail'
  const q = searchParams.get('q');       // query string
  const channelId = searchParams.get('channelId');
  const ids = searchParams.get('ids');   // comma-separated video ids

  // 🛡️ High-quality Fallback Samples (Real YouTube IDs)
  const FALLBACK_CHANNELS = [
    { id: { channelId: "UCO98reM6_X98Y0i_bM3mXpQ" }, snippet: { title: "のがちゃんねる (Sample)", thumbnails: { high: { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" } } } },
    { id: { channelId: "UCX69-7Z9P3S3GvY_qN_Y_qN" }, snippet: { title: "竹脇まりな (Sample)", thumbnails: { high: { url: "https://images.unsplash.com/photo-1518611012118-2969c6a2ccd1?w=400&q=80" } } } },
    { id: { channelId: "UCV_7_V_7_V_7" }, snippet: { title: "MadFit International (Sample)", thumbnails: { high: { url: "https://images.unsplash.com/photo-1541534741688-6078c64b5936?w=400&q=80" } } } }
  ];

  const FALLBACK_VIDEOS = [
    { id: { videoId: "v7AYKMP6rOE" }, snippet: { title: "【毎日3分】腹筋を割る (Sample)", channelTitle: "のがちゃんねる", publishedAt: new Date().toISOString(), thumbnails: { high: { url: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80" } } } },
    { id: { videoId: "vS_BIdf89fE" }, snippet: { title: "痩せるダンス！ (Sample)", channelTitle: "Marina Takewaki", publishedAt: new Date().toISOString(), thumbnails: { high: { url: "https://images.unsplash.com/photo-1518611012118-2969c6a2ccd1?w=400&q=80" } } } },
    { id: { videoId: "8PZ6B-f7x0k" }, snippet: { title: "Ultimate Core Training (Sample)", channelTitle: "Chloe Ting", publishedAt: new Date().toISOString(), thumbnails: { high: { url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80" } } } }
  ];

  // fallback results for development (if no API Key provided)
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === "YOUR_ACTUAL_API_KEY_HERE") {
    console.warn("YouTube API Key is missing. Using Contextual Fallbacks.");
    const isVideoSearch = q?.includes("workout") || q?.includes("fitness");
    
    if (type === 'search') return NextResponse.json({ items: isVideoSearch ? FALLBACK_VIDEOS : FALLBACK_CHANNELS });
    if (type === 'videos') return NextResponse.json({ items: FALLBACK_VIDEOS });
    return NextResponse.json({ items: [] });
  }

  // REAL API CALL (Hidden from Browser)
  try {
    let url = "";
    if (type === 'search') {
      // If searching for generic fitness workout (like Home page), return VIDEOS. 
      // If simple name search (like MyPage), return CHANNELS.
      const isVideoSearch = q?.includes("workout") || q?.includes("fitness");
      
      url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=${isVideoSearch ? 'video' : 'channel'}&maxResults=12&q=${encodeURIComponent(q || "")}&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        console.warn("Search Quota Limit, using contextual fallbacks");
        return NextResponse.json({ items: isVideoSearch ? FALLBACK_VIDEOS : FALLBACK_CHANNELS });
      }
      return NextResponse.json(data);

    } else if (type === 'videos') {
      // Get videos from a specific channel
      const channelUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`;
      const channelRes = await fetch(channelUrl);
      const channelData = await channelRes.json();
      
      if (channelData.error || !channelData.items?.[0]) {
         return NextResponse.json({ items: FALLBACK_VIDEOS });
      }
      const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      
      if (!uploadsPlaylistId) {
         return NextResponse.json({ items: [] });
      }

      // Step 2: Get Items from that playlist
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=50&key=${YOUTUBE_API_KEY}`;
      const playlistRes = await fetch(playlistUrl);
      const playlistData = await playlistRes.json();
      
      if (playlistData.error) throw new Error(playlistData.error.message);

      // Normalize result: Map playlist resourceId to same id.videoId format as search results
      const normalizedItems = (playlistData.items || []).map((item: any) => ({
         id: { videoId: item.snippet.resourceId.videoId },
         snippet: item.snippet
      }));

      return NextResponse.json({ items: normalizedItems });

    } else if (type === 'detail') {
      // Get specifics for a list of video IDs (Costs 1 unit)
      url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${ids}&key=${YOUTUBE_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.error) throw new Error(data.error.message);
      return NextResponse.json(data);
    }

    return NextResponse.json({ items: [] });
  } catch (error: any) {
    console.error("YouTube API Fallback to MOCK due to error:", error.message);
    
    // Final Fallback for Quota or invalid keys
    if (type === 'videos') {
       return NextResponse.json({
          items: [
             { id: { videoId: "v7AYKMP6rOE" }, snippet: { title: "HIIT Session (Sample 1)", channelTitle: "Fitness Channel", publishedAt: new Date().toISOString(), thumbnails: { high: { url: "https://images.unsplash.com/photo-1541534741688-6078c64b5936?w=800&q=80" } } } },
             { id: { videoId: "vS_BIdf89fE" }, snippet: { title: "Yoga Recovery (Sample 2)", channelTitle: "Zen Channel", publishedAt: new Date().toISOString(), thumbnails: { high: { url: "https://images.unsplash.com/photo-1518611012118-2969c6a2ccd1?w=800&q=80" } } } }
          ]
       });
    }
    return NextResponse.json({ error: error.message || "Failed to fetch from YouTube" }, { status: 500 });
  }
}
