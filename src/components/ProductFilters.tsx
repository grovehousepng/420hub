'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

interface ProductFiltersProps {
    totalItems: number;
}

export default function ProductFilters({ totalItems }: ProductFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set(name, value);
            } else {
                params.delete(name);
            }
            return params.toString();
        },
        [searchParams]
    );

    const handleSortChange = (value: string) => {
        let orderby = 'date';
        let order = 'desc';

        if (value === 'price_asc') {
            orderby = 'price';
            order = 'asc';
        } else if (value === 'price_desc') {
            orderby = 'price';
            order = 'desc';
        } else if (value === 'popularity') {
            orderby = 'popularity';
            order = 'desc';
        }

        const query = createQueryString('orderby', orderby);
        const finalQuery = new URLSearchParams(query);
        finalQuery.set('order', order);
        router.push(pathname + '?' + finalQuery.toString(), { scroll: false });
    };

    const handleStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.checked ? 'instock' : '';
        router.push(pathname + '?' + createQueryString('stock_status', value), { scroll: false });
    };

    // Determine current sort value for the select
    const currentOrderby = searchParams.get('orderby') || 'date';
    const currentOrder = searchParams.get('order') || 'desc';
    
    let selectValue = 'newest';
    if (currentOrderby === 'price' && currentOrder === 'asc') selectValue = 'price_asc';
    if (currentOrderby === 'price' && currentOrder === 'desc') selectValue = 'price_desc';
    if (currentOrderby === 'popularity') selectValue = 'popularity';

    const isStockOnly = searchParams.get('stock_status') === 'instock';

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-brand-border">
            <div className="flex items-center gap-4">
                <p className="text-[11px] font-body text-brand-muted">
                    Gösterilen <strong className="text-brand-black font-semibold">{totalItems}</strong> ürün
                </p>
                <div className="h-4 w-[1px] bg-brand-border hidden md:block"></div>
                <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center">
                        <input 
                            type="checkbox" 
                            checked={isStockOnly}
                            onChange={handleStockChange}
                            className="peer sr-only" 
                        />
                        <div className="w-4 h-4 border border-brand-border rounded-sm peer-checked:bg-brand-green peer-checked:border-brand-green transition-all"></div>
                        <span className="material-symbols-outlined absolute text-white text-[14px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">check</span>
                    </div>
                    <span className="text-[11px] font-bold tracking-[0.05em] uppercase text-brand-muted group-hover:text-brand-black transition-colors">Sadece Stoktakiler</span>
                </label>
            </div>

            <div className="flex items-center gap-3">
                <label className="text-[11px] font-bold tracking-[0.15em] uppercase text-brand-muted">Sırala:</label>
                <select 
                    value={selectValue}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none bg-white border border-brand-border focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green font-headline font-bold text-[12px] uppercase tracking-wider text-brand-black px-4 py-2 pr-10 rounded-sm cursor-pointer transition-all hover:border-brand-black"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 12px center',
                        backgroundSize: '14px',
                    }}
                >
                    <option value="newest">En Yeni</option>
                    <option value="price_asc">Fiyat: Düşükten Yükseğe</option>
                    <option value="price_desc">Fiyat: Yüksekten Düşüğe</option>
                    <option value="popularity">Popülerlik</option>
                </select>
            </div>
        </div>
    );
}
