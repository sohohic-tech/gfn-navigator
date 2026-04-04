'use client';

import { RecommendedProduct } from '@/types/fitness';

export default function AffiliateSection({ products }: { products: RecommendedProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col">
          <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 italic">Curated Selection</h2>
          <p className="text-sm font-black text-white italic uppercase tracking-tighter">AI推奨ギア</p>
        </div>
        <div className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest border border-zinc-800 px-3 py-1 rounded-full bg-zinc-900/50">
          Professional Choice
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-8 pt-2 px-2 no-scrollbar snap-x">
        {products.map((p) => (
          <div 
            key={p.id} 
            className="min-w-[280px] group relative snap-center"
          >
            {/* Background Aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-[40px] -m-1 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            
            <div className="relative bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-[40px] p-5 space-y-4 hover:border-primary/30 transition-all duration-500 shadow-3xl">
               <div className="aspect-square w-full bg-zinc-800 rounded-[30px] overflow-hidden relative shadow-inner">
                 <img 
                    src={p.image} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[0.2] group-hover:grayscale-0" 
                    alt={p.name} 
                 />
                 <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-[10px] font-black px-3 py-1.5 rounded-2xl text-primary border border-primary/20 italic">
                    AI PICK
                 </div>
               </div>

               <div className="space-y-2">
                 <div className="flex justify-between items-start gap-2">
                    <h4 className="text-sm font-black text-white italic uppercase tracking-tight leading-tight line-clamp-1">{p.name}</h4>
                    <p className="text-[11px] font-black text-primary italic shrink-0">
                        {new Intl.NumberFormat('ja-JP').format(p.price)}<span className="text-[8px] ml-0.5">円</span>
                    </p>
                 </div>
                 <p className="text-[10px] text-zinc-500 font-bold leading-relaxed line-clamp-2">
                    「{p.reason}」
                 </p>
               </div>

               <a 
                 href={p.affiliateUrl || '#'} 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="block w-full py-3 bg-white text-black text-center rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors shadow-2xl"
               >
                 Shop Now
               </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
