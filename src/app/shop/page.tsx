import { getProducts } from '@/lib/woocommerce';
import Link from 'next/link';
import ProductFilters from '@/components/ProductFilters';
import ProductCard from '@/components/ProductCard';
import CategoryViewTracker from '@/components/analytics/CategoryViewTracker';

export const revalidate = 3600;

interface Props {
    searchParams: Promise<{ 
        orderby?: string; 
        order?: string; 
        stock_status?: string;
    }>;
}

export default async function ShopPage({ searchParams }: Props) {
    const { orderby, order, stock_status } = await searchParams;

    const products = await getProducts(
        50, 
        undefined, 
        orderby || 'date', 
        order || 'desc', 
        stock_status
    );

    return (
        <div className="bg-brand-surface min-h-screen">
            <CategoryViewTracker categoryName="TÜM ÜRÜNLER" items={products} pathname="/shop" />
            {/* ======== SHOP HEADER ======== */}
            <div className="relative bg-brand-black text-white pt-[140px] md:pt-[180px] pb-16 md:pb-20 px-6 md:px-10 overflow-hidden">
                <div className="absolute inset-0">
                    <img src="/shop-hero.png" alt="" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-black/80 to-brand-black/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/50 to-transparent"></div>
                </div>
                <div className="relative z-10 max-w-[1440px] mx-auto">
                    <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-green mb-4">Koleksiyonlar / Tüm Ürünler</p>
                    <h1 className="font-headline font-bold tracking-tighter leading-tight"
                        style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
                    >
                        Mağaza
                    </h1>
                    <p className="mt-4 text-white/50 font-body text-base max-w-md">
                        En yeni modellerimiz, aksesuarlarımız ve özel seri ürünlerimizi keşfedin.
                    </p>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-8 md:py-12">
                
                <ProductFilters totalItems={products.length} />

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* ======== PRODUCT GRID ======== */}
                    <div className="flex-1">
                        {products.length === 0 ? (
                            <div className="text-center py-20 text-brand-muted font-body bg-white rounded-sm border border-brand-border">
                                <span className="material-symbols-outlined text-[48px] text-brand-border mb-4">inventory_2</span>
                                <p>Kriterlere uygun ürün bulunamadı.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                                {products.map((p, i) => (
                                    <ProductCard key={p.id} product={p} index={i} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

