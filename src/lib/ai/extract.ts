import { generateJSON } from "./client";
import { EXTRACTION_SYSTEM_PROMPT, buildExtractionPrompt } from "./prompts";
import type { ContentExtraction } from "@/lib/db/schema";

export async function extractContent(article: {
  title: string;
  content: string;
  pillar: string;
}): Promise<ContentExtraction> {
  const prompt = buildExtractionPrompt(article);

  const extraction = await generateJSON<ContentExtraction>(prompt, {
    system: EXTRACTION_SYSTEM_PROMPT,
    maxTokens: 8192,
  });

  // Validate required fields have content
  if (!extraction.takeaways?.length) {
    throw new Error("Extraction produced no takeaways");
  }
  if (!extraction.themes?.length) {
    throw new Error("Extraction produced no themes");
  }

  return {
    takeaways: extraction.takeaways || [],
    quotes: extraction.quotes || [],
    stats: extraction.stats || [],
    hooks: extraction.hooks || [],
    themes: extraction.themes || [],
    audienceInsights: extraction.audienceInsights || "",
    emotionalAngles: extraction.emotionalAngles || [],
  };
}
