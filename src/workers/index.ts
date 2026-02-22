import "dotenv/config";
import { getBoss } from "../lib/queue/boss";
import {
  QUEUE_CASCADE,
  QUEUE_RETRY_IMAGES,
  QUEUE_RETRY_CONTENT,
} from "../lib/queue/cascade";
import { processCascadeJob } from "./cascade-worker";
import { processRetryImages, processRetryContent } from "./retry-handlers";
import type {
  CascadeJobData,
  RetryImagesJobData,
  RetryContentJobData,
} from "../lib/queue/cascade";
import { ensureBucket } from "../lib/storage";

console.log("Starting Content Cascade worker...");

// Ensure Supabase storage bucket exists
ensureBucket()
  .then(() => console.log("[storage] Bucket ready"))
  .catch((err: Error) => console.warn("[storage] Bucket init warning:", err.message));

async function main() {
  const boss = await getBoss();

  await boss.work<CascadeJobData>(
    QUEUE_CASCADE,
    { localConcurrency: 1 },
    async ([job]) => {
      const ts = new Date().toISOString();
      console.log(
        `[${ts}] Processing cascade job ${job.id} for source ${job.data.sourceId}`
      );
      await processCascadeJob(job.data);
      console.log(`[${ts}] Completed cascade job ${job.id}`);
    }
  );

  await boss.work<RetryImagesJobData>(
    QUEUE_RETRY_IMAGES,
    { localConcurrency: 2 },
    async ([job]) => {
      const ts = new Date().toISOString();
      console.log(`[${ts}] Processing retry-images job ${job.id}`);
      await processRetryImages(job.data);
      console.log(`[${ts}] Completed retry-images job ${job.id}`);
    }
  );

  await boss.work<RetryContentJobData>(
    QUEUE_RETRY_CONTENT,
    { localConcurrency: 2 },
    async ([job]) => {
      const ts = new Date().toISOString();
      console.log(`[${ts}] Processing retry-content job ${job.id}`);
      await processRetryContent(job.data);
      console.log(`[${ts}] Completed retry-content job ${job.id}`);
    }
  );

  console.log("Worker ready. Waiting for jobs...");
}

main().catch((err) => {
  console.error("Worker startup failed:", err);
  process.exit(1);
});

async function shutdown() {
  console.log("Shutting down worker...");
  const boss = await getBoss();
  await boss.stop({ graceful: true, timeout: 30000 });
  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
