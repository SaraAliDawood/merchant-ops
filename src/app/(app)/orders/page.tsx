'use client';

import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/money';
import StatusBadge from '@/components/StatusBadge';

interface OrderRow {
  id: string; reference: string; status: string; totalCents: number; currency: string;
  createdAt: string; customer: { name: string; email: string }; _count: { items: number };
}
interface Page { data: OrderRow[]; page: number; totalPages: number; total: number }

const STATUSES = ['', 'PENDING', 'PAID', 'FULFILLED', 'CANCELLED'];

export default function OrdersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set('query', query);
      if (status) params.set('status', status);
      setLoading(true);
      fetch(`/api/orders?${params}`).then((r) => r.json()).then((d: Page) => setResult(d)).finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, status, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-indigo-500">Operations</p>
          <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">Orders</h1>
        </div>
        {result && <span className="text-sm text-slate-400">{result.total} total</span>}
      </div>

      <div className="flex flex-wrap gap-3">
        <input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}
          placeholder="Search reference or customer…" className="input flex-1 min-w-[200px]" />
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className="input w-auto">
          {STATUSES.map((s) => <option key={s} value={s}>{s || 'All statuses'}</option>)}
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">Reference</th>
                <th className="px-6 py-3 font-medium">Customer</th>
                <th className="px-6 py-3 font-medium">Items</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    {Array.from({ length: 6 }).map((__, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-3 w-24 animate-pulse rounded bg-slate-100" /></td>
                    ))}
                  </tr>
                ))}
              {!loading && result?.data.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-6 py-3 font-mono text-xs text-indigo-600">{o.reference}</td>
                  <td className="px-6 py-3">
                    <div className="text-slate-700">{o.customer.name}</div>
                    <div className="text-xs text-slate-400">{o.customer.email}</div>
                  </td>
                  <td className="px-6 py-3 text-slate-600">{o._count.items}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">{formatMoney(o.totalCents, o.currency)}</td>
                  <td className="px-6 py-3"><StatusBadge status={o.status} /></td>
                  <td className="px-6 py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!loading && result?.data.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">No orders match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost disabled:opacity-40">Previous</button>
          <span className="text-slate-500">Page {result.page} of {result.totalPages}</span>
          <button disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost disabled:opacity-40">Next</button>
        </div>
      )}
    </div>
  );
}
