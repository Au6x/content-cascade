import { db } from "../src/lib/db";
import { derivatives, contentTemplates, platforms } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function check() {
  const rows = await db
    .select({
      id: derivatives.id,
      templateSlug: contentTemplates.slug,
      templateName: contentTemplates.name,
      platformName: platforms.name,
      content: derivatives.content,
    })
    .from(derivatives)
    .leftJoin(contentTemplates, eq(derivatives.templateId, contentTemplates.id))
    .leftJoin(platforms, eq(derivatives.platformId, platforms.id));

  // Show all visual templates (memes, carousels, thumbnails, single_image)
  const visualSlugs = [
    "drake_format", "distracted_boyfriend", "expanding_brain",
    "this_is_fine", "change_my_mind", "is_this_a", "two_buttons",
    "custom_concept", "carousel_outline", "carousel_educational",
    "carousel_storytelling", "thumbnail_concepts", "single_image",
  ];

  for (const r of rows) {
    if (!visualSlugs.includes(r.templateSlug || "")) continue;
    const c = (r.content || {}) as Record<string, unknown>;
    const imgUrls = c.imageUrls as string[] | undefined;
    const imgStatus = c.imageGenerationStatus as string | undefined;
    const imgError = c.imageGenerationError as string | undefined;

    console.log(
      `${r.templateSlug} | ${r.platformName} | status: ${imgStatus || "NONE"} | urls: ${imgUrls ? imgUrls.length : 0} | error: ${imgError || "-"}`
    );
  }
}

check().catch(console.error);
