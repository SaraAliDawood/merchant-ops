import { clearSessionCookie } from '@/lib/auth';
import { json } from '@/lib/http';

// POST /api/auth/logout
export async function POST() {
  await clearSessionCookie();
  return json({ ok: true });
}
