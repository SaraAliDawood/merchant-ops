import { OrderStatus } from '@prisma/client';

export interface LineInput {
  quantity: number;
  unitPriceCents: number;
}

/** Sum of line items in minor units. Throws on invalid quantities. */
export function computeTotalCents(items: LineInput[]): number {
  if (items.length === 0) throw new Error('An order needs at least one line item.');
  return items.reduce((sum, item) => {
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new Error('Quantity must be a positive integer.');
    }
    if (!Number.isInteger(item.unitPriceCents) || item.unitPriceCents < 0) {
      throw new Error('Unit price must be a non-negative integer (minor units).');
    }
    return sum + item.quantity * item.unitPriceCents;
  }, 0);
}

/**
 * Allowed order-status transitions — the state machine that keeps order data
 * consistent. Cancelling is allowed from any non-terminal state.
 */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['FULFILLED', 'CANCELLED'],
  FULFILLED: [],
  CANCELLED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: OrderStatus, to: OrderStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(`Illegal status change: ${from} → ${to}`);
  }
}

/** Human-friendly order reference, e.g. ORD-2026-000042. */
export function buildReference(year: number, seq: number): string {
  return `ORD-${year}-${String(seq).padStart(6, '0')}`;
}
