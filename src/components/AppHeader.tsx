'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/orders', label: 'Orders' },
  { href: '/products', label: 'Products' },
];

export default function AppHeader({ email, role }: { email: string; role: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
      <div className="relative mx-auto flex w-[88%] max-w-[1600px] items-center justify-between py-3">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold text-slate-900">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm text-white">M</span>
            MerchantOps
          </Link>
          <nav className="hidden gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 text-sm text-slate-500 md:flex">
            {email}
            <span className="badge bg-indigo-50 text-indigo-600">{role}</span>
          </span>
          <button onClick={logout} className="btn-ghost hidden px-3 py-1.5 text-sm md:inline-flex">Sign out</button>
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-100 md:hidden"
          >
            {open ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
            )}
          </button>
        </div>

        {open && (
          <div className="absolute left-0 right-0 top-full mt-px rounded-b-2xl border-b border-slate-200 bg-white p-4 shadow-xl md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
                  {n.label}
                </Link>
              ))}
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-3">
                <span className="text-sm text-slate-500">{email} · {role}</span>
                <button onClick={logout} className="btn-ghost px-3 py-1.5 text-sm">Sign out</button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
