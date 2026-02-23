"use server";

import { cache } from "react";
import { db } from "@/lib/db";
import { contentSources, cascadeJobs, derivatives, brandProfiles } from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// cache() deduplicates within a single request — layout + page won't double-query
export const listBrands = cache(async () => {
  return db.select({ id: brandProfiles.id, name: brandProfiles.name, slug: brandProfiles.slug })
    .from(brandProfiles)
    .orderBy(brandProfiles.name);
});

export async function createSource(data: {
  title: string;
  content: string;
  pillar: string;
  brandId?: string;
  canonicalUrl?: string;
  primaryHandle?: string;
  variationsCount?: number;
}) {
  const [source] = await db
    .insert(contentSources)
    .values({
      title: data.title,
      content: data.content,
      pillar: data.pillar as any,
      brandId: data.brandId || null,
      canonicalUrl: data.canonicalUrl || null,
      primaryHandle: data.primaryHandle || "",
      variationsCount: data.variationsCount ?? 5,
      status: "draft",
    })
    .returning();

  revalidatePath("/sources");
  return source;
}

export async function listSources(brandId?: string) {
  return db.query.contentSources.findMany({
    where: brandId ? eq(contentSources.brandId, brandId) : undefined,
    orderBy: desc(contentSources.createdAt),
    with: {
      brand: true,
      jobs: {
        orderBy: desc(cascadeJobs.createdAt),
        limit: 1,
      },
    },
  });
}

export async function getSource(id: string) {
  return db.query.contentSources.findFirst({
    where: eq(contentSources.id, id),
    with: {
      jobs: {
        orderBy: desc(cascadeJobs.createdAt),
      },
      derivatives: {
        with: {
          template: true,
          platform: true,
        },
        orderBy: desc(derivatives.createdAt),
      },
    },
  });
}

export async function updateSource(
  id: string,
  data: Partial<{
    title: string;
    content: string;
    pillar: string;
    canonicalUrl: string;
    primaryHandle: string;
    status: string;
  }>
) {
  const [updated] = await db
    .update(contentSources)
    .set({
      ...data,
      pillar: data.pillar as any,
      status: data.status as any,
      updatedAt: new Date(),
    })
    .where(eq(contentSources.id, id))
    .returning();

  revalidatePath("/sources");
  revalidatePath(`/sources/${id}`);
  return updated;
}

export async function deleteSource(id: string) {
  // First, collect derivative IDs so we can clean up storage images
  const derivs = await db
    .select({ id: derivatives.id })
    .from(derivatives)
    .where(eq(derivatives.sourceId, id));

  // Delete the source (cascade deletes jobs + derivatives in DB)
  await db.delete(contentSources).where(eq(contentSources.id, id));

  // Clean up Supabase storage images in background
  if (derivs.length > 0) {
    try {
      const { supabase, STORAGE_BUCKET } = await import("@/lib/storage");
      for (const d of derivs) {
        const { data: files } = await supabase.storage
          .from(STORAGE_BUCKET)
          .list(d.id);
        if (files && files.length > 0) {
          const paths = files.map((f) => `${d.id}/${f.name}`);
          await supabase.storage.from(STORAGE_BUCKET).remove(paths);
        }
      }
    } catch (e) {
      // Storage cleanup is best-effort; DB records are already gone
      console.warn("[deleteSource] Storage cleanup error:", e);
    }
  }

  revalidatePath("/sources");
}

export async function getDashboardStats(brandId?: string) {
  const sourceWhere = brandId ? eq(contentSources.brandId, brandId) : undefined;
  const derivWhere = brandId ? eq(derivatives.brandId, brandId) : undefined;

  const [sourceCount] = await db
    .select({ count: count() })
    .from(contentSources)
    .where(sourceWhere);
  const [derivativeCount] = await db
    .select({ count: count() })
    .from(derivatives)
    .where(derivWhere);
  const platformBreakdown = await db
    .select({
      platformId: derivatives.platformId,
      count: count(),
    })
    .from(derivatives)
    .where(derivWhere)
    .groupBy(derivatives.platformId);

  const statusBreakdown = await db
    .select({
      status: derivatives.status,
      count: count(),
    })
    .from(derivatives)
    .where(derivWhere)
    .groupBy(derivatives.status);

  return {
    totalSources: sourceCount?.count ?? 0,
    totalDerivatives: derivativeCount?.count ?? 0,
    platformBreakdown,
    statusBreakdown,
  };
}
