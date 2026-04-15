import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PrimeClean — Клининг в Telegram",
  description: "Профессиональный клининг квартир и офисов в Минске",
  robots: { index: false, follow: false },
};

export default function TMALayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Load Telegram WebApp SDK before anything else */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      {/* Full-screen overlay that hides the site Header/Footer */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          background: "#F0FDFF",
        }}
      >
        {children}
      </div>
    </>
  );
}
