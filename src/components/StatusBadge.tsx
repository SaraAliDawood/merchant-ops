const STYLES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-600',
  PAID: 'bg-sky-50 text-sky-600',
  FULFILLED: 'bg-emerald-50 text-emerald-600',
  CANCELLED: 'bg-slate-100 text-slate-500',
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STYLES[status] ?? 'bg-slate-100 text-slate-500'}`}>{status}</span>
  );
}
