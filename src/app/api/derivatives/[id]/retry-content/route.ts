import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { derivatives, brandProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateDerivative } from "@/lib/ai/generate";
import type { DerivativeContent, ContentExtraction } from "@/lib/db/schema";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const derivative = await db.query.derivatives.findFirst({
    where: eq(derivatives.id, id),
    with: { template: true, source: true, platform: true },
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

  // Regenerate in background
  regenerateInBackground(id, derivative, extraction);

  return NextResponse.json({ status: "regenerating" });
}

async function regenerateInBackground(
  id: string,
  derivative: {
    variationIndex: number;
    template: {
      name: string;
      slug: string;
      promptTemplate: string;
      description: string;
    };
    source: {
      title: string;
      pillar: string;
      primaryHandle: string | null;
      canonicalUrl: string | null;
      variationsCount: number;
    };
    platform: { name: string };
  },
  extraction: ContentExtraction
) {
  try {
    const brandProfile = await db.query.brandProfiles.findFirst({
      where: eq(brandProfiles.isActive, true),
    });

    const brandVoice = {
      voiceGuidelines: brandProfile?.voiceGuidelines ?? "",
      tone: brandProfile?.tone ?? "",
      vocabulary: brandProfile?.vocabulary ?? { preferred: [], avoided: [] },
    };

    const newContent = await generateDerivative({
      template: {
        name: derivative.template.name,
        slug: derivative.template.slug,
        promptTemplate: derivative.template.promptTemplate,
        description: derivative.template.description,
      },
      platformName: derivative.platform.name,
      extraction,
      source: {
        title: derivative.source.title,
        pillar: derivative.source.pillar,
        primaryHandle: derivative.source.primaryHandle || "",
        canonicalUrl: derivative.source.canonicalUrl || "",
      },
      brandVoice,
      variationIndex: derivative.variationIndex,
      totalVariations: derivative.source.variationsCount ?? 5,
    });

    await db
      .update(derivatives)
      .set({
        content: newContent,
        status: "draft",
        updatedAt: new Date(),
      })
      .where(eq(derivatives.id, id));

    console.log(`[retry-content] Regeneration completed for ${id}`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await db
      .update(derivatives)
      .set({
        content: {
          primaryContent: `[Generation failed: ${message}]`,
          error: String(err),
        },
        updatedAt: new Date(),
      })
      .where(eq(derivatives.id, id));
    console.error(`[retry-content] Regeneration failed for ${id}:`, message);
  }
}
