import { Card, CardContent } from "@/components/ui/card";
import { DerivativesAccordion } from "@/components/derivatives-accordion";
import { getPlatformMeta } from "@/lib/platform-meta";
import { listDerivatives } from "@/server/derivatives";

export default async function DerivativesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; platform?: string; brand?: string }>;
}) {
  const params = await searchParams;

  let items: Awaited<ReturnType<typeof listDerivatives>> = [];
  try {
    items = await listDerivatives({
      status: params.status,
      platformId: params.platform,
      brandId: params.brand,
    });
  } catch {
    // DB not connected
  }

  const statusCounts = items.reduce(
    (acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Group: Article → Platform → Derivatives
  const platformOrder = [
    "LinkedIn", "X", "Twitter", "Instagram", "Facebook",
    "TikTok", "YouTube", "Memes",
  ];

  const byArticle = items.reduce(
    (acc, d) => {
      const sourceId = d.source?.id || "unknown";
      const sourceTitle = d.source?.title || "Unknown Article";
      if (!acc[sourceId]) acc[sourceId] = { title: sourceTitle, items: [] };
      acc[sourceId].items.push(d);
      return acc;
    },
    {} as Record<string, { title: string; items: typeof items }>
  );

  const articles = Object.entries(byArticle).map(
    ([sourceId, { title, items: articleItems }]) => {
      const grouped = articleItems.reduce(
        (acc, d) => {
          const platform = d.platform?.name || "Unknown";
          if (!acc[platform]) acc[platform] = [];
          acc[platform].push(d);
          return acc;
        },
        {} as Record<string, typeof articleItems>
      );

      const platforms = Object.entries(grouped)
        .sort(([a], [b]) => {
          const ai = platformOrder.indexOf(a);
          const bi = platformOrder.indexOf(b);
          return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
        })
        .map(([name, platformItems]) => ({
          name,
          meta: getPlatformMeta(name),
          items: platformItems,
        }));

      return {
        sourceId,
        title,
        platforms,
        totalCount: articleItems.length,
      };
    }
  );

  const allPlatforms = new Set(
    items.map((d) => d.platform?.name).filter(Boolean)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Content Derivatives
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} pieces from {articles.length}{" "}
          {articles.length === 1 ? "article" : "articles"} across{" "}
          {allPlatforms.size} platforms
        </p>
      </div>

      {/* Status filter chips */}
      <div className="flex flex-wrap gap-2">
        <a href={params.brand ? `/derivatives?brand=${params.brand}` : "/derivatives"}>
          <span
            className={`inline-flex cursor-pointer items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              !params.status
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
          >
            All ({items.length})
          </span>
        </a>
        {Object.entries(statusCounts).map(([status, count]) => (
          <a key={status} href={`/derivatives?status=${status}${params.brand ? `&brand=${params.brand}` : ""}`}>
            <span
              className={`inline-flex cursor-pointer items-center rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                params.status === status
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {status} ({count})
            </span>
          </a>
        ))}
      </div>

      {items.length === 0 ? (
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-lg font-semibold">No derivatives yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Run a cascade on a source to generate content
            </p>
          </CardContent>
        </Card>
      ) : (
        <DerivativesAccordion articles={articles} />
      )}
    </div>
  );
}
