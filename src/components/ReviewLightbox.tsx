'use client';

import { useEffect, useState } from 'react';

interface Photo {
    url: string;
    filename: string;
}

interface Props {
    photos: Photo[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function ReviewLightbox({ photos, initialIndex, isOpen, onClose }: Props) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex, isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };

        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, currentIndex]);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-brand-black/95 backdrop-blur-md animate-fade-in">
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors p-2 z-[100]"
            >
                <span className="material-symbols-outlined text-[32px]">close</span>
            </button>

            {/* Navigation Arrows */}
            {photos.length > 1 && (
                <>
                    <button 
                        onClick={handlePrev}
                        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-all hover:bg-white/10 rounded-full z-[100]"
                    >
                        <span className="material-symbols-outlined text-[40px]">chevron_left</span>
                    </button>
                    <button 
                        onClick={handleNext}
                        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-4 text-white/50 hover:text-white transition-all hover:bg-white/10 rounded-full z-[100]"
                    >
                        <span className="material-symbols-outlined text-[40px]">chevron_right</span>
                    </button>
                </>
            )}

            {/* Main Image Container */}
            <div className="relative w-full h-full max-w-5xl max-h-[85vh] p-4 flex flex-col items-center justify-center select-none">
                <div className="relative group overflow-hidden bg-brand-black/20 rounded-sm">
                    <img 
                        src={photos[currentIndex].url} 
                        alt="Yorum görseli tam ekran"
                        className="max-w-full max-h-[75vh] object-contain animate-scale-in"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>

                {/* Info & Counter */}
                <div className="mt-6 text-center space-y-2">
                    <p className="text-white/60 font-body text-xs uppercase tracking-[0.2em]">
                        Görsel {currentIndex + 1} / {photos.length}
                    </p>
                    {photos.length > 1 && (
                        <div className="flex gap-2 justify-center">
                            {photos.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentIndex(i)}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-brand-green w-4' : 'bg-white/20'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Background Click to Close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
}
