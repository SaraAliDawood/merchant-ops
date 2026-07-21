import { describe, it, expect } from 'vitest';
import { toCents, formatMoney } from '@/lib/money';

describe('money', () => {
  it('converts major units to integer cents without float drift', () => {
    expect(toCents('12.50')).toBe(1250);
    expect(toCents(0.1 + 0.2)).toBe(30); // 0.30000000000000004 → 30
    expect(toCents(99.99)).toBe(9999);
  });

  it('rejects invalid amounts', () => {
    expect(() => toCents(-5)).toThrow();
    expect(() => toCents('abc')).toThrow();
  });

  it('formats cents as currency', () => {
    expect(formatMoney(1250, 'AED')).toContain('12.50');
    expect(formatMoney(0)).toContain('0.00');
  });
});
