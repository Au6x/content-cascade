export default function SettingsLoading() {
  return (
    <div className="space-y-6 pb-8 animate-pulse">
      <div>
        <div className="h-7 w-28 rounded bg-muted" />
        <div className="mt-2 h-4 w-52 rounded bg-muted/60" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="h-3 w-full rounded bg-muted/40" />
            <div className="h-3 w-2/3 rounded bg-muted/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
