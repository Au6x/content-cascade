import { db } from "../src/lib/db";
import { derivatives, contentTemplates } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function check() {
  const rows = await db
    .select({
      id: derivatives.id,
      templateSlug: contentTemplates.slug,
      templateName: contentTemplates.name,
      content: derivatives.content,
    })
    .from(derivatives)
    .leftJoin(contentTemplates, eq(derivatives.templateId, contentTemplates.id))
    .limit(20);

  for (const r of rows) {
    const c = (r.content || {}) as Record<string, unknown>;
    const slides = c.slides as Array<{ title: string; body: string }> | undefined;
    const pc = (c.primaryContent as string) || "";
    const imgUrls = c.imageUrls as string[] | undefined;
    const imgStatus = c.imageGenerationStatus as string | undefined;

    console.log("---");
    console.log("template:", r.templateSlug, "|", r.templateName);
    console.log("primaryContent length:", pc.length);
    console.log("primaryContent preview:", pc.substring(0, 150));
    console.log("slides count:", slides ? slides.length : 0);
    if (slides && slides.length > 0) {
      console.log("slide[0]:", JSON.stringify(slides[0]).substring(0, 100));
    }
    console.log("imageUrls:", imgUrls && imgUrls.length > 0 ? imgUrls : "NONE");
    console.log("imageGenStatus:", imgStatus || "NONE");
  }
}

check().catch(console.error);
