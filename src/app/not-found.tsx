import Link from 'next/link';
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
      <h2 className="text-3xl font-headline font-bold text-brand-black mb-4">404 - Sayfa Bulunamadı</h2>
      <p className="text-brand-muted mb-8">Aradığınız sayfaya ulaşılamıyor veya taşınmış olabilir.</p>
      <Link href="/" className="btn-press bg-brand-black text-white px-8 py-4 font-headline font-bold text-[13px] uppercase tracking-wider rounded-sm">
        Ana Sayfaya Dön
      </Link>
    </div>
  );
}
