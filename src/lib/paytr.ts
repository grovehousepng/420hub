// PayTR Link üretme — Sunucu taraflı (Server-only)
// WordPress eklentisinin /wp-json/paytr/v1/generate-link endpoint'ini çağırır
// Credentials hiçbir zaman client bundle'a sızmaz

interface PayTRLinkResponse {
    link: string;
    link_id: string;
    order_id: number;
}

interface PayTRErrorResponse {
    error: string;
}

export async function generatePayTRLink(
    items: { product_id: number | string; quantity: number, price?: number, variant?: string }[],
    frontend_total?: number,
    userData?: { first_name?: string; last_name?: string; email?: string; phone?: string },
    gaClientId?: string | null
): Promise<PayTRLinkResponse | PayTRErrorResponse> {
    const credentials = Buffer.from(
        `${process.env.WP_APP_USER}:${process.env.WP_APP_PASSWORD}`
    ).toString('base64');

    const res = await fetch(
        `${process.env.WORDPRESS_URL}/wp-json/paytr/v1/generate-link`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items,
                frontend_total: frontend_total || 0,
                user_data: userData,
                ga_client_id: gaClientId || '',
            }),
        }
    );

    const data = await res.json();

    if (!res.ok) {
        console.error('[PayTR] Link üretilemedi:', data);
        return { error: data.error || 'PayTR link üretme hatası' };
    }

    return data as PayTRLinkResponse;
}
