import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AppHeader from '@/components/AppHeader';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen">
      <AppHeader email={session.email} role={session.role} />
      <main className="mx-auto w-[88%] max-w-[1600px] py-8">{children}</main>
    </div>
  );
}
