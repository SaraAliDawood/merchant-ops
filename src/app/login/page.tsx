'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' ? { email: form.email, password: form.password } : form;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.push('/dashboard');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? 'Something went wrong.');
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between p-12 text-white">
        <div className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(600px 400px at 15% 20%, rgba(99,102,241,0.5), transparent 60%), radial-gradient(600px 500px at 90% 95%, rgba(236,72,153,0.35), transparent 55%)' }} />
        <div className="relative flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-400 to-violet-500 text-white">M</span>
          MerchantOps
        </div>
        <div className="relative">
          <h1 className="font-display text-4xl font-extrabold leading-tight">Run your<br />order ops.</h1>
          <p className="mt-4 max-w-sm text-slate-300">Auth, roles, a status workflow and a live revenue dashboard over thousands of orders — one clean console.</p>
          <div className="mt-8 flex flex-wrap gap-2">
            {['Role-based access', 'Search 4,000+ orders', 'Live revenue'].map((t) => (
              <span key={t} className="badge border border-white/15 bg-white/10 text-slate-200">{t}</span>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-slate-400">Built by Sara Dawood</div>
      </aside>

      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><span className="font-display text-xl font-bold text-slate-900">MerchantOps</span></div>
          <h2 className="font-display text-2xl font-bold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1 text-sm text-slate-500">{mode === 'login' ? 'Sign in to your console.' : 'Get started in seconds.'}</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === 'register' && <Field label="Name" type="text" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />}
            <Field label="Email" type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Password" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
            {error && <p className="text-sm text-rose-600">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="mt-5 w-full text-center text-sm text-slate-500 transition hover:text-indigo-600">
            {mode === 'login' ? 'Need an account? Register' : 'Have an account? Sign in'}
          </button>

          <p className="mt-8 rounded-xl border border-slate-200 bg-slate-50 p-3 text-center text-xs text-slate-500">
            Demo — <span className="text-slate-700">admin@merchantops.dev</span> / <span className="text-slate-700">password123</span>
          </p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void; }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-slate-600">{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required className="input" />
    </label>
  );
}
