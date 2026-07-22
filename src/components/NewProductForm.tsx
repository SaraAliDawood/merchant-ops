'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toCents } from '@/lib/money';

export default function NewProductForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ sku: '', name: '', price: '', currency: 'AED' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku: form.sku, name: form.name, priceCents: toCents(form.price), currency: form.currency }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? 'Could not create product.'); }
      setForm({ sku: '', name: '', price: '', currency: 'AED' });
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return <button onClick={() => setOpen(true)} className="btn-primary">+ New product</button>;

  return (
    <form onSubmit={submit} className="card flex w-full flex-wrap items-end gap-3 p-4">
      <Input label="SKU" value={form.sku} onChange={(v) => setForm({ ...form, sku: v })} />
      <Input label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} wide />
      <Input label="Price" value={form.price} onChange={(v) => setForm({ ...form, price: v })} type="number" />
      <button type="submit" disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save'}</button>
      <button type="button" onClick={() => setOpen(false)} className="btn-ghost">Cancel</button>
      {error && <p className="w-full text-sm text-rose-600">{error}</p>}
    </form>
  );
}

function Input({ label, value, onChange, type = 'text', wide }: { label: string; value: string; onChange: (v: string) => void; type?: string; wide?: boolean }) {
  return (
    <label className={wide ? 'flex-1 min-w-[160px]' : ''}>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      <input type={type} step="0.01" value={value} onChange={(e) => onChange(e.target.value)} required className="input" />
    </label>
  );
}
