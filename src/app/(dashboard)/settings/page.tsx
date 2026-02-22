import { db } from "@/lib/db";
import { brandProfiles, platforms, contentTemplates } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { getPlatformMeta } from "@/lib/platform-meta";

export default async function SettingsPage() {
  let allBrands: typeof brandProfiles.$inferSelect[] = [];
  let allPlatforms: Array<{
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
    templateCount?: number;
  }> = [];

  try {
    [allBrands, allPlatforms] = await Promise.all([
      db.select().from(brandProfiles).orderBy(brandProfiles.name),
      db
        .select({
          id: platforms.id,
          name: platforms.name,
          slug: platforms.slug,
          enabled: platforms.enabled,
          templateCount: count(contentTemplates.id),
        })
        .from(platforms)
        .leftJoin(contentTemplates, eq(platforms.id, contentTemplates.platformId))
        .groupBy(platforms.id)
        .orderBy(platforms.sortOrder),
    ]);
  } catch {
    // DB not connected
  }

  const activeBrands = allBrands.filter((b) => b.isActive).length;
  const totalTemplates = allPlatforms.reduce((sum, p) => sum + (p.templateCount ?? 0), 0);

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {activeBrands} brand voices · {allPlatforms.length} platforms · {totalTemplates} templates
        </p>
      </div>

      {/* Brand Voices */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">Brand Voices</h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {allBrands.length} profiles
          </span>
        </div>

        {allBrands.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">
              No brand profiles configured. Run the seed script.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allBrands.map((brand) => (
              <div
                key={brand.id}
                className="group overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                {/* Brand header */}
                <div className="flex items-start gap-3 px-4 py-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-teal-400/15 text-[11px] font-bold text-primary">
                    {brand.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-foreground">
                      {brand.name}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${
                        brand.isActive
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
                          : "bg-muted text-muted-foreground ring-border/50"
                      }`}>
                        <span className={`h-1 w-1 rounded-full ${brand.isActive ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                        {brand.isActive ? "Active" : "Inactive"}
                      </span>
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-[10px] text-muted-foreground">
                        {brand.slug}
                      </code>
                      {brand.ghlLocationId && (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60">
                          GHL
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tone + guidelines */}
                <div className="border-t border-border/30 px-4 py-3">
                  {brand.tone && (
                    <p className="text-[12px] leading-relaxed text-foreground/70">
                      {brand.tone.length > 120 ? brand.tone.slice(0, 120) + "..." : brand.tone}
                    </p>
                  )}
                  {brand.voiceGuidelines && (
                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
                      {brand.voiceGuidelines}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Platforms */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-foreground">Platforms</h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            {totalTemplates} templates total
          </span>
        </div>

        {allPlatforms.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-8 text-center">
            <p className="text-sm text-muted-foreground">No platforms configured. Run the seed script.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/50 bg-card shadow-sm">
            <div className="divide-y divide-border/30">
              {allPlatforms.map((p) => {
                const meta = getPlatformMeta(p.name);
                return (
                  <div key={p.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/20">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${meta.gradient} text-[9px] font-bold text-white shadow-sm`}
                    >
                      {meta.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-foreground">{p.name}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 ${
                      p.enabled
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200/60"
                        : "bg-muted text-muted-foreground ring-border/50"
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${p.enabled ? "bg-emerald-500" : "bg-muted-foreground/40"}`} />
                      {p.enabled ? "Active" : "Disabled"}
                    </span>
                    <span className="text-[12px] tabular-nums text-muted-foreground">
                      {p.templateCount} templates
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
