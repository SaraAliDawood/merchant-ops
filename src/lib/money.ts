/**
 * Money helpers. All amounts are stored and computed in *minor units*
 * (integer fils/cents) so we never hit floating-point rounding bugs — the
 * classic mistake in payment/e-commerce code (0.1 + 0.2 !== 0.3).
 */

export function formatMoney(cents: number, currency = 'AED'): string {
  const major = cents / 100;
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(major);
}

/** Parse a user-entered major-unit amount (e.g. "12.50") into integer cents. */
export function toCents(major: number | string): number {
  const n = typeof major === 'string' ? Number(major) : major;
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`Invalid money amount: ${major}`);
  }
  return Math.round(n * 100);
}
