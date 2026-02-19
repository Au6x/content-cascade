import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { derivatives, contentTemplates, contentSources } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getVisualSpec } from "@/lib/gamma/specs";
import { generateAndSaveVisuals } from "@/lib/gamma/render";
import type { DerivativeContent } from "@/lib/db/schema";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const derivative = await db.query.derivatives.findFirst({
    where: eq(derivatives.id, id),
    with: { template: true, source: true },
  });

  if (!derivative) {
    return NextResponse.json({ error: "Derivative not found" }, { status: 404 });
  }

  const content = derivative.content as DerivativeContent;
  const spec = getVisualSpec(derivative.template.slug);

  if (!spec.shouldGenerate) {
    return NextResponse.json({ error: "Template has no visual spec" }, { status: 400 });
  }

  // Mark as generating
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

  // Generate in background (don't block the response)
  generateInBackground(id, derivative, content, spec);

  return NextResponse.json({ status: "generating" });
}

async function generateInBackground(
  id: string,
  derivative: { template: { slug: string }; source: { title: string; pillar: string } },
  content: DerivativeContent,
  spec: { shouldGenerate: true; buildRequest: (content: DerivativeContent, context: { title: string; pillar: string }) => unknown }
) {
  try {
    const request = spec.buildRequest(content, {
      title: derivative.source.title,
      pillar: derivative.source.pillar,
    });

    if (!request) {
      await db
        .update(derivatives)
        .set({
          content: {
            ...content,
            imageGenerationStatus: "failed",
            imageGenerationError: "Builder returned null — no content to render",
          },
          updatedAt: new Date(),
        })
        .where(eq(derivatives.id, id));
      return;
    }

    const imageUrls = await generateAndSaveVisuals(
      request as Parameters<typeof generateAndSaveVisuals>[0],
      id
    );

    await db
      .update(derivatives)
      .set({
        content: {
          ...content,
          imageUrls,
          imageGenerationStatus: "completed",
          imageGenerationError: undefined,
        },
        updatedAt: new Date(),
      })
      .where(eq(derivatives.id, id));

    console.log(`[retry] Image generation completed for ${id}: ${imageUrls.length} images`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db
      .update(derivatives)
      .set({
        content: {
          ...content,
          imageGenerationStatus: "failed",
          imageGenerationError: message,
        },
        updatedAt: new Date(),
      })
      .where(eq(derivatives.id, id));
    console.error(`[retry] Image generation failed for ${id}:`, message);
  }
}
