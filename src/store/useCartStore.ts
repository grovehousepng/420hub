import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
    variant?: string;
    category?: string;
}

interface CartStore {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addToCart: (item) => set((state) => {
                const existingItem = state.items.find(i => i.id === item.id && i.variant === item.variant);
                const safeItem = { ...item, price: Number(item.price) };
                if (existingItem) {
                    return {
                        items: state.items.map(i => 
                            (i.id === item.id && i.variant === item.variant) 
                                ? { ...i, quantity: i.quantity + safeItem.quantity } 
                                : i
                        )
                    };
                }
                return { items: [...state.items, safeItem] };
            }),
            removeFromCart: (id) => set((state) => ({ 
                items: state.items.filter(item => item.id !== id) 
            })),
            updateQuantity: (id, quantity) => set((state) => ({
                items: state.items.map(item => 
                    item.id === id ? { ...item, quantity } : item
                )
            })),
            clearCart: () => set({ items: [] }),
            getTotal: () => {
                return get().items.reduce((total, item) => total + (Number(item.price) * item.quantity), 0);
            }
        }),
        {
            name: '420hub-cart-storage',
            // Fix existing localStorage data where price may be stored as string
            merge: (persistedState: any, currentState: CartStore): CartStore => {
                const sanitized = {
                    ...currentState,
                    ...persistedState,
                    items: (persistedState?.items || []).map((item: any) => ({
                        ...item,
                        price: Number(item.price) || 0,
                        quantity: Number(item.quantity) || 1,
                    })),
                };
                return sanitized;
            },
        }
    )
);
