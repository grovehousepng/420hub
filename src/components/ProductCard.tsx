'use client';

import Link from 'next/link';
import { WCProduct } from '@/lib/woocommerce';

import ProductRating from './ProductRating';

interface ProductCardProps {
    product: WCProduct;
    index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
    const p = product;

    return (
        <Link
            href={`/product/${p.slug}`}
            className="product-card group bg-white rounded-sm overflow-hidden border border-brand-border hover:border-brand-black transition-all hover:shadow-xl flex flex-col"
        >
            <div className="relative aspect-square overflow-hidden bg-zinc-100 shrink-0">
                <img
                    src={p.images?.[0]?.src || '/grinder-hero.png'}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                    loading={index < 4 ? 'eager' : 'lazy'}
                />
                {p.stock_status === 'outofstock' && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-brand-black text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 grayscale">Tükendi</span>
                    </div>
                )}
                
                {/* Badge if it was on sale or featured? (Mocking for now) */}
                {p.sale_price && (
                    <span className="absolute top-3 left-3 bg-brand-green text-white text-[9px] font-bold tracking-[0.15em] uppercase px-2 py-1">İndirim</span>
                )}
            </div>
            
            <div className="p-4 md:p-5 flex flex-col flex-1">
                <div className="flex flex-col gap-1">
                    {p.categories?.[0] && (
                        <p className="text-[10px] md:text-[11px] font-bold tracking-[0.15em] uppercase text-brand-muted truncate">
                            {p.categories[0].name}
                        </p>
                    )}
                    <h3 className="font-headline font-bold text-[15px] md:text-lg tracking-tight leading-snug truncate">
                        {p.name}
                    </h3>
                </div>
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-1 mb-1 min-h-[16px]">
                            <ProductRating productId={p.id} size="sm" />
                        </div>
                        {p.price ? (
                            <div className="flex items-baseline gap-2">
                                <span className="font-headline font-bold text-lg md:text-xl text-brand-black">₺{p.price}</span>
                                {p.regular_price && Number(p.regular_price) > Number(p.price) && (
                                    <span className="text-[12px] text-brand-muted line-through opacity-60">₺{p.regular_price}</span>
                                )}
                            </div>
                        ) : (
                            <span className="text-brand-muted text-[13px]">Fiyat Yok</span>
                        )}
                    </div>
                    
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${p.stock_status === 'outofstock' ? 'bg-brand-surface text-brand-muted' : 'bg-brand-surface text-brand-black group-hover:bg-brand-black group-hover:text-white group-hover:scale-110'}`}>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
