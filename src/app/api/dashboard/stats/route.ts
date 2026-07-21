import { getDashboardStats } from '@/lib/stats';
import { requireUser, json } from '@/lib/http';

// GET /api/dashboard/stats — KPI tiles + 7-day revenue series for the dashboard.
export async function GET() {
  const guard = await requireUser();
  if ('response' in guard) return guard.response;
  return json(await getDashboardStats());
}
