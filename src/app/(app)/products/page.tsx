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
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-indigo-500">Catalog</p>
        <h1 className="mt-1 font-display text-2xl font-bold text-slate-900">Products</h1>
      </div>

      {isAdmin && <NewProductForm />}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400">
                <th className="px-6 py-3 font-medium">SKU</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Price</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-6 py-3 font-mono text-xs text-slate-500">{p.sku}</td>
                  <td className="px-6 py-3 text-slate-700">{p.name}</td>
                  <td className="px-6 py-3 font-medium text-slate-900">{formatMoney(p.priceCents, p.currency)}</td>
                  <td className="px-6 py-3">
                    <span className={`badge ${p.active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                      {p.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
