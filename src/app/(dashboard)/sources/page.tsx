import Link from "next/link";
import { listSources, listBrands } from "@/server/sources";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { label: string; classes: string }> = {
  completed: { label: "Completed", classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60" },
  processing: { label: "Processing", classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/60" },
  pending: { label: "Pending", classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/60" },
  error: { label: "Error", classes: "bg-red-50 text-red-700 ring-1 ring-red-200/60" },
  draft: { label: "Draft", classes: "bg-muted text-muted-foreground ring-1 ring-border/50" },
};

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const params = await searchParams;
  const selectedBrandId = params.brand;

  let sources: Awaited<ReturnType<typeof listSources>> = [];
  let brandName: string | undefined;

  try {
    sources = await listSources(selectedBrandId);
    if (selectedBrandId) {
      const brands = await listBrands();
      brandName = brands.find((b) => b.id === selectedBrandId)?.name;
    }
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Sources</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {sources.length > 0 ? `${sources.length} article${sources.length === 1 ? "" : "s"}` : "No articles yet"}
            {brandName ? ` · ${brandName}` : ""}
          </p>
        </div>
        <Link
          href="/sources/new"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14" /><path d="M5 12h14" />
          </svg>
          New Source
        </Link>
      </div>

      {/* Sources list */}
      {sources.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/60">
              <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
              <path d="M14 2v4a2 2 0 0 0 2 2h4" />
            </svg>
          </div>
          <p className="font-semibold text-foreground">
            {selectedBrandId ? "No sources for this brand" : "No sources yet"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedBrandId
              ? "Try a different brand or create a new source"
              : "Add your first article to start generating content"}
          </p>
          <Link href="/sources/new" className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14" /><path d="M5 12h14" />
            </svg>
            Create source
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="divide-y divide-border/40">
            {sources.map((source) => {
              const status = statusConfig[source.status] ?? statusConfig.draft;
              const lastJob = source.jobs[0];

              return (
                <Link key={source.id} href={`/sources/${source.id}`}>
                  <div className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
                    {/* Status dot */}
                    <div className="mt-0.5 shrink-0">
                      <div
                        className={`h-2 w-2 rounded-full mt-1.5 ${
                          source.status === "completed"
                            ? "bg-emerald-500"
                            : source.status === "processing"
                            ? "bg-blue-500 animate-pulse"
                            : source.status === "error"
                            ? "bg-red-500"
                            : source.status === "pending"
                            ? "bg-amber-500"
                            : "bg-border"
                        }`}
                      />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-[13px] font-semibold text-foreground transition-colors group-hover:text-primary">
                          {source.title}
                        </p>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${status.classes}`}>
                          {status.label}
                        </span>
                        <span className="inline-flex items-center rounded-full bg-primary/8 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {source.pillar.replace(/_/g, " ")}
                        </span>
                        {source.brand && (
                          <span className="inline-flex items-center rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-600 ring-1 ring-teal-200/60">
                            {source.brand.name}
                          </span>
                        )}
                        {lastJob && (
                          <span className="text-[11px] text-muted-foreground/70">
                            Last run: {lastJob.status}
                          </span>
                        )}
                      </div>
                      <p className="mt-1.5 line-clamp-1 text-[12px] text-muted-foreground/70">
                        {source.content.slice(0, 120)}
                      </p>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 text-right">
                      <p className="text-[11px] text-muted-foreground">
                        {formatDistanceToNow(new Date(source.createdAt), { addSuffix: true })}
                      </p>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-auto mt-3 text-border transition-all group-hover:translate-x-0.5 group-hover:text-primary/40">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
