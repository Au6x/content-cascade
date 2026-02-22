import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { derivatives } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCascadeQueue } from "@/lib/queue/cascade";
import type { DerivativeContent, ContentExtraction } from "@/lib/db/schema";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const derivative = await db.query.derivatives.findFirst({
    where: eq(derivatives.id, id),
    with: { source: true },
  });

  if (!derivative) {
    return NextResponse.json(
      { error: "Derivative not found" },
      { status: 404 }
    );
  }

  const extraction = derivative.source.extraction as ContentExtraction | null;
  if (!extraction) {
    return NextResponse.json(
      { error: "Source has no extraction data — run a cascade first" },
      { status: 400 }
    );
  }

  // Mark as regenerating
  const currentContent = derivative.content as DerivativeContent;
  await db
    .update(derivatives)
    .set({
      content: {
        ...currentContent,
        primaryContent: "[Regenerating content...]",
        error: undefined,
      },
      updatedAt: new Date(),
    })
    .where(eq(derivatives.id, id));

  // Enqueue for worker processing instead of fire-and-forget
  await getCascadeQueue().add("retry-content", { derivativeId: id });

  return NextResponse.json({ status: "regenerating" });
}
