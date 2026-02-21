import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listSources, listBrands } from "@/server/sources";
import { formatDistanceToNow } from "date-fns";

const statusStyles: Record<string, string> = {
  completed:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  processing:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  error:
    "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  draft:
    "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300",
};

export default async function SourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const params = await searchParams;
  const selectedBrandId = params.brand;

  let sources: Awaited<ReturnType<typeof listSources>> = [];
  let brands: Awaited<ReturnType<typeof listBrands>> = [];

  try {
    [sources, brands] = await Promise.all([
      listSources(selectedBrandId),
      listBrands(),
    ]);
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 via-primary/5 to-transparent p-8 ring-1 ring-primary/10">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="relative flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sources</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your pillar articles for content cascade
            </p>
          </div>
          <Link href="/sources/new">
            <Button size="lg" className="shadow-md">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1.5">
                <path d="M12 5v14" /><path d="M5 12h14" />
              </svg>
              New Source
            </Button>
          </Link>
        </div>
      </div>

      {/* Brand filter */}
      {brands.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link href="/sources">
            <span
              className={`inline-flex cursor-pointer items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                !selectedBrandId
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              All brands
            </span>
          </Link>
          {brands.map((b) => (
            <Link key={b.id} href={`/sources?brand=${b.id}`}>
              <span
                className={`inline-flex cursor-pointer items-center rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  selectedBrandId === b.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      {sources.length === 0 ? (
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
            </div>
            <p className="text-lg font-semibold">No sources yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first article to start generating content
            </p>
            <Link href="/sources/new" className="mt-4">
              <Button size="lg">Create your first source</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sources.map((source) => (
            <Link key={source.id} href={`/sources/${source.id}`}>
              <div className="group rounded-2xl p-5 shadow-sm ring-1 ring-border/40 transition-all hover:shadow-md hover:ring-border/60">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="truncate text-base font-semibold group-hover:text-primary transition-colors">
                        {source.title}
                      </h3>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles[source.status] || statusStyles.draft}`}
                      >
                        {source.status}
                      </span>
                      <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                        {source.pillar.replace(/_/g, " ")}
                      </span>
                      {source.brand && (
                        <span className="shrink-0 rounded-full bg-violet-100 px-2.5 py-0.5 text-[10px] font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-400">
                          {source.brand.name}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {source.content}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(source.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                    {source.jobs[0] && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground/70">
                        Last run: {source.jobs[0].status}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
