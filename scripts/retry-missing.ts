import { db } from "../src/lib/db";
import { derivatives, contentTemplates } from "../src/lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function retry() {
  // Find all visual derivatives with no images
  const visualSlugs = [
    "drake_format", "distracted_boyfriend", "expanding_brain",
    "this_is_fine", "change_my_mind", "is_this_a", "two_buttons",
    "custom_concept", "carousel_outline", "carousel_educational",
    "carousel_storytelling", "thumbnail_concepts", "single_image",
  ];

  const rows = await db
    .select({
      id: derivatives.id,
      templateSlug: contentTemplates.slug,
      content: derivatives.content,
    })
    .from(derivatives)
    .leftJoin(contentTemplates, eq(derivatives.templateId, contentTemplates.id));

  const toRetry: string[] = [];

  for (const r of rows) {
    if (!visualSlugs.includes(r.templateSlug || "")) continue;
    const c = (r.content || {}) as Record<string, unknown>;
    const imgUrls = c.imageUrls as string[] | undefined;
    const imgStatus = c.imageGenerationStatus as string | undefined;

    if (!imgUrls || imgUrls.length === 0) {
      toRetry.push(r.id);
      console.log(`Will retry: ${r.id} (${r.templateSlug}) status=${imgStatus || "NONE"}`);
    }
  }

  console.log(`\nRetrying ${toRetry.length} derivatives...`);

  for (const id of toRetry) {
    // Set status to "pending" so the retry endpoint picks them up
    await db
      .update(derivatives)
      .set({
        content: sql`jsonb_set(
          jsonb_set(
            COALESCE(content, '{}'::jsonb),
            '{imageGenerationStatus}',
            '"pending"'
          ),
          '{imageGenerationError}',
          'null'
        )`,
      })
      .where(eq(derivatives.id, id));
    console.log(`  Reset: ${id}`);
  }

  console.log("Done. Now trigger retries via API...");

  for (const id of toRetry) {
    try {
      const res = await fetch(`http://localhost:3000/api/derivatives/${id}/retry-images`, {
        method: "POST",
      });
      console.log(`  Triggered ${id}: ${res.status}`);
    } catch (e) {
      console.log(`  Failed to trigger ${id}: ${e}`);
    }
  }

  console.log("\nAll retries triggered.");
}

retry().catch(console.error);
