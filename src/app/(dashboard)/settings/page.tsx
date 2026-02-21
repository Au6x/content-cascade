import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { brandProfiles, platforms, contentTemplates } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure brand voices, platforms, and content templates
        </p>
      </div>

      {/* Brand Profiles */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Voices</CardTitle>
          <CardDescription>
            {allBrands.length} brand profiles configured for content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allBrands.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No brand profiles configured. Run the seed script to create profiles.
            </p>
          ) : (
            <div className="space-y-3">
              {allBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{brand.name}</span>
                        <Badge
                          variant={brand.isActive ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {brand.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          {brand.slug}
                        </code>
                      </div>
                      {brand.tone && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          <span className="font-medium text-foreground/70">Tone:</span>{" "}
                          {brand.tone}
                        </p>
                      )}
                      {brand.voiceGuidelines && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {brand.voiceGuidelines}
                        </p>
                      )}
                    </div>
                    {brand.ghlLocationId && (
                      <div className="shrink-0">
                        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300">
                          GHL Connected
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platforms */}
      <Card>
        <CardHeader>
          <CardTitle>Platforms</CardTitle>
          <CardDescription>
            Target platforms and their content templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allPlatforms.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No platforms configured. Run the seed script.
            </p>
          ) : (
            <div className="space-y-3">
              {allPlatforms.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{p.name}</span>
                    <Badge variant={p.enabled ? "default" : "secondary"}>
                      {p.enabled ? "Active" : "Disabled"}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {p.templateCount} templates
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
