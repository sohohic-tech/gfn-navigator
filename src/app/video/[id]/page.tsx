'use client';

import { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FitnessVideo } from '@/types/fitness';
import AffiliateSection from '@/components/video/AffiliateSection';
import { useUser } from '@/context/UserContext';
import { useTypewriter } from '@/hooks/useTypewriter';

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { userData, completeTraining, undoTraining, consumeAiStamina, rechargeAiStamina } = useUser();
  
  const [video, setVideo] = useState<FitnessVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [isCustomAdPlaying, setIsCustomAdPlaying] = useState(false);
  const [isAiUnlocked, setIsAiUnlocked] = useState(false);
  const [isVideoError, setIsVideoError] = useState(false);
  const [customRequest, setCustomRequest] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Data Fetching with smart error detection
  // ... (unchanged)

  const handleCustomRequest = () => {
    if (userData.aiStamina > 0) {
       setIsAiUnlocked(true); // Ensure AI is unlocked if they use stamina
       setIsAnalyzing(true);
       consumeAiStamina();
       // Simulate AI Magic
       setTimeout(() => {
          setIsAnalyzing(false);
          setCustomRequest("");
       }, 3000);
    } else {
       // Recharge via Ad
       setIsCustomAdPlaying(true);
       setTimeout(() => {
          setIsCustomAdPlaying(false);
          rechargeAiStamina();
       }, 4000);
    }
  };
  useEffect(() => {
    const loadVideoData = async () => {
      const startTime = Date.now();
      try {
        const res = await fetch('/api/video-gen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            url: id,
            lang: userData.language === 'en' ? 'English' : 'Japanese'
          })
        });
        const result = await res.json();
        
        if (result.success && result.data) {
          setVideo({
            ...result.data,
            id: id,
            youtubeId: result.data.id || id
          });
        } else {
          // Detect gone/deleted video immediately
          if (result.error === 'VIDEO_NOT_FOUND' || !result.data) {
            setIsVideoError(true);
            setVideo({ id: id, youtubeId: id } as any);
          } else {
            // AI Limit fallback (Video is still there)
            setVideo({
              id: id,
              youtubeId: id,
              title: "Workout Navigation",
              channel: "GFN AI Trainer",
              category: "HIIT",
              aiIntroduction: "現在AIエンジンが混み合っているため、動画のみ表示しています。通常通りトレーニング可能です。",
              navigationItems: [{ id: 1, time: 0, label: "ワークアウト開始", detail: "この動画に合わせて動きましょう。" }],
              aiRecommendedProducts: []
            });
          }
        }
      } catch (e) {
        console.error("Critical discovery fail:", e);
        setIsVideoError(true);
        setVideo({ id: id, youtubeId: id } as any);
      } finally {
        const elapsed = Date.now() - startTime;
        if (elapsed < 1200) await new Promise(r => setTimeout(r, 1200 - elapsed));
        setLoading(false);
      }
    };
    loadVideoData();
  }, [id, userData.language]);

  const onPlayerStateChange = (event: any) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if ((window as any).YT && event.data === (window as any).YT.PlayerState.PLAYING) {
      intervalRef.current = setInterval(() => {
        if (playerRef.current?.getCurrentTime) setCurrentTime(playerRef.current.getCurrentTime());
      }, 1000);
    }
  };

  useEffect(() => {
    if (!video || !video.youtubeId || loading || isVideoError) return;

    const initPlayer = () => {
      if ((window as any).YT?.Player) {
        if (playerRef.current) try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = new (window as any).YT.Player('player', {
          height: '100%', width: '100%', videoId: video.youtubeId,
          playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
          events: { 
            onStateChange: onPlayerStateChange,
            onError: () => setIsVideoError(true)
          }
        });
      }
    };

    if (!(window as any).YT) {
      const t = document.createElement('script');
      t.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(t);
      (window as any).onYouTubeIframeAPIReady = initPlayer;
    } else {
      initPlayer();
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [video, id, loading, isVideoError]);

  const seekTo = (seconds: number) => {
    if (playerRef.current?.seekTo) playerRef.current.seekTo(seconds, true);
  };

  const handleUnlockAi = () => {
    setIsAdPlaying(true);
    setTimeout(() => {
      setIsAdPlaying(false);
      setIsAiUnlocked(true);
    }, 3000);
  };

  const { displayedText } = useTypewriter(video?.aiIntroduction || "");

  if (loading || !video) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center font-black text-primary italic overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 animate-pulse" />
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary animate-ping opacity-50 mb-8" />
        <p className="text-xl animate-pulse uppercase">AI Scanning Wisdom...</p>
      </div>
    );
  }

  const isVideoCompleted = userData.completedVideoIds.includes(video.id);

  return (
    <main className="min-h-screen bg-black text-white pb-40 uppercase tracking-tight">
      <nav className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-primary font-black italic uppercase italic">← Home</Link>
        <span className="text-[10px] font-black text-gray-500 truncate max-w-[200px]">{video.title}</span>
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
      </nav>

      <div className="relative aspect-video w-full bg-zinc-900 border-b border-white/5 shadow-2xl flex items-center justify-center">
        <div id="player" className={`absolute inset-0 ${isVideoError ? 'opacity-0' : 'opacity-100'}`}></div>
        {isVideoError && (
          <div className="text-center p-8 space-y-4 animate-fade-in z-20">
             <div className="text-5xl mb-4">🌙</div>
             <h2 className="text-xl font-black italic tracking-tighter text-white">This workout is on a break</h2>
             <p className="text-[10px] text-gray-400 font-bold max-w-xs mx-auto leading-relaxed">
                申し訳ありません！この動画は現在メンテナンス中です。<br />別のワークアウトで汗を流しませんか？
             </p>
             <button onClick={() => router.push('/')} className="inline-block mt-4 px-8 py-3 bg-white/10 border border-white/10 rounded-full text-[10px] font-black text-primary">
               他のワークアウトを探す
             </button>
          </div>
        )}
      </div>

      <div className="px-6 py-8 space-y-12 animate-fade-in">
        <section className={`space-y-6 ai-blur-container ${!isAiUnlocked ? 'is-locked' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="text-primary font-black italic">AI</span>
            </div>
            <div>
              <h1 className="text-lg font-black leading-none text-white italic uppercase">{video.title || "Workout"}</h1>
              <p className="text-[10px] text-gray-500 font-bold mt-2 uppercase">Global AI Navigation</p>
            </div>
          </div>

          {/* AI Customizer Input - Stamina & Recharge logic */}
          <div className={`relative transition-all duration-700 ${!isAiUnlocked ? 'opacity-40 blur-[1px] pointer-events-none' : 'opacity-100'}`}>
             <div className="bg-white/5 border border-white/10 rounded-[32px] p-2 flex gap-2 ring-1 ring-white/5 hover:ring-primary/20 focus-within:ring-primary/40 transition-all">
                <input 
                  type="text"
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  placeholder={isAnalyzing ? "AIが自分専用に解析中..." : "AIにリクエスト（例：腰痛に配慮して、5分で等）"}
                  disabled={isAnalyzing}
                  className="flex-1 bg-transparent px-6 py-4 text-[11px] font-bold focus:outline-none text-white italic"
                />
                <button 
                  onClick={handleCustomRequest}
                  disabled={isAnalyzing}
                  className={`px-8 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${userData.aiStamina > 0 ? 'bg-primary text-black' : 'bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)]'}`}
                >
                  {isAnalyzing ? '...' : (userData.aiStamina > 0 ? 'アレンジ' : '⚡️ チャージ')}
                </button>
             </div>
             <div className="flex justify-between items-center mt-2 px-4">
                <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">
                   {userData.aiStamina > 0 ? (
                      `⚡️ 残り ${userData.aiStamina} 回特典 (期限：${userData.aiStaminaExpiresAt?.replace(/-/g, '/')} まで)`
                   ) : (
                      userData.aiStaminaExpiresAt && (new Date().toISOString().split('T')[0] > userData.aiStaminaExpiresAt) 
                      ? '⚡️ 無料体験期間が終了しました。広告チャージで復活！' 
                      : '⚡️ エナジー切れ（広告で3回分回復）'
                   )}
                </p>
                {!isAiUnlocked && (
                  <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">🔒 解放後に自分専用へアレンジ可能</p>
                )}
             </div>

             {/* Ad Layer for Customizer Recharge */}
             {isCustomAdPlaying && (
                 <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center p-8 animate-fade-in backdrop-blur-xl">
                    <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-8" />
                    <h2 className="text-2xl font-black italic text-white mb-2 uppercase">⚡️ Recharging AI Power</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">エナジーを満タンにチャージしています (4s)</p>
                 </div>
             )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <p className="text-sm text-gray-300 leading-relaxed italic relative z-10">
              「<span className="text-white opacity-100">{displayedText.slice(0, 30)}</span>
              <span className={!isAiUnlocked ? 'ai-blur-content' : ''}>{displayedText.slice(30)}</span>」
            </p>
          </div>
          
          {!isAiUnlocked && !isVideoError && (
            <div className="lock-overlay px-8">
              <button onClick={handleUnlockAi} className="bg-white text-black px-8 py-5 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">
                🔓 広告を見て AI分析を全解放 (FREE)
              </button>
            </div>
          )}
        </section>

        {video.aiRecommendedProducts && <AffiliateSection products={video.aiRecommendedProducts} />}

        {!isVideoError && (
          <section className={`space-y-4 ai-blur-container relative ${!isAiUnlocked ? 'is-locked pb-20' : ''}`}>
            <h2 className="text-[10px] font-black uppercase tracking-widest text-white/50 border-l-2 border-primary pl-3 italic">トレーニング手順</h2>
            <div className="space-y-3 ai-blur-content">
              {(video.navigationItems || []).map((item) => {
                const isPassed = currentTime >= item.time;
                const isNext = !isPassed && (currentTime + 30 >= item.time);
                return (
                  <button key={item.id} onClick={() => seekTo(item.time)} className={`w-full text-left p-5 rounded-3xl border transition-all duration-500 ${isPassed ? 'bg-primary/5 border-primary/20' : 'bg-white/5 border-white/10 opacity-40'} ${isNext ? 'ring-2 ring-primary bg-primary/10 opacity-100' : ''}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isPassed ? 'bg-primary text-black' : 'bg-white/10 text-gray-500'}`}>
                        {Math.floor(item.time / 60)}:{String(item.time % 60).padStart(2, '0')}
                      </span>
                    </div>
                    <h3 className="font-black text-sm text-white mb-1 uppercase">{item.label}</h3>
                    <p className="text-xs text-gray-400 font-medium">{item.detail}</p>
                  </button>
                );
              })}
            </div>

            {!isAiUnlocked && (
              <div 
                onClick={handleUnlockAi}
                className="absolute inset-0 flex flex-col items-start justify-start pt-16 pl-8 z-30 cursor-pointer group/lock bg-gradient-to-b from-black/20 via-transparent to-transparent"
              >
                  <div className="w-16 h-16 bg-zinc-900/80 border border-white/10 rounded-full flex items-center justify-center text-2xl shadow-3xl backdrop-blur-xl group-hover/lock:scale-110 active:scale-95 transition-all">
                     🔒
                  </div>
              </div>
            )}
          </section>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 glass border-t border-white/10 z-[60]">
        {!isVideoCompleted && !isVideoError ? (
          <button onClick={() => completeTraining(video.id)} className="w-full py-5 bg-primary text-black rounded-full font-black text-lg shadow-[0_0_40px_rgba(192,255,1,0.5)] uppercase italic">
            トレーニングを完了する
          </button>
        ) : (
          <div className="space-y-4">
            <button onClick={() => router.push('/')} className="w-full py-5 bg-white/10 text-primary rounded-full font-black text-center border border-primary animate-bounce">
              <span>🔥</span> お疲れ様でした！ (ホームへ戻る)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
