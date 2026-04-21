"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { pushEvent } from "@/lib/gtm";

export default function ClientRouteTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Ürün ve kategori sayfaları kendi özel (hierarchical) başlıklarıyla 
        // manuel page_view fırlattığı için buraları global takipçiden muaf tutuyoruz.
        const isProductPage = pathname.startsWith('/product/');
        const isCategoryPage = pathname.includes('/category/') || pathname === '/shop';
        
        if (isProductPage || isCategoryPage || pathname === '/checkout') return;

        // Next.js'in document.title'ı güncellediğinden emin olmak için mikro-delay
        const timer = setTimeout(() => {
            pushEvent("page_view", {
                page_location: window.location.href,
                page_path: pathname,
                page_title: document.title,
                page_search: searchParams?.toString() || '',
            });
        }, 150);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    return null;
}
