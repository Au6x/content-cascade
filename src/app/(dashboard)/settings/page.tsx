import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { db } from "@/lib/db";
import { brandProfiles, platforms, contentTemplates } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";

export default async function SettingsPage() {
  let activeBrand = null;
  let allPlatforms: Array<{
    id: string;
    name: string;
    slug: string;
    enabled: boolean;
    templateCount?: number;
  }> = [];

  try {
    activeBrand = await db.query.brandProfiles.findFirst({
      where: eq(brandProfiles.isActive, true),
    });

    const platformsWithCounts = await db
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
      .orderBy(platforms.sortOrder);

    allPlatforms = platformsWithCounts;
  } catch {
    // DB not connected
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure brand voice, platforms, and content templates
        </p>
      </div>

      {/* Brand Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Brand Profile</CardTitle>
          <CardDescription>
            Brand voice guidelines used for all content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeBrand ? (
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium">Name:</span>{" "}
                <span className="text-sm">{activeBrand.name}</span>
              </div>
              {activeBrand.tone && (
                <div>
                  <span className="text-sm font-medium">Tone:</span>{" "}
                  <span className="text-sm">{activeBrand.tone}</span>
                </div>
              )}
              {activeBrand.voiceGuidelines && (
                <div>
                  <span className="text-sm font-medium">Guidelines:</span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {activeBrand.voiceGuidelines.slice(0, 500)}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No brand profile configured. Run the seed script to create a
              default profile.
            </p>
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
