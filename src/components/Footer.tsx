import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-brand-surface border-t border-brand-border py-12 md:py-20 mt-auto">
            <div className="max-w-[1440px] mx-auto px-6 md:px-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-8">
                    {/* Brand */}
                    <div className="md:col-span-1">
                        <img src="/logo.png" alt="Grind & Co" className="h-20 md:h-24 mb-12 scale-[3] origin-left -ml-12 md:-ml-20" />
                        <p className="text-sm text-brand-muted font-body leading-relaxed max-w-xs">
                            Hassas üretim, premium kalite ve dayanıklı malzemeler ile deneyiminizi bir üst seviyeye taşıyın.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-black mb-6">Koleksiyonlar</h4>
                        <ul className="space-y-4">
                            <li><Link href="/grinderlar" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">Grinderlar</Link></li>
                            <li><Link href="/aksesuarlar" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">Aksesuarlar</Link></li>
                            <li><Link href="/kavanozlar" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">Kavanozlar</Link></li>
                            <li><Link href="/tepsiler" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">Tepsiler</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-black mb-6">Müşteri Hizmetleri</h4>
                        <ul className="space-y-4">
                            <li><Link href="/hakkimizda" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">Hakkımızda</Link></li>
                            <li><Link href="/iletisim" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">İletişim</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-[11px] font-bold tracking-[0.2em] uppercase text-brand-black mb-6">Yasal</h4>
                        <ul className="space-y-4">
                            <li><Link href="/gizlilik-politikasi" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">Gizlilik Politikası</Link></li>
                            <li><Link href="/geri-odeme-ve-iade-politikasi" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">İade ve Geri Ödeme Şartları</Link></li>
                            <li><Link href="/mesafeli-satis-sozlesmesi" className="text-sm font-body text-brand-muted hover:text-brand-green transition-colors">Mesafeli Satış Sözleşmesi</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-16 pt-8 border-t border-brand-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-brand-muted font-body">
                        &copy; {new Date().getFullYear()} Grind & Co. Tüm hakları saklıdır.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-brand-muted font-body">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                        100% Güvenli Alışveriş
                    </div>
                </div>
            </div>
        </footer>
    );
}
