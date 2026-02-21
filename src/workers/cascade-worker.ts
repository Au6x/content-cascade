import { eq, and } from "drizzle-orm";
import { db } from "../lib/db";
import {
  contentSources,
  cascadeJobs,
  derivatives,
  platforms,
  contentTemplates,
  brandProfiles,
} from "../lib/db/schema";
import type { ContentExtraction, DerivativeContent } from "../lib/db/schema";
import { extractContent } from "../lib/ai/extract";
import { generateDerivative } from "../lib/ai/generate";
import { getVisualSpec } from "../lib/gamma/specs";
import { generateAndSaveVisuals } from "../lib/gamma/render";
import type { GammaVisualSpec } from "../lib/gamma/types";
import type { CascadeJobData, CascadeJobProgress } from "../lib/queue/cascade";
import type { Job } from "bullmq";

const CONCURRENCY_LIMIT = 5; // Max parallel text AI calls
const IMAGE_CONCURRENCY = 2; // Max parallel image generation calls

export async function processCascadeJob(
  job: Job<CascadeJobData>
): Promise<void> {
  const { sourceId, jobId } = job.data;

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

    await reportProgress(job, {
      stage: "extracting",
      progress: 5,
      completedDerivatives: 0,
      totalDerivatives: 0,
    });

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

    await reportProgress(job, {
      stage: "generating",
      progress: 15,
      completedDerivatives: 0,
      totalDerivatives: 0,
    });

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

    // 5. Generate derivatives in parallel batches
    let completedCount = 0;

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

      // Save results to DB
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const task = batch[j];

        if (result.status === "fulfilled") {
          await db.insert(derivatives).values({
            sourceId,
            jobId,
            brandId: source.brandId ?? null,
            templateId: task.template.id,
            platformId: task.platformId,
            variationIndex: task.variationIndex,
            content: result.value,
            status: "draft",
          });
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

        completedCount++;
      }

      const progress = Math.round(15 + (completedCount / totalDerivatives) * 80);

      await db
        .update(cascadeJobs)
        .set({ completedDerivatives: completedCount })
        .where(eq(cascadeJobs.id, jobId));

      await reportProgress(job, {
        stage: "generating",
        progress,
        completedDerivatives: completedCount,
        totalDerivatives,
        currentPlatform: batch[0]?.platformName,
      });
    }

    // 6. Render visuals for eligible derivatives (Gamma)
    await db
      .update(cascadeJobs)
      .set({ status: "imaging" })
      .where(eq(cascadeJobs.id, jobId));

    const createdDerivatives = await db.query.derivatives.findMany({
      where: eq(derivatives.jobId, jobId),
      with: { template: true },
    });

    const imageableDerivsWithSpecs = createdDerivatives
      .map((d) => {
        const spec = getVisualSpec(d.template.slug);
        if (!spec.shouldGenerate) return null;
        return { derivative: d, spec: spec as GammaVisualSpec };
      })
      .filter(Boolean) as Array<{
        derivative: (typeof createdDerivatives)[0];
        spec: GammaVisualSpec;
      }>;

    const totalImageTasks = imageableDerivsWithSpecs.length;
    let completedImageTasks = 0;

    if (totalImageTasks > 0) {
      console.log(
        `[${new Date().toISOString()}] Generating visuals for ${totalImageTasks} derivatives via Gamma...`
      );

      await reportProgress(job, {
        stage: "generating_images",
        progress: 90,
        completedDerivatives: completedCount,
        totalDerivatives,
        completedImages: 0,
        totalImages: totalImageTasks,
      });

      for (
        let i = 0;
        i < imageableDerivsWithSpecs.length;
        i += IMAGE_CONCURRENCY
      ) {
        const batch = imageableDerivsWithSpecs.slice(
          i,
          i + IMAGE_CONCURRENCY
        );

        const results = await Promise.allSettled(
          batch.map(async ({ derivative, spec }) => {
            const content = derivative.content as DerivativeContent;
            const request = spec.buildRequest(content, {
              title: source.title,
              pillar: source.pillar,
              variationIndex: derivative.variationIndex,
            });

            if (!request) return [];

            const allImageUrls = await generateAndSaveVisuals(
              request,
              derivative.id
            );

            const updatedContent: DerivativeContent = {
              ...content,
              imageUrls: allImageUrls,
              imageGenerationStatus: "completed",
            };

            await db
              .update(derivatives)
              .set({
                content: updatedContent,
                updatedAt: new Date(),
              })
              .where(eq(derivatives.id, derivative.id));

            return allImageUrls;
          })
        );

        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.status === "rejected") {
            const { derivative } = batch[j];
            const content = derivative.content as DerivativeContent;
            await db
              .update(derivatives)
              .set({
                content: {
                  ...content,
                  imageGenerationStatus: "failed",
                  imageGenerationError:
                    result.reason?.message || "Image generation failed",
                },
                updatedAt: new Date(),
              })
              .where(eq(derivatives.id, derivative.id));
            console.error(
              `Visual rendering failed for derivative ${derivative.id}:`,
              result.reason?.message
            );
          }
          completedImageTasks++;
        }

        const imageProgress = Math.round(
          90 + (completedImageTasks / Math.max(totalImageTasks, 1)) * 8
        );

        await reportProgress(job, {
          stage: "generating_images",
          progress: imageProgress,
          completedDerivatives: completedCount,
          totalDerivatives,
          completedImages: completedImageTasks,
          totalImages: totalImageTasks,
        });
      }

      console.log(
        `[${new Date().toISOString()}] Image generation complete: ${completedImageTasks}/${totalImageTasks}`
      );
    }

    // 7. Mark complete
    await db
      .update(cascadeJobs)
      .set({
        status: "completed",
        progress: 100,
        completedDerivatives: completedCount,
        completedAt: new Date(),
      })
      .where(eq(cascadeJobs.id, jobId));

    await db
      .update(contentSources)
      .set({ status: "completed", updatedAt: new Date() })
      .where(eq(contentSources.id, sourceId));

    await reportProgress(job, {
      stage: "completed",
      progress: 100,
      completedDerivatives: completedCount,
      totalDerivatives,
    });
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

    await reportProgress(job, {
      stage: "failed",
      progress: 0,
      completedDerivatives: 0,
      totalDerivatives: 0,
      error: errorMessage,
    });

    throw error;
  }
}

async function reportProgress(
  job: Job<CascadeJobData>,
  progress: CascadeJobProgress
): Promise<void> {
  await job.updateProgress(progress);
}
