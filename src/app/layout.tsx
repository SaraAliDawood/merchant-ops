import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MerchantOps — Order Operations',
  description: 'Full-stack merchant order-operations dashboard (Next.js + Node + Prisma).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
