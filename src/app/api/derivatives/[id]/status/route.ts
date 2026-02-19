import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { derivatives } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import type { DerivativeContent } from "@/lib/db/schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const derivative = await db.query.derivatives.findFirst({
    where: eq(derivatives.id, id),
    columns: { content: true, status: true },
  });

  if (!derivative) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const content = derivative.content as DerivativeContent;

  return NextResponse.json({
    imageGenerationStatus: content.imageGenerationStatus || null,
    hasImages: (content.imageUrls?.length || 0) > 0,
    contentError:
      content.primaryContent?.startsWith("[Generation failed") ||
      content.primaryContent?.startsWith("[Regenerating") ||
      false,
    regenerating: content.primaryContent?.startsWith("[Regenerating") || false,
  });
}
