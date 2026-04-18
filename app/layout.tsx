import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
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
  icons: { icon: "/favicon.ico" },
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
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Уборка квартир" }, priceCurrency: "BYN", price: "100" },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Клининг офисов" }, priceCurrency: "BYN", price: "80" },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Генеральная уборка" }, priceCurrency: "BYN", price: "180" },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Уборка после ремонта" }, priceCurrency: "BYN", price: "220" },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Химчистка мебели" }, priceCurrency: "BYN", price: "60" },
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
        <Header />
        <main>{children}</main>
        <Footer />
        <SupportWidget />
        <ScrollReveal />
      </body>
    </html>
  );
}
