"use server";

import { db } from "@/lib/db";
import { contentSources, cascadeJobs, derivatives } from "@/lib/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createSource(data: {
  title: string;
  content: string;
  pillar: string;
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
      canonicalUrl: data.canonicalUrl || null,
      primaryHandle: data.primaryHandle || "",
      variationsCount: data.variationsCount ?? 5,
      status: "draft",
    })
    .returning();

  revalidatePath("/sources");
  return source;
}

export async function listSources() {
  return db.query.contentSources.findMany({
    orderBy: desc(contentSources.createdAt),
    with: {
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
  await db.delete(contentSources).where(eq(contentSources.id, id));
  revalidatePath("/sources");
}

export async function getDashboardStats() {
  const [sourceCount] = await db
    .select({ count: count() })
    .from(contentSources);
  const [derivativeCount] = await db
    .select({ count: count() })
    .from(derivatives);
  const platformBreakdown = await db
    .select({
      platformId: derivatives.platformId,
      count: count(),
    })
    .from(derivatives)
    .groupBy(derivatives.platformId);

  const statusBreakdown = await db
    .select({
      status: derivatives.status,
      count: count(),
    })
    .from(derivatives)
    .groupBy(derivatives.status);

  return {
    totalSources: sourceCount?.count ?? 0,
    totalDerivatives: derivativeCount?.count ?? 0,
    platformBreakdown,
    statusBreakdown,
  };
}
