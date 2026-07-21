import { requireUser, json } from '@/lib/http';

// GET /api/auth/me — the current session, or 401.
export async function GET() {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;
  return json(guard.session);
}
