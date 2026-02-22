import { getPlatformMeta } from "@/lib/platform-meta";
import { getDashboardStats, listBrands } from "@/server/sources";
import { db } from "@/lib/db";
import { platforms } from "@/lib/db/schema";
import Link from "next/link";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ brand?: string }>;
}) {
  const params = await searchParams;
  const brandId = params.brand;

  let stats = {
    totalSources: 0,
    totalDerivatives: 0,
    platformBreakdown: [] as { platformId: string; count: number }[],
    statusBreakdown: [] as { status: string; count: number }[],
  };

  try {
    stats = await getDashboardStats(brandId);
  } catch {
    // DB not connected yet
  }

  let platformNames: Record<string, string> = {};
  try {
    const allPlatforms = await db.select().from(platforms);
    platformNames = Object.fromEntries(allPlatforms.map((p) => [p.id, p.name]));
  } catch {
    // DB not connected
  }

  let brandName: string | undefined;
  if (brandId) {
    try {
      const brands = await listBrands();
      brandName = brands.find((b) => b.id === brandId)?.name;
    } catch {}
  }

  const approvedCount = stats.statusBreakdown.find((s) => s.status === "approved")?.count ?? 0;
  const publishedCount = stats.statusBreakdown.find((s) => s.status === "published")?.count ?? 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {brandName ? `Overview for ${brandName}` : "Overview of your content cascade pipeline"}
        </p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          {
            label: "Sources",
            value: stats.totalSources,
            sub: "articles submitted",
            color: "text-teal-600",
            bg: "bg-teal-50",
            border: "border-teal-100",
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-teal-500">
                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
              </svg>
            ),
          },
          {
            label: "Derivatives",
            value: stats.totalDerivatives,
            sub: "content pieces",
            color: "text-cyan-600",
            bg: "bg-cyan-50",
            border: "border-cyan-100",
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-cyan-500">
                <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                <path d="m22.54 12.43-1.42-.65-8.58 3.91a2 2 0 0 1-1.66 0L2.3 11.78l-1.42.65a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
              </svg>
            ),
          },
          {
            label: "Approved",
            value: approvedCount,
            sub: "ready to schedule",
            color: "text-amber-600",
            bg: "bg-amber-50",
            border: "border-amber-100",
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-amber-500">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            ),
          },
          {
            label: "Published",
            value: publishedCount,
            sub: "live on platforms",
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-100",
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-emerald-500">
                <path d="M22 2 11 13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            ),
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border ${card.border} ${card.bg} p-4 transition-shadow hover:shadow-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {card.label}
                </p>
                <p className={`mt-1.5 text-3xl font-bold tabular-nums ${card.color}`}>
                  {card.value.toLocaleString()}
                </p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">{card.sub}</p>
              </div>
              <div className="rounded-lg bg-white/70 p-1.5 shadow-sm">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column: Platform breakdown + Quick actions */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Platform breakdown */}
        {stats.platformBreakdown.length > 0 && (
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-3.5">
                <h2 className="text-[13px] font-semibold text-foreground">Content by Platform</h2>
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  {stats.platformBreakdown.length} active
                </span>
              </div>
              <div className="divide-y divide-border/40 px-5">
                {stats.platformBreakdown
                  .sort((a, b) => b.count - a.count)
                  .map((p) => {
                    const name = platformNames[p.platformId] || p.platformId;
                    const meta = getPlatformMeta(name);
                    const pct =
                      stats.totalDerivatives > 0
                        ? Math.round((p.count / stats.totalDerivatives) * 100)
                        : 0;
                    return (
                      <div key={p.platformId} className="flex items-center gap-4 py-3">
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} text-[11px] font-bold text-white shadow-sm`}
                        >
                          {meta.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[13px] font-medium">{name}</span>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="tabular-nums">{p.count}</span>
                              <span className="w-7 text-right font-semibold">{pct}%</span>
                            </div>
                          </div>
                          <div className="h-1 w-full overflow-hidden rounded-full bg-border/50">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${meta.gradient} transition-all duration-700`}
                              style={{ width: `${Math.max(pct, 2)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Quick actions */}
        <div className={stats.platformBreakdown.length > 0 ? "lg:col-span-2" : "lg:col-span-5"}>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <div className="border-b border-border/50 px-5 py-3.5">
              <h2 className="text-[13px] font-semibold text-foreground">Quick Actions</h2>
            </div>
            <div className="divide-y divide-border/40">
              {[
                {
                  href: "/sources/new",
                  title: "New Source",
                  desc: "Submit an article to cascade",
                  iconBg: "bg-primary/8",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" className="text-primary">
                      <path d="M12 5v14" /><path d="M5 12h14" />
                    </svg>
                  ),
                },
                {
                  href: "/sources",
                  title: "View Sources",
                  desc: "Manage your article library",
                  iconBg: "bg-teal-50",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-500">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    </svg>
                  ),
                },
                {
                  href: "/derivatives",
                  title: "Browse Derivatives",
                  desc: "Review generated content",
                  iconBg: "bg-cyan-50",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500">
                      <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
                    </svg>
                  ),
                },
                {
                  href: "/settings",
                  title: "Brand Voices",
                  desc: "Configure brand profiles",
                  iconBg: "bg-emerald-50",
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500">
                      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  ),
                },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="group flex items-center gap-3.5 px-5 py-3.5 transition-colors hover:bg-muted/40"
                >
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${action.iconBg}`}>
                    {action.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground transition-colors group-hover:text-primary">
                      {action.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">{action.desc}</p>
                  </div>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0 text-border transition-all group-hover:translate-x-0.5 group-hover:text-primary/40">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {stats.totalSources === 0 && (
        <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-12 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/8">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary">
              <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
              <path d="m22.54 12.43-1.42-.65-8.58 3.91a2 2 0 0 1-1.66 0L2.3 11.78l-1.42.65a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
            </svg>
          </div>
          <p className="font-semibold text-foreground">Ready to cascade</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Submit your first article to generate content across all 7 platforms and 61 templates
          </p>
          <Link
            href="/sources/new"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-all hover:bg-primary/90"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14" /><path d="M5 12h14" />
            </svg>
            Create your first source
          </Link>
        </div>
      )}
    </div>
  );
}
