import "dotenv/config";
import { Worker } from "bullmq";
import { getRedisConnectionOptions } from "../lib/queue/connection";
import { processCascadeJob } from "./cascade-worker";
import type { CascadeJobData } from "../lib/queue/cascade";
import { ensureBucket } from "../lib/storage";

console.log("Starting Content Cascade worker...");

// Ensure Supabase storage bucket exists
ensureBucket().then(() => {
  console.log("[storage] Bucket ready");
}).catch((err) => {
  console.warn("[storage] Bucket init warning:", err.message);
});

const worker = new Worker<CascadeJobData>(
  "cascade",
  async (job) => {
    console.log(
      `[${new Date().toISOString()}] Processing cascade job ${job.id} for source ${job.data.sourceId}`
    );
    await processCascadeJob(job);
    console.log(
      `[${new Date().toISOString()}] Completed cascade job ${job.id}`
    );
  },
  {
    connection: getRedisConnectionOptions(),
    concurrency: 1, // Process one cascade at a time
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
