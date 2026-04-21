'use client';

import { useEffect } from 'react';
import { pushEvent } from '@/lib/gtm';

interface CategoryViewTrackerProps {
    categoryName: string;
    items?: any[];
    categoryId?: string | number;
    pathname?: string;
}

export default function CategoryViewTracker({ categoryName, items = [], categoryId, pathname = '' }: CategoryViewTrackerProps) {
    useEffect(() => {
        const fullTitle = `GRIND & CO | ${categoryName.toUpperCase()}`;

        // 1. Manuel Page View
        const timer = setTimeout(() => {
            pushEvent('page_view', {
                page_location: window.location.href,
                page_path: pathname,
                page_title: fullTitle,
            });
        }, 150);

        // 2. view_item_list Etkinliği (JSON şablonuna göre)
        const totalValue = items.reduce((acc, p) => acc + parseFloat(p.price as any || 0), 0);
        
        pushEvent('view_item_list', {
            ecommerce: {
                currency: 'TRY',
                value: totalValue,
                item_list_id: categoryId ? String(categoryId) : 'all',
                item_list_name: categoryName,
                items: items.map((p, index) => ({
                    item_id: String(p.id),
                    item_name: p.name,
                    price: parseFloat(p.price as any),
                    item_category: categoryName,
                    index: index,
                    quantity: 1
                }))
            }
        });

        return () => clearTimeout(timer);
    }, [pathname, categoryName, items, categoryId]);

    return null;
}
