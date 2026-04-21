# 420HUB — Frontend & GTM Master Prompt
# Bu dosyayı baştan sona oku, hiçbir kısmı atlama.

---

## 1. SENİN ROLÜN

Sen 420hub projesinin Next.js frontend'ine GTM dataLayer entegrasyonunu ekleyen ve
mevcut bileşenleri tamamlayan AI geliştirme agentısın.

Backend hazır:
- WordPress + WooCommerce çalışıyor
- PayTR Link Gateway plugin'i kurulu
- sGTM container'ı `https://sso.420hub.com.tr` adresinde ayakta
- Web GTM container'ı `GTM-WZ9N3Z3R` (Stape şablonu, import edildi)

Senin görevin:
1. GTM snippet'ini Next.js'e doğru eklemek
2. Her sayfada/aksiyonda doğru dataLayer event'lerini push etmek
3. `_ga client_id`'yi yakalayıp PayTR API çağrısına eklemek

---

## 2. GTM KURULUMU — Next.js App Router

### layout.tsx'e ekle

```tsx
import Script from 'next/script'

// <head> içine:
<Script
  id="gtm-script"
  strategy="afterInteractive"
  dangerouslySetInnerHTML={{
    __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-WZ9N3Z3R');`,
  }}
/>

// <body> açılışından hemen sonra:
<noscript>
  <iframe
    src="https://www.googletagmanager.com/ns.html?id=GTM-WZ9N3Z3R"
    height="0" width="0"
    style={{ display: 'none', visibility: 'hidden' }}
  />
</noscript>
```

---

## 3. DATALAYER EVENT REFERANSI

### ÖNEMLİ: Bu şablondaki event isimleri `_stape` suffix'li
GTM container'ındaki triggerlar standart GA4 event isimlerini DEĞİL,
`_stape` suffix'li özel isimleri dinliyor. Aşağıdaki isimleri birebir kullan.

### 3.1 GTM Helper — `lib/gtm.ts`

```ts
// lib/gtm.ts
declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
  }
}

export function pushEvent(event: string, data: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({ event, ...data })
}

export function getGAClientId(): string | null {
  if (typeof document === 'undefined') return null
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('_ga='))
  if (!cookie) return null
  const parts = cookie.split('.')
  return parts.length >= 4 ? `${parts[2]}.${parts[3]}` : null
}
```

---

## 4. EVENT REFERANSI — SAYFA SAYFA

### 4.1 page_view
GTM zaten DOM Ready'de otomatik tetikler. Ekstra bir şey yapma.

### 4.2 view_item — Ürün Detay Sayfası
`app/products/[slug]/page.tsx` — bileşen mount olduğunda:

```ts
pushEvent('view_item_stape', {
  ecommerce: {
    currency: 'TRY',
    value: parseFloat(product.price),
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.categories?.[0]?.name ?? '',
      price: parseFloat(product.price),
      quantity: 1,
    }]
  }
})
```

### 4.3 add_to_cart — Sepete Ekle Butonu

```ts
pushEvent('add_to_cart_stape', {
  ecommerce: {
    currency: 'TRY',
    value: parseFloat(product.price) * quantity,
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.categories?.[0]?.name ?? '',
      price: parseFloat(product.price),
      quantity,
    }]
  }
})
```

### 4.4 begin_checkout — Ödeme Butonu Tıklandığında
PayTR link isteği atmadan ÖNCE push et:

```ts
pushEvent('begin_checkout_stape', {
  ecommerce: {
    currency: 'TRY',
    value: cartTotal,
    items: cartItems.map(item => ({
      item_id: String(item.id),
      item_name: item.name,
      price: parseFloat(item.price),
      quantity: item.quantity,
    }))
  }
})
```

### 4.5 purchase — YAPMA
`purchase` eventi sGTM'ye WordPress callback'ten server-side gidiyor.
Browser tarafından tekrar gönderme — duplicate olur.

### 4.6 search — Arama

```ts
pushEvent('search_submitted_stape', {
  ecommerce: {
    search_term: searchQuery
  }
})
```

### 4.7 view_item_list — Ürün Listesi / Koleksiyon

```ts
pushEvent('view_collection_stape', {
  ecommerce: {
    item_list_name: 'Ana Sayfa',
    items: products.map((p, i) => ({
      item_id: String(p.id),
      item_name: p.name,
      price: parseFloat(p.price),
      index: i,
    }))
  }
})
```

---

## 5. PAYTR ENTEGRASYONU — GA CLIENT ID

PayTR link üretirken `ga_client_id`'yi ekle:

```ts
// checkout/page.tsx veya PaymentButton.tsx

import { getGAClientId, pushEvent } from '@/lib/gtm'

async function handlePayment() {
  setLoading(true)

  // 1. begin_checkout event'i
  pushEvent('begin_checkout_stape', {
    ecommerce: {
      currency: 'TRY',
      value: total,
      items: cartItems.map(item => ({
        item_id: String(item.id),
        item_name: item.name,
        price: parseFloat(item.price),
        quantity: item.quantity,
      }))
    }
  })

  // 2. GA client_id'yi yakala
  const gaClientId = getGAClientId()

  // 3. PayTR link iste
  const res = await fetch('/api/paytr-link', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_id: product.id,
      quantity: 1,
      ga_client_id: gaClientId, // sGTM'ye oradan iletilir
    }),
  })

  const data = await res.json()
  if (data.error) { setError(data.error); setLoading(false); return }

  window.location.href = data.link
}
```

---

## 6. THANK YOU SAYFASI

PayTR ödeme sonrası kullanıcı bu sayfaya döner.
`purchase` eventi zaten WordPress → sGTM üzerinden gitti.
Bu sayfada sadece UI göster, event push etme.

```tsx
// app/thank-you/page.tsx
// URL'de order bilgisi yoksa WooCommerce'e sorma
// Sadece teşekkür mesajı + sipariş özeti UI göster
// "purchase" event'i TEKRAR GÖNDERME
```

---

## 7. WORDPRESS TARAFINDA YAPILACAKLAR

### 7.1 GA4 Client ID'yi Order Meta'ya Yaz
Next.js checkout'ta `ga_client_id` gönderiyor → WordPress plugin bunu
`_ga_client_id` meta key'ine kaydediyor → sGTM pusher bunu okuyor.

Bu akış plugin'de zaten var. Ek bir şey yapmana gerek yok.

### 7.2 sGTM Endpoint'ini Plugin Ayarlarına Gir
WooCommerce → Ayarlar → Ödemeler → PayTR Linkle Ödeme:
- sGTM HTTP Endpoint: `https://sso.420hub.com.tr`
- GA4 API Secret: GA4 → Yönetici → Veri Akışları → Ölçüm Protokolü → yeni secret oluştur

### 7.3 WooCommerce REST API Credentials
WooCommerce → Ayarlar → Gelişmiş → REST API → Yeni anahtar oluştur:
- Açıklama: `420hub-nextjs`
- Yetki: **Okuma**
- Oluşturulan `ck_` ve `cs_` değerlerini Next.js `.env.local`'e yaz

### 7.4 Application Password
WordPress Yönetici → Kullanıcılar → Profilin → Application Passwords:
- İsim: `420hub-nextjs`
- Oluşturulan şifreyi `.env.local`'e yaz:
  ```
  WP_APP_USER=admin_kullanici_adi
  WP_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
  ```

---

## 8. ENV KONTROL LİSTESİ

```env
# .env.local

WORDPRESS_URL=https://wp.420hub.com.tr
WC_CONSUMER_KEY=ck_
WC_CONSUMER_SECRET=cs_
WP_APP_USER=
WP_APP_PASSWORD=

NEXT_PUBLIC_GTM_ID=GTM-WZ9N3Z3R
NEXT_PUBLIC_SITE_URL=https://420hub.com.tr
NEXT_PUBLIC_SGTM_URL=https://sso.420hub.com.tr
```

---

## 9. TEST PROTOKOLÜ

Kurulum bittikten sonra şu sırayla test et:

1. **GTM Preview modu aç** → Chrome'da siteyi gez → `page_view` geliyor mu?
2. **Ürün sayfasına gir** → `view_item_stape` geliyor mu?
3. **Sepete ekle** → `add_to_cart_stape` geliyor mu?
4. **Ödeme butonuna bas** → `begin_checkout_stape` geliyor mu?
5. **PayTR test ödemesi yap** → GA4 Debug View'da `purchase` geliyor mu?
   (Bu event browser'dan değil sGTM'den gelecek — biraz gecikebilir)

---

## 10. NOTLAR

- `pushEvent` fonksiyonunu her zaman `'use client'` bileşenlerden çağır
- Server Component'larda dataLayer push yapamazsın — event'leri client bileşenlere taşı
- `ecommerce` objesini push etmeden önce `dataLayer.push({ ecommerce: null })` ile temizle
  (GTM best practice — bir önceki ecommerce verisinin karışmasını engeller)
- Framer Motion animasyonları ile event timing çakışabilir — push'u onClick'te yap, animasyon sonrasında değil
