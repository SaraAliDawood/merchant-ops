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
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-indigo-500">Overview</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Revenue" value={formatMoney(stats.revenueCents)} hint="Paid + fulfilled" accent />
        <StatCard label="Orders" value={String(stats.orderCount)} hint="All time" />
        <StatCard label="Avg. order value" value={formatMoney(stats.avgOrderCents)} hint="Per earning order" />
      </div>

      <section className="card p-6">
        <h2 className="mb-4 font-display text-sm font-semibold text-slate-700">Revenue — last 7 days</h2>
        <RevenueChart series={stats.series} />
      </section>

      <section className="card overflow-hidden">
        <h2 className="border-b border-slate-100 px-6 py-4 font-display text-sm font-semibold text-slate-700">Recent orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-6 py-3 font-mono text-xs text-indigo-600">{o.reference}</td>
                  <td className="px-6 py-3 text-slate-700">{o.customer.name}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">{formatMoney(o.totalCents, o.currency)}</td>
                  <td className="px-6 py-3"><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, hint, accent }: { label: string; value: string; hint: string; accent?: boolean }) {
  return (
    <div className="card card-hover p-5">
      <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${accent ? 'text-indigo-600' : 'text-slate-900'}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{hint}</p>
    </div>
  );
}
