import "dotenv/config";
import { Worker } from "bullmq";
import { getRedisConnectionOptions } from "../lib/queue/connection";
import { processCascadeJob } from "./cascade-worker";
import { processRetryImages, processRetryContent } from "./retry-handlers";
import type { CascadeJobData } from "../lib/queue/cascade";
import type { Job } from "bullmq";
import { ensureBucket } from "../lib/storage";

console.log("Starting Content Cascade worker...");

// Ensure Supabase storage bucket exists
ensureBucket().then(() => {
  console.log("[storage] Bucket ready");
}).catch((err) => {
  console.warn("[storage] Bucket init warning:", err.message);
});

const worker = new Worker(
  "cascade",
  async (job) => {
    const ts = new Date().toISOString();

    if (job.name === "retry-images") {
      console.log(`[${ts}] Processing retry-images job ${job.id}`);
      await processRetryImages(job.data);
      console.log(`[${ts}] Completed retry-images job ${job.id}`);
      return;
    }

    if (job.name === "retry-content") {
      console.log(`[${ts}] Processing retry-content job ${job.id}`);
      await processRetryContent(job.data);
      console.log(`[${ts}] Completed retry-content job ${job.id}`);
      return;
    }

    // Default: cascade job
    console.log(`[${ts}] Processing cascade job ${job.id} for source ${job.data.sourceId}`);
    await processCascadeJob(job as Job<CascadeJobData>);
    console.log(`[${ts}] Completed cascade job ${job.id}`);
  },
  {
    connection: getRedisConnectionOptions(),
    concurrency: 1, // Process one job at a time
  }
);

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id} failed:`, error.message);
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});

console.log("Worker ready. Waiting for jobs...");
