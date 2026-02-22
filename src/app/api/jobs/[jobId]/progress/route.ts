import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cascadeJobs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const job = await db.query.cascadeJobs.findFirst({
    where: eq(cascadeJobs.id, jobId),
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    totalDerivatives: job.totalDerivatives,
    completedDerivatives: job.completedDerivatives,
    completedImages: job.completedImages,
    totalImages: job.totalImages,
    error: job.error,
  });
}
