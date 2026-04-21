// WooCommerce REST API helper
// Basic Auth ile hem HTTP hem HTTPS uzerinden calisir

export interface WCProduct {
    id: number;
    name: string;
    slug: string;
    price: string;
    regular_price: string;
    sale_price: string;
    status: string;
    description: string;
    short_description: string;
    images: { id: number; src: string; alt: string }[];
    categories: { id: number; name: string; slug: string }[];
    attributes: { name: string; options: string[] }[];
    stock_status: string;
    related_ids: number[];
}

function getAuthParams(): string {
    const key = process.env.WC_CONSUMER_KEY || '';
    const secret = process.env.WC_CONSUMER_SECRET || '';
    return `consumer_key=${key}&consumer_secret=${secret}`;
}

export interface WCCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    count: number;
}

export interface WPPage {
    id: number;
    slug: string;
    title: { rendered: string };
    content: { rendered: string };
}

function getBaseUrl(): string {
    return `${process.env.WORDPRESS_URL}/wp-json/wc/v3`;
}

export async function getProducts(
    perPage: number = 20, 
    categoryId?: number,
    orderby: string = 'date',
    order: string = 'desc',
    stockStatus?: string
): Promise<WCProduct[]> {
    try {
        let url = `${getBaseUrl()}/products?per_page=${perPage}&status=publish&orderby=${orderby}&order=${order}&${getAuthParams()}`;
        
        if (categoryId) url += `&category=${categoryId}`;
        if (stockStatus) url += `&stock_status=${stockStatus}`;

        console.log('[DEBUG] Fetching products from URL:', url.replace(/consumer_key=[^&]+&consumer_secret=[^\s]+/, '***'));

        const res = await fetch(url, {
            next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 300 }, 
        });

        if (!res.ok) {
            console.error('[WC API] Products fetch failed:', res.status, await res.text());
            return [];
        }

        const data = await res.json();
        console.log(`[DEBUG] Fetched ${data.length} products for category ${categoryId}`);
        return data;
    } catch (err) {
        console.error('[WC API] Products fetch error:', err);
        return [];
    }
}

export async function getProductBySlug(slug: string): Promise<WCProduct | null> {
    const url = `${getBaseUrl()}/products?slug=${slug}&status=publish&${getAuthParams()}`;
    console.log('[DEBUG] Fetching product by slug:', slug, 'from URL:', url.replace(/consumer_key=[^&]+&consumer_secret=[^\s]+/, '***'));
    try {
        const res = await fetch(url, {
            next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 300 },
        });

        if (!res.ok) {
            console.error('[WC API] Product fetch failed:', res.status, res.statusText);
            const text = await res.text();
            console.error('[WC API] Error details:', text);
            return null;
        }

        const products: WCProduct[] = await res.json();
        console.log('[DEBUG] Found products count for slug', slug, ':', products.length);
        return products.length > 0 ? products[0] : null;
    } catch (err) {
        console.error('[WC API] Product fetch error:', err);
        return null;
    }
}

export async function getProductById(id: number): Promise<WCProduct | null> {
    try {
        const res = await fetch(`${getBaseUrl()}/products/${id}?${getAuthParams()}`, {
            next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 300 },
        });

        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function getWCCategoryBySlug(slug: string): Promise<WCCategory | null> {
    try {
        const res = await fetch(`${getBaseUrl()}/products/categories?slug=${slug}&${getAuthParams()}`, {
            next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 300 }
        });
        if (!res.ok) return null;
        const data: WCCategory[] = await res.json();
        return data.length > 0 ? data[0] : null;
    } catch {
        return null;
    }
}

export async function getWCCategories(): Promise<WCCategory[]> {
    try {
        const res = await fetch(`${getBaseUrl()}/products/categories?hide_empty=true&${getAuthParams()}`, {
            next: { revalidate: process.env.NODE_ENV === 'development' ? 0 : 300 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch {
        return [];
    }
}

export async function getWPPageBySlug(slug: string): Promise<WPPage | null> {
    try {
        const res = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/pages?slug=${slug}`, {
            next: { revalidate: 300 }
        });
        if (!res.ok) return null;
        const data: WPPage[] = await res.json();
        return data.length > 0 ? data[0] : null;
    } catch {
        return null;
    }
}

/**
 * Ürün özel fotoğraflı yorumlarını çeker (proxy üzerinden)
 */
export async function getProductReviews(productId: number) {
    try {
        const response = await fetch(`/api/reviews/${productId}`, {
            cache: 'no-store'
        });
        if (!response.ok) return null;
        return await response.json();
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return null;
    }
}

/**
 * Yeni fotoğraflı yorum gönderir (proxy üzerinden)
 */
export async function submitProductReview(formData: FormData) {
    try {
        const response = await fetch(`/api/reviews/submit`, {
            method: 'POST',
            body: formData,
        });
        return await response.json();
    } catch (error) {
        console.error('Error submitting review:', error);
        return { success: false, message: 'Sunucu hatası oluştu.' };
    }
}

/**
 * Ürünle alakalı diğer ürünleri çeker
 */
export async function getRelatedProducts(product: WCProduct, limit: number = 10): Promise<WCProduct[]> {
    try {
        // 1. Varsa tanımlı 'related_ids' üzerinden çek
        if (product.related_ids && product.related_ids.length > 0) {
            const ids = product.related_ids.slice(0, limit).join(',');
            const url = `${getBaseUrl()}/products?include=${ids}&status=publish&${getAuthParams()}`;
            const res = await fetch(url, { next: { revalidate: 3600 } });
            if (res.ok) {
                const data = await res.json();
                if (data.length > 0) return data;
            }
        }

        // 2. Yoksa veya hata aldıysa aynı kategorideki ürünleri çek
        if (product.categories && product.categories.length > 0) {
            const catId = product.categories[0].id;
            return await getProducts(limit + 1, catId).then(list => 
                list.filter(p => p.id !== product.id).slice(0, limit)
            );
        }

        // 3. Hiçbiri yoksa rastgele ürünleri çek
        return await getProducts(limit);
    } catch (err) {
        console.error('[WC API] Related products fetch error:', err);
        return [];
    }
}
