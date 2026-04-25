import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SupportWidget from "@/components/ui/SupportWidget";
import ScrollReveal from "@/components/ui/ScrollReveal";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://primeclean.by"),
  title: {
    default: "PrimeClean — Профессиональная уборка квартир и офисов в Минске",
    template: "%s | PrimeClean",
  },
  description:
    "PrimeClean в Минске — уборка квартир, офисов, домов. Генеральная уборка и уборка после ремонта. Опытная команда, экологичные средства. Звоните: +375 (44) 478-93-60",
  keywords: [
    "уборка квартир Минск",
    "клининг офисов Минск",
    "генеральная уборка Минск",
    "уборка после ремонта Минск",
    "клининговая компания Минск",
    "мытьё окон Минск",
    "химчистка дивана Минск",
    "PrimeClean",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "https://primeclean.by",
    siteName: "PrimeClean",
    title: "PrimeClean — Профессиональная уборка в Минске",
    description:
      "Профессиональный клининг квартир и офисов в Минске. Быстро, качественно, с гарантией.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "PrimeClean Минск" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrimeClean — Уборка в Минске",
    description: "Профессиональный клининг квартир и офисов в Минске.",
    images: ["/og-image.jpg"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/favicon.svg",
    shortcut: "/favicon.ico",
  },
  verification: {
    // Подстави свои коды после подтверждения прав в вебмастерах:
    // yandex: "<код Яндекс.Вебмастер>",
    // google: "<код Google Search Console>",
  },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "CleaningService",
  "@id": "https://primeclean.by/#business",
  name: "PrimeClean",
  url: "https://primeclean.by",
  description:
    "Профессиональный клининг квартир, офисов и домов в Минске. Генеральная уборка, уборка после ремонта, мытьё окон, химчистка мебели.",
  image: "https://primeclean.by/og-image.jpg",
  logo: "https://primeclean.by/og-image.jpg",
  telephone: "+375444789360",
  email: "info@primeclean.by",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Минск",
    addressRegion: "Минская область",
    addressCountry: "BY",
  },
  geo: { "@type": "GeoCoordinates", latitude: 53.9045, longitude: 27.5615 },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "20:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday", "Sunday"], opens: "09:00", closes: "18:00" },
  ],
  priceRange: "80–500 BYN",
  currenciesAccepted: "BYN",
  paymentAccepted: "Cash, Card, Transfer",
  areaServed: [
    { "@type": "City", name: "Минск" },
    { "@type": "AdministrativeArea", name: "Минский район" },
  ],
  sameAs: [
    "https://instagram.com/primeclean_by",
    "https://t.me/primeclean_bybot",
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Услуги клининга",
    itemListElement: [
      { "@type": "ListItem", position: 1, item: { "@type": "Service", name: "Уборка квартир", url: "https://primeclean.by/uslugi/uborka-kvartir-minsk" } },
      { "@type": "ListItem", position: 2, item: { "@type": "Service", name: "Клининг офисов", url: "https://primeclean.by/uslugi/klining-ofisov-minsk" } },
      { "@type": "ListItem", position: 3, item: { "@type": "Service", name: "Генеральная уборка", url: "https://primeclean.by/uslugi/generalnaya-uborka-minsk" } },
      { "@type": "ListItem", position: 4, item: { "@type": "Service", name: "Уборка после ремонта", url: "https://primeclean.by/uslugi/uborka-posle-remonta-minsk" } },
      { "@type": "ListItem", position: 5, item: { "@type": "Service", name: "Химчистка мебели", url: "https://primeclean.by/uslugi/khimchistka-minsk" } },
    ],
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    reviewCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://primeclean.by/#website",
  url: "https://primeclean.by",
  name: "PrimeClean",
  inLanguage: "ru-BY",
  publisher: { "@id": "https://primeclean.by/#business" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="image"
          href="https://res.cloudinary.com/dkbltmyul/image/upload/f_auto,q_auto,w_900/v1776550300/primeclean_cleaning_minks_sxtbc5.jpg"
          imageSrcSet="https://res.cloudinary.com/dkbltmyul/image/upload/f_auto,q_auto,w_480/v1776550300/primeclean_cleaning_minks_sxtbc5.jpg 480w, https://res.cloudinary.com/dkbltmyul/image/upload/f_auto,q_auto,w_900/v1776550300/primeclean_cleaning_minks_sxtbc5.jpg 900w"
          imageSizes="(max-width: 768px) 100vw, 50vw"
        />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="antialiased">
        <Script id="yandex-metrika" strategy="afterInteractive">{`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
          ym(108686777,"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true});
        `}</Script>
        <noscript><div><img src="https://mc.yandex.ru/watch/108686777" style={{position:"absolute",left:"-9999px"}} alt="" /></div></noscript>
        <Script src="https://www.googletagmanager.com/gtag/js?id=AW-18107069366" strategy="afterInteractive" />
        <Script id="google-ads" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-18107069366');
          gtag('config', 'AW-18108437624');
        `}</Script>
        <Header />
        <main>{children}</main>
        <Footer />
        <SupportWidget />
        <ScrollReveal />
      </body>
    </html>
  );
}
