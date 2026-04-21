'use client';

import { useCartStore, CartItem } from '@/store/useCartStore';
import { useRouter } from 'next/navigation';

interface Props {
    product: CartItem;
    variant: 'main' | 'hover';
    isBuyNow?: boolean;
}

export default function AddToCartButton({ product, variant, isBuyNow }: Props) {
    const addToCart = useCartStore((state) => state.addToCart);
    const router = useRouter();

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault(); 
        e.stopPropagation();
        
        // Track Add to Cart
        const { pushEvent } = await import('@/lib/gtm');
        pushEvent('add_to_cart', {
            ecommerce: {
                currency: 'TRY',
                value: parseFloat(product.price as any),
                items: [{
                    item_id: String(product.id),
                    item_name: product.name,
                    price: parseFloat(product.price as any),
                    quantity: product.quantity,
                    item_category: product.category || 'Genel',
                    item_variant: product.variant || '',
                    index: 0
                }]
            }
        });

        addToCart(product);
        
        if (isBuyNow) {
            router.push('/checkout');
        } else {
            // Custom event for CartSidebar so it opens
            document.dispatchEvent(new CustomEvent('open-cart'));
        }
    };

    if (variant === 'main') {
        if (isBuyNow) {
            return (
                <button 
                    onClick={handleAdd}
                    className="btn-press w-full flex items-center justify-center gap-3 bg-brand-green text-white py-4 font-headline font-bold text-[13px] uppercase tracking-[0.08em] rounded-sm"
                >
                    <span className="material-symbols-outlined text-[20px]">bolt</span>
                    PayTR ile Hemen Satın Al
                </button>
            );
        }

        return (
            <button 
                onClick={handleAdd}
                className="btn-press w-full flex items-center justify-center gap-3 bg-brand-black text-white py-4 font-headline font-bold text-[13px] uppercase tracking-[0.08em] rounded-sm"
            >
                <span className="material-symbols-outlined text-[20px]">local_mall</span>
                Sepete Ekle
            </button>
        );
    }

    return (
        <button 
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-surface border border-brand-border text-[11px] font-headline font-bold uppercase tracking-wider text-brand-black opacity-0 group-hover:opacity-100 hover:bg-brand-black hover:text-white hover:border-brand-black -translate-y-1 group-hover:translate-y-0 transition-all duration-300"
        >
            Sepete Ekle
            <span className="material-symbols-outlined text-[15px]">local_mall</span>
        </button>
    );
}
