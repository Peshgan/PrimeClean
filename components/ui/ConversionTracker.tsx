"use client";

import { useEffect } from "react";

export default function ConversionTracker() {
  useEffect(() => {
    const gtag = (window as any).gtag;
    if (typeof gtag !== "function") return;
    gtag("event", "conversion", {
      send_to: "AW-18108437624/7n_uCNyD1KIcEPic47pD",
    });
  }, []);

  return null;
}
