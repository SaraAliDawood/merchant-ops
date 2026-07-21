'use client';

import { useEffect, useState } from 'react';
import { formatMoney } from '@/lib/money';
import StatusBadge from '@/components/StatusBadge';

interface OrderRow {
  id: string;
  reference: string;
  status: string;
  totalCents: number;
  currency: string;
  createdAt: string;
  customer: { name: string; email: string };
  _count: { items: number };
}

interface Page {
  data: OrderRow[];
  page: number;
  totalPages: number;
  total: number;
}

const STATUSES = ['', 'PENDING', 'PAID', 'FULFILLED', 'CANCELLED'];

export default function OrdersPage() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  // Debounce the search box so we don't hammer the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams({ page: String(page) });
      if (query) params.set('query', query);
      if (status) params.set('status', status);
      setLoading(true);
      fetch(`/api/orders?${params}`)
        .then((r) => r.json())
        .then((data: Page) => setResult(data))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [query, status, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Orders</h1>
        {result && <span className="text-sm text-slate-400">{result.total} total</span>}
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          placeholder="Search reference or customer…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s || 'All statuses'}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-3">Reference</th>
              <th className="px-6 py-3">Customer</th>
              <th className="px-6 py-3">Items</th>
              <th className="px-6 py-3">Total</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading &&
              result?.data.map((o) => (
                <tr key={o.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-xs">{o.reference}</td>
                  <td className="px-6 py-3">
                    <div>{o.customer.name}</div>
                    <div className="text-xs text-slate-400">{o.customer.email}</div>
                  </td>
                  <td className="px-6 py-3">{o._count.items}</td>
                  <td className="px-6 py-3 font-medium">{formatMoney(o.totalCents, o.currency)}</td>
                  <td className="px-6 py-3">
                    <StatusBadge status={o.status} />
                  </td>
                  <td className="px-6 py-3 text-slate-500">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            {!loading && result?.data.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No orders match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {result && result.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-slate-500">
            Page {result.page} of {result.totalPages}
          </span>
          <button
            disabled={page >= result.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-slate-300 px-3 py-1.5 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
