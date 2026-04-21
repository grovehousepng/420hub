'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useEffect } from 'react';

export default function ThankYouPage() {
    const clearCart = useCartStore(state => state.clearCart);

    // Sipariş başarılıktan sonra sepeti boşalt
    // NOT: Purchase event'i sGTM (webhook) tarafından atılır.
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="min-h-screen bg-brand-surface flex items-center justify-center py-20 px-6">
            <div className="max-w-xl w-full bg-white p-10 md:p-14 rounded-lg shadow-xl border border-brand-border text-center animate-fade-in-up">
                <div className="w-20 h-20 bg-brand-green/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="material-symbols-outlined text-[40px] text-brand-green">check_circle</span>
                </div>
                
                <h1 className="font-headline font-bold text-4xl text-brand-black tracking-tight mb-4">Siparişiniz Alındı</h1>
                <p className="font-body text-brand-muted text-lg leading-relaxed mb-10">
                    Ödemeniz başarıyla gerçekleşti. Sipariş detaylarınız e-posta adresinize gönderilecektir. Bizi tercih ettiğiniz için teşekkür ederiz.
                </p>
                
                <Link href="/" className="inline-flex items-center justify-center btn-press bg-brand-black text-white px-8 py-4 font-headline font-bold uppercase tracking-widest text-[13px] rounded-sm hover:bg-zinc-800 transition-colors gap-2">
                    <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                    Ana Sayfaya Dön
                </Link>
            </div>
        </div>
    );
}
