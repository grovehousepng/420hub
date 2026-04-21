'use client';

import { useState, useEffect } from 'react';
import { getProductReviews } from '@/lib/woocommerce';

interface Props {
    productId: number;
    showCount?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export default function ProductRating({ productId, showCount = true, size = 'sm' }: Props) {
    const [rating, setRating] = useState(0);
    const [count, setCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRating() {
            try {
                const data = await getProductReviews(productId);
                if (data) {
                    setRating(Number(data.avg_rating) || 0);
                    setCount(Number(data.count) || 0);
                }
            } catch (error) {
                console.error('Rating fetch error:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchRating();
    }, [productId]);

    if (loading) return <div className="h-4 w-24 bg-brand-border/20 animate-pulse rounded"></div>;

    const starSize = size === 'lg' ? 'text-[20px]' : size === 'md' ? 'text-[16px]' : 'text-[14px]';

    if (count === 0) {
        return (
            <div className="flex items-center gap-2 opacity-40">
                <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(n => (
                        <span key={n} className={`material-symbols-outlined ${starSize} text-brand-border`}>star</span>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(n => (
                    <span 
                        key={n} 
                        className={`material-symbols-outlined ${starSize} ${n <= Math.round(rating) ? 'text-brand-green' : 'text-brand-border'}`}
                        style={{ fontVariationSettings: n <= Math.round(rating) ? "'FILL' 1" : "'FILL' 0" }}
                    >star</span>
                ))}
            </div>
            {showCount && (
                <span className="text-[10px] font-body text-brand-muted uppercase tracking-wider font-semibold">
                    {count} Yorum
                </span>
            )}
        </div>
    );
}
