export default function DerivativesLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 rounded bg-muted" />
          <div className="mt-2 h-4 w-56 rounded bg-muted/60" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-28 rounded-lg bg-muted" />
          <div className="h-9 w-28 rounded-lg bg-muted" />
        </div>
      </div>

      {/* Derivative cards */}
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="rounded-lg border border-border/30 p-3 space-y-2">
                  <div className="aspect-[4/3] rounded bg-muted/60" />
                  <div className="h-3 w-full rounded bg-muted/40" />
                  <div className="h-3 w-2/3 rounded bg-muted/40" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
