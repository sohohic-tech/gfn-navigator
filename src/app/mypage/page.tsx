'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { Trainer } from '@/types/fitness';

export default function MyPage() {
  const { userData, toggleFavoriteTrainer, setLanguage, updateUserName, isLoading } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]); // Real Channel Search
  const [previewVideos, setPreviewVideos] = useState<any[]>([]); // 10 Preview Videos
  const [isSearching, setIsSearching] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<any>(null);
  
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
    <main className="min-h-screen bg-black text-white pb-40 max-w-7xl mx-auto border-x border-white/5 shadow-2xl overflow-x-hidden">
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
           <div className="bg-white/5 border border-white/10 rounded-3xl p-5"><p className="text-[10px] text-gray-500 font-black uppercase mb-1">{c.stats[0]}</p><p className="text-3xl font-black text-primary">{userData.totalStamps}</p></div>
           <div className="bg-white/5 border border-white/10 rounded-3xl p-5"><p className="text-[10px] text-gray-400 font-black uppercase mb-1">{c.stats[1]}</p><p className="text-3xl font-black text-white">{userData.streak}</p></div>
        </div>
      </header>

      <section className="px-6 space-y-12 animate-fade-in">
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

          {/* Search Result - Identification Preview */}
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

          {/* Selected Channel - Deep Preview (5 Videos) */}
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
      </section>

      <footer className="mt-20 py-10 border-t border-white/5 text-center px-6">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">© {new Date().getFullYear()} なぎさのお星サマ制作委員会</p>
      </footer>

      {/* Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-8 md:px-12 py-5 rounded-full flex gap-8 md:gap-12 border border-white/10 shadow-3xl z-50 whitespace-nowrap">
        <Link href="/" className="text-gray-500 text-[10px] font-black">ホーム</Link>
        <Link href="/mypage" className="text-primary text-[10px] font-black">{c.nav[1]}</Link>
      </div>
    </main>
  );
}
