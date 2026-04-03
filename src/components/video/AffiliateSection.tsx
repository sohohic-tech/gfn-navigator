'use client';

import { RecommendedProduct } from '@/types/fitness';

export default function AffiliateSection({ products }: { products: RecommendedProduct[] }) {
  // Check if there are any products with affiliate links
  const hasAffiliateLinks = products.some(p => p.affiliateUrl);

  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-primary/80">AI Recommended Gear</h2>
          {hasAffiliateLinks && (
            <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-black">
              PR
            </span>
          )}
        </div>
        {hasAffiliateLinks && (
          <span className="text-[9px] text-gray-500 italic">※アフィリエイトリンクを含みます</span>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {products.map((p) => (
          <a 
            key={p.id} 
            href={p.affiliateUrl || '#'} 
            target={p.affiliateUrl ? "_blank" : undefined}
            rel={p.affiliateUrl ? "noopener noreferrer" : undefined}
            className={`min-w-[260px] bg-card border border-border rounded-2xl p-3 flex gap-3 transition-all shadow-lg ${p.affiliateUrl ? 'hover:scale-[1.02] cursor-pointer hover:border-primary/30' : 'cursor-default'}`}
          >
            <div className="w-20 h-20 bg-zinc-800 rounded-xl overflow-hidden flex-shrink-0">
              <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
            </div>
            <div className="flex flex-col justify-between py-1">
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{p.name}</h4>
                <p className="text-[10px] text-gray-400 line-clamp-2 mt-1 leading-tight">{p.reason}</p>
              </div>
              <p className="text-xs font-black text-primary">
                {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(p.price)}
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
