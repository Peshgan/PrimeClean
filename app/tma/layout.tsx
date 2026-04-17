import type { Metadata, Viewport } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "PrimeClean — Клининг в Telegram",
  description: "Профессиональный клининг квартир и офисов в Минске",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  minimumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function TMALayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="beforeInteractive"
      />
      <style>{`
        html, body {
          touch-action: manipulation;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
          overscroll-behavior: none;
        }
        html, body, #__next { height: 100%; }
        input, select, textarea { font-size: 16px !important; }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          overflowY: "auto",
          overflowX: "hidden",
          WebkitOverflowScrolling: "touch",
          background: "#F0FDFF",
          touchAction: "pan-y",
        }}
      >
        {children}
      </div>
    </>
  );
}
