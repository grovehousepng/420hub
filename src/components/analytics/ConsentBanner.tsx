'use client';

import { useState, useEffect } from 'react';
import { pushEvent } from '@/lib/gtm';

export default function ConsentBanner() {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        // Simple cookie check
        const hasConsent = document.cookie.includes('420hub_consent_status=');
        
        // Define default consent state for GTM before logic runs
        pushEvent('default_consent', {
            ad_storage: 'denied',
            analytics_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied'
        });

        if (!hasConsent) {
            setShowBanner(true);
        } else {
            // Already accepted or rejected
            const isAccepted = document.cookie.includes('420hub_consent_status=accepted');
            if (isAccepted) {
                applyConsent('granted');
            }
        }
    }, []);

    const applyConsent = (status: 'granted' | 'denied') => {
        pushEvent('update_consent', {
            ad_storage: status,
            analytics_storage: status,
            ad_user_data: status,
            ad_personalization: status
        });
        
        // Save choice for 365 days
        document.cookie = `420hub_consent_status=${status === 'granted' ? 'accepted' : 'rejected'}; path=/; max-age=31536000`;
        setShowBanner(false);
    };

    if (!showBanner) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 md:bottom-8 md:left-8 md:right-auto md:w-[380px] z-[100] bg-white md:border border-t border-brand-border p-4 md:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] md:shadow-2xl flex flex-col gap-3 md:gap-5 animate-fade-in-up rounded-t-xl md:rounded-2xl">
            <div className="text-[11.5px] md:text-[12.5px] font-body text-brand-muted leading-relaxed">
                <span className="font-headline font-bold text-brand-black block mb-1.5 md:mb-2 text-[13px] md:text-[14px]">
                    🍪 Çerez Tercihleri
                </span>
                Size en iyi deneyimi sunmak için çerezleri kullanıyoruz. Sitemizi kullanmaya devam ederek onaylamış olursunuz.
            </div>
            <button 
                onClick={() => applyConsent('granted')}
                className="w-full px-6 py-2.5 md:py-3.5 bg-brand-black text-white font-headline font-bold text-[12px] md:text-[13px] uppercase tracking-wider rounded-lg md:rounded-xl transition-colors hover:bg-zinc-800 shadow-sm flex justify-center items-center gap-2"
            >
                <span className="material-symbols-outlined text-[16px] md:text-[18px]">check</span>
                Kabul Et
            </button>
        </div>
    );
}
