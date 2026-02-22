import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

// ─── Types (unchanged) ─────────────────────────────────

export type CascadeJobData = {
  sourceId: string;
  jobId: string;
};

export type RetryImagesJobData = { derivativeId: string };
export type RetryContentJobData = { derivativeId: string };

export type CascadeJobProgress = {
  stage: "extracting" | "generating" | "generating_images" | "completed" | "failed";
  progress: number;
  completedDerivatives: number;
  totalDerivatives: number;
  currentPlatform?: string;
  completedImages?: number;
  totalImages?: number;
  error?: string;
};

// ─── Queue Names ───────────────────────────────────────

export const QUEUE_CASCADE = "cascade";
export const QUEUE_RETRY_IMAGES = "retry-images";
export const QUEUE_RETRY_CONTENT = "retry-content";

// ─── Default Job Options ───────────────────────────────

export type SendJobOptions = {
  retryLimit?: number;
  retryDelay?: number;
  retryBackoff?: boolean;
  expireInSeconds?: number;
};

export const CASCADE_JOB_OPTIONS: SendJobOptions = {
  retryLimit: 2,
  retryDelay: 5,
  retryBackoff: true,
  expireInSeconds: 3600,
};

// ─── Lightweight Job Sender (no pg-boss start needed) ──
// Inserts directly into the pgboss.job table via raw SQL.
// This avoids the ~3s boss.start() overhead on Vercel serverless.

export async function sendJob(
  queueName: string,
  data: object,
  options?: SendJobOptions,
): Promise<string | null> {
  const retryLimit = options?.retryLimit ?? 2;
  const retryDelay = options?.retryDelay ?? 0;
  const retryBackoff = options?.retryBackoff ?? false;
  const expireInSeconds = options?.expireInSeconds ?? 900;

  const result = await db.execute<{ id: string }>(sql`
    INSERT INTO pgboss.job (
      name, data,
      retry_limit, retry_delay, retry_backoff,
      expire_seconds
    ) VALUES (
      ${queueName},
      ${JSON.stringify(data)}::jsonb,
      ${retryLimit},
      ${retryDelay},
      ${retryBackoff},
      ${expireInSeconds}
    )
    RETURNING id
  `);

  return (result[0] as { id: string } | undefined)?.id ?? null;
}
