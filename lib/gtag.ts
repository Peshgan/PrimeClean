const CONVERSION_ID = "AW-18108437624/7n_uCNyD1KIcEPic47pD";

export function fireBookingConversion(transactionId?: string | number) {
  if (typeof window === "undefined") return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gtag = (window as any).gtag;
  if (typeof gtag !== "function") return;
  gtag("event", "conversion", {
    send_to: CONVERSION_ID,
    transaction_id: transactionId ? String(transactionId) : "",
  });
}
