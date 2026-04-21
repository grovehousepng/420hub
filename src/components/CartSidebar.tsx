'use client';

import { useCartStore } from '@/store/useCartStore';
import Link from 'next/link';
import { useEffect } from 'react';
import { pushEvent } from '@/lib/gtm';

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: Props) {
    const { items, removeFromCart, updateQuantity, getTotal } = useCartStore();

    // Prevent body scroll when sidebar is open and trigger view_cart
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            // Push view_cart_stape event
            pushEvent('view_cart_stape', {
                ecommerce: {
                    currency: 'TRY',
                    value: getTotal(),
                    items: items.map(item => ({
                        item_id: String(item.id),
                        item_name: item.name,
                        price: item.price,
                        quantity: item.quantity,
                        item_variant: item.variant
                    }))
                }
            });
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, items, getTotal]);

    const handleRemoveFromCart = (item: any) => {
        removeFromCart(item.id);
        
        pushEvent('remove_from_cart_stape', {
            ecommerce: {
                currency: 'TRY',
                value: item.price * item.quantity,
                items: [{
                    item_id: String(item.id),
                    item_name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    item_variant: item.variant
                }]
            }
        });
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
                    isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                onClick={onClose}
            />

            {/* Sidebar Overlay */}
            <div
                className={`fixed inset-y-0 right-0 z-[90] w-full md:w-[420px] bg-white flex flex-col shadow-2xl transition-transform duration-300 ${
                    isOpen ? 'translate-x-0' : 'translate-x-[100%]'
                }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
                    <h2 className="text-[20px] font-headline font-bold text-brand-black">Sepetiniz</h2>
                    <button
                        onClick={onClose}
                        aria-label="Kapat"
                        className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-brand-surface text-brand-muted hover:text-brand-black transition-colors"
                    >
                        <span className="material-symbols-outlined text-[24px]">close</span>
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto p-6">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-brand-muted">
                            <span className="material-symbols-outlined text-[48px] mb-4 opacity-50">remove_shopping_cart</span>
                            <p className="font-body text-[16px] mb-6">Sepetiniz şu an boş.</p>
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-brand-surface text-brand-black font-semibold rounded-full hover:bg-brand-border transition-colors text-sm uppercase tracking-wider"
                            >
                                Alışverişe Devam Et
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.variant}`} className="flex gap-4 border-b border-brand-surface pb-6">
                                    {/* Image Placeholder or Actual Image */}
                                    <div className="w-20 h-24 bg-brand-surface rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                                        {item.imageUrl ? (
                                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined text-brand-muted">image</span>
                                        )}
                                    </div>
                                    
                                    {/* Item Details */}
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-semibold text-brand-black text-[15px] max-w-[80%] uppercase">{item.name}</h3>
                                                <button
                                                    onClick={() => handleRemoveFromCart(item)}
                                                    className="text-brand-muted hover:text-red-500 transition-colors"
                                                    aria-label="Kaldır"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                                </button>
                                            </div>
                                            {item.variant && (
                                                <p className="text-sm text-brand-muted font-body mb-2">Varyant: {item.variant}</p>
                                            )}
                                            <div className="font-bold text-brand-black text-[15px]">
                                                {Number(item.price).toLocaleString('tr-TR')} ₺
                                            </div>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-4 mt-3">
                                            <div className="flex items-center border border-brand-border rounded-md px-2 py-1 bg-white max-w-fit">
                                                <button
                                                    disabled={item.quantity <= 1}
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-brand-muted hover:text-brand-black disabled:opacity-50"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">remove</span>
                                                </button>
                                                <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-6 h-6 flex items-center justify-center text-brand-muted hover:text-brand-black"
                                                >
                                                    <span className="material-symbols-outlined text-[16px]">add</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Checkout Info */}
                {items.length > 0 && (
                    <div className="border-t border-brand-border bg-brand-surface/50 p-6">
                        <div className="flex items-center justify-between font-bold text-brand-black text-[18px] mb-6">
                            <span>Ara Toplam:</span>
                            <span>{getTotal().toLocaleString('tr-TR')} ₺</span>
                        </div>
                        
                        <p className="text-xs text-brand-muted text-center mb-4">
                            Kargo ve vergiler ödeme adımında hesaplanacaktır.
                        </p>

                        <Link href="/checkout" onClick={onClose} className="block w-full">
                            <button className="w-full bg-brand-green text-white py-4 rounded font-bold uppercase tracking-widest text-[14px] hover:bg-brand-green-light transition-colors shadow-lg btn-press flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">lock</span>
                                Güvenli Ödeme
                            </button>
                        </Link>
                    </div>
                )}
            </div>
        </>
    );
}
