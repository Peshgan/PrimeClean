"use client";

import { useEffect } from "react";

const CONVERSION_ID = "AW-18108437624/p1SVCMnv1aIcEPio47pD";

export default function ConversionTracker() {
  useEffect(() => {
    let attempts = 0;
    const interval = setInterval(() => {
      const gtag = (window as any).gtag;
      if (typeof gtag === "function") {
        gtag("event", "conversion", { send_to: CONVERSION_ID });
        clearInterval(interval);
        return;
      }
      if (++attempts >= 20) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return null;
}
