const CONVERSION_ID = "AW-18108437624/p1SVCMnv1aIcEPio47pD";

export function fireBookingConversion(redirectUrl?: string) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag !== "function") return;

  const callback = () => {
    if (redirectUrl) window.location.href = redirectUrl;
  };

  gtag("event", "conversion", {
    send_to: CONVERSION_ID,
    value: 1.0,
    currency: "USD",
    event_callback: callback,
  });
}
