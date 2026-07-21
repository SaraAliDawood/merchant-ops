import type { OrderStatus } from '@prisma/client';
import { prisma } from './db';

export interface DashboardStats {
  revenueCents: number;
  orderCount: number;
  avgOrderCents: number;
  byStatus: Record<string, number>;
  series: { date: string; revenueCents: number }[];
}

/** Aggregate KPIs + a 7-day revenue series. Revenue = PAID or FULFILLED orders. */
export async function getDashboardStats(): Promise<DashboardStats> {
  const earning = { in: ['PAID', 'FULFILLED'] as OrderStatus[] };

  const [revenueAgg, orderCount, byStatusRaw, recent] = await Promise.all([
    prisma.order.aggregate({ _sum: { totalCents: true }, where: { status: earning } }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.order.findMany({
      where: { status: earning },
      select: { totalCents: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 500,
    }),
  ]);

  const revenueCents = revenueAgg._sum?.totalCents ?? 0;
  const earningCount = byStatusRaw
    .filter((s) => s.status === 'PAID' || s.status === 'FULFILLED')
    .reduce((n, s) => n + s._count._all, 0);
  const avgOrderCents = earningCount ? Math.round(revenueCents / earningCount) : 0;

  const days: { date: string; revenueCents: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    days.push({ date: d.toISOString().slice(0, 10), revenueCents: 0 });
  }
  const indexByDate = new Map(days.map((d, i) => [d.date, i]));
  for (const o of recent) {
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    const idx = indexByDate.get(key);
    if (idx !== undefined) days[idx].revenueCents += o.totalCents;
  }

  return {
    revenueCents,
    orderCount,
    avgOrderCents,
    byStatus: Object.fromEntries(byStatusRaw.map((s) => [s.status, s._count._all])),
    series: days,
  };
}
