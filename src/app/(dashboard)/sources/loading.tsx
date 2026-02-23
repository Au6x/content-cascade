export default function SourcesLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-28 rounded bg-muted" />
          <div className="mt-2 h-4 w-48 rounded bg-muted/60" />
        </div>
        <div className="h-9 w-32 rounded-lg bg-muted" />
      </div>

      {/* Source cards */}
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card p-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted/60" />
              </div>
              <div className="h-6 w-20 rounded-full bg-muted/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
