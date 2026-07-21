import { describe, it, expect } from 'vitest';
import { computeTotalCents, canTransition, assertTransition, buildReference } from '@/lib/orders';

describe('computeTotalCents', () => {
  it('sums quantity × unit price across lines', () => {
    expect(
      computeTotalCents([
        { quantity: 2, unitPriceCents: 500 },
        { quantity: 1, unitPriceCents: 1250 },
      ]),
    ).toBe(2250);
  });

  it('rejects empty orders and bad quantities', () => {
    expect(() => computeTotalCents([])).toThrow();
    expect(() => computeTotalCents([{ quantity: 0, unitPriceCents: 100 }])).toThrow();
    expect(() => computeTotalCents([{ quantity: 1.5, unitPriceCents: 100 }])).toThrow();
  });
});

describe('order status state machine', () => {
  it('allows valid transitions', () => {
    expect(canTransition('PENDING', 'PAID')).toBe(true);
    expect(canTransition('PAID', 'FULFILLED')).toBe(true);
    expect(canTransition('PENDING', 'CANCELLED')).toBe(true);
  });

  it('blocks illegal transitions', () => {
    expect(canTransition('FULFILLED', 'PENDING')).toBe(false);
    expect(canTransition('CANCELLED', 'PAID')).toBe(false);
    expect(canTransition('PENDING', 'FULFILLED')).toBe(false);
    expect(() => assertTransition('FULFILLED', 'PAID')).toThrow(/Illegal status change/);
  });
});

describe('buildReference', () => {
  it('zero-pads the sequence', () => {
    expect(buildReference(2026, 42)).toBe('ORD-2026-000042');
  });
});
