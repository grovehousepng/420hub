import ProductViewTracker from '@/components/analytics/ProductViewTracker';
import AddToCartButton from '@/components/AddToCartButton';
import ProductReviews from '@/components/ProductReviews';
import ProductRating from '@/components/ProductRating';
import RelatedProducts from '@/components/RelatedProducts';

import { getProductBySlug } from '@/lib/woocommerce';
import { notFound } from 'next/navigation';

export const revalidate = 3600;

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const rawProduct = await getProductBySlug(slug);

    if (!rawProduct) {
        notFound();
    }

    const product = {
        id: String(rawProduct.id),
        slug: rawProduct.slug,
        name: rawProduct.name,
        variant: rawProduct.attributes?.[0]?.options?.[0] || null,
        price: parseFloat(rawProduct.price) || 0,
        priceFormatted: rawProduct.price ? `₺${rawProduct.price}` : null,
        badge: null,
        rating: 5,
        reviews: 0,
        short_description: rawProduct.short_description || '<p>Ürün açıklaması bulunmuyor.</p>',
        description: rawProduct.description || '<p>Ürün detayı bulunmuyor.</p>',
        images: rawProduct.images?.length > 0 ? rawProduct.images.map(img => img.src) : ['/grinder-hero.png'],
        variants: rawProduct.attributes?.[0]?.options || [],
    };

    return (
        <div className="bg-brand-surface min-h-screen">
            <ProductViewTracker product={product} />
            <div className="max-w-[1440px] mx-auto px-6 md:px-10 pt-[140px] md:pt-[180px] pb-20">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[11px] font-body text-brand-muted mb-6 md:mb-10">
                    <a href="/" className="hover:text-brand-black transition-colors">Ana Sayfa</a>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <a href="/grinderlar" className="hover:text-brand-black transition-colors">Öğütücüler</a>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-brand-black font-semibold">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_480px] xl:grid-cols-[1fr_520px] gap-8 lg:gap-16">

                    {/* ====== LEFT: IMAGE GALLERY ====== */}
                    <div className="space-y-3">
                        {/* Main image */}
                        <div className="aspect-square md:aspect-[4/3] lg:aspect-square bg-white rounded-sm overflow-hidden">
                            <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Thumbnail row */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {product.images.map((img, i) => (
                                <div
                                    key={i}
                                    className={`shrink-0 w-20 h-20 md:w-24 md:h-24 bg-white rounded-sm overflow-hidden cursor-pointer border-2 transition-colors ${i === 0 ? 'border-brand-black' : 'border-transparent hover:border-brand-muted'}`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ====== RIGHT: PRODUCT INFO ====== */}
                    <div className="lg:sticky lg:top-24 lg:self-start space-y-6">

                        {/* Badge + Title */}
                        <div>
                            {product.badge && (
                                <span className="inline-block px-3 py-1 bg-brand-green/10 text-brand-green text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm mb-3">
                                    {product.badge}
                                </span>
                            )}
                            <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter leading-tight uppercase">
                                {product.name}
                            </h1>
                            {product.variant && <p className="text-brand-muted font-body mt-1">{product.variant}</p>}

                            {/* Rating */}
                            <div className="mt-3">
                                <ProductRating productId={Number(product.id)} size="sm" />
                                <p className="text-[11px] font-body text-brand-muted mt-2">KDV dahil, kargo ödeme sırasında hesaplanır</p>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3">
                            {product.priceFormatted && <span className="text-4xl font-headline font-bold tracking-tight">{product.priceFormatted}</span>}
                        </div>

                        {/* Variant selector */}
                        {product.variants.length > 0 && (
                            <div>
                                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-brand-black mb-3">Kaplama</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map(v => (
                                        <button
                                            key={v}
                                            className={`px-4 py-2 rounded-sm text-[12px] font-headline font-semibold border transition-colors ${v === product.variant ? 'bg-brand-black text-white border-brand-black' : 'bg-white text-brand-muted border-brand-border hover:border-brand-black hover:text-brand-black'}`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Short Description (From WordPress) */}
                        <div 
                            className="font-body text-brand-muted text-sm leading-relaxed border-t border-brand-border pt-5 prose prose-sm prose-p:mb-3 prose-li:my-0 prose-ul:mb-4 marker:text-brand-green max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.short_description }}
                        />

                        {/* CTA Buttons */}
                        <div className="space-y-3 pt-2">
                            <AddToCartButton 
                                variant="main" 
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    quantity: 1,
                                    imageUrl: product.images[0],
                                    variant: product.variant || undefined,
                                    category: rawProduct.categories?.[0]?.name
                                }} 
                            />
                            <AddToCartButton 
                                variant="main" 
                                isBuyNow={true}
                                product={{
                                    id: product.id,
                                    name: product.name,
                                    price: product.price,
                                    quantity: 1,
                                    imageUrl: product.images[0],
                                    variant: product.variant || undefined,
                                    category: rawProduct.categories?.[0]?.name
                                }} 
                            />
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-brand-border">
                            {[
                                { icon: 'verified', text: 'Memnuniyet Garantisi' },
                                { icon: 'local_shipping', text: 'Aynı Gün Kargo' },
                                { icon: 'lock', text: 'Güvenli Ödeme' },
                            ].map(b => (
                                <div key={b.text} className="flex flex-col items-center gap-1.5 text-center">
                                    <span className="material-symbols-outlined text-brand-green text-[22px]">{b.icon}</span>
                                    <span className="text-[10px] font-body text-brand-muted leading-tight">{b.text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Made in Türkiye Typography */}
                        <div className="flex justify-center pt-8 pb-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 border border-brand-border rounded-sm bg-white opacity-90 hover:opacity-100 hover:border-brand-black transition-all cursor-default">
                                <span className="material-symbols-outlined text-brand-black text-[16px]">precision_manufacturing</span>
                                <span className="font-headline font-bold text-[10px] tracking-[0.2em] uppercase text-brand-black">
                                    Made in <span className="text-brand-green">Türkiye</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* ====== BOTTOM: LONG DESCRIPTION ====== */}
                <div className="mt-16 md:mt-24 pt-16 md:pt-20 border-t border-brand-border max-w-3xl mx-auto">
                    <h3 className="font-headline font-bold text-2xl md:text-3xl mb-8 tracking-tight">Ürün Detayları</h3>
                    <div 
                        className="font-body text-brand-muted leading-relaxed prose prose-brand prose-headings:font-headline prose-headings:font-bold prose-headings:tracking-tight prose-a:text-brand-green max-w-none"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </div>

                {/* ====== BOTTOM: REVIEWS ====== */}
                <ProductReviews productId={Number(product.id)} productName={product.name} />

                {/* ====== BOTTOM: RELATED PRODUCTS ====== */}
                <RelatedProducts product={rawProduct} />
            </div>
        </div>
    );
}
