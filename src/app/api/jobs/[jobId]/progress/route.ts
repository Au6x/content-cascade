import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { cascadeJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        );
      };

      // Poll job status every second
      const interval = setInterval(async () => {
        try {
          const job = await db.query.cascadeJobs.findFirst({
            where: eq(cascadeJobs.id, jobId),
          });

          if (!job) {
            send({ error: "Job not found" });
            clearInterval(interval);
            controller.close();
            return;
          }

          send({
            status: job.status,
            progress: job.progress,
            totalDerivatives: job.totalDerivatives,
            completedDerivatives: job.completedDerivatives,
            completedImages: job.completedImages,
            totalImages: job.totalImages,
            error: job.error,
          });

          // Close stream when job is done
          if (job.status === "completed" || job.status === "failed") {
            clearInterval(interval);
            controller.close();
          }
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 1000);

      // Clean up on client disconnect
      request.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
