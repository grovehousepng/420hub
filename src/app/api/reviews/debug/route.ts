import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const WP_URL = process.env.WORDPRESS_URL;

    try {
        const res = await fetch(`${WP_URL}/wp-json/photo-review/v1/debug`, {
            cache: 'no-store',
        });

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message });
    }
}
