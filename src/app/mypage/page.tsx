'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

const RECOMMENDED_CHANNELS = [
  { id: "UCO98reM6_X98Y0i_bM3mXpQ", name: "のがちゃんねる (Noga)", tag: "JP / HIIT / YOGA", image: "https://yt3.googleusercontent.com/ytc/AIdro_n8t9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T=s176-c-k-c0x00ffffff-no-rj" },
  { id: "UCX69-7Z9P3S3GvY_qN_Y_qN_Y_qN_Y_qN", name: "Marina Takewaki", tag: "JP / Dance / Diet", image: "https://yt3.googleusercontent.com/ytc/AIdro_m8R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9=s176-c-k-c0x00ffffff-no-rj" },
  { id: "UCCgLoMYIyP7i129h-3329-3329-3329", name: "Chloe Ting", tag: "Global / Abs / HIIT", image: "https://yt3.googleusercontent.com/ytc/AIdro_n8t9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T=s176-c-k-c0x00ffffff-no-rj" },
  { id: "UCV_7_V_7_V_7_V_7_V_7_V_7_V_7_V_7", name: "MadFit", tag: "Global / Strength", image: "https://api.dicebear.com/7.x/identicon/svg?seed=MadFit" },
  { id: "UCa-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a", name: "Pamela Reif", tag: "Global / Aesthetics", image: "https://api.dicebear.com/7.x/identicon/svg?seed=Pamela" }
];

export default function MyPage() {
  const { userData, toggleFavoriteTrainer, setLanguage, updateUserName, updateFitnessProfile, isLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); 
  const [previewVideos, setPreviewVideos] = useState<any[]>([]); 
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'subscriptions' | 'history' | 'calendar'>('subscriptions');
  const [historyVideos, setHistoryVideos] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateVideos, setSelectedDateVideos] = useState<any[]>([]);
  const [dynamicRecs, setDynamicRecs] = useState<any[]>([]);

  useEffect(() => {
    const loadRecs = async () => {
      let q = "fitness trainer top";
      if (userData.favoriteTrainers.length > 0) {
        const last = userData.favoriteTrainers[userData.favoriteTrainers.length - 1].name;
        q = `${last} related trainer`;
      }
      try {
        const res = await fetch(`/api/youtube?type=search&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const items = data.items || [];
        const uniqueItems = Array.from(new Map(items.map((i: any) => [typeof i.id === 'string' ? i.id : (i.id?.videoId || i.id), i])).values());
        setDynamicRecs(uniqueItems.slice(0, 5));
      } catch (e) {
        console.error(e);
        setDynamicRecs(RECOMMENDED_CHANNELS);
      }
    };
    if (!isLoading) loadRecs();
  }, [userData.favoriteTrainers, isLoading]);

  useEffect(() => {
    if (viewMode === 'history' && userData.completedVideoIds.length > 0) {
      const fetchHistory = async () => {
        try {
          const ids = userData.completedVideoIds.join(',');
          const res = await fetch(`/api/youtube?type=detail&ids=${ids}`);
          const data = await res.json();
          const items = data.items || [];
          const uniqueItems = Array.from(new Map(items.map((i: any) => [typeof i.id === 'string' ? i.id : (i.id?.videoId || i.id), i])).values());
          setHistoryVideos(uniqueItems);
        } catch (e) { console.error(e); }
      };
      fetchHistory();
    }
  }, [viewMode, userData.completedVideoIds]);

  useEffect(() => {
    const dailyIds = selectedDate ? userData.dailyRecord?.[selectedDate] : [];
    if (dailyIds && dailyIds.length > 0) {
      const fetchDaily = async () => {
        try {
          const ids = dailyIds.join(',');
          const res = await fetch(`/api/youtube?type=detail&ids=${ids}`);
          const data = await res.json();
          const items = data.items || [];
          const uniqueItems = Array.from(new Map(items.map((i: any) => [typeof i.id === 'string' ? i.id : (i.id?.videoId || i.id), i])).values());
          setSelectedDateVideos(uniqueItems);
        } catch (e) { console.error(e); }
      };
      fetchDaily();
    } else {
      setSelectedDateVideos([]);
    }
  }, [selectedDate, userData.dailyRecord]);
  
  const lang = userData.language || 'ja';
  const c = ({
    ja: {
      stats: ["累計スタンプ", "継続日数"],
      searchH: "配信者の名前を入力", searchB: "検索",
      confirmTitle: "この配信者ですか？",
      previewTitle: "最新のトレーニング (プレビュー)",
      langB: "English", nav: ["ホーム", "マイページ"]
    },
    en: {
      stats: ["Total Stamps", "Streak"],
      searchH: "Enter trainer name", searchB: "Search",
      confirmTitle: "Is this correct?",
      previewTitle: "Latest Workouts",
      langB: "Japanese", nav: ["Home", "My Page"]
    }
  } as any)[lang];

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/youtube?type=search&q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      const items = data.items || [];
      const uniqueItems = Array.from(new Map(items.map((i: any) => [typeof i.id === 'string' ? i.id : (i.id?.videoId || i.id), i])).values());
      setSearchResults(uniqueItems);
      setPreviewVideos([]);
      setSelectedChannel(null);
    } catch (e) { console.error(e); } finally { setIsSearching(false); }
  };

  const loadPreview = async (channel: any) => {
    setSelectedChannel(channel);
    try {
      const channelId = channel.id.channelId || channel.id;
      const res = await fetch(`/api/youtube?type=videos&channelId=${channelId}`);
      const data = await res.json();
      const items = data.items || [];
      const uniqueItems = Array.from(new Map(items.map((i: any) => [typeof i.id === 'string' ? i.id : (i.id?.videoId || i.id), i])).values());
      setPreviewVideos(uniqueItems.slice(0, 5));
    } catch (e) { console.error(e); }
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-primary">LOADING...</div>;

  return (
    <main className="min-h-screen bg-black text-white pb-40 w-full max-w-7xl mx-auto border-x border-white/5 shadow-2xl overflow-x-hidden">
      <header className="px-6 pt-12 pb-8 bg-gradient-to-b from-primary/10 to-transparent">
        <button onClick={() => setLanguage(lang === 'ja' ? 'en' : 'ja')} className="float-right text-[10px] bg-white/10 px-3 py-1 rounded-full text-primary font-black uppercase">{c.langB}</button>
        <div className="flex items-center gap-4 mb-8">
           <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-primary overflow-hidden shadow-2xl">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fitness" alt="profile" className="w-full h-full" />
           </div>
           <input 
             type="text"
             value={userData.userName}
             onChange={(e) => updateUserName(e.target.value)}
             className="flex-1 min-w-0 bg-transparent text-xl font-black italic uppercase tracking-tighter border-b border-white/10 focus:border-primary outline-none"
           />
        </div>

        <div className="mb-10 space-y-3 bg-white/5 border border-white/10 rounded-[32px] p-6 relative overflow-hidden backdrop-blur-xl">
           <div className="flex justify-between items-end mb-2">
              <div>
                 <p className="text-[10px] text-primary font-black uppercase italic tracking-widest leading-none">Fitness Rank</p>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mt-1">
                    Lv. {Math.floor(userData.totalStamps / 10) + 1}
                 </h2>
              </div>
              <p className="text-[10px] text-gray-500 font-black uppercase">Next: {10 - (userData.totalStamps % 10)} stamps</p>
           </div>
           <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
              <div 
                className="h-full bg-gradient-to-r from-primary/40 to-primary shadow-[0_0_20px_rgba(192,255,1,0.5)] transition-all"
                style={{ width: `${(userData.totalStamps % 10) * 10}%` }}
              />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button onClick={() => setViewMode('history')} className={`bg-white/5 border rounded-3xl p-5 text-left transition-all ${viewMode === 'history' ? 'border-primary ring-1 ring-primary' : 'border-white/10'}`}>
             <p className="text-[10px] text-gray-500 font-black uppercase mb-1">{c.stats[0]}</p>
             <p className="text-3xl font-black text-primary">{userData.totalStamps}</p>
           </button>
           <button onClick={() => setViewMode('calendar')} className={`bg-white/5 border rounded-3xl p-5 text-left transition-all ${viewMode === 'calendar' ? 'border-primary ring-1 ring-primary' : 'border-white/10'}`}>
             <p className="text-[10px] text-gray-400 font-black uppercase mb-1">{c.stats[1]}</p>
             <p className="text-3xl font-black text-white">{userData.streak}</p>
           </button>
        </div>
      </header>

      <section className="px-6 space-y-12 animate-fade-in relative">
        {viewMode !== 'subscriptions' && (
          <button onClick={() => setViewMode('subscriptions')} className="absolute -top-6 left-6 text-[10px] text-primary font-black uppercase tracking-widest border border-primary/30 px-4 py-1 rounded-full bg-primary/5 hover:bg-primary/20">
            ← 配信者一覧に戻る
          </button>
        )}

        {viewMode === 'subscriptions' && (
          <>
            <div className="bg-white/5 border border-white/10 rounded-[40px] p-8 space-y-10 shadow-2xl relative overflow-hidden group mb-12">
               <div className="space-y-2">
                  <p className="text-[10px] text-primary font-black uppercase tracking-[0.4em] italic mb-1">Your Diagnostic</p>
                  <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">フィットネス診断</h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pt-2">パーソナライズ設定であなたに最適化します。</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <p className="text-[10px] text-white/50 font-black uppercase tracking-widest pl-2">Q1. 目的</p>
                     <div className="flex flex-wrap gap-2">
                       {["ダイエット", "筋力アップ", "健康維持", "運動不足解消"].map(goal => (
                         <button 
                           key={goal}
                           onClick={() => {
                             const current = userData.fitnessProfile?.goals || [];
                             const next = current.includes(goal) ? current.filter(g => g !== goal) : [...current, goal];
                             updateFitnessProfile({ ...userData.fitnessProfile, goals: next });
                           }}
                           className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all ${userData.fitnessProfile?.goals?.includes(goal) ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 border border-white/5'}`}
                         >
                           {goal}
                         </button>
                       ))}
                     </div>
                  </div>
               </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest border-l-4 border-primary pl-3 italic">トレーナーを検索</h2>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={c.searchH} 
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-medium focus:outline-none focus:border-primary" 
                />
                <button onClick={handleSearch} disabled={isSearching} className="bg-primary text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg disabled:opacity-50">
                  {isSearching ? '...' : c.searchB}
                </button>
              </div>

              {searchResults.length > 0 && !selectedChannel && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  {searchResults.map((chan: any) => {
                    const cid = chan.id.channelId || chan.id;
                    const isFav = userData.favoriteTrainers.some(t => t.id === cid);
                    return (
                      <div key={cid} className="bg-white/5 border border-white/10 rounded-[32px] p-4 flex items-center justify-between group">
                        <button onClick={() => loadPreview(chan)} className="flex items-center gap-4 flex-1 text-left min-w-0">
                          <img src={chan.snippet.thumbnails.high.url} className="w-14 h-14 rounded-full border-2 border-primary/20 shrink-0" alt="p" />
                          <div className="min-w-0">
                            <h3 className="text-sm font-bold text-white line-clamp-1">{chan.snippet.title}</h3>
                            <p className="text-[9px] text-gray-500 font-bold uppercase mt-0.5">動画を見て確認 ➔</p>
                          </div>
                        </button>
                        <button onClick={() => toggleFavoriteTrainer(cid, chan.snippet.title)} className={`ml-4 px-6 py-3 rounded-full font-black text-[10px] uppercase transition-all ${isFav ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-primary text-black hover:scale-105 shadow-xl'}`}>
                          {isFav ? '✓' : '+ 購読'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedChannel && (
                <div className="space-y-8 animate-fade-in pt-4 pb-12">
                    <div className="bg-white/5 border border-primary/20 rounded-[40px] p-8 space-y-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                       <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10">
                          <div className="w-24 h-24 rounded-full border-4 border-primary/20 overflow-hidden shrink-0">
                             <img src={selectedChannel.snippet.thumbnails.high.url} className="w-full h-full object-cover" alt="p" />
                          </div>
                          <div className="text-center sm:text-left space-y-2">
                             <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter leading-none">{selectedChannel.snippet.title}</h3>
                             <p className="text-xs text-gray-400">内容を確認してよろしければ購読してください。</p>
                          </div>
                       </div>
                       <div className="flex flex-col sm:flex-row gap-4 relative z-10 pt-2">
                          <button 
                            onClick={() => toggleFavoriteTrainer(selectedChannel.id.channelId || selectedChannel.id, selectedChannel.snippet.title)}
                            className={`flex-1 px-12 py-5 rounded-full font-black text-sm uppercase transition-all ${userData.favoriteTrainers.some(t => t.id === (selectedChannel.id.channelId || selectedChannel.id)) ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-primary text-black shadow-lg'}`}
                          >
                             {userData.favoriteTrainers.some(t => t.id === (selectedChannel.id.channelId || selectedChannel.id)) ? "✓ 購読済み" : "このトレーナーを購読する"}
                          </button>
                          <button onClick={() => setSelectedChannel(null)} className="px-8 py-5 bg-white/5 border border-white/10 text-gray-500 rounded-full font-black text-[10px] uppercase">キャンセル</button>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {previewVideos.map((vid: any) => (
                        <div key={vid.id.videoId || vid.id} className="group relative bg-white/5 rounded-[32px] p-4 border border-white/5 hover:border-primary/20 transition-all">
                            <div className="aspect-video relative rounded-2xl overflow-hidden mb-3">
                               <img src={vid.snippet.thumbnails.high.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="t" />
                            </div>
                            <h4 className="text-[11px] font-black text-white italic line-clamp-2 leading-tight uppercase">{vid.snippet.title}</h4>
                        </div>
                      ))}
                    </div>
                </div>
              )}
            </div>

            <div className="space-y-4 pt-12 border-t border-white/5">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-2 border-primary pl-3">おすすめ配信者</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(dynamicRecs.length > 0 ? dynamicRecs : RECOMMENDED_CHANNELS).map(chan => {
                    const id = chan.id?.channelId || chan.id;
                    const name = chan.snippet?.title || chan.name;
                    const image = chan.snippet?.thumbnails?.high?.url || chan.image;
                    const isSubscribed = userData.favoriteTrainers.some(t => t.id === id);
                    return (
                      <div key={id} className="bg-white/5 border border-white/10 rounded-[32px] p-5 flex items-center justify-between hover:border-primary/20 transition-all">
                         <div className="flex items-center gap-4 min-w-0">
                            <img src={image} className="w-12 h-12 rounded-full object-cover" alt="p" />
                            <div className="min-w-0"><h3 className="text-xs font-bold text-white truncate">{name}</h3></div>
                         </div>
                         <button onClick={() => toggleFavoriteTrainer(id, name)} className={`text-[9px] font-black uppercase px-4 py-2 rounded-full ${isSubscribed ? 'bg-zinc-800 text-gray-500' : 'bg-primary/20 text-primary border border-primary/30'}`}>
                            {isSubscribed ? '解除' : '追加'}
                         </button>
                      </div>
                    );
                  })}
               </div>
            </div>
          </>
        )}

        {viewMode === 'history' && (
          <div className="space-y-6 pt-4 animate-fade-in pb-24">
             <h2 className="text-[10px] font-black uppercase tracking-widest border-l-4 border-primary pl-3 italic">トレーニング履歴</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {historyVideos.length > 0 ? historyVideos.map((vid: any) => {
                  const videoId = typeof vid.id === 'string' ? vid.id : vid.id.videoId;
                  return (
                    <Link href={`/video/${videoId}`} key={videoId} className="flex gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 hover:border-primary/30 transition-all">
                       <img src={vid.snippet.thumbnails.high.url} className="w-24 aspect-video rounded-xl object-cover opacity-60" alt="v" />
                       <div className="flex flex-col justify-center">
                          <h4 className="text-[10px] font-bold text-white line-clamp-2 leading-tight uppercase">{vid.snippet.title}</h4>
                          <p className="text-[8px] text-gray-500 font-black mt-1 uppercase italic">✓ 完了済み</p>
                       </div>
                    </Link>
                  );
                }) : <p className="text-[10px] text-gray-500 italic">まだ記録はありません。</p>}
             </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="space-y-6 pt-4 animate-fade-in pb-24">
             <h2 className="text-[10px] font-black uppercase tracking-widest border-l-4 border-primary pl-3 italic">トレーニングカレンダー</h2>
             <div className="bg-white/5 border border-white/10 rounded-[40px] p-8">
                <div className="grid grid-cols-7 gap-2 mb-4 text-center">
                   {['日', '月', '火', '水', '木', '金', '土'].map(d => (
                     <div key={d} className="text-[9px] font-black text-gray-500 uppercase">{d}</div>
                   ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                   {(() => {
                     const now = new Date();
                     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
                     const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                     const cells = [];
                     for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} />);
                     for (let day = 1; day <= daysInMonth; day++) {
                       const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                       const isDone = userData.completedDates.some(d => d.startsWith(dateStr));
                       cells.push(
                         <button 
                           key={day} 
                           onClick={() => setSelectedDate(dateStr)}
                           className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black border ${isDone ? 'bg-primary text-black border-primary' : 'bg-white/5 text-gray-600 border-white/5'} ${selectedDate === dateStr ? 'ring-2 ring-white' : ''}`}
                         >
                           {day}
                         </button>
                       );
                     }
                     return cells;
                   })()}
                </div>
                {selectedDate && (
                  <div className="mt-10 space-y-4 pt-8 border-t border-white/10 animate-fade-in">
                     <p className="text-[10px] text-primary font-black uppercase italic">{selectedDate} の記録</p>
                     <div className="space-y-3">
                        {selectedDateVideos.length > 0 ? selectedDateVideos.map((vid: any) => {
                           const vId = typeof vid.id === 'string' ? vid.id : vid.id.videoId;
                           return (
                             <Link href={`/video/${vId}`} key={vId} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                                <img src={vid.snippet.thumbnails.high.url} className="w-20 aspect-video rounded-lg object-cover" alt="v" />
                                <h4 className="text-[10px] font-bold text-white line-clamp-2 uppercase">{vid.snippet.title}</h4>
                             </Link>
                           );
                        }) : <p className="text-[10px] text-gray-500 italic">記録はありません。</p>}
                     </div>
                  </div>
                )}
             </div>
          </div>
        )}
      </section>

      <footer className="mt-20 py-10 border-t border-white/5 text-center px-6">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} なぎさのお星サマ制作委員会</p>
      </footer>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-8 md:px-12 py-5 rounded-full flex gap-8 md:gap-12 border border-white/10 shadow-3xl z-50">
        <Link href="/" className="text-gray-500 text-[10px] font-black">ホーム</Link>
        <Link href="/mypage" className="text-primary text-[10px] font-black">{c.nav[1]}</Link>
      </div>
    </main>
  );
}
