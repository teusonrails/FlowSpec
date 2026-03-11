/**
 * Format price from cents to display string.
 * formatPrice(1499) → "$14.99"
 * formatPrice(0) → "Free"
 * formatPrice(null) → "Free"
 */
export function formatPrice(cents: number | null | undefined): string {
  if (!cents || cents === 0) return "Free";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
  }).format(cents / 100);
}

/**
 * Format a date to a readable string.
 * formatDate(new Date()) → "Mar 9, 2026"
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Format a number with compact notation.
 * formatNumber(1234) → "1.2K"
 * formatNumber(45) → "45"
 */
export function formatNumber(num: number): string {
  if (num < 1000) return num.toString();
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Get the lowest price from an automation's tier prices.
 */
export function getLowestPrice(
  priceStarter: number | null,
  pricePro: number | null,
  priceAgency: number | null
): number | null {
  const prices = [priceStarter, pricePro, priceAgency].filter(
    (p): p is number => p !== null && p > 0
  );
  return prices.length > 0 ? Math.min(...prices) : null;
}
