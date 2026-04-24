import { NextRequest, NextResponse } from 'next/server';
// // export const runtime = 'edge';
import { getProducts } from '@/lib/woocommerce';

// We reuse getProducts but with a search term param, 
// let's update lib/woocommerce.ts to support search first.
// Wait, I will just write the fetch dynamically here to keep it simple, or import a specialized function.

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Missing query' }, { status: 400 });
    }

    try {
        const WC_BASE = `${process.env.WORDPRESS_URL}/wp-json/wc/v3`;
        const authHeader = 'Basic ' + Buffer.from(
            `${process.env.WC_CONSUMER_KEY}:${process.env.WC_CONSUMER_SECRET}`
        ).toString('base64');

        const res = await fetch(
            `${WC_BASE}/products?status=publish&search=${encodeURIComponent(query)}&per_page=5`,
            { headers: { Authorization: authHeader } }
        );

        if (!res.ok) {
            return NextResponse.json({ error: 'WP API Error' }, { status: res.status });
        }

        const data = await res.json();
        
        // Map data to reduce payload size
        const results = data.map((p: any) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            regular_price: p.regular_price,
            image: p.images?.[0]?.src || '/grinder-black.png'
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
