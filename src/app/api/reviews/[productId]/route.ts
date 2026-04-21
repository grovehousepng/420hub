import { NextRequest, NextResponse } from 'next/server';
export const runtime = 'edge';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ productId: string }> }
) {
    const { productId } = await params;
    const WP_URL = process.env.WORDPRESS_URL;

    try {
        const timestamp = Date.now();
        const res = await fetch(`${WP_URL}/wp-json/photo-review/v1/product/${productId}?t=${timestamp}`, {
            cache: 'no-store',
        });

        if (!res.ok) {
            return NextResponse.json({ reviews: [], count: 0, avg_rating: 0 });
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Reviews fetch error:', error);
        return NextResponse.json({ reviews: [], count: 0, avg_rating: 0 });
    }
}
