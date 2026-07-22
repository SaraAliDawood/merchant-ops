import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import LogoutButton from '@/components/LogoutButton';

const NAV = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/orders', label: 'Orders' },
  { href: '/products', label: 'Products' },
];

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 font-display font-bold text-slate-900">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm text-white">M</span>
              MerchantOps
            </span>
            <nav className="hidden gap-1 sm:flex">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              {session.email}
              <span className="badge bg-indigo-50 text-indigo-600">{session.role}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
