'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

export default function Home() {
  const { userData, isLoading, unlockFullLibrary } = useUser();
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const lang = userData.language || 'ja';

  useEffect(() => {
    // Fetch all videos from all subscribed channels
    const fetchAllSubscribedVideos = async () => {
      const channelIds = userData.favoriteTrainers.map(t => t.id);
      if (channelIds.length === 0) return;

      const results = await Promise.all(channelIds.map(async id => {
         const res = await fetch(`/api/youtube?type=videos&channelId=${id}`);
         const data = await res.json();
         return data.items || [];
      }));
      
      const flattened = results.flat();
      // Ensure unique videos by ID
      const uniqueVideos = Array.from(new Map(flattened.map((item: any) => {
         const vid = typeof item.id === 'string' ? item.id : item.id.videoId;
         return [vid, item];
      })).values());

      setAllVideos(uniqueVideos.sort((a: any, b: any) => new Date(b.snippet.publishedAt).getTime() - new Date(a.snippet.publishedAt).getTime()));
    };

    if (!isLoading) fetchAllSubscribedVideos();
  }, [userData.favoriteTrainers, isLoading]);

  const handleUnlock = () => {
    setIsAdPlaying(true);
    setTimeout(() => {
       setIsAdPlaying(false);
       unlockFullLibrary();
    }, 4000); // 4s Ad Simulation
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-primary">LOADING...</div>;

  const content = {
    ja: {
        hero: "世界と繋がる、あなただけのフィットネス",
        tagline: "購読中のトレーナーによる最新トレーニングを分析しました。",
        section: "あなたへの特別メニュー",
        unlockBtn: "🔒 広告を見て 15本以上の過去動画を全解放 (FREE)",
        adLoading: "⌛ 広告視聴中 (収益でAPIコストを賄っています)...",
        empty: "マイページから配信者を購読して、あなただけのプログラムを作りましょう。"
    },
    en: {
        hero: "Exclusive Global Wisdom.",
        tagline: "Analyzing latest workouts from your subscriptions.",
        section: "Personalized For You",
        unlockBtn: "🔒 Watch Ad to Unlock Full Library (FREE)",
        adLoading: "⌛ Watching Ad (Generating API Revenue)...",
        empty: "Subscribe to trainers in My Page to build your program."
    }
  }[lang];

  // Display limited items (5) unless unlocked
  const displayVideos = userData.isFullLibraryUnlocked ? allVideos : allVideos.slice(0, 5);

  return (
    <main className="min-h-screen pb-40 bg-black text-white max-w-7xl mx-auto border-x border-white/5 shadow-2xl overflow-x-hidden">
      <nav className="sticky top-0 z-50 glass px-6 py-4 flex justify-between items-center shadow-2xl border-b border-white/5">
        <h1 className="text-xl font-black italic tracking-tighter uppercase">GFN<span className="text-primary italic">.</span></h1>
        <Link href="/mypage" className="bg-white/10 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all">マイページ</Link>
      </nav>

      <header className="px-6 pt-16 pb-12 text-center animate-fade-in relative bg-gradient-to-b from-primary/5 to-transparent">
        <h2 className="text-4xl md:text-5xl font-black mb-6 leading-tight italic uppercase tracking-tighter">{content.hero}</h2>
        <p className="text-gray-400 text-[10px] md:text-[11px] max-w-md mx-auto leading-relaxed font-bold uppercase tracking-[0.2em]">{content.tagline}</p>
      </header>

      <section className="px-6 space-y-12 animate-fade-in">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 border-l-4 border-primary pl-3 italic">{content.section}</h3>
        
        {allVideos.length === 0 ? (
          <div className="text-center py-20 italic text-gray-500 text-xs px-10 leading-loose">{content.empty}</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {displayVideos.map((video: any) => {
                const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
                const isCompleted = userData.completedVideoIds.includes(videoId);
                
                return (
                  <Link 
                    href={`/video/${videoId}`} 
                    key={videoId} 
                    className={`group relative bg-zinc-900 border rounded-[40px] overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer block hover:scale-[1.01] active:scale-[0.98] ${isCompleted ? 'border-primary/40' : 'border-white/5 hover:border-primary/20'}`}
                  >
                    {isCompleted && (
                      <div className="absolute top-6 right-6 z-20 bg-primary text-black text-[10px] font-black px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(192,255,1,0.5)] flex items-center gap-1 italic uppercase animate-fade-in">
                        ✓ 完了済み
                      </div>
                    )}
                    <div className="aspect-video relative overflow-hidden">
                      <img src={video.snippet.thumbnails.high.url} alt="t" className={`object-cover w-full h-full transition-transform duration-700 ${isCompleted ? 'opacity-50 grayscale-[0.5]' : 'group-hover:scale-105'}`} />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-6 left-6 right-6">
                          <h4 className="text-xl font-black text-white italic uppercase tracking-tighter leading-tight line-clamp-2">{video.snippet.title}</h4>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-2"><p className="text-[9px] text-primary font-black uppercase tracking-widest italic">{video.snippet.channelTitle}</p></div>
                      <div className="bg-white/5 rounded-[28px] p-6 italic text-[11px] text-gray-400 leading-relaxed group-hover:bg-white/10 transition-colors border border-white/5">
                        「AI分析ガイドを生成済み。正しい姿勢とタイミングをガイドします。」
                      </div>
                      <div className={`w-full py-5 rounded-[24px] text-[10px] font-black flex items-center justify-center gap-2 transition-all shadow-2xl uppercase italic ${isCompleted ? 'bg-zinc-800 text-gray-400 border border-white/10' : 'bg-white text-black'}`}>
                        {isCompleted ? 'もう一度トレーニングする' : 'プログラムを開始する'} <span>→</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* AD UNLOCK SECTION */}
            {!userData.isFullLibraryUnlocked && allVideos.length > 5 && (
               <div className="pt-10">
                  <button 
                     onClick={handleUnlock}
                     disabled={isAdPlaying}
                     className="w-full bg-gradient-to-br from-indigo-900/40 via-primary/10 to-indigo-900/40 border border-primary/20 p-8 rounded-[40px] shadow-2xl text-center space-y-4 hover:scale-[1.01] transition-all disabled:opacity-50"
                  >
                     <div className="w-12 h-12 bg-white/5 mx-auto rounded-full flex items-center justify-center text-xl">🎁</div>
                     <p className="text-[10px] font-black text-white italic uppercase tracking-widest">
                        {isAdPlaying ? content.adLoading : content.unlockBtn}
                     </p>
                  </button>
               </div>
            )}
          </>
        )}
      </section>
      
      <footer className="mt-20 py-10 border-t border-white/5 text-center px-6 space-y-4">
        <Link href="/about" className="text-[10px] text-gray-400 font-bold uppercase tracking-widest hover:text-primary transition-colors">
          About App — アプリについて
        </Link>
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} なぎさのお星サマ制作委員会</p>
      </footer>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 glass px-8 md:px-12 py-5 rounded-full flex gap-8 md:gap-12 border border-white/10 shadow-3xl z-50 whitespace-nowrap">
        <Link href="/" className="text-primary text-[10px] font-black border-b border-primary">ホーム</Link>
        <Link href="/mypage" className="text-gray-500 text-[10px] font-black">マイページ</Link>
      </div>
    </main>
  );
}
