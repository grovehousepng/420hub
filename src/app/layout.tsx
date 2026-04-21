import { Inter, Space_Grotesk } from "next/font/google";
import Script from "next/script";
export const runtime = 'edge';
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ClientRouteTracker from "@/components/analytics/ClientRouteTracker";
import ConsentBanner from "@/components/analytics/ConsentBanner";
import WhatsAppPopup from "@/components/WhatsAppPopup";
import { getWCCategories } from '@/lib/woocommerce';
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata = {
  title: "Grind & Co | Premium Öğütücüler",
  description: "Hassas üretim, premium kalite ve dayanıklı tasarım. Deneyiminizi bir üst seviyeye taşıyacak özel üretim grinder (öğütücü) modelleri.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const rawCategories = await getWCCategories();
  const order = ['grinderlar', 'aksesuarlar', 'kavanozlar', 'tepsiler'];
  const navCategories = rawCategories
    .filter(c => !['cok-satanlar', 'genel', 'uncategorized'].includes(c.slug))
    .sort((a, b) => {
      const idxA = order.indexOf(a.slug);
      const idxB = order.indexOf(b.slug);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });
  return (
    <html
      lang="en"
      className={`${inter.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col tracking-normal">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WZ9N3Z3R"
            height="0" width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <Script id="gtm-datalayer-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];`}
        </Script>
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WZ9N3Z3R');`}
        </Script>
        
        <ClientRouteTracker />
        <Navigation categories={navCategories} />
        
        <main className="flex-grow">
          {children}
        </main>
        
        <Footer />
        <ConsentBanner />
        <WhatsAppPopup />
      </body>
    </html>
  );
}
