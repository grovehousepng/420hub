/**
 * GET /api/order-status?order_id=123
 * WooCommerce siparişinin durumunu döner.
 * Credentials sunucu tarafında kalır, client'a sızmaz.
 */
import { NextRequest, NextResponse } from 'next/server';

// export const runtime = 'edge';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
        return Response.json({ error: 'order_id gerekli' }, { status: 400 });
    }

    const key = process.env.WC_CONSUMER_KEY;
    const secret = process.env.WC_CONSUMER_SECRET;
    const baseUrl = process.env.WORDPRESS_URL;

    try {
        const res = await fetch(
            `${baseUrl}/wp-json/wc/v3/orders/${orderId}?consumer_key=${key}&consumer_secret=${secret}`,
            { cache: 'no-store' }
        );

        if (!res.ok) {
            return Response.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
        }

        const order = await res.json();

        return Response.json({
            order_id: order.id,
            status: order.status, // pending, processing, completed, failed, cancelled
            total: order.total,
            billing: {
                first_name: order.billing?.first_name,
                last_name: order.billing?.last_name,
                email: order.billing?.email,
            }
        });
    } catch (err) {
        console.error('[/api/order-status] Hata:', err);
        return Response.json({ error: 'Sunucu hatası' }, { status: 500 });
    }
}
