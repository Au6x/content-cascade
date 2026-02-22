import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { derivatives, brandProfiles } from "../lib/db/schema";
import type { DerivativeContent, ContentExtraction } from "../lib/db/schema";
import { getVisualSpec } from "../lib/gamma/specs";
import { generateAndSaveVisuals } from "../lib/gamma/render";
import { generateDerivative } from "../lib/ai/generate";
import type { RetryImagesJobData, RetryContentJobData } from "../lib/queue/cascade";

export async function processRetryImages(data: RetryImagesJobData) {
  const { derivativeId } = data;

  const derivative = await db.query.derivatives.findFirst({
    where: eq(derivatives.id, derivativeId),
    with: { template: true, source: true },
  });

  if (!derivative) {
    console.error(`[retry-images] Derivative ${derivativeId} not found`);
    return;
  }

  const content = derivative.content as DerivativeContent;
  const spec = getVisualSpec(derivative.template.slug);

  if (!spec.shouldGenerate) {
    console.warn(`[retry-images] Template ${derivative.template.slug} has no visual spec`);
    return;
  }

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
        .where(eq(derivatives.id, derivativeId));
      return;
    }

    const imageUrls = await generateAndSaveVisuals(
      request as Parameters<typeof generateAndSaveVisuals>[0],
      derivativeId
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
      .where(eq(derivatives.id, derivativeId));

    console.log(`[retry-images] Completed for ${derivativeId}: ${imageUrls.length} images`);
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
      .where(eq(derivatives.id, derivativeId));
    console.error(`[retry-images] Failed for ${derivativeId}:`, message);
  }
}

export async function processRetryContent(data: RetryContentJobData) {
  const { derivativeId } = data;

  const derivative = await db.query.derivatives.findFirst({
    where: eq(derivatives.id, derivativeId),
    with: { template: true, source: true, platform: true },
  });

  if (!derivative) {
    console.error(`[retry-content] Derivative ${derivativeId} not found`);
    return;
  }

  const extraction = derivative.source.extraction as ContentExtraction | null;
  if (!extraction) {
    console.error(`[retry-content] Source has no extraction for ${derivativeId}`);
    return;
  }

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
      .where(eq(derivatives.id, derivativeId));

    console.log(`[retry-content] Completed for ${derivativeId}`);
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
      .where(eq(derivatives.id, derivativeId));
    console.error(`[retry-content] Failed for ${derivativeId}:`, message);
  }
}
