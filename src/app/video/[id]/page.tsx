'use client';

import { useState, useRef, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FitnessVideo } from '@/types/fitness';
import AffiliateSection from '@/components/video/AffiliateSection';
import { useUser } from '@/context/UserContext';

// Mock video data
const VIDEO_DATABASE: Record<string, FitnessVideo> = {
  "1": {
    id: "1",
    title: "15-Minute Morning HIIT",
    youtubeId: "v7AYKMP6rOE", // DUMMY ID
    channel: "Fitness Pro Global",
    category: 'HIIT',
    aiIntroduction: "このHIITは、一日の代謝を最大限に高めるために設計されています。特に関節への負担が少ない動きを中心に、短時間で脂肪燃焼を促します。",
    navigationItems: [
      { id: 1, time: 0, label: "準備運動 (Warm-up)", detail: "肩回りと股関節を動かして体温を上げます。" },
      { id: 2, time: 180, label: "メインセット1: バーピー", detail: "全身を使った運動です。腰を反らさないよう注意。" },
      { id: 3, time: 540, label: "メインセット2: スクワット", detail: "腹筋に力を入れ姿勢を保ちます。" },
    ],
    aiRecommendedProducts: [
      { id: "p1", name: "燃焼系サプリメント(BCAA)", price: 2980, reason: "HIIT中の筋肉分解を防ぎ、燃焼効率を高めます。", image: "https://images.unsplash.com/photo-1593094855826-63b70bc9075d?w=200&q=80" },
      { id: "p2", name: "滑り止めヨガマット", price: 3500, reason: "激しい動きでも滑らず、関節を保護します。", image: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=200&q=80" }
    ]
  },
  "2": {
    id: "2",
    title: "Deep Stretch for Recovery",
    youtubeId: "v7AYKMP6rOE", // DUMMY ID
    channel: "Yoga Zen",
    category: 'Yoga',
    aiIntroduction: "深い呼吸と共に心身をリセットするリカバリープログラムです。",
    navigationItems: [
      { id: 1, time: 0, label: "イントロダクション", detail: "基本的な呼吸法を確認。" },
      { id: 2, time: 300, label: "ハムストリングの伸展", detail: "リラックスして伸ばします。" }
    ],
    aiRecommendedProducts: [
      { id: "p3", name: "リラックスアロマオイル", price: 1800, reason: "深い呼吸を助け、自律神経を整えます。", image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=200&q=80" }
    ]
  }
};

export default function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // If id is in database, use it. Otherwise, assume it's a direct YouTube ID.
  const video = VIDEO_DATABASE[id] || {
    id: id,
    title: "AI Analysis Mode",
    youtubeId: id,
    channel: "Global Fitness Navigator",
    category: 'Strength',
    aiIntroduction: "最新のYouTube動画に基づき、AIがトレーニングメニューを自動解析しています。適切なフォーム、呼吸、そして休憩のタイミングをサポートします。",
    navigationItems: [
      { id: 1, time: 0, label: "準備運動", detail: "体の柔軟性を高め、トレーニングに備えます。" },
      { id: 2, time: 60, label: "メインパート 1", detail: "正しい姿勢を意識して動き続けましょう。" },
      { id: 3, time: 300, label: "メインパート 2", detail: "呼吸を止めず、心拍数を一定に保ちます。" },
    ],
    aiRecommendedProducts: [
      { id: "p4", name: "プロテイン (Whey)", price: 4200, reason: "トレーニング後の筋修復を助けます。", image: "https://images.unsplash.com/photo-1593094855826-63b70bc9075d?w=200&q=80" }
    ]
  };
  const [currentTime, setCurrentTime] = useState(0);
  const [isAdPlaying, setIsAdPlaying] = useState(false);
  const [isAiUnlocked, setIsAiUnlocked] = useState(false);
  const playerRef = useRef<any>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const { userData, completeTraining, undoTraining } = useUser();
  const isVideoCompleted = userData.completedVideoIds.includes(video.id);

  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    const onPlayerStateChange = (event: any) => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (event.data === (window as any).YT.PlayerState.PLAYING) {
        intervalRef.current = setInterval(() => {
          if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
            const time = playerRef.current.getCurrentTime();
            setCurrentTime(time);
          }
        }, 1000);
      }
    };

    (window as any).onYouTubeIframeAPIReady = () => {
      if (playerRef.current) playerRef.current.destroy();
      playerRef.current = new (window as any).YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: video.youtubeId,
        events: { 'onStateChange': onPlayerStateChange }
      });
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (playerRef.current) playerRef.current.destroy();
    };
  }, [video.youtubeId]);


  const seekTo = (seconds: number) => {
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      playerRef.current.seekTo(seconds, true);
    }
  };

  const handleUnlockAi = () => {
    setIsAdPlaying(true);
    // Simulate Ad viewing (3 seconds)
    setTimeout(() => {
      setIsAdPlaying(false);
      setIsAiUnlocked(true);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-black text-white pb-40">
      <nav className="glass px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="text-primary font-black flex items-center gap-2 italic uppercase tracking-tighter">
          ← <span className="text-xs">ホーム</span>
        </Link>
        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest truncate max-w-[120px]">{video.title}</span>
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
      </nav>

      <div className="relative aspect-video w-full bg-zinc-900 border-b border-white/5 shadow-2xl">
        <div id="player" className="absolute inset-0"></div>
      </div>

      <div className="px-6 py-8 space-y-12 animate-fade-in relative z-10">
        {/* AI Navigation UI */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-[0_0_20px_rgba(192,255,1,0.2)]">
                <span className="text-primary font-black italic">AI</span>
             </div>
             <div>
                <h1 className="text-lg font-black tracking-tight leading-none text-white italic uppercase">{video.title}</h1>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Global AI ナビゲーション</p>
             </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-6 relative group overflow-hidden">
             <div className="absolute -top-4 -right-4 opacity-5 pointer-events-none">
                <span className="text-7xl font-black italic tracking-tighter uppercase text-primary">Insight</span>
             </div>
             <p className="text-sm text-gray-300 leading-relaxed italic relative z-10">
                「{video.aiIntroduction}」
             </p>
          </div>
        </section>

        {/* Affiliate Section */}
        <AffiliateSection products={video.aiRecommendedProducts} />

        {/* AI Intelligent Navigation */}
        <section className="space-y-4">
           <h2 className="text-[10px] font-black uppercase tracking-widest text-white/50 border-l-2 border-primary pl-3 italic">トレーニング手順</h2>
           <div className="space-y-3">
             {video.navigationItems.map((item) => {
               const isPassed = currentTime >= item.time;
               const isNext = !isPassed && (currentTime + 30 >= item.time);
               return (
                 <button key={item.id} onClick={() => seekTo(item.time)} className={`w-full text-left p-5 rounded-3xl border transition-all duration-500 ${isPassed ? 'bg-primary/5 border-primary/20 scale-[0.98]' : 'bg-white/5 border-white/10 opacity-40'} ${isNext ? 'ring-2 ring-primary animate-pulse opacity-100 bg-primary/10 scale-100' : ''}`}>
                    <div className="flex justify-between items-center mb-2">
                       <span className={`text-[10px] font-black px-3 py-1 rounded-full ${isPassed ? 'bg-primary text-black' : 'bg-white/10 text-gray-500'}`}>
                          {Math.floor(item.time / 60)}:{String(item.time % 60).padStart(2, '0')}
                       </span>
                       {isPassed && <span className="text-[10px] text-primary font-black uppercase tracking-widest italic animate-pulse">Passed</span>}
                    </div>
                    <h3 className="font-black text-sm text-white mb-1 uppercase tracking-tight">{item.label}</h3>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{item.detail}</p>
                 </button>
               );
             })}
           </div>
        </section>

        {/* Reward Video AI Unlock (MODIFIED FEATURE) */}
        {!isAiUnlocked ? (
          <section className="bg-gradient-to-br from-indigo-900/40 via-primary/10 to-indigo-900/40 border border-white/10 rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
             <div className="absolute inset-0 bg-primary/5 animate-pulse pointer-events-none" />
             <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto flex items-center justify-center text-2xl border border-primary/30 shadow-[0_0_30px_rgba(192,255,1,0.2)]">
                🔒
             </div>
             <div className="space-y-2">
                <h3 className="text-lg font-black text-white italic uppercase tracking-tighter">AI 質問アシスタント</h3>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed px-4 uppercase tracking-widest">
                   このシーンの正しいフォームや<br />翻訳をAIに質問できます
                </p>
             </div>
             <button 
                onClick={handleUnlockAi}
                disabled={isAdPlaying}
                className="w-full bg-white text-black py-4 rounded-full font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,255,255,0.2)] disabled:opacity-50"
             >
                {isAdPlaying ? '広告視聴中...' : '🔓 広告を見て質問枠を解放 (FREE)'}
             </button>
             <p className="text-[9px] text-gray-500 italic">※広告再生後にGemini AIが回答を生成します。リクエスト費用は広告収益で賄われます。</p>
          </section>
        ) : (
          <section className="bg-white/5 border border-primary/40 rounded-[40px] p-8 space-y-4 animate-fade-in shadow-[0_0_30px_rgba(192,255,1,0.1)]">
             <div className="flex items-center gap-2 justify-center mb-2">
                <span className="text-primary font-black text-[10px] uppercase tracking-widest italic px-2 py-0.5 bg-primary/10 rounded">AI分析機能 解放済み</span>
             </div>
             <div className="relative">
                <textarea 
                  className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-primary/50" 
                  placeholder="例: 正しい背中の筋肉の使い方は？"
                  rows={3}
                />
                <button className="absolute bottom-2 right-2 bg-primary text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:opacity-90">
                   AIに聞く
                </button>
             </div>
          </section>
        )}
      </div>

      <footer className="mt-20 py-10 border-t border-white/5 text-center px-6">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} なぎさのお星サマ制作委員会</p>
      </footer>

      {/* Persistent Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 glass border-t border-white/10 z-[60]">
        {!isVideoCompleted ? (
          <button onClick={() => completeTraining(video.id)} className="w-full py-5 bg-primary text-black rounded-full font-black text-lg hover:rotate-1 active:scale-95 transition-all shadow-[0_0_40px_rgba(192,255,1,0.5)] uppercase italic tracking-tighter">
            トレーニングを完了する
          </button>
        ) : (
          <div className="space-y-4">
            <button 
              onClick={() => router.push('/')} 
              className="w-full py-5 bg-white/10 text-primary rounded-full font-black text-center border border-primary animate-bounce shadow-[0_0_20px_rgba(192,255,1,0.2)] flex items-center justify-center gap-2 hover:bg-primary/20 transition-all"
            >
              <span>🔥</span> お疲れ様でした！スタンプを記録しました (ホームへ戻る)
            </button>
            <button 
              onClick={() => undoTraining(video.id)} 
              className="w-full text-[10px] text-gray-500 font-black uppercase tracking-widest text-center hover:text-red-400 transition-colors"
            >
              ✕ 間違えて押した (スタンプを取り消す)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
