import { PgBoss } from "pg-boss";
import type { SendOptions } from "pg-boss";

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

export const CASCADE_JOB_OPTIONS: SendOptions = {
  retryLimit: 2,
  retryDelay: 5,
  retryBackoff: true,
  expireInSeconds: 3600,
};

// ─── pg-boss Singleton ─────────────────────────────────

let boss: PgBoss | null = null;
let startPromise: Promise<PgBoss> | null = null;

export async function getBoss(): Promise<PgBoss> {
  if (boss) return boss;

  // Prevent multiple concurrent start() calls
  if (!startPromise) {
    startPromise = (async () => {
      const instance = new PgBoss({
        connectionString: process.env.DATABASE_URL!,
      });
      instance.on("error", (err: Error) => console.error("[pg-boss] Error:", err));
      await instance.start();
      boss = instance;
      return instance;
    })();
  }

  return startPromise;
}
