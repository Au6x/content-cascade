import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlatformMeta } from "@/lib/platform-meta";
import { getDashboardStats } from "@/server/sources";
import { db } from "@/lib/db";
import { platforms } from "@/lib/db/schema";
import Link from "next/link";

export default async function DashboardPage() {
  let stats = {
    totalSources: 0,
    totalDerivatives: 0,
    platformBreakdown: [] as { platformId: string; count: number }[],
    statusBreakdown: [] as { status: string; count: number }[],
  };

  try {
    stats = await getDashboardStats();
  } catch {
    // DB not connected yet
  }

  let platformNames: Record<string, string> = {};
  try {
    const allPlatforms = await db.select().from(platforms);
    platformNames = Object.fromEntries(
      allPlatforms.map((p) => [p.id, p.name])
    );
  } catch {
    // DB not connected
  }

  const approvedCount =
    stats.statusBreakdown.find((s) => s.status === "approved")?.count ?? 0;

  const statCards = [
    {
      label: "Total Sources",
      value: stats.totalSources,
      sub: "Articles submitted",
      iconPath: "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z",
      gradient: "from-blue-500/10 to-cyan-500/10",
    },
    {
      label: "Derivatives",
      value: stats.totalDerivatives,
      sub: "Content pieces generated",
      iconPath:
        "m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z",
      gradient: "from-violet-500/10 to-purple-500/10",
    },
    {
      label: "Platforms",
      value: stats.platformBreakdown.length,
      sub: "Active platforms",
      iconPath:
        "M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z",
      gradient: "from-amber-500/10 to-orange-500/10",
    },
    {
      label: "Approved",
      value: approvedCount,
      sub: "Ready to schedule",
      iconPath: "M22 11.08V12a10 10 0 1 1-5.93-9.14",
      gradient: "from-emerald-500/10 to-green-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-violet-500/5 to-transparent p-8 ring-1 ring-primary/10">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Content Cascade overview and stats
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="overflow-hidden border-0 shadow-sm ring-1 ring-border/50"
          >
            <CardContent className="relative p-5">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50`}
              />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {card.label}
                  </p>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground/50"
                  >
                    <path d={card.iconPath} />
                  </svg>
                </div>
                <p className="mt-2 text-3xl font-bold">{card.value}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {card.sub}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Platform breakdown */}
      {stats.platformBreakdown.length > 0 && (
        <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-border/50">
          <CardHeader className="border-b bg-muted/30 pb-3">
            <CardTitle className="text-sm font-semibold">
              Content by Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-3">
              {stats.platformBreakdown.map((p) => {
                const name = platformNames[p.platformId] || p.platformId;
                const meta = getPlatformMeta(name);
                const pct =
                  stats.totalDerivatives > 0
                    ? Math.round((p.count / stats.totalDerivatives) * 100)
                    : 0;
                return (
                  <div key={p.platformId} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} text-xs font-bold text-white shadow-sm`}
                    >
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-sm font-medium">{name}</span>
                        <span className="text-xs text-muted-foreground">
                          {p.count} pieces
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${meta.gradient}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {stats.totalSources === 0 && (
        <Card className="border-0 shadow-sm ring-1 ring-border/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-violet-500/10">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-primary"
              >
                <path d="M12 3v18" />
                <path d="M5.636 5.636 3.515 3.515" />
                <path d="m18.364 5.636 2.121-2.121" />
                <circle cx="12" cy="12" r="4" />
              </svg>
            </div>
            <p className="text-lg font-semibold">No content yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create your first content source to get started
            </p>
            <Link href="/sources/new" className="mt-4">
              <Button size="lg">Create Source</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
