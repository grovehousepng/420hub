import { NextRequest, NextResponse } from 'next/server';
// export const runtime = 'edge';

export async function POST(request: NextRequest) {
    const WP_URL = process.env.WORDPRESS_URL;

    try {
        const formData = await request.formData().catch(e => {
            throw new Error('FormData ayrıştırma hatası: ' + e.message);
        });

        console.log('WordPress\'e istek atılıyor:', `${WP_URL}/wp-json/photo-review/v1/submit`);

        const response = await fetch(`${WP_URL}/wp-json/photo-review/v1/submit`, {
            method: 'POST',
            body: formData,
        }).catch(e => {
            throw new Error('WordPress fetch hatası: ' + e.message);
        });

        const contentType = response.headers.get('content-type');
        const rawText = await response.text();
        
        console.log('WordPress yanıtı (ilk 100 karakter):', rawText.substring(0, 100));

        if (contentType && contentType.includes('application/json')) {
            try {
                const data = JSON.parse(rawText);
                return NextResponse.json(data, { status: response.status });
            } catch (e) {
                return NextResponse.json(
                    { success: false, message: 'WordPress JSON dönmek istedi ama JSON bozuk.', detail: rawText },
                    { status: 500 }
                );
            }
        } else {
            return NextResponse.json(
                { success: false, message: 'WordPress JSON yerine başka bir şey döndürdü (Muhtemelen PHP Hatası).', detail: rawText },
                { status: response.status || 500 }
            );
        }
    } catch (error: any) {
        console.error('Kritik Proxy Hatası:', error);
        return NextResponse.json(
            { success: false, message: 'Proxy katmanında hata.', detail: error.message },
            { status: 500 }
        );
    }
}
