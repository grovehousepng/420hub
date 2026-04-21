import { getWPPageBySlug, getWCCategoryBySlug, getProducts } from '@/lib/woocommerce';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductFilters from '@/components/ProductFilters';
import ProductCard from '@/components/ProductCard';
import CategoryViewTracker from '@/components/analytics/CategoryViewTracker';

export const revalidate = 3600;

interface Props {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ 
        orderby?: string; 
        order?: string; 
        stock_status?: string;
    }>;
}

export default async function DynamicSlugPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { orderby, order, stock_status } = await searchParams;

    // 1. Sayfa değilse, E-Ticaret Kategorisi mi diye kontrol et (Öncelikli)
    const category = await getWCCategoryBySlug(slug);

    if (category) {
        // Fetch products with filters
        const products = await getProducts(
            50, 
            category.id, 
            orderby || 'date', 
            order || 'desc', 
            stock_status
        );
        
        return (
            <div className="bg-brand-surface min-h-screen">
                <CategoryViewTracker 
                    categoryName={category.name} 
                    items={products} 
                    categoryId={category.id}
                    pathname={`/category/${slug}`}
                />
                <div className="relative bg-brand-black text-white pt-[140px] md:pt-[180px] pb-16 md:pb-20 px-6 md:px-10 overflow-hidden">
                    <div className="absolute inset-0">
                        <img src="/shop-hero.png" alt="" className="w-full h-full object-cover opacity-60 mix-blend-luminosity" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-surface via-brand-black/80 to-brand-black/40"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/50 to-transparent"></div>
                    </div>
                    <div className="relative z-10 max-w-[1440px] mx-auto">
                        <p className="text-[11px] font-bold tracking-[0.3em] uppercase text-brand-green mb-4">Koleksiyonlar / Ekipman</p>
                        <h1 className="font-headline font-bold tracking-tighter leading-tight uppercase"
                            style={{ fontSize: 'clamp(36px, 6vw, 72px)' }}
                        >
                            {category.name}
                        </h1>
                        {category.description && (
                            <p 
                                className="mt-4 text-white/50 font-body text-base max-w-md"
                                dangerouslySetInnerHTML={{ __html: category.description }}
                            />
                        )}
                    </div>
                </div>

                <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-8 md:py-12">
                    <ProductFilters totalItems={products.length} />

                    {products.length === 0 ? (
                        <div className="text-center py-20 text-brand-muted font-body bg-white rounded-sm border border-brand-border">
                            <span className="material-symbols-outlined text-[48px] text-brand-border mb-4">inventory_2</span>
                            <p>Bu kategoride kriterlere uygun ürün bulunmuyor.</p>
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
        );
    }

    // 2. Kategori değilse WordPress Sayfası (Page) mı diye kontrol et
    const page = await getWPPageBySlug(slug);

    if (page) {
        return (
            <div className="bg-brand-surface min-h-screen pt-[140px] md:pt-[180px] pb-20">
                <div className="max-w-3xl mx-auto px-6 md:px-10">
                    <h1 className="text-3xl md:text-5xl font-headline font-bold mb-10 text-brand-black tracking-tight uppercase">
                        {page.title.rendered}
                    </h1>
                    <div 
                        className="bg-white p-8 md:p-12 rounded-sm shadow-sm border border-brand-border prose prose-brand prose-headings:font-headline prose-headings:font-bold prose-a:text-brand-green max-w-none prose-p:mb-5 font-body leading-relaxed text-brand-muted"
                        dangerouslySetInnerHTML={{ __html: page.content.rendered }}
                    />
                </div>
            </div>
        );
    }

    notFound();
}

