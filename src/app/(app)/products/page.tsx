import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { formatMoney } from '@/lib/money';
import NewProductForm from '@/components/NewProductForm';

export const dynamic = 'force-dynamic';

export default async function ProductsPage() {
  const [products, session] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: 'desc' } }),
    getSession(),
  ]);
  const isAdmin = session?.role === 'ADMIN';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Products</h1>
        {isAdmin && <NewProductForm />}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-6 py-3">SKU</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-slate-100">
                <td className="px-6 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-6 py-3">{p.name}</td>
                <td className="px-6 py-3 font-medium">{formatMoney(p.priceCents, p.currency)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      p.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {p.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
