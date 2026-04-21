'use client';

import { useState, useEffect } from 'react';
import { getProductReviews, submitProductReview } from '@/lib/woocommerce';
import ReviewForm from './ReviewForm';
import ReviewLightbox from './ReviewLightbox';
import ProductRating from './ProductRating';

interface Photo {
    url: string;
    filename: string;
}

interface Review {
    id: number;
    author_name: string;
    author_email: string;
    rating: number;
    review_text: string;
    photos: Photo[];
    created_at: string;
}

interface Props {
    productId: number;
    productName: string;
}

export default function ProductReviews({ productId, productName }: Props) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [visibleCount, setVisibleCount] = useState(3);

    // Lightbox State
    const [lightbox, setLightbox] = useState<{
        isOpen: boolean;
        photos: Photo[];
        index: number;
    }>({
        isOpen: false,
        photos: [],
        index: 0
    });

    const fetchReviews = async () => {
        setLoading(true);
        const data = await getProductReviews(productId);
        if (data) {
            setReviews(data.reviews || []);
            setAvgRating(data.avg_rating || 0);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-brand-border/30 w-1/4 rounded-sm"></div>
                <div className="h-32 bg-brand-border/20 rounded-sm"></div>
            </div>
        );
    }

    return (
        <section id="reviews" className="mt-20 md:mt-28 border-t border-brand-border pt-16 md:pt-20">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-muted mb-2">— Müşteri Deneyimleri</p>
                        <h3 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter uppercase mb-4">Değerlendirmeler</h3>
                        
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-5xl font-headline font-bold text-brand-black">{avgRating > 0 ? avgRating : '—'}</span>
                                <div className="flex flex-col justify-center">
                                    <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map(n => (
                                            <span 
                                                key={n} 
                                                className={`material-symbols-outlined text-[20px] ${n <= Math.round(Number(avgRating)) ? 'text-brand-green' : 'text-brand-border'}`}
                                                style={{ fontVariationSettings: n <= Math.round(Number(avgRating)) ? "'FILL' 1" : "'FILL' 0" }}
                                            >star</span>
                                        ))}
                                    </div>
                                    <span className="text-[11px] font-body text-brand-muted uppercase tracking-wider font-bold">{reviews.length} Toplam Yorum</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="btn-press inline-flex items-center justify-center gap-2 bg-brand-black text-white px-6 py-3 font-headline font-bold text-[12px] tracking-[0.1em] uppercase rounded-sm self-start"
                    >
                        {showForm ? 'Vazgeç' : 'Yorum Yap'}
                        <span className="material-symbols-outlined text-[18px]">{showForm ? 'close' : 'add_photo_alternate'}</span>
                    </button>
                </div>

                {showForm && (
                    <div className="mb-16 bg-white p-6 md:p-10 rounded-sm border border-brand-border shadow-sm animate-fade-in-down">
                        <ReviewForm 
                            productId={productId} 
                            productName={productName}
                            onSuccess={() => {
                                setShowForm(false);
                                fetchReviews();
                            }} 
                        />
                    </div>
                )}

                <div className="space-y-12">
                    {reviews.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-sm border border-brand-border border-dashed">
                            <span className="material-symbols-outlined text-[40px] text-brand-border mb-3">chat_bubble_outline</span>
                            <p className="font-body text-brand-muted">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
                        </div>
                    ) : (
                        <>
                            {reviews.slice(0, visibleCount).map((review) => (
                                <div key={review.id} className="group border-b border-brand-border/60 pb-10 last:border-0">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <div className="flex gap-0.5 mb-2">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <span 
                                                        key={n} 
                                                        className={`material-symbols-outlined text-[14px] ${n <= review.rating ? 'text-brand-green' : 'text-brand-border'}`}
                                                        style={{ fontVariationSettings: n <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                                                    >star</span>
                                                ))}
                                            </div>
                                            <h4 className="font-headline font-bold text-brand-black tracking-tight uppercase">{review.author_name}</h4>
                                        </div>
                                        <span className="text-[11px] font-body text-brand-muted uppercase tracking-widest">
                                            {new Date(review.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <p className="font-body text-brand-muted leading-relaxed mb-6">
                                        {review.review_text}
                                    </p>

                                    {review.photos && review.photos.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {review.photos.map((photo, i) => (
                                                <button 
                                                    key={i} 
                                                    onClick={() => setLightbox({ isOpen: true, photos: review.photos, index: i })}
                                                    className="block w-20 h-20 md:w-24 md:h-24 bg-brand-surface rounded-sm overflow-hidden border border-brand-border hover:border-brand-green transition-colors cursor-zoom-in"
                                                >
                                                    <img 
                                                        src={photo.url} 
                                                        alt={`Yorum fotoğrafı ${i + 1}`} 
                                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Load More Button */}
                            {reviews.length > visibleCount && (
                                <div className="text-center pt-8">
                                    <button 
                                        onClick={() => setVisibleCount(reviews.length)}
                                        className="btn-press inline-flex items-center gap-2 bg-white border border-brand-border px-8 py-3 text-[12px] font-headline font-bold tracking-[0.1em] uppercase hover:border-brand-black transition-colors rounded-sm"
                                    >
                                        Tüm Yorumları Gör ({reviews.length})
                                        <span className="material-symbols-outlined text-[18px]">expand_more</span>
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Lightbox Integration */}
                <ReviewLightbox 
                    isOpen={lightbox.isOpen}
                    photos={lightbox.photos}
                    initialIndex={lightbox.index}
                    onClose={() => setLightbox({ ...lightbox, isOpen: false })}
                />
            </div>
        </section>
    );
}
