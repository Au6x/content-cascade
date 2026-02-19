"use server";

import { db } from "@/lib/db";
import { cascadeJobs, contentSources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCascadeQueue } from "@/lib/queue/cascade";
import { revalidatePath } from "next/cache";

export async function triggerCascade(sourceId: string) {
  // Verify source exists and is in a valid state
  const source = await db.query.contentSources.findFirst({
    where: eq(contentSources.id, sourceId),
  });

  if (!source) {
    throw new Error("Source not found");
  }

  if (source.status === "processing") {
    throw new Error("Source is already being processed");
  }

  // Update source status
  await db
    .update(contentSources)
    .set({ status: "pending", updatedAt: new Date() })
    .where(eq(contentSources.id, sourceId));

  // Create cascade job
  const [job] = await db
    .insert(cascadeJobs)
    .values({
      sourceId,
      status: "queued",
    })
    .returning();

  // Enqueue to BullMQ
  const queue = getCascadeQueue();
  await queue.add(
    "cascade",
    {
      sourceId,
      jobId: job.id,
    },
    {
      jobId: job.id,
    }
  );

  revalidatePath(`/sources/${sourceId}`);
  revalidatePath("/sources");
  return job;
}

export async function getJobStatus(jobId: string) {
  return db.query.cascadeJobs.findFirst({
    where: eq(cascadeJobs.id, jobId),
  });
}
