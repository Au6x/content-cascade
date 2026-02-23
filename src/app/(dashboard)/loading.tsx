export default function DashboardLoading() {
  return (
    <div className="space-y-8 pb-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-40 rounded bg-muted" />
        <div className="mt-2 h-4 w-64 rounded bg-muted/60" />
      </div>

      {/* KPI strip skeleton */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-muted/30 p-4">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="mt-3 h-8 w-12 rounded bg-muted" />
            <div className="mt-2 h-3 w-24 rounded bg-muted/60" />
          </div>
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid gap-5 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-lg bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-muted" />
                <div className="h-1 w-full rounded-full bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
        <div className="lg:col-span-2 rounded-xl border border-border/40 bg-muted/20 p-5 space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-7 w-7 rounded-lg bg-muted" />
              <div className="space-y-1.5">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-2.5 w-40 rounded bg-muted/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
