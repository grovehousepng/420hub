'use client';

import { useEffect, useState } from 'react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ReviewSuccessPopup({ isOpen, onClose }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setMounted(true);
            document.body.style.overflow = 'hidden';
            
            // Auto close after 5 seconds
            const timer = setTimeout(() => {
                handleClose();
            }, 5000);
            return () => clearTimeout(timer);
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const handleClose = () => {
        setMounted(false);
        setTimeout(onClose, 300); // Wait for animation
    };

    if (!isOpen && !mounted) return null;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center px-6 transition-all duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
            {/* Backdrop */}
            <div 
                className={`absolute inset-0 bg-brand-black/40 backdrop-blur-md transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}
                onClick={handleClose}
            />
            
            {/* Modal Content */}
            <div 
                className={`relative bg-white w-full max-w-md p-8 md:p-12 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.2)] text-center transition-all duration-500 transform ${mounted ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-8 scale-95 opacity-0'}`}
            >
                <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="material-symbols-outlined text-[40px] text-brand-green select-none">verified</span>
                </div>
                
                <h3 className="font-headline font-bold text-2xl md:text-3xl tracking-tight text-brand-black mb-4 uppercase">
                    Yorumunuz Alındı!
                </h3>
                
                <p className="font-body text-brand-muted text-base leading-relaxed mb-10">
                    Değerli geri bildiriminiz için teşekkür ederiz. Yorumunuz incelendikten sonra kısa süre içinde onaylanacaktır.
                </p>
                
                <button
                    onClick={handleClose}
                    className="w-full bg-brand-black text-white py-4 font-headline font-bold text-[13px] tracking-[0.1em] uppercase rounded-sm btn-press"
                >
                    Anladım, Teşekkürler
                </button>
            </div>
        </div>
    );
}
