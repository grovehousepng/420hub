'use client';

import { useRef, useState, useEffect } from 'react';
import { WCProduct } from '@/lib/woocommerce';
import ProductCard from './ProductCard';

interface Props {
    products: WCProduct[];
}

export default function ProductCarousel({ products }: Props) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
        }
    };

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            checkScroll();
            // Pencere boyutu değiştiğinde de kontrol et
            window.addEventListener('resize', checkScroll);
            return () => {
                el.removeEventListener('scroll', checkScroll);
                window.removeEventListener('resize', checkScroll);
            };
        }
    }, [products]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { clientWidth } = scrollRef.current;
            const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (products.length === 0) return null;

    return (
        <div className="relative group">
            {/* Navigation Arrows - Desktop only */}
            <div className="hidden md:block">
                {canScrollLeft && (
                    <button
                        onClick={() => scroll('left')}
                        className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-black shadow-lg hover:bg-brand-black hover:text-white transition-all duration-300"
                    >
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                )}
                {canScrollRight && (
                    <button
                        onClick={() => scroll('right')}
                        className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white border border-brand-border flex items-center justify-center text-brand-black shadow-lg hover:bg-brand-black hover:text-white transition-all duration-300"
                    >
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                )}
            </div>

            {/* Scrollable Container */}
            <div
                ref={scrollRef}
                className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 px-1 mt-6"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {products.map((product, index) => (
                    <div 
                        key={product.id} 
                        className="snap-start shrink-0 w-[260px] md:w-[320px]"
                    >
                        <ProductCard product={product} index={index} />
                    </div>
                ))}
            </div>
        </div>
    );
}
