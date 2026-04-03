'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { Trainer } from '@/types/fitness';

const RECOMMENDED_CHANNELS = [
  { id: "UCO98reM6_X98Y0i_bM3mXpQ", name: "のがちゃんねる (Noga)", tag: "JP / HIIT / YOGA", image: "https://yt3.googleusercontent.com/ytc/AIdro_n8t9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T=s176-c-k-c0x00ffffff-no-rj" },
  { id: "UCX69-7Z9P3S3GvY_qN_Y_qN_Y_qN_Y_qN", name: "Marina Takewaki", tag: "JP / Dance / Diet", image: "https://yt3.googleusercontent.com/ytc/AIdro_m8R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9R9=s176-c-k-c0x00ffffff-no-rj" },
  { id: "UCCgLoMYIyP7i129h-3329-3329-3329", name: "Chloe Ting", tag: "Global / Abs / HIIT", image: "https://yt3.googleusercontent.com/ytc/AIdro_n8t9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T_nZ9Y9X0T=s176-c-k-c0x00ffffff-no-rj" },
  { id: "UCV_7_V_7_V_7_V_7_V_7_V_7_V_7_V_7", name: "MadFit", tag: "Global / Strength", image: "https://api.dicebear.com/7.x/identicon/svg?seed=MadFit" },
  { id: "UCa-a-a-a-a-a-a-a-a-a-a-a-a-a-a-a", name: "Pamela Reif", tag: "Global / Aesthetics", image: "https://api.dicebear.com/7.x/identicon/svg?seed=Pamela" }
];

export default function MyPage() {
  const { userData, toggleFavoriteTrainer, setLanguage, updateUserName, isLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Real Channel Search
  const [previewVideos, setPreviewVideos] = useState<any[]>([]); // 10 Preview Videos
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'subscriptions' | 'history' | 'calendar'>('subscriptions');
  const [historyVideos, setHistoryVideos] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedDateVideos, setSelectedDateVideos] = useState<any[]>([]);

  // Load history video details if in history mode
  useEffect(() => {
    if (viewMode === 'history' && userData.completedVideoIds.length > 0) {
      const fetchHistory = async () => {
        try {
          const ids = userData.completedVideoIds.join(',');
          const res = await fetch(`/api/youtube?type=detail&ids=${ids}`);
          const data = await res.json();
          setHistoryVideos(data.items || []);
        } catch (e) { console.error(e); }
      };
      fetchHistory();
    }
  }, [viewMode, userData.completedVideoIds]);

  // Load details for specific date when clicked
  useEffect(() => {
    const dailyIds = selectedDate ? userData.dailyRecord?.[selectedDate] : [];
    if (dailyIds && dailyIds.length > 0) {
      const fetchDaily = async () => {
        try {
          const ids = dailyIds.join(',');
          const res = await fetch(`/api/youtube?type=detail&ids=${ids}`);
          const data = await res.json();
          setSelectedDateVideos(data.items || []);
        } catch (e) { console.error(e); }
      };
      fetchDaily();
    } else {
      setSelectedDateVideos([]);
    }
  }, [selectedDate, userData.dailyRecord]);
  
  const lang = userData.language || 'ja';
  const c = {
    ja: {
      stats: ["累計スタンプ", "継続日数"],
      searchH: "配信者の名前を入力 (のがちゃんねる等)", searchB: "検索",
      confirmTitle: "この配信者ですか？ (本人確認)",
      previewTitle: "最新のトレーニング (プレビュー)",
      sub: "購読中 (解除する)", unsub: "+ 購読リストに追加 (無料)",
      langB: "English", nav: ["ホーム", "マイページ"]
    },
    en: {
      stats: ["Total Stamps", "Streak"],
      searchH: "Enter trainer name", searchB: "Search",
      confirmTitle: "Is this the correct trainer?",
      previewTitle: "Latest Workouts (Preview)",
      sub: "Subscribed (Unsubscribe)", unsub: "+ Add to Subscriptions (FREE)",
      langB: "Japanese", nav: ["Home", "My Page"]
    }
  }[lang];

  const handleSearch = async () => {
    if (!searchTerm) return;
    setIsSearching(true);
    try {
      const res = await fetch(`/api/youtube?type=search&q=${encodeURIComponent(searchTerm)}`);
      const data = await res.json();
      setSearchResults(data.items || []);
      setPreviewVideos([]);
      setSelectedChannel(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  const loadPreview = async (channel: any) => {
    setSelectedChannel(channel);
    try {
      const channelId = channel.id.channelId;
      const res = await fetch(`/api/youtube?type=videos&channelId=${channelId}`);
      const data = await res.json();
      setPreviewVideos(data.items?.slice(0, 5) || []); // Show 5 for quick check
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-black flex items-center justify-center font-black text-primary">LOADING...</div>;

  return (
    <main className="min-h-screen bg-black text-white pb-40 w-full max-w-7xl mx-auto border-x border-white/5 shadow-2xl overflow-x-hidden">
      <header className="px-6 pt-12 pb-8 bg-gradient-to-b from-primary/10 to-transparent">
        <button onClick={() => setLanguage(lang === 'ja' ? 'en' : 'ja')} className="float-right text-[10px] bg-white/10 px-3 py-1 rounded-full text-primary font-black uppercase">{c.langB}</button>
        <div className="flex items-center gap-4 mb-8">
           <div className="w-16 h-16 rounded-full bg-zinc-800 border-2 border-primary overflow-hidden shadow-2xl">
             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Fitness" alt="p" className="w-full h-full" />
           </div>
           <input 
             type="text"
             value={userData.userName}
             onChange={(e) => updateUserName(e.target.value)}
             className="flex-1 min-w-0 bg-transparent text-xl font-black italic uppercase tracking-tighter border-b border-white/10 focus:border-primary outline-none"
           />
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
            {/* Real Search Input */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-black uppercase tracking-widest border-l-4 border-primary pl-3 italic">トレーナーを検索</h2>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={c.searchH} 
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-xs font-medium" 
                />
                <button 
                  onClick={handleSearch} 
                  disabled={isSearching}
                  className="bg-primary text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg disabled:opacity-50"
                >
                  {isSearching ? '...' : c.searchB}
                </button>
              </div>

              {searchResults.length > 0 && !selectedChannel && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  <p className="text-[10px] text-primary font-black uppercase italic animate-pulse">{c.confirmTitle}</p>
                  {searchResults.map((chan: any) => (
                    <button 
                      key={chan.id.channelId} 
                      onClick={() => loadPreview(chan)}
                      className="bg-white/5 border border-white/10 rounded-[32px] p-5 flex items-center gap-4 hover:border-primary/50 text-left transition-all"
                    >
                      <img src={chan.snippet.thumbnails.high.url} className="w-16 h-16 rounded-full border-2 border-primary/20" alt="p" />
                      <div>
                        <h3 className="text-sm font-bold text-white line-clamp-1">{chan.snippet.title}</h3>
                        <p className="text-[10px] text-gray-500 line-clamp-2 mt-1">{chan.snippet.description}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {selectedChannel && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] text-primary font-black uppercase italic">{c.previewTitle}</h3>
                      <button onClick={() => setSelectedChannel(null)} className="text-[9px] text-gray-500 uppercase font-black underline">戻る</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {previewVideos.map((vid: any) => (
                        <div key={vid.id.videoId} className="flex gap-3 bg-white/5 rounded-2xl p-3 border border-white/5">
                            <img src={vid.snippet.thumbnails.high.url} className="w-24 aspect-video rounded-xl object-cover" alt="t" />
                            <div className="flex flex-col justify-center">
                                <h4 className="text-[10px] font-bold text-white line-clamp-2 leading-tight">{vid.snippet.title}</h4>
                            </div>
                        </div>
                      ))}
                    </div>

                    <button 
                      onClick={() => toggleFavoriteTrainer(selectedChannel.id.channelId, selectedChannel.snippet.title)}
                      className={`w-full py-5 rounded-full font-black text-sm uppercase transition-all shadow-[0_0_30px_rgba(192,255,1,0.3)] ${userData.favoriteTrainers.some(t => t.id === selectedChannel.id.channelId) ? 'bg-primary text-black' : 'bg-primary text-black hover:scale-105'}`}
                    >
                      {userData.favoriteTrainers.some(t => t.id === selectedChannel.id.channelId) ? c.sub : c.unsub}
                    </button>
                </div>
              )}
            </div>

            {/* My Subscriptions List */}
            <div className="space-y-4 pt-8 border-t border-white/5">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">購読中の配信者一覧</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {userData.favoriteTrainers.map(trainer => (
                  <div key={trainer.id} className="bg-white/5 border border-white/10 rounded-full px-6 py-4 flex items-center justify-between">
                    <span className="text-xs font-bold text-white italic">{trainer.name} (購読中)</span>
                    <button onClick={() => toggleFavoriteTrainer(trainer.id)} className="text-[9px] text-primary font-black uppercase">削除</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Trainers */}
            <div className="space-y-4 pt-12">
               <h2 className="text-[10px] font-black uppercase tracking-widest text-primary italic border-l-2 border-primary pl-3">おすすめの配信者 (発見)</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {RECOMMENDED_CHANNELS.map(chan => {
                    const isSubscribed = userData.favoriteTrainers.some(t => t.id === chan.id);
                    return (
                      <div key={chan.id} className="bg-white/5 border border-white/10 rounded-[32px] p-5 flex items-center justify-between hover:border-primary/20 transition-all">
                         <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                               <img src={chan.image || "https://api.dicebear.com/7.x/identicon/svg?seed=fitness"} className="w-full h-full object-cover" alt="p" />
                            </div>
                            <div>
                               <h3 className="text-xs font-bold text-white">{chan.name}</h3>
                               <p className="text-[9px] text-gray-500 font-black uppercase tracking-tighter mt-0.5">{chan.tag}</p>
                            </div>
                         </div>
                         <button 
                           onClick={() => toggleFavoriteTrainer(chan.id, chan.name)}
                           className={`text-[9px] font-black uppercase px-4 py-2 rounded-full transition-all ${isSubscribed ? 'bg-zinc-800 text-gray-500' : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-black'}`}
                         >
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
          <div className="space-y-6 pt-4 animate-fade-in">
             <h2 className="text-[10px] font-black uppercase tracking-widest border-l-4 border-primary pl-3 italic">トレーニング履歴</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {historyVideos.length > 0 ? historyVideos.map((vid: any) => (
                  <Link href={`/video/${vid.id}`} key={vid.id} className="flex gap-3 bg-white/5 rounded-2xl p-3 border border-white/5 hover:border-primary/30 transition-all">
                     <img src={vid.snippet.thumbnails.high.url} className="w-24 aspect-video rounded-xl object-cover opacity-60" alt="t" />
                     <div className="flex flex-col justify-center">
                        <h4 className="text-[10px] font-bold text-white line-clamp-2 leading-tight uppercase">{vid.snippet.title}</h4>
                        <p className="text-[8px] text-gray-500 font-black mt-1 uppercase italic">✓ 完了済み</p>
                     </div>
                  </Link>
                )) : (
                  <p className="text-[10px] text-gray-500 italic">まだ完了したトレーニングはありません。</p>
                )}
             </div>
          </div>
        )}

        {viewMode === 'calendar' && (
          <div className="space-y-6 pt-4 animate-fade-in">
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
                     const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay(); // 0-6 (Sun-Sat)
                     const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                     
                     const cells = [];
                     // Add empty cells for the offset
                     for (let i = 0; i < firstDay; i++) {
                       cells.push(<div key={`empty-${i}`} />);
                     }
                     // Add actual days
                     for (let day = 1; day <= daysInMonth; day++) {
                       const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                       const isDone = userData.completedDates.some(d => d.startsWith(dateStr));
                       const isSelected = selectedDate === dateStr;
                       cells.push(
                         <button 
                           key={day} 
                           onClick={() => setSelectedDate(dateStr)}
                           className={`aspect-square rounded-xl flex items-center justify-center text-[10px] font-black border transition-all ${isDone ? 'bg-primary text-black border-primary shadow-[0_0_15px_rgba(192,255,1,0.4)]' : 'bg-white/5 text-gray-600 border-white/5'} ${isSelected ? 'ring-2 ring-white shadow-3xl' : ''}`}
                         >
                           {day}
                         </button>
                       );
                     }
                     return cells;
                   })()}
                </div>
                
                {/* Daily Specific History List */}
                {selectedDate && (
                  <div className="mt-10 space-y-4 pt-8 border-t border-white/10 animate-fade-in">
                     <p className="text-[10px] text-primary font-black uppercase italic">{selectedDate} の記録</p>
                     <div className="space-y-3">
                        {selectedDateVideos.length > 0 ? selectedDateVideos.map((vid: any) => (
                           <Link href={`/video/${vid.id}`} key={vid.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 items-center">
                              <img src={vid.snippet.thumbnails.high.url} className="w-20 aspect-video rounded-lg object-cover" alt="t" />
                              <h4 className="text-[10px] font-bold text-white line-clamp-2 leading-tight uppercase">{vid.snippet.title}</h4>
                           </Link>
                        )) : (
                          <p className="text-[10px] text-gray-500 italic">この日の記録はありません。</p>
                        )}
                     </div>
                  </div>
                )}
                <p className="mt-6 text-center text-[9px] text-gray-500 font-black uppercase italic tracking-widest">
                   {new Date().getMonth() + 1}月 のアクティビティ
                </p>
             </div>
          </div>
        )}
      </section>

      <footer className="mt-20 py-10 border-t border-white/5 text-center px-6">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} なぎさのお星サマ制作委員会</p>
      </footer>

      {/* Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-8 md:px-12 py-5 rounded-full flex gap-8 md:gap-12 border border-white/10 shadow-3xl z-50 whitespace-nowrap max-w-[90vw] overflow-x-auto no-scrollbar scale-90 sm:scale-100">
        <Link href="/" className="text-gray-500 text-[10px] font-black">ホーム</Link>
        <Link href="/mypage" className="text-primary text-[10px] font-black">{c.nav[1]}</Link>
      </div>
    </main>
  );
}
