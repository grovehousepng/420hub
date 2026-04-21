import { getRelatedProducts, WCProduct } from '@/lib/woocommerce';
import ProductCarousel from './ProductCarousel';

interface Props {
    product: WCProduct;
    title?: string;
}

export default async function RelatedProducts({ product, title = 'Bunları da Beğenebilirsiniz' }: Props) {
    // Alakalı ürünleri çek
    const relatedProducts = await getRelatedProducts(product, 8);

    if (!relatedProducts || relatedProducts.length === 0) return null;

    return (
        <section className="mt-20 md:mt-32 pt-20 border-t border-brand-border overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div className="space-y-2">
                    <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-green">Sizin İçin Seçtiklerimiz</p>
                    <h2 className="text-3xl md:text-5xl font-headline font-bold tracking-tighter uppercase leading-none">
                        {title}
                    </h2>
                </div>
            </div>

            <ProductCarousel products={relatedProducts} />
        </section>
    );
}
