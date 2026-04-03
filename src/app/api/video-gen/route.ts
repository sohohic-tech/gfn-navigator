import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    
    // Validate YouTube URL
    if (!url || !url.includes('youtube.com') && !url.includes('youtu.be')) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 });
    }

    // SIMULATION: In real implementation, we would:
    // 1. Fetch metadata from YouTube Data API (Safe Under TOS)
    // 2. Send metadata to Google Gemini Flash 2.0 API (Cost-Efficient)
    // 3. Generate summary, navigation points, and recommended products (Affiliate-ready)

    await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate AI processing

    // Mock API result (To be replaced with actual Gemini API calling when API key is provided)
    const result = {
      success: true,
      data: {
        id: `gen-${Date.now()}`,
        title: "AI Analysis: Your Request Video",
        aiIntroduction: "リクエストされた動画を解析しました。Gemini AIが規約を遵守しつつ、重要なトレーニングポイントを日本語で要約しています。",
        navigationItems: [
          { id: 1, time: 0, label: "ワークアウト開始", detail: "AIが推奨する正しいフォームで開始しましょう。" },
          { id: 2, time: 300, label: "休憩・水分補給", detail: "筋疲労を抑えるためのインターバルです。" }
        ],
        aiRecommendedProducts: [
          { id: "gen-p1", name: "AI推奨: リカバリードリンク", price: 1580, reason: "この動画の強度に合わせてAIが選定しました。", image: "https://images.unsplash.com/photo-1593094855826-63b70bc9075d?w=200&q=80", affiliateUrl: "https://example.com" }
        ],
        status: "APPROVED_BY_CURATOR" // Legal Safety Tag
      }
    };

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'AI Generation Failed' }, { status: 500 });
  }
}
