import { prisma } from '@/lib/db';
import { getDashboardStats } from '@/lib/stats';
import { formatMoney } from '@/lib/money';
import StatusBadge from '@/components/StatusBadge';
import RevenueChart from '@/components/RevenueChart';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([
    getDashboardStats(),
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { customer: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue" value={formatMoney(stats.revenueCents)} hint="Paid + fulfilled" />
        <StatCard label="Orders" value={String(stats.orderCount)} hint="All time" />
        <StatCard label="Avg. order value" value={formatMoney(stats.avgOrderCents)} hint="Per earning order" />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-sm font-medium text-slate-600">Revenue — last 7 days</h2>
        <RevenueChart series={stats.series} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-100 px-6 py-4 text-sm font-medium text-slate-600">
          Recent orders
        </h2>
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {recent.map((o) => (
              <tr key={o.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-mono text-xs">{o.reference}</td>
                <td className="px-6 py-3">{o.customer.name}</td>
                <td className="px-6 py-3">{formatMoney(o.totalCents, o.currency)}</td>
                <td className="px-6 py-3">
                  <StatusBadge status={o.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
