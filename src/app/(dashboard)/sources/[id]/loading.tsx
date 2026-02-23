export default function SourceDetailLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* Back link + header */}
      <div className="h-4 w-24 rounded bg-muted/60" />
      <div>
        <div className="h-7 w-2/3 rounded bg-muted" />
        <div className="mt-2 h-4 w-40 rounded bg-muted/60" />
      </div>

      {/* Action bar */}
      <div className="flex gap-2">
        <div className="h-9 w-32 rounded-lg bg-muted" />
        <div className="h-9 w-24 rounded-lg bg-muted" />
      </div>

      {/* Derivative sections */}
      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-muted" />
              <div className="h-5 w-24 rounded bg-muted" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="rounded-xl border border-border/40 bg-card p-4 space-y-3">
                  <div className="h-4 w-40 rounded bg-muted" />
                  <div className="h-3 w-full rounded bg-muted/40" />
                  <div className="h-3 w-3/4 rounded bg-muted/40" />
                  <div className="aspect-[4/3] max-w-[280px] rounded-lg bg-muted/50" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
