'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import SearchModal from '@/components/SearchModal';
import CartSidebar from '@/components/CartSidebar';

export default function Navigation({ categories = [] }: { categories?: any[] }) {
    const items = useCartStore((state) => state.items);
    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const prevCartCount = useRef(cartCount);
    const [badgePulse, setBadgePulse] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const pathname = usePathname();

    // 1. Generate Navigation Links first
    let navLinks = categories.map(c => ({ href: `/${c.slug}`, label: c.name }));
    
    // Add "All Products" link at the beginning
    navLinks = [
        { href: '/shop', label: 'Tüm Ürünler' },
        ...navLinks
    ];

    // Fallback if no categories received
    if (navLinks.length === 1) { // 1 because we just added "All Products"
        navLinks = [
            { href: '/shop', label: 'Tüm Ürünler' },
            { href: '/grinderlar', label: 'Grinderlar' },
            { href: '/aksesuarlar', label: 'Aksesuarlar' },
            { href: '/kavanozlar', label: 'Kavanozlar' },
            { href: '/tepsiler', label: 'Tepsiler' },
        ];
    }

    // 2. Determine if the navigation sits on top of a dark section initially.
    // Shop and Category pages have a bg-brand-black top section.
    const isDarkTop = !scrolled && (
        pathname === '/shop' || 
        pathname === '/cok-satanlar' ||
        navLinks.some(link => link.href === pathname)
    );

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', onScroll, { passive: true });
        
        const openCart = () => setCartOpen(true);
        document.addEventListener('open-cart', openCart);
        
        return () => {
            window.removeEventListener('scroll', onScroll);
            document.removeEventListener('open-cart', openCart);
        };
    }, []);

    useEffect(() => {
        if (cartCount > prevCartCount.current) {
            setBadgePulse(true);
            setTimeout(() => setBadgePulse(false), 500);
        }
        prevCartCount.current = cartCount;
    }, [cartCount]);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        document.body.style.overflow = mobileOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileOpen]);

    return (
        <>
            {/* ============ DESKTOP NAV ============ */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                    scrolled
                        ? 'bg-white/92 backdrop-blur-2xl border-b border-brand-border shadow-[0_1px_24px_rgba(0,0,0,0.06)]'
                        : 'bg-transparent'
                }`}
            >
                {/* WAVES BACKGROUND WHEN TRANSPARENT */}
                <div 
                    className={`absolute inset-0 -z-10 pointer-events-none overflow-hidden transition-opacity duration-700 ${
                        scrolled ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    <svg viewBox="0 0 1440 200" className="absolute top-0 w-full h-[150px] md:h-[250px]" preserveAspectRatio="none">
                        <path fill="var(--color-brand-green)" fillOpacity="0.04" d="M0,32L48,42.7C96,53,192,75,288,80C384,85,480,75,576,64C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
                        <path fill="var(--color-brand-green)" fillOpacity="0.08" d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,64C960,53,1056,43,1152,48C1248,53,1344,75,1392,85.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z" />
                    </svg>
                </div>

                <div className={`max-w-[1440px] mx-auto px-6 md:px-10 flex items-center justify-between transition-all duration-500 ease-in-out ${
                    scrolled ? 'h-16 md:h-[72px]' : 'h-24 md:h-32'
                }`}>
                    
                    {/* LOGO */}
                    <Link 
                        href="/" 
                        className={`flex-shrink-0 z-10 transition-all duration-500 ease-in-out md:ml-0 mt-1 ${
                            scrolled ? '-ml-10' : '-ml-[72px]'
                        }`}
                    >
                        <img
                            src="/logo.png"
                            alt="Grind & Co"
                            className={`w-auto object-contain transition-all duration-500 ease-in-out py-2 scale-[3] md:scale-[3.2] origin-left ${
                                scrolled ? 'h-14 md:h-16' : 'h-20 md:h-24'
                            } ${isDarkTop ? 'invert brightness-0' : ''}`}
                        />
                    </Link>

                    {/* DESKTOP LINKS — centered */}
                    <div className="hidden lg:flex items-center gap-8 absolute left-1/2 -translate-x-1/2 z-10">
                        {navLinks.map(link => (
                            <Link
                                key={link.label}
                                href={link.href}
                                className={`nav-link font-headline font-semibold tracking-[0.05em] uppercase transition-all duration-500 ${scrolled ? 'text-[13px]' : 'text-[15px]'} ${isDarkTop ? 'text-white' : 'text-brand-black'}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* RIGHT ACTIONS */}
                    <div className="flex items-center gap-3 md:gap-4 z-10">
                        {/* Search — desktop only */}
                        <button
                            onClick={() => setSearchOpen(true)}
                            aria-label="Arama Yap"
                            className={`hidden lg:flex items-center gap-2 font-body transition-colors px-3 py-1.5 rounded-full hover:bg-brand-surface border border-transparent hover:border-brand-border ${isDarkTop ? 'text-white/80 hover:text-brand-black' : 'text-brand-muted hover:text-brand-black'}`}
                        >
                            <span className={`material-symbols-outlined transition-all duration-500 ${scrolled ? 'text-[20px]' : 'text-[26px]'}`}>search</span>
                            <span className={`hidden xl:inline transition-all duration-500 ${scrolled ? 'text-[13px]' : 'text-[15px]'}`}>Ara</span>
                        </button>

                        {/* Cart */}
                        <button
                            onClick={() => setCartOpen(true)}
                            aria-label={`Sepet (${cartCount} ürün)`}
                            className={`relative flex items-center justify-center rounded-full transition-all duration-500 ${scrolled ? 'w-10 h-10' : 'w-12 h-12'} ${isDarkTop ? 'text-white hover:bg-white/10' : 'text-brand-black hover:bg-brand-surface'}`}
                        >
                            <span className={`material-symbols-outlined transition-all duration-500 ${scrolled ? 'text-[24px]' : 'text-[28px]'}`}>local_mall</span>
                            {cartCount > 0 && (
                                <span
                                    className={`absolute -top-0.5 -right-0.5 rounded-full bg-brand-green text-white font-bold flex items-center justify-center ${badgePulse ? 'cart-badge-pulse' : ''} transition-all duration-500 ${scrolled ? 'w-5 h-5 text-[10px]' : 'w-6 h-6 text-[12px]'}`}
                                >
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setMobileOpen(true)}
                            aria-label="Menüyü aç"
                            className={`lg:hidden flex items-center justify-center rounded-sm transition-all duration-500 ${scrolled ? 'w-10 h-10' : 'w-12 h-12'} ${isDarkTop ? 'text-white hover:bg-white/10' : 'text-brand-black hover:bg-brand-surface'}`}
                        >
                            <span className={`material-symbols-outlined transition-all duration-500 ${scrolled ? 'text-[28px]' : 'text-[36px]'}`}>drag_handle</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* ============ MOBILE DRAWER ============ */}
            {/* Backdrop */}
            <div
                onClick={() => setMobileOpen(false)}
                className={`lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            />

            {/* Drawer Panel */}
            <div
                className={`lg:hidden fixed inset-y-0 right-0 z-[70] w-[85vw] max-w-[360px] bg-white flex flex-col mobile-nav ${mobileOpen ? 'mobile-nav-open' : 'mobile-nav-closed'}`}
            >
                <div className="flex items-center justify-between px-6 h-16 border-b border-brand-border">
                    <img src="/logo.png" alt="Grind & Co" className="h-16 w-auto scale-[4] origin-left -ml-14" />
                    <button
                        onClick={() => setMobileOpen(false)}
                        aria-label="Menüyü kapat"
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-surface transition-colors"
                    >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-6 pt-0 pb-6 space-y-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            href={link.href}
                            onClick={() => setMobileOpen(false)}
                            className="flex items-center justify-between py-4 border-b border-brand-border/60 group"
                        >
                            <span className="text-[22px] font-headline font-bold tracking-tighter text-brand-black uppercase">
                                {link.label}
                            </span>
                            <span className="material-symbols-outlined text-brand-muted text-[20px] group-hover:translate-x-1 transition-transform">
                                arrow_forward
                            </span>
                        </Link>
                    ))}
                </nav>

                <div className="px-6 pb-8 pt-4 space-y-5">
                    <div className="flex flex-col gap-4 pb-5 border-b border-brand-border/60">
                        <Link href="/hakkimizda" onClick={() => setMobileOpen(false)} className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-black hover:text-brand-green transition-colors">Hakkımızda</Link>
                        <Link href="/geri-odeme-ve-iade-politikasi" onClick={() => setMobileOpen(false)} className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-black hover:text-brand-green transition-colors">İade Politikası</Link>
                        <Link href="/gizlilik-politikasi" onClick={() => setMobileOpen(false)} className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-black hover:text-brand-green transition-colors">Gizlilik Politikası</Link>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-muted font-body">
                        <span className="material-symbols-outlined text-[16px] text-brand-green">verified</span>
                        Hassas Tasarım · Türkiye Üretimi
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-muted font-body">
                        <span className="material-symbols-outlined text-[16px] text-brand-green">local_shipping</span>
                        Türkiye içi ücretsiz kargo
                    </div>
                </div>
            </div>
            {/* Search Modal */}
            <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

            {/* Cart Sidebar */}
            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </>
    );
}
