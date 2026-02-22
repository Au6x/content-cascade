import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { derivatives } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getVisualSpec } from "@/lib/gamma/specs";
import { getCascadeQueue } from "@/lib/queue/cascade";
import type { DerivativeContent } from "@/lib/db/schema";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const derivative = await db.query.derivatives.findFirst({
    where: eq(derivatives.id, id),
    with: { template: true },
  });

  if (!derivative) {
    return NextResponse.json({ error: "Derivative not found" }, { status: 404 });
  }

  const spec = getVisualSpec(derivative.template.slug);

  if (!spec.shouldGenerate) {
    return NextResponse.json({ error: "Template has no visual spec" }, { status: 400 });
  }

  // Mark as generating
  const content = derivative.content as DerivativeContent;
  await db
    .update(derivatives)
    .set({
      content: {
        ...content,
        imageGenerationStatus: "generating",
        imageGenerationError: undefined,
      },
      updatedAt: new Date(),
    })
    .where(eq(derivatives.id, id));

  // Enqueue for worker processing instead of fire-and-forget
  await getCascadeQueue().add("retry-images", { derivativeId: id });

  return NextResponse.json({ status: "generating" });
}
