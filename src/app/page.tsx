import Link from 'next/link';
import CollectionViewTracker from '@/components/analytics/CollectionViewTracker';
import TrackedLink from '@/components/analytics/TrackedLink';
import AddToCartButton from '@/components/AddToCartButton';

import { getProducts, getWCCategoryBySlug, getWCCategories } from '@/lib/woocommerce';

export default async function Home() {
    const rawProducts = await getProducts(4);
    
    const displayProducts = rawProducts.map((p, index) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        variant: p.attributes?.[0]?.options?.[0] || null,
        price: p.price ? String(p.price) : '0',
        regularPrice: p.regular_price ? Number(p.regular_price) : null,
        priceFormatted: p.price ? `₺${p.price}` : null,
        regularPriceFormatted: p.regular_price ? `₺${p.regular_price}` : null,
        badge: index === 0 ? 'Yeni' : null,
        img: p.images?.[0]?.src || '/grinder-hero.png',
        wide: index === 0,
        category: p.categories?.[0]?.name
    }));

    // Cok Satanlar Kategorisi
    const cokSatanlarCat = await getWCCategoryBySlug('cok-satanlar');
    let cokSatanlarProducts: any[] = [];
    if (cokSatanlarCat) {
        const rawCokSatanlar = await getProducts(4, cokSatanlarCat.id);
        cokSatanlarProducts = rawCokSatanlar.map((p, index) => ({
            id: p.id,
            slug: p.slug,
            name: p.name,
            variant: p.attributes?.[0]?.options?.[0] || null,
            price: p.price ? String(p.price) : '0',
            regularPrice: p.regular_price ? Number(p.regular_price) : null,
            priceFormatted: p.price ? `₺${p.price}` : null,
            regularPriceFormatted: p.regular_price ? `₺${p.regular_price}` : null,
            badge: null,
            img: p.images?.[0]?.src || '/grinder-hero.png',
            wide: index === 0,
            category: p.categories?.[0]?.name
        }));
    }

    // Kategoriler
    const rawCategories = await getWCCategories();
    // 'cok-satanlar', 'genel', 'uncategorized' gibi kategorileri ana ekranda gizlemek iyi bir pratik olabilir, ancak hepsi gozuksun isteniyor, cok-satanlar ve genel'i haric tutalim
    const displayCategories = rawCategories.filter(c => !['cok-satanlar', 'genel', 'uncategorized'].includes(c.slug));



    return (
        <div className="bg-brand-surface min-h-screen">
            <CollectionViewTracker 
                itemListId="home_featured" 
                itemListName="Ana Sayfa Çok Satanlar" 
                products={displayProducts} 
            />

            {/* ======== HERO — Full Bleed ======== */}
            <section className="relative min-h-[100svh] flex items-end md:items-center overflow-hidden grain">
                {/* Full-bleed background image */}
                <div className="absolute inset-0">
                    <img
                        src="/grinder-hero.png"
                        alt=""
                        className="w-full h-full object-cover object-center"
                        aria-hidden="true"
                    />
                    {/* Directional overlay */}
                    <div className="hero-overlay absolute inset-0" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 max-w-[1440px] mx-auto w-full px-6 md:px-10 pb-16 md:pb-0">
                    <div className="max-w-[540px]">
                        <p className="text-[11px] font-headline font-bold tracking-[0.3em] uppercase text-brand-green mb-5 fade-up">
                            Yeni Koleksiyon — Hassas Tasarım
                        </p>
                        <h1 className="font-headline font-bold leading-[0.92] tracking-[-0.04em] text-brand-black mb-6 fade-up"
                            style={{ fontSize: 'clamp(52px, 9vw, 110px)' }}
                        >
                            Kusursuz<br />
                            <em className="not-italic text-brand-green">Kıvam.</em>
                        </h1>
                        <p className="font-body text-brand-muted text-base md:text-lg max-w-[380px] mb-10 leading-relaxed fade-up">
                            Keskin diş geometrisi. Tutarlı öğütme.<br className="hidden md:block" /> Her seferinde aynı incelikte sonuç.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 fade-up">
                            <Link
                                href="/grinderlar"
                                className="btn-press inline-flex items-center justify-center gap-2 bg-brand-black text-white px-8 py-4 font-headline font-bold text-[13px] tracking-[0.08em] uppercase rounded-sm"
                            >
                                Koleksiyonu Keşfet
                                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                            </Link>
                            <button className="btn-press inline-flex items-center justify-center gap-2 border border-brand-black/30 text-brand-black px-8 py-4 font-headline font-bold text-[13px] tracking-[0.08em] uppercase rounded-sm hover:bg-brand-black/5 transition-colors">
                                Teknik Özellikler
                            </button>
                        </div>
                    </div>
                </div>

                {/* Scroll cue — hidden on mobile */}
                <div className="hidden md:flex absolute bottom-8 right-10 z-10 flex-col items-center gap-2">
                    <span className="text-[10px] font-headline font-bold tracking-[0.25em] uppercase text-brand-muted [writing-mode:vertical-rl]">Kaydır</span>
                    <div className="w-px h-12 bg-brand-muted/30" />
                </div>
            </section>

            {/* ======== MARQUEE BANNER ======== */}
            <div className="bg-brand-black text-white py-3.5 overflow-hidden">
                <div className="flex marquee-track whitespace-nowrap">
                    {Array(8).fill(null).map((_, i) => (
                        <span key={i} className="flex items-center gap-6 px-8 text-[11px] font-headline font-semibold tracking-[0.18em] uppercase shrink-0">
                            <span className="text-brand-green-light">✦</span>
                            Türkiye İçi Ücretsiz Kargo
                            <span className="text-brand-green-light">✦</span>
                            Benzersiz Tasarımlar
                            <span className="text-brand-green-light">✦</span>
                            Hassas Üretim
                            <span className="text-brand-green-light">✦</span>
                            Tutarlı Öğütme Garantisi
                        </span>
                    ))}
                </div>
            </div>

            {/* ======== NEW DROPS ======== */}
            <section className="max-w-[1440px] mx-auto px-6 md:px-10 pt-20 pb-12 md:pt-28 md:pb-16">
                <div className="flex items-end justify-between mb-10 md:mb-14">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-muted mb-2">— Yeni Ürünler</p>
                        <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">NEW DROPS</h2>
                    </div>
                    <Link
                        href="/grinderlar"
                        className="nav-link hidden sm:inline-block text-[13px] font-headline font-semibold tracking-wide uppercase text-brand-black"
                    >
                        Tümünü Gör
                    </Link>
                </div>

                {/* Desktop: Asymmetric Editorial Grid | Mobile: Single Column */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {displayProducts.map((p, i) => (
                        <TrackedLink
                            key={p.id}
                            href={`/product/${p.slug}`}
                            className={`product-card group relative overflow-hidden bg-white rounded-sm cursor-pointer ${p.wide ? 'lg:col-span-2 lg:row-span-1' : ''}`}
                            eventName="select_item"
                            eventData={{
                                ecommerce: {
                                    item_list_id: "home_featured",
                                    item_list_name: "Ana Sayfa Çok Satanlar",
                                    items: [{
                                        item_id: p.id,
                                        item_name: p.name,
                                        price: Number(p.price),
                                        index: i
                                    }]
                                }
                            }}
                        >
                            <div className={`w-full overflow-hidden ${p.wide ? 'aspect-[16/10]' : 'aspect-square'} bg-zinc-100`}>
                                <img
                                    src={p.img}
                                    alt={p.name}
                                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                                    loading={i === 0 ? 'eager' : 'lazy'}
                                />
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        {p.variant && <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-1">{p.variant}</p>}
                                        <h3 className="font-headline font-bold text-xl tracking-tight text-brand-black">{p.name}</h3>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                        <span className="font-headline font-bold text-lg text-brand-black">{p.priceFormatted}</span>
                                        {p.regularPriceFormatted && Number(p.regularPrice) > Number(p.price) && (
                                            <span className="text-[12px] text-brand-muted line-through opacity-60">{p.regularPriceFormatted}</span>
                                        )}
                                    </div>
                                </div>
                                {p.badge && (
                                    <span className="mt-3 inline-block px-2.5 py-1 bg-brand-green/10 text-brand-green text-[10px] font-bold tracking-[0.15em] uppercase rounded-sm">
                                        {p.badge}
                                    </span>
                                )}
                                <div className="mt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-brand-black opacity-80 group-hover:opacity-100 transition-opacity">
                                        Ürünü İncele <span className="material-symbols-outlined text-[16px] text-brand-green group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                    </div>
                                    <AddToCartButton 
                                        variant="hover"
                                        product={{
                                            id: String(p.id),
                                            name: p.name,
                                            price: Number(p.price),
                                            regular_price: p.regularPrice || undefined,
                                            imageUrl: p.img,
                                            variant: p.variant || undefined,
                                            quantity: 1,
                                            category: p.category
                                        }} 
                                    />
                                </div>
                            </div>
                        </TrackedLink>
                    ))}
                </div>

                {/* Mobile View All */}
                <div className="mt-8 sm:hidden text-center">
                    <Link href="/grinderlar" className="inline-flex items-center gap-2 text-[13px] font-headline font-bold uppercase tracking-wider border border-brand-black px-6 py-3 rounded-sm btn-press">
                        Tüm Ürünleri Gör
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </Link>
                </div>
            </section>

            {/* ======== ÇOK SATANLAR ======== */}
            {cokSatanlarProducts.length > 0 && (
                <section className="max-w-[1440px] mx-auto px-6 md:px-10 pb-24 md:pb-32">
                    <div className="flex items-end justify-between mb-10 md:mb-14">
                        <div>
                            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-muted mb-2">— Popüler Seçimler</p>
                            <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter uppercase">Çok Satanlar</h2>
                        </div>
                        <Link
                            href="/cok-satanlar"
                            className="nav-link hidden sm:inline-block text-[13px] font-headline font-semibold tracking-wide uppercase text-brand-black"
                        >
                            Tümünü Gör
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {cokSatanlarProducts.map((p, i) => (
                            <TrackedLink
                                key={p.id}
                                href={`/product/${p.slug}`}
                                className={`product-card group relative overflow-hidden bg-white rounded-sm cursor-pointer ${p.wide ? 'lg:col-span-2 lg:row-span-1' : ''}`}
                                eventName="select_item"
                                eventData={{
                                    ecommerce: {
                                        item_list_id: "home_bestsellers",
                                        item_list_name: "Ana Sayfa Çok Satanlar Alternatif",
                                        items: [{
                                            item_id: p.id,
                                            item_name: p.name,
                                            price: Number(p.price),
                                            index: i
                                        }]
                                    }
                                }}
                            >
                                <div className={`w-full overflow-hidden ${p.wide ? 'aspect-[16/10]' : 'aspect-square'} bg-zinc-100`}>
                                    <img
                                        src={p.img}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                                        loading="lazy"
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            {p.variant && <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-muted mb-1">{p.variant}</p>}
                                            <h3 className="font-headline font-bold text-xl tracking-tight text-brand-black">{p.name}</h3>
                                        </div>
                                        <div className="flex flex-col items-end shrink-0">
                                            <span className="font-headline font-bold text-lg text-brand-black">{p.priceFormatted}</span>
                                            {p.regularPriceFormatted && Number(p.regularPrice) > Number(p.price) && (
                                                <span className="text-[12px] text-brand-muted line-through opacity-60">{p.regularPriceFormatted}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-headline font-bold uppercase tracking-[0.2em] text-brand-black opacity-80 group-hover:opacity-100 transition-opacity">
                                            Ürünü İncele <span className="material-symbols-outlined text-[16px] text-brand-green group-hover:translate-x-1 transition-transform">arrow_forward</span>
                                        </div>
                                        <AddToCartButton 
                                            variant="hover"
                                            product={{
                                                id: String(p.id),
                                                name: p.name,
                                                price: Number(p.price),
                                                regular_price: p.regularPrice || undefined,
                                                imageUrl: p.img,
                                                variant: p.variant || undefined,
                                                quantity: 1,
                                                category: p.category
                                            }} 
                                        />
                                    </div>
                                </div>
                            </TrackedLink>
                        ))}
                    </div>
                </section>
            )}

            {/* ======== FEATURES — Alternating Large Layout ======== */}
            <section className="bg-brand-black text-white">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-20 md:py-28">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                        <div>
                            <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-green mb-6">Neden Grind & Co?</p>
                            <h2 className="font-headline font-bold leading-tight tracking-tighter mb-8"
                                style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}
                            >
                                Her detayı düşünülmüş. Farkı hissedin.
                            </h2>
                            <div className="space-y-8">
                                {[
                                    { icon: 'tune', title: 'Keskin Diş Yapısı', desc: 'Özel açılı diş geometrisi her seferinde tutarlı ve homojen kıvam elde etmenizi sağlar.' },
                                    { icon: 'layers', title: 'Çok Katmanlı Tasarım', desc: '3 ya da 4 parça seçenekleriyle toplama haznesi ve elek dahil, ihtiyacınıza göre esneklik.' },
                                    { icon: 'lock', title: 'Manyetik Kapak', desc: 'Güçlü mıknatıslı kapak sayesinde güvenli taşıma, cebinizde bile dökülme olmaz.' },
                                ].map(f => (
                                    <div key={f.title} className="flex gap-5 group">
                                        <div className="w-11 h-11 rounded-sm bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-brand-green/20 transition-colors">
                                            <span className="material-symbols-outlined text-brand-green text-[22px]">{f.icon}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-headline font-bold mb-1">{f.title}</h4>
                                            <p className="text-white/50 text-sm leading-relaxed font-body">{f.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative aspect-square lg:aspect-auto lg:h-[560px] rounded-sm overflow-hidden">
                            <img
                                src="/grinder-detail.png"
                                alt="Diş detayı makro çekim"
                                className="w-full h-full object-cover grayscale opacity-70"
                            />
                            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-brand-black to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-green mb-1">Yakından Bakış</p>
                                <p className="font-headline font-bold text-xl">Optimize edilmiş diş geometrisi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ======== CATEGORIES (Dinamik) ======== */}
            <section className="py-20 md:py-28 max-w-[1440px] mx-auto px-6 md:px-10">
                <div className="mb-10 md:mb-14">
                    <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-brand-muted mb-2">— Koleksiyonlar</p>
                    <h2 className="text-4xl md:text-5xl font-headline font-bold tracking-tighter">Kategoriler</h2>
                </div>

                {/* Mobile: horizontal scroll / Desktop: 3-col grid */}
                <div className="flex gap-3 overflow-x-auto md:grid md:grid-cols-4 md:overflow-visible pb-2 md:pb-0 snap-x snap-mandatory md:snap-none">
                    {displayCategories.map(c => (
                        <TrackedLink
                            key={c.slug}
                            href={`/${c.slug}`}
                            className="group relative shrink-0 w-[75vw] md:w-auto snap-start rounded-sm overflow-hidden aspect-[3/4] md:aspect-[4/5] bg-brand-surface border border-brand-border hover:border-brand-black transition-colors flex flex-col items-center justify-center text-center p-6"
                            eventName="select_promotion"
                            eventData={{
                                ecommerce: {
                                    creative_name: c.name,
                                    creative_slot: "home_categories"
                                }
                            }}
                        >
                            <span className="material-symbols-outlined text-[48px] text-brand-green/40 mb-4 group-hover:text-brand-green group-hover:scale-110 transition-all duration-500">grid_view</span>
                            <h3 className="text-2xl font-headline font-bold text-brand-black tracking-tight">{c.name}</h3>
                            <p className="text-brand-muted text-[11px] font-body mt-2">{c.count} Ürün</p>
                            
                            <div className="mt-6 inline-flex items-center gap-2 text-[11px] font-headline font-bold text-brand-black uppercase tracking-wide border-b border-brand-black/30 pb-0.5 group-hover:border-brand-black transition-colors">
                                Keşfet <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                            </div>
                        </TrackedLink>
                    ))}
                </div>
            </section>

            {/* ======== CTA FULL-BLEED BANNER ======== */}
            <section className="relative overflow-hidden bg-brand-green min-h-[280px] md:min-h-[340px] flex items-center">
                <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-16 md:py-20 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                    <div>
                        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-white/60 mb-3">Memnuniyet Garantisi</p>
                        <h2 className="font-headline font-bold text-white tracking-tighter"
                            style={{ fontSize: 'clamp(30px, 4.5vw, 56px)' }}
                        >
                            Memnun kalmazsan<br />iade edebilirsin.
                        </h2>
                    </div>
                    <Link
                        href="/shop"
                        className="btn-press shrink-0 inline-flex items-center gap-3 bg-white text-brand-green px-8 py-4 font-headline font-bold text-[13px] uppercase tracking-[0.1em] rounded-sm"
                    >
                        Hemen Sipariş Ver
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </Link>
                </div>
                <img 
                    src="/logo.png"
                    alt="" 
                    className="absolute right-[-15%] bottom-[-30%] w-[110%] md:w-[65%] opacity-10 invert brightness-0 pointer-events-none select-none"
                    aria-hidden
                />
            </section>


        </div>
    );
}
