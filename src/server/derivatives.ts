"use server";

import { db } from "@/lib/db";
import { derivatives } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { DerivativeContent } from "@/lib/db/schema";

export async function listDerivatives(filters?: {
  sourceId?: string;
  platformId?: string;
  status?: string;
  brandId?: string;
}) {
  return db.query.derivatives.findMany({
    where: and(
      ...[
        filters?.sourceId
          ? eq(derivatives.sourceId, filters.sourceId)
          : undefined,
        filters?.platformId
          ? eq(derivatives.platformId, filters.platformId)
          : undefined,
        filters?.status
          ? eq(derivatives.status, filters.status as any)
          : undefined,
        filters?.brandId
          ? eq(derivatives.brandId, filters.brandId)
          : undefined,
      ].filter(Boolean)
    ),
    with: {
      template: true,
      platform: true,
      source: true,
    },
    orderBy: desc(derivatives.createdAt),
  });
}

export async function updateDerivativeContent(
  id: string,
  content: DerivativeContent
) {
  const [updated] = await db
    .update(derivatives)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(derivatives.id, id))
    .returning();

  revalidatePath("/derivatives");
  return updated;
}

export async function approveDerivative(id: string) {
  const [updated] = await db
    .update(derivatives)
    .set({
      status: "approved",
      updatedAt: new Date(),
    })
    .where(eq(derivatives.id, id))
    .returning();

  revalidatePath("/derivatives");
  return updated;
}

export async function bulkApproveDerivatives(ids: string[]) {
  for (const id of ids) {
    await db
      .update(derivatives)
      .set({
        status: "approved",
        updatedAt: new Date(),
      })
      .where(eq(derivatives.id, id));
  }

  revalidatePath("/derivatives");
}

export async function archiveDerivative(id: string) {
  const [updated] = await db
    .update(derivatives)
    .set({
      status: "archived",
      updatedAt: new Date(),
    })
    .where(eq(derivatives.id, id))
    .returning();

  revalidatePath("/derivatives");
  return updated;
}
