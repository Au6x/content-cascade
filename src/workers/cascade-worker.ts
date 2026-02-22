import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import {
  contentSources,
  cascadeJobs,
  derivatives,
  platforms,
  contentTemplates,
  brandProfiles,
} from "../lib/db/schema";
import type { DerivativeContent } from "../lib/db/schema";
import { extractContent } from "../lib/ai/extract";
import { generateDerivative } from "../lib/ai/generate";
import { getVisualSpec } from "../lib/gamma/specs";
import { generateAndSaveVisuals } from "../lib/gamma/render";
import type { GammaVisualSpec } from "../lib/gamma/types";
import type { CascadeJobData, CascadeJobProgress } from "../lib/queue/cascade";

const CONCURRENCY_LIMIT = 5; // Max parallel Gemini text AI calls
const IMAGE_CONCURRENCY = parseInt(process.env.IMAGE_CONCURRENCY ?? "3", 10);

// ─── Async Bounded-Concurrency Pool ──────────────────────
//
// Fire-and-forget enqueue pattern with drain() to wait for
// all tasks. Used to run Gamma image generation in parallel
// with Gemini text generation.

class ImagePool {
  private running = 0;
  private readonly waiters: Array<() => void> = [];
  private readonly active = new Set<Promise<void>>();

  constructor(private readonly concurrency: number) {}

  enqueue(fn: () => Promise<void>): void {
    const task = this.execute(fn);
    this.active.add(task);
    task.finally(() => this.active.delete(task));
  }

  private async execute(fn: () => Promise<void>): Promise<void> {
    if (this.running >= this.concurrency) {
      await new Promise<void>((resolve) => this.waiters.push(resolve));
    }
    this.running++;
    try {
      await fn();
    } catch {
      // Errors must be handled inside fn
    } finally {
      this.running--;
      const next = this.waiters.shift();
      if (next) next();
    }
  }

  async drain(): Promise<void> {
    while (this.active.size > 0) {
      await Promise.allSettled([...this.active]);
    }
  }
}

// ─── Main Pipeline ───────────────────────────────────────

export async function processCascadeJob(
  data: CascadeJobData
): Promise<void> {
  const { sourceId, jobId } = data;

  try {
    // 1. Load source and mark job as extracting
    const source = await db.query.contentSources.findFirst({
      where: eq(contentSources.id, sourceId),
    });

    if (!source) throw new Error(`Source ${sourceId} not found`);

    await db
      .update(cascadeJobs)
      .set({
        status: "extracting",
        startedAt: new Date(),
      })
      .where(eq(cascadeJobs.id, jobId));

    await db
      .update(contentSources)
      .set({ status: "processing" })
      .where(eq(contentSources.id, sourceId));

    // Delete any existing derivatives for this source (allows clean re-runs)
    const existingDerivatives = await db.query.derivatives.findMany({
      where: eq(derivatives.sourceId, sourceId),
      columns: { id: true },
    });
    if (existingDerivatives.length > 0) {
      console.log(
        `[cascade] Cleaning up ${existingDerivatives.length} existing derivatives for source ${sourceId}`
      );
      await db
        .delete(derivatives)
        .where(eq(derivatives.sourceId, sourceId));
    }

    // 2. Extract content from article
    const extraction = await extractContent({
      title: source.title,
      content: source.content,
      pillar: source.pillar,
    });

    // Save extraction to source
    await db
      .update(contentSources)
      .set({ extraction })
      .where(eq(contentSources.id, sourceId));

    // 3. Load enabled platforms + templates
    const enabledPlatforms = await db.query.platforms.findMany({
      where: eq(platforms.enabled, true),
      with: {
        templates: {
          where: eq(contentTemplates.enabled, true),
        },
      },
      orderBy: platforms.sortOrder,
    });

    // Build generation tasks — N variations per template
    const variationsCount = source.variationsCount ?? 5;
    console.log(
      `[cascade] Source "${source.title}" — variationsCount from DB: ${source.variationsCount}, using: ${variationsCount}`
    );

    const tasks: {
      platformId: string;
      platformName: string;
      template: typeof enabledPlatforms[0]["templates"][0];
      variationIndex: number;
    }[] = [];

    for (const platform of enabledPlatforms) {
      for (const template of platform.templates) {
        for (let v = 0; v < variationsCount; v++) {
          tasks.push({
            platformId: platform.id,
            platformName: platform.name,
            template,
            variationIndex: v,
          });
        }
      }
    }

    const totalDerivatives = tasks.length;
    console.log(
      `[cascade] Generating ${totalDerivatives} derivatives (${enabledPlatforms.length} platforms × ${enabledPlatforms.reduce((s, p) => s + p.templates.length, 0)} templates × ${variationsCount} variations)`
    );

    await db
      .update(cascadeJobs)
      .set({
        status: "generating",
        totalDerivatives,
      })
      .where(eq(cascadeJobs.id, jobId));

    // 4. Load brand voice (use source's brand if set, otherwise first active brand)
    const brandProfile = source.brandId
      ? await db.query.brandProfiles.findFirst({
          where: eq(brandProfiles.id, source.brandId),
        })
      : await db.query.brandProfiles.findFirst({
          where: eq(brandProfiles.isActive, true),
        });

    const brandVoice = {
      voiceGuidelines: brandProfile?.voiceGuidelines ?? "",
      tone: brandProfile?.tone ?? "",
      vocabulary: brandProfile?.vocabulary ?? { preferred: [], avoided: [] },
    };

    // 5. Generate text + images in PARALLEL
    //
    // As each text derivative is generated, its image generation is
    // immediately enqueued into the ImagePool. Gamma runs concurrently
    // with remaining Gemini text generation.

    const imagePool = new ImagePool(IMAGE_CONCURRENCY);
    let completedTextCount = 0;
    let completedImageCount = 0;
    let totalImageTasks = 0;

    console.log(
      `[cascade] Pipeline: text concurrency=${CONCURRENCY_LIMIT}, image concurrency=${IMAGE_CONCURRENCY} (parallel)`
    );

    for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
      const batch = tasks.slice(i, i + CONCURRENCY_LIMIT);

      const results = await Promise.allSettled(
        batch.map((task) =>
          generateDerivative({
            template: {
              name: task.template.name,
              slug: task.template.slug,
              promptTemplate: task.template.promptTemplate,
              description: task.template.description,
            },
            platformName: task.platformName,
            extraction,
            source: {
              title: source.title,
              pillar: source.pillar,
              primaryHandle: source.primaryHandle || "",
              canonicalUrl: source.canonicalUrl || "",
            },
            brandVoice,
            variationIndex: task.variationIndex,
            totalVariations: variationsCount,
          })
        )
      );

      // Save results to DB and enqueue image generation
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const task = batch[j];

        if (result.status === "fulfilled") {
          // Insert and capture the new derivative ID
          const [inserted] = await db
            .insert(derivatives)
            .values({
              sourceId,
              jobId,
              brandId: source.brandId ?? null,
              templateId: task.template.id,
              platformId: task.platformId,
              variationIndex: task.variationIndex,
              content: result.value,
              status: "draft",
            })
            .returning({ id: derivatives.id });

          // Check if this derivative needs image generation
          const spec = getVisualSpec(task.template.slug);
          if (spec.shouldGenerate) {
            totalImageTasks++;
            const derivativeId = inserted.id;
            const content = result.value;
            const gammaSpec = spec as GammaVisualSpec;

            // Fire-and-forget into the image pool
            imagePool.enqueue(async () => {
              try {
                const request = gammaSpec.buildRequest(content, {
                  title: source.title,
                  pillar: source.pillar,
                  variationIndex: task.variationIndex,
                });

                if (!request) {
                  return;
                }

                const allImageUrls = await generateAndSaveVisuals(
                  request,
                  derivativeId
                );

                const updatedContent: DerivativeContent = {
                  ...content,
                  imageUrls: allImageUrls,
                  imageGenerationStatus: "completed",
                };

                await db
                  .update(derivatives)
                  .set({ content: updatedContent, updatedAt: new Date() })
                  .where(eq(derivatives.id, derivativeId));
              } catch (err) {
                const errMsg =
                  err instanceof Error ? err.message : "Image generation failed";
                console.error(
                  `Visual rendering failed for derivative ${derivativeId}:`,
                  errMsg
                );
                await db
                  .update(derivatives)
                  .set({
                    content: {
                      ...content,
                      imageGenerationStatus: "failed",
                      imageGenerationError: errMsg,
                    },
                    updatedAt: new Date(),
                  })
                  .where(eq(derivatives.id, derivativeId));
              } finally {
                completedImageCount++;
                await updateCombinedProgress(jobId, {
                  completedText: completedTextCount,
                  totalDerivatives,
                  completedImages: completedImageCount,
                  totalImages: totalImageTasks,
                });
              }
            });
          }
        } else {
          // Save error derivative so user can see what failed
          await db.insert(derivatives).values({
            sourceId,
            jobId,
            brandId: source.brandId ?? null,
            templateId: task.template.id,
            platformId: task.platformId,
            variationIndex: task.variationIndex,
            content: {
              primaryContent: `[Generation failed: ${result.reason?.message || "Unknown error"}]`,
              error: String(result.reason),
            },
            status: "draft",
          });
        }

        completedTextCount++;
      }

      // Update progress after each text batch
      await updateCombinedProgress(jobId, {
        completedText: completedTextCount,
        totalDerivatives,
        completedImages: completedImageCount,
        totalImages: totalImageTasks,
      });
    }

    // All text generation complete. Wait for remaining image tasks.
    console.log(
      `[${new Date().toISOString()}] Text generation complete (${completedTextCount}/${totalDerivatives}). Waiting for ${totalImageTasks - completedImageCount} remaining image tasks...`
    );

    await db
      .update(cascadeJobs)
      .set({ status: "imaging" })
      .where(eq(cascadeJobs.id, jobId));

    await imagePool.drain();

    console.log(
      `[${new Date().toISOString()}] Image generation complete: ${completedImageCount}/${totalImageTasks}`
    );

    // 6. Mark complete
    await db
      .update(cascadeJobs)
      .set({
        status: "completed",
        progress: 100,
        completedDerivatives: completedTextCount,
        completedImages: completedImageCount,
        totalImages: totalImageTasks,
        completedAt: new Date(),
      })
      .where(eq(cascadeJobs.id, jobId));

    await db
      .update(contentSources)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(contentSources.id, sourceId));

  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await db
      .update(cascadeJobs)
      .set({
        status: "failed",
        error: errorMessage,
        completedAt: new Date(),
      })
      .where(eq(cascadeJobs.id, jobId));

    await db
      .update(contentSources)
      .set({ status: "error", updatedAt: new Date() })
      .where(eq(contentSources.id, sourceId));

    throw error;
  }
}

// ─── Progress Helpers ────────────────────────────────────

async function updateCombinedProgress(
  jobId: string,
  state: {
    completedText: number;
    totalDerivatives: number;
    completedImages: number;
    totalImages: number;
  }
): Promise<void> {
  const { completedText, totalDerivatives, completedImages, totalImages } =
    state;

  // Text progress: 15% to 55% of the bar
  const textFraction =
    totalDerivatives > 0 ? completedText / totalDerivatives : 1;
  const textProgress = 15 + textFraction * 40; // 15-55

  // Image progress: 55% to 98% of the bar (only contributes when images complete)
  const imageFraction = totalImages > 0 ? completedImages / totalImages : 0;
  const imageProgress = imageFraction * 43; // 0-43 contribution

  // Combined: text progress + image progress
  const progress = Math.min(98, Math.round(textProgress + imageProgress));

  // Determine stage label
  const allTextDone = completedText >= totalDerivatives;
  const stage: CascadeJobProgress["stage"] =
    allTextDone && totalImages > 0 && completedImages < totalImages
      ? "generating_images"
      : "generating";

  await db
    .update(cascadeJobs)
    .set({
      completedDerivatives: completedText,
      completedImages,
      totalImages,
      progress,
    })
    .where(eq(cascadeJobs.id, jobId));
}
