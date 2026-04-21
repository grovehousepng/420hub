'use client';

import { useEffect } from 'react';
import { pushEvent } from '@/lib/gtm';

interface CollectionViewTrackerProps {
    itemListId: string;
    itemListName: string;
    products: Array<{
        id: string | number;
        name: string;
        price: string | null;
    }>;
}

export default function CollectionViewTracker({ itemListId, itemListName, products }: CollectionViewTrackerProps) {
    useEffect(() => {
        const totalValue = products.reduce((acc, p) => acc + parseFloat(p.price?.replace(/[^\d.]/g, '') || '0'), 0);

        pushEvent('view_item_list', {
            ecommerce: {
                currency: 'TRY',
                value: totalValue,
                item_list_id: itemListId,
                item_list_name: itemListName,
                items: products.map((p, i) => ({
                    item_id: String(p.id),
                    item_name: p.name,
                    price: parseFloat(p.price?.replace(/[^\d.]/g, '') || '0'),
                    index: i,
                    quantity: 1
                }))
            }
        });
    }, [itemListId, itemListName, products]);

    return null;
}
