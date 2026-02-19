import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CascadeTrigger } from "@/components/cascade-trigger";
import { VariationScroller } from "@/components/variation-scroller";
import { getPlatformMeta } from "@/lib/platform-meta";
import { PlatformTabs } from "@/components/platform-dropdown";
import { getSource } from "@/server/sources";

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

export default async function SourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const source = await getSource(id);

  if (!source) {
    notFound();
  }

  // Group derivatives by platform, then by template slug
  type TemplateGroup = {
    templateName: string;
    templateSlug: string;
    variations: typeof source.derivatives;
  };

  const grouped: Record<string, TemplateGroup[]> = {};

  for (const d of source.derivatives || []) {
    const platform = d.platform?.name || "Unknown";
    if (!grouped[platform]) grouped[platform] = [];

    const slug = d.template?.slug || "unknown";
    let templateGroup = grouped[platform].find(
      (g) => g.templateSlug === slug
    );
    if (!templateGroup) {
      templateGroup = {
        templateName:
          d.template?.name ||
          slug.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        templateSlug: slug,
        variations: [],
      };
      grouped[platform].push(templateGroup);
    }
    templateGroup.variations.push(d);
  }

  const canRunCascade =
    source.status !== "processing" && source.content.length > 0;

  const platformOrder = [
    "LinkedIn", "X", "Twitter", "Instagram", "Facebook",
    "TikTok", "YouTube", "Memes",
  ];

  const sortedPlatforms = Object.entries(grouped).sort(([a], [b]) => {
    const ai = platformOrder.indexOf(a);
    const bi = platformOrder.indexOf(b);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  }) as [string, TemplateGroup[]][];

  const uniqueTemplateCount = sortedPlatforms.reduce(
    (sum, [, groups]) => sum + groups.length,
    0
  );

  return (
    <div className="space-y-8">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent p-8 ring-1 ring-primary/10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-violet-500/5 blur-2xl" />
        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-3">
              <h1 className="text-3xl font-bold tracking-tight">
                {source.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[source.status] || statusStyles.draft}`}
                >
                  {source.status}
                </span>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {source.pillar.replace(/_/g, " ")}
                </span>
                {source.derivatives.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {source.derivatives.length} derivatives ({source.variationsCount}x variations)
                  </span>
                )}
              </div>
            </div>
            {canRunCascade && (
              <div className="shrink-0">
                <CascadeTrigger sourceId={source.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article + Extraction in 2-col */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
              Article Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="max-h-72 overflow-y-auto pr-2 text-sm leading-relaxed text-muted-foreground">
              {source.content}
            </div>
          </CardContent>
        </Card>

        {source.extraction && (
          <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/50">
            <CardHeader className="border-b bg-muted/30 pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted-foreground">
                  <path d="M12 3v18" /><path d="M5.636 5.636 3.515 3.515" /><path d="m18.364 5.636 2.121-2.121" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                AI Extraction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5 p-4">
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Themes
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {source.extraction.themes.map((theme, i) => (
                    <span
                      key={i}
                      className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Key Takeaways
                </h4>
                <ul className="space-y-2">
                  {source.extraction.takeaways.slice(0, 5).map((t, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      <span>
                        <strong className="text-foreground">{t.point}</strong>{" "}
                        — {t.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Social Hooks
                </h4>
                <ul className="space-y-1.5">
                  {source.extraction.hooks.slice(0, 5).map((h, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="mt-1 text-primary/60">&#x2022;</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Generated content by platform */}
      {sortedPlatforms.length > 0 && (
        <div className="space-y-6">
          <div className="border-b-2 border-red-500 pb-4">
            <h2 className="text-2xl font-bold tracking-tight">
              Generated Content
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {source.derivatives.length} pieces across{" "}
              {sortedPlatforms.length} platforms,{" "}
              {uniqueTemplateCount} templates
            </p>
          </div>

          <div className="space-y-10">
            {sortedPlatforms.map(([platformName, templateGroups]) => {
              const meta = getPlatformMeta(platformName);
              return (
                <div key={platformName}>
                  {/* Platform sub-heading */}
                  <div className="mb-4 flex items-center gap-3 border-l-4 pl-3" style={{ borderColor: meta.color }}>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} text-[10px] font-bold text-white`}
                    >
                      {meta.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold">{platformName}</h3>
                      <p className="text-[11px] text-muted-foreground">
                        {templateGroups.length}{" "}
                        {templateGroups.length === 1 ? "template" : "templates"}
                        {templateGroups[0]?.variations.length > 1 &&
                          ` · ${templateGroups[0].variations.length} variations each`}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {templateGroups.map((group) => (
                      <VariationScroller
                        key={group.templateSlug}
                        templateName={group.templateName}
                        variations={group.variations}
                        platformName={platformName}
                        meta={meta}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
