import { generatePayTRLink } from '@/lib/paytr';

// export const runtime = 'edge';

/**
 * POST /api/paytr-link
 * 
 * Next.js Route Handler — WordPress PayTR eklentisine proxy.
 * Body: { items: {product_id: number, quantity: number}[], user_data?: any, ga_client_id?: string }
 * Response: { link: string, link_id: string, order_id: number }
 * 
 * Bu handler sunucu tarafında çalışır.
 * WP_APP_USER / WP_APP_PASSWORD hiçbir zaman client'a sızmaz.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, frontend_total, user_data, ga_client_id } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return Response.json({ error: 'Sepet boş veya geçersiz format.' }, { status: 400 });
        }

        const result = await generatePayTRLink(
            items,
            frontend_total,
            user_data,
            ga_client_id || null
        );

        if ('error' in result) {
            return Response.json({ error: result.error }, { status: 500 });
        }

        return Response.json(result);
    } catch (err) {
        console.error('[/api/paytr-link] Hata:', err);
        return Response.json(
            { error: 'Sunucu hatası. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
