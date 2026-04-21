'use client';

import { useState, useEffect, useRef } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { pushEvent, getGAClientId } from '@/lib/gtm';

type PaymentState = 'idle' | 'pending' | 'success' | 'failed' | 'timeout';

export default function CheckoutPage() {
    const { items, getTotal, clearCart } = useCartStore();
    const [mounted, setMounted] = useState(false);
    const [paymentState, setPaymentState] = useState<PaymentState>('idle');
    const [orderData, setOrderData] = useState<{ order_id: number; total: string; billing: any } | null>(null);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        setMounted(true);
        
        // 1. Manuel Page View (JSON Config'e göre şart)
        const timer = setTimeout(() => {
            pushEvent('page_view', {
                page_location: window.location.href,
                page_path: '/checkout',
                page_title: 'GRIND & CO | GÜVENLİ ÖDEME',
            });
        }, 150);

        return () => {
            clearTimeout(timer);
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, []);

    const total = mounted ? getTotal() : 0;

    const startPolling = (orderId: number) => {
        let attempts = 0;
        const MAX_ATTEMPTS = 40; // 40 * 3s = 2 dakika

        pollingRef.current = setInterval(async () => {
            attempts++;
            try {
                const res = await fetch(`/api/order-status?order_id=${orderId}`);
                const data = await res.json();

                if (data.status === 'processing' || data.status === 'completed') {
                    clearInterval(pollingRef.current!);
                    
                    // JSON şablonuna göre purchase (Tag 32)
                    pushEvent('purchase', {
                        ecommerce: {
                            transaction_id: String(orderId),
                            value: parseFloat(data.total),
                            currency: 'TRY',
                            items: data.line_items?.map((item: any) => ({
                                item_id: String(item.product_id),
                                item_name: item.name,
                                price: parseFloat(item.total),
                                quantity: item.quantity
                            })) || []
                        }
                    });

                    clearCart();
                    setOrderData(data);
                    setPaymentState('success');
                } else if (data.status === 'failed' || data.status === 'cancelled') {
                    clearInterval(pollingRef.current!);
                    setPaymentState('failed');
                } else if (attempts >= MAX_ATTEMPTS) {
                    clearInterval(pollingRef.current!);
                    setPaymentState('timeout');
                }
            } catch {
                // Network error, keep polling
            }
        }, 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (items.length === 0) {
            setError('Sepetiniz boş.');
            setLoading(false);
            return;
        }

        // JSON şablonuna göre begin_checkout (Tag 114)
        pushEvent('begin_checkout', {
            user_data: {
                email: formData.email,
                phone: formData.phone,
                first_name: formData.first_name,
                last_name: formData.last_name,
            },
            ecommerce: {
                currency: 'TRY',
                value: total,
                items: items.map((item, index) => ({
                    item_id: String(item.id),
                    item_name: item.name,
                    price: parseFloat(item.price as any),
                    quantity: item.quantity,
                    item_variant: item.variant || '',
                    index
                }))
            }
        });

        const gaClientId = getGAClientId();

        try {
            const res = await fetch('/api/paytr-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map(i => ({ product_id: i.id, quantity: i.quantity, price: i.price, variant: i.variant })),
                    frontend_total: total,
                    user_data: formData,
                    ga_client_id: gaClientId
                })
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            if (data.link && data.order_id) {
                window.open(data.link, '_blank');
                setPaymentState('pending');
                setLoading(false);
                startPolling(data.order_id);
            }
        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'Ödeme bağlantısı oluşturulurken bir hata oluştu');
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    // ── PENDING SCREEN (Ödeme Bekleniyor) ────────────────────────
    if (paymentState === 'pending') {
        return (
            <div className="bg-brand-surface min-h-screen flex items-center justify-center px-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-brand-border p-10 md:p-14 text-center">
                    <div className="w-24 h-24 rounded-full bg-brand-black/5 flex items-center justify-center mx-auto mb-8">
                        <span className="material-symbols-outlined text-[48px] text-brand-black animate-spin">sync</span>
                    </div>
                    <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-muted mb-3">Ödeme Bekleniyor</p>
                    <h1 className="font-headline font-bold text-3xl text-brand-black tracking-tight mb-4">
                        PayTR ödemenizi<br />bekliyoruz...
                    </h1>
                    <p className="font-body text-brand-muted text-base leading-relaxed mb-2">
                        Açılan sekmeden ödemenizi tamamladıktan sonra bu sayfa otomatik olarak güncellenecek.
                    </p>
                    <p className="font-body text-brand-muted text-sm">
                        Sekme kapandıysa <a href="#" onClick={() => window.location.reload()} className="underline">sayfayı yenileyin</a>.
                    </p>
                </div>
            </div>
        );
    }

    // ── SUCCESS SCREEN ──────────────────────────────────────────
    if (paymentState === 'success') {
        return (
            <div className="bg-brand-surface min-h-screen flex items-center justify-center px-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-brand-border p-10 md:p-14 text-center">
                    <div className="w-24 h-24 rounded-full bg-brand-green/10 flex items-center justify-center mx-auto mb-8"
                         style={{ animation: 'bounceIn 0.6s ease-out' }}>
                        <span className="material-symbols-outlined text-[52px] text-brand-green">check_circle</span>
                    </div>
                    <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-green mb-3">Ödeme Onaylandı ✓</p>
                    <h1 className="font-headline font-bold text-3xl md:text-4xl text-brand-black tracking-tight mb-4">
                        Siparişiniz Alındı!<br />
                        <span className="text-brand-green">Teşekkürler 🎉</span>
                    </h1>
                    {orderData && (
                        <div className="bg-brand-surface rounded-lg p-4 mb-6 text-left">
                            <p className="text-xs font-bold tracking-widest uppercase text-brand-muted mb-2">Sipariş Özeti</p>
                            <p className="font-body text-brand-black text-sm">
                                Sipariş #{orderData.order_id} · <strong>{Number(orderData.total).toLocaleString('tr-TR')} ₺</strong>
                            </p>
                            {orderData.billing?.email && (
                                <p className="font-body text-brand-muted text-sm mt-1">
                                    Onay: {orderData.billing.email}
                                </p>
                            )}
                        </div>
                    )}
                    <p className="font-body text-brand-muted text-sm leading-relaxed mb-10">
                        Sipariş detayları e-posta adresinize gönderilecektir.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <a href="/" className="btn-press inline-flex items-center justify-center gap-2 bg-brand-black text-white px-8 py-4 font-headline font-bold text-[13px] uppercase tracking-[0.08em] rounded-sm hover:bg-zinc-800 transition-colors">
                            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                            Ana Sayfaya Dön
                        </a>
                    </div>
                </div>
                <style>{`
                    @keyframes bounceIn {
                        0% { transform: scale(0.3); opacity: 0; }
                        50% { transform: scale(1.1); }
                        70% { transform: scale(0.95); }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        );
    }

    // ── FAILED SCREEN ──────────────────────────────────────────
    if (paymentState === 'failed') {
        return (
            <div className="bg-brand-surface min-h-screen flex items-center justify-center px-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-brand-border p-10 md:p-14 text-center">
                    <div className="w-24 h-24 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-8">
                        <span className="material-symbols-outlined text-[52px] text-red-500">cancel</span>
                    </div>
                    <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-red-500 mb-3">Ödeme Başarısız</p>
                    <h1 className="font-headline font-bold text-3xl text-brand-black tracking-tight mb-4">
                        Ödeme tamamlanamadı.
                    </h1>
                    <p className="font-body text-brand-muted text-base leading-relaxed mb-10">
                        Kartınız reddedildi veya işlem iptal edildi. Lütfen tekrar deneyin.
                    </p>
                    <button onClick={() => setPaymentState('idle')} className="btn-press inline-flex items-center justify-center gap-2 bg-brand-black text-white px-8 py-4 font-headline font-bold text-[13px] uppercase tracking-[0.08em] rounded-sm">
                        Tekrar Dene
                    </button>
                </div>
            </div>
        );
    }

    // ── TIMEOUT SCREEN ─────────────────────────────────────────
    if (paymentState === 'timeout') {
        return (
            <div className="bg-brand-surface min-h-screen flex items-center justify-center px-6">
                <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-brand-border p-10 md:p-14 text-center">
                    <div className="w-24 h-24 rounded-full bg-yellow-50 flex items-center justify-center mx-auto mb-8">
                        <span className="material-symbols-outlined text-[52px] text-yellow-500">schedule</span>
                    </div>
                    <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-yellow-600 mb-3">Onay Bekleniyor</p>
                    <h1 className="font-headline font-bold text-3xl text-brand-black tracking-tight mb-4">
                        Ödemeniz işleniyor...
                    </h1>
                    <p className="font-body text-brand-muted text-base leading-relaxed mb-10">
                        Ödemeniz onaylanıyor. Birkaç dakika içinde e-posta adresinize sipariş onayı gelecektir.
                    </p>
                    <a href="/" className="btn-press inline-flex items-center justify-center gap-2 bg-brand-black text-white px-8 py-4 font-headline font-bold text-[13px] uppercase tracking-[0.08em] rounded-sm">
                        Ana Sayfaya Dön
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-brand-surface min-h-screen pt-[140px] pb-20">
            <div className="max-w-3xl mx-auto px-6 md:px-10">
                <h1 className="text-3xl font-headline font-bold mb-8 text-brand-black tracking-tight">Güvenli Ödeme</h1>
                
                <div className="bg-white p-8 rounded-lg shadow-sm border border-brand-border">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-sm font-medium font-body text-sm">
                                {error}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold tracking-[0.1em] uppercase text-brand-muted mb-2">Adınız</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="first_name" 
                                    value={formData.first_name} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-brand-surface border border-transparent focus:border-brand-black focus:bg-white rounded-sm outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold tracking-[0.1em] uppercase text-brand-muted mb-2">Soyadınız</label>
                                <input 
                                    required 
                                    type="text" 
                                    name="last_name" 
                                    value={formData.last_name} 
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-brand-surface border border-transparent focus:border-brand-black focus:bg-white rounded-sm outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold tracking-[0.1em] uppercase text-brand-muted mb-2">E-posta Adresi</label>
                            <input 
                                required 
                                type="email" 
                                name="email" 
                                value={formData.email} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-brand-surface border border-transparent focus:border-brand-black focus:bg-white rounded-sm outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold tracking-[0.1em] uppercase text-brand-muted mb-2">Telefon Numarası</label>
                            <input 
                                required 
                                type="tel" 
                                name="phone" 
                                value={formData.phone} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-brand-surface border border-transparent focus:border-brand-black focus:bg-white rounded-sm outline-none transition-all"
                            />
                        </div>

                        <div className="pt-6 border-t border-brand-border">
                            <div className="flex justify-between items-center mb-6 font-headline font-bold text-lg">
                                <span>Toplam Ödenecek Tutar</span>
                                <span>{mounted ? total.toLocaleString('tr-TR') : '...'} ₺</span>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={loading || items.length === 0}
                                className="w-full btn-press flex items-center justify-center gap-3 bg-brand-green text-white py-4 font-headline font-bold text-[14px] uppercase tracking-[0.08em] rounded-sm disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                            >
                                {loading ? (
                                    <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                                ) : (
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                )}
                                {loading ? 'Bağlantı Kuruluyor...' : 'PayTR ile Ödemeye Geç'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
