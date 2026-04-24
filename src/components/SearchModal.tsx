'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { pushEvent } from '@/lib/gtm';

interface ProductResult {
    id: number;
    name: string;
    slug: string;
    price: string;
    regular_price?: string;
    image: string;
}

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto focus when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults([]);
        }
        return () => { document.body.style.overflow = ''; }
    }, [isOpen]);

    // Handle Search with basic debounce
    useEffect(() => {
        if (!query.trim() || query.length < 2) {
            setResults([]);
            return;
        }

        const fetchResults = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data || []);
                    
                    // GTM Search Tracking
                    pushEvent('search_submitted_stape', {
                        ecommerce: {
                            search_term: query
                        }
                    });
                }
            } catch (err) {
                console.error('Search failed', err);
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(fetchResults, 400); // 400ms debounce
        return () => clearTimeout(timer);
    }, [query]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col">
            {/* Overlay */}
            <div 
                className="absolute inset-0 bg-brand-black/40 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>

            {/* Modal Body */}
            <div className="relative w-full bg-brand-surface shadow-2xl origin-top animate-fade-in-down">
                <div className="max-w-[1000px] mx-auto px-6 md:px-10 py-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-[12px] font-body font-bold tracking-[0.2em] uppercase text-brand-green">Ürün Arama</h2>
                        <button 
                            onClick={onClose}
                            className="p-2 -mr-2 rounded-full hover:bg-black/5 text-brand-muted hover:text-brand-black transition-colors"
                        >
                            <span className="material-symbols-outlined text-[24px]">close</span>
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="relative mb-8">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-brand-muted text-[32px]">
                            search
                        </span>
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Öğütücü, Aksesuar, Seri..."
                            className="w-full h-20 pl-16 pr-8 text-2xl md:text-4xl bg-white border-2 border-transparent focus:border-brand-black focus:outline-none rounded-lg font-headline font-semibold shadow-sm transition-all"
                        />
                        {loading && (
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-brand-green animate-spin">
                                sync
                            </span>
                        )}
                    </div>

                    {/* Results */}
                    <div className="max-h-[50vh] overflow-y-auto">
                        {results.length > 0 ? (
                            <div className="space-y-4">
                                {results.map((product) => (
                                    <Link 
                                        key={product.id} 
                                        href={`/product/${product.slug}`}
                                        onClick={onClose}
                                        className="flex items-center gap-4 bg-white p-4 rounded-lg hover:shadow-md border border-transparent hover:border-brand-border transition-all"
                                    >
                                        <div className="w-16 h-16 bg-brand-surface rounded-md overflow-hidden shrink-0">
                                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h3 className="font-headline font-bold text-brand-black text-[18px]">{product.name}</h3>
                                            <div className="flex items-baseline gap-2">
                                                <p className="font-body text-brand-muted font-medium text-[14px]">₺{product.price}</p>
                                                {product.regular_price && Number(product.regular_price) > Number(product.price) && (
                                                    <p className="font-body text-brand-muted/40 line-through text-[12px]">₺{product.regular_price}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-auto">
                                            <span className="material-symbols-outlined text-brand-green">arrow_forward</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : query.length > 1 && !loading ? (
                            <div className="text-center py-12">
                                <p className="font-body text-brand-muted text-lg">"{query}" için ürün bulunamadı. Lütfen başka bir kelime deneyin.</p>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
