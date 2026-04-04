'use client';

import React from 'react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-primary selection:text-black">
      {/* Dynamic Header */}
      <nav className="glass px-8 py-6 sticky top-0 z-50 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="text-xl font-black italic tracking-tighter uppercase text-primary">
          GFN <span className="text-[10px] text-white/50 not-italic ml-2 tracking-widest font-normal">Global Fitness Navigator</span>
        </Link>
        <Link href="/" className="text-[10px] font-black uppercase tracking-widest border border-white/10 px-6 py-2 rounded-full hover:bg-white/5 transition-all">
          ホームに戻る
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-24 pb-32 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="space-y-4 relative z-10">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] italic animate-pulse">Our Philosophy</p>
          <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.9] max-w-4xl mx-auto">
            YouTube を<br />
            <span className="text-primary italic">究極のジム</span>へ。
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm font-medium leading-relaxed pt-4">
            Global Fitness Navigator (GFN) は、AI技術（Gemini 2.0）を駆使して、お気に入りのフィットネス動画を「見るだけ」から「完璧なトレーニング」へと進化させる次世代プラットフォームです。
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-20 border-t border-white/5">
        <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-4 hover:border-primary/20 transition-all">
          <div className="text-3xl">🤖</div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">AI Real-time Scan</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-bold">
            膨大な動画データから、トレーニング手順・難易度・消費カロリーをAIが瞬時に抽出。あなただけの完璧なガイドラインを生成します。
          </p>
        </div>
        
        <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-4 hover:border-primary/20 transition-all">
          <div className="text-3xl">📡</div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Live Navigation</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-bold">
            動画の進行に合わせてガイドが自動同期。今何をすべきか迷うことはもうありません。タイマー機能もAIが自動セット。
          </p>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-[40px] p-10 space-y-4 hover:border-primary/20 transition-all md:col-span-2 lg:col-span-1">
          <div className="text-3xl">🎁</div>
          <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">Free Forever</h3>
          <p className="text-xs text-gray-500 leading-relaxed font-bold">
            広告を1本視聴するだけで、高度なAI分析結果はすべて無料でアンロック。高額なパーソナルトレーニングは不要です。
          </p>
        </div>
      </section>

      {/* User Benefits Section - Powerful & Emotional */}
      <section className="px-8 py-32 space-y-20 relative">
        <div className="text-center space-y-4">
           <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.5em] italic">Infinite Benefits</h2>
           <p className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
              あなたのフィットネスが、<br />
              <span className="text-primary">劇的に変わる4つの利点。</span>
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <div className="group p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[50px] transition-all hover:from-primary/30">
            <div className="bg-zinc-950 rounded-[49px] p-10 h-full space-y-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-black transition-colors">💰</div>
              <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">月額数万円のジム費用を0円に</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-bold">
                 プロのパーソナルトレーナーと同等の解説とナビゲーションが、広告1本（数秒）で手に入ります。浮いたお金で、より良いプロテインやウェアを。
              </p>
            </div>
          </div>

          <div className="group p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[50px] transition-all hover:from-primary/30">
            <div className="bg-zinc-950 rounded-[49px] p-10 h-full space-y-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-black transition-colors">⏳</div>
              <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">「探す時間」を「動く時間」へ</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-bold">
                 動画内の何分に何があるか、AIがすべて整理済み。シークバーを彷徨う無駄な時間をなくし、最短ルートで目標のスタイルへ導きます。
              </p>
            </div>
          </div>

          <div className="group p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[50px] transition-all hover:from-primary/30">
            <div className="bg-zinc-950 rounded-[49px] p-10 h-full space-y-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-black transition-colors">🔥</div>
              <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">モチベーションを「資産」に変える</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-bold">
                 スタンプとレベルシステムが、あなたの努力を正確に記録。成長が目に見えるから、もう三日坊主で終わることはありません。
              </p>
            </div>
          </div>

          <div className="group p-1 bg-gradient-to-br from-white/10 to-transparent rounded-[50px] transition-all hover:from-primary/30">
            <div className="bg-zinc-950 rounded-[49px] p-10 h-full space-y-6">
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-primary group-hover:text-black transition-colors">🛡️</div>
              <h4 className="text-2xl font-black italic text-white uppercase tracking-tighter">怪我のリスクを最小限に</h4>
              <p className="text-sm text-gray-400 leading-relaxed font-bold">
                 AIが見るべきポイントを具体的に指示。「膝を曲げすぎない」「背中を丸めない」などの解説が、自宅トレーニングを安全で効果的に変えます。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Respect & Creator Section */}
      <section className="px-8 py-32 bg-white/[0.02] border-y border-white/5 relative overflow-hidden">
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          <div className="text-center space-y-4">
             <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] italic">Co-Creation with Creators</h2>
             <p className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">
                クリエイターへの、<br />
                <span className="text-primary">止まらないリスペクト。</span>
             </p>
          </div>
          
          <div className="space-y-8 text-center">
            <p className="text-lg text-gray-300 font-medium leading-relaxed italic">
              「GFNは、配信者が心血を注いで作り上げた動画を<br className="hidden md:block" />
              単なる『コンテンツ』ではなく、一つの『マスターピース（傑作）』として扱います。」
            </p>
            <div className="text-sm text-gray-500 leading-loose max-w-2xl mx-auto font-bold">
              優れたトレーナーによる指導は、それ自体が芸術であり、共有されるべき財産です。私たちのAIの使命は、彼らの情熱を1秒も無駄にせず、ユーザーの元へ正しく届けるための「最高の架け橋」になること。動画の魅力を再発見し、新しいファンを増やすことで、クリエイターと共にフィットネスの未来を共創します。
            </div>
          </div>
        </div>
      </section>

      {/* Identity Section */}
      <section className="px-8 py-32 text-center space-y-12">
        <div className="space-y-4">
          <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] italic">Why GFN?</h2>
          <p className="text-2xl md:text-3xl font-black text-white italic tracking-tighter max-w-3xl mx-auto leading-tight">
            「動画が多すぎて何を選べばいいか分からない」<br className="hidden md:block" />
            「トレーナーの真意を100%受け取りたい」<br className="hidden md:block" />
            その架け橋をAIが担います。
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { label: "AI Analysis", val: "99.9%" },
            { label: "Cost", val: "¥0" },
            { label: "Videos", val: "Unlimited" },
            { label: "Tech", val: "Gemini 2.0" }
          ].map(stat => (
            <div key={stat.label} className="py-8 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black italic text-primary">{stat.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 py-32 text-center space-y-10">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter">
          さあ、新しいトレーニング体験へ。
        </h2>
        <Link 
          href="/" 
          className="inline-block bg-primary text-black px-16 py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-3xl shadow-primary/30"
        >
          ワークアウトを開始する
        </Link>
      </section>

      <footer className="py-10 border-t border-white/5 text-center px-8 opacity-40">
        <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} なぎさのお星サマ制作委員会<br />
          Built by Advanced AI Team
        </p>
      </footer>
    </main>
  );
}
