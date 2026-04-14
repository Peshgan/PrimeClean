import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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
    "Клининговая компания PrimeClean в Минске. Уборка квартир, офисов, домов. Генеральная уборка и уборка после ремонта. Опытная команда, экологичные средства. Звоните: +375 (29) 123-45-67",
  keywords: [
    "уборка квартир Минск",
    "клининг офисов Минск",
    "генеральная уборка Минск",
    "уборка после ремонта Минск",
    "клининговая компания Минск",
    "PrimeClean",
  ],
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
  robots: { index: true, follow: true },
};

const schemaOrg = {
  "@context": "https://schema.org",
  "@type": "CleaningService",
  name: "PrimeClean",
  url: "https://primeclean.by",
  description: "Профессиональная клининговая компания в Минске.",
  telephone: "+375291234567",
  email: "info@primeclean.by",
  address: {
    "@type": "PostalAddress",
    streetAddress: "ул. Немига, 5",
    addressLocality: "Минск",
    addressCountry: "BY",
  },
  geo: { "@type": "GeoCoordinates", latitude: 53.9045, longitude: 27.5615 },
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday"], opens: "08:00", closes: "20:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday","Sunday"], opens: "09:00", closes: "18:00" },
  ],
  priceRange: "$$",
  areaServed: { "@type": "City", name: "Минск" },
  aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", reviewCount: "127" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${montserrat.variable}`} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrg) }}
        />
      </head>
      <body className="antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
