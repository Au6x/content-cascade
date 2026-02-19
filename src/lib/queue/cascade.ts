import { Queue } from "bullmq";
import { getRedisConnectionOptions } from "./connection";

export type CascadeJobData = {
  sourceId: string;
  jobId: string;
};

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

let cascadeQueue: Queue | null = null;

export function getCascadeQueue(): Queue {
  if (!cascadeQueue) {
    cascadeQueue = new Queue("cascade", {
      connection: getRedisConnectionOptions(),
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 50 },
      },
    });
  }
  return cascadeQueue;
}
