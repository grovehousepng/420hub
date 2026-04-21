"use client";

import { useEffect } from "react";
import { pushEvent } from "@/lib/gtm";

interface ProductViewTrackerProps {
    product: {
        id: string;
        name: string;
        price: any;
        category?: string;
        slug: string;
    };
}

export default function ProductViewTracker({ product }: ProductViewTrackerProps) {
    const categoryName = product.category || "ÖĞÜTÜCÜLER";

    useEffect(() => {
        // 1. Manuel Page View (Metadatanın güncellenmesi için küçük delay)
        const timer = setTimeout(() => {
            pushEvent("page_view", {
                page_location: window.location.href,
                page_path: `/product/${product.slug}`,
                page_title: `GRIND & CO | ${categoryName.toUpperCase()} > ${product.name.toUpperCase()}`,
            });
        }, 150);

        // 2. view_item Etkinliği (JSON şablonuna göre)
        pushEvent("view_item", {
            ecommerce: {
                currency: "TRY",
                value: parseFloat(product.price as any),
                items: [
                    {
                        item_id: String(product.id),
                        item_name: product.name,
                        item_category: categoryName,
                        price: parseFloat(product.price as any),
                        quantity: 1,
                        index: 0,
                    },
                ],
            },
        });

        return () => clearTimeout(timer);
    }, [product, categoryName]);

    return null;
}
