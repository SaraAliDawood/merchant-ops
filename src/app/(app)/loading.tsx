export default function Loading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 w-48 rounded-lg bg-slate-200/70" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="h-3 w-20 rounded bg-slate-100" />
            <div className="mt-3 h-8 w-28 rounded bg-slate-200/70" />
          </div>
        ))}
      </div>
      <div className="card h-64" />
      <div className="card h-72" />
    </div>
  );
}
