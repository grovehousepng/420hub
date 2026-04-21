// Browser tarafı GTM event yardımcıları
// purchase eventi ASLA buradan gönderilmez — o sGTM server-side'da

declare global {
    interface Window {
        dataLayer: Record<string, unknown>[];
    }
}

export function getGAClientId(): string | null {
    if (typeof document === 'undefined') return null;
    const cookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('_ga='));
    if (!cookie) return null;
    const parts = cookie.split('.');
    return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : null;
}

// Global pushEvent helper
export const pushEvent = (event: string, data?: any) => {
    if (typeof window !== "undefined" && (window as any).dataLayer) {
        // GA4 standartlarına ve JSON şablonlarına göre ecommerce objesini resetliyoruz
        if (data?.ecommerce) {
            (window as any).dataLayer.push({ ecommerce: null });
        }
        
        const payload = {
            event,
            ...data
        };
        
        console.log(`[GTM PUSH] ${event}:`, payload);
        (window as any).dataLayer.push(payload);
    }
};
