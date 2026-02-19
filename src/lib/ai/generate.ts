import { generateJSON } from "./client";
import { buildGenerationPrompt, buildGenerationSystemPrompt } from "./prompts";
import type { ContentExtraction, DerivativeContent } from "@/lib/db/schema";

export type GenerationInput = {
  template: {
    name: string;
    slug: string;
    promptTemplate: string;
    description: string;
  };
  platformName: string;
  extraction: ContentExtraction;
  source: {
    title: string;
    pillar: string;
    primaryHandle: string;
    canonicalUrl: string;
  };
  brandVoice: {
    voiceGuidelines: string;
    tone: string;
    vocabulary: { preferred: string[]; avoided: string[] };
  };
  variationIndex?: number;
  totalVariations?: number;
};

// Style directions to force diversity across variations
const VARIATION_ANGLES = [
  "Take a bold, contrarian angle. Challenge assumptions. Be provocative and thought-provoking.",
  "Use a storytelling approach. Lead with a personal anecdote or vivid scenario. Make it narrative-driven.",
  "Be data-first and analytical. Lead with numbers, stats, or logical frameworks. Cerebral and authoritative.",
  "Go emotional and inspirational. Tap into aspirations, fears, or triumphs. Make people feel something.",
  "Be practical and tactical. Give concrete, actionable steps. No fluff — just usable advice.",
  "Use humor and wit. Be clever, playful, self-aware. Make people smile while they learn.",
  "Take a minimalist, zen approach. Say more with less. Every word earns its place. Poetic brevity.",
  "Be conversational and raw. Write like you're texting a friend. Authentic, unpolished, real.",
  "Go big-picture and visionary. Connect to macro trends. Position the insight within a larger movement.",
  "Be urgency-driven. Frame as 'this matters right now.' Create FOMO. Time-sensitive energy.",
];

export async function generateDerivative(
  input: GenerationInput
): Promise<DerivativeContent> {
  const prompt = buildGenerationPrompt(
    input.template,
    input.extraction,
    input.source,
    input.brandVoice
  );

  const variationIdx = input.variationIndex ?? 0;
  const totalVars = input.totalVariations ?? 1;

  // Build variation-specific instructions
  let variationPrompt = prompt;
  if (totalVars > 1) {
    const angle = VARIATION_ANGLES[variationIdx % VARIATION_ANGLES.length];
    variationPrompt += `\n\n## VARIATION DIRECTIVE (Variation ${variationIdx + 1} of ${totalVars})
${angle}
This MUST be meaningfully different from any other variation. Use a different opening hook, different structure, different examples, and different tone. Do NOT produce generic or safe content — be distinctive and memorable.`;
  }

  const systemPrompt = buildGenerationSystemPrompt(
    input.platformName,
    input.brandVoice
  );

  const result = await generateJSON<Record<string, unknown>>(variationPrompt, {
    system: systemPrompt,
    maxTokens: 4096,
  });

  // Normalize to DerivativeContent shape
  return normalizeContent(result, input.template.slug);
}

function normalizeContent(
  raw: Record<string, unknown>,
  templateSlug: string
): DerivativeContent {
  // Handle different output shapes from different template types
  const content: DerivativeContent = {
    primaryContent: "",
  };

  // Extract primary content from various possible field names
  content.primaryContent = String(
    raw.content ||
      raw.primary_content ||
      raw.primaryContent ||
      raw.script ||
      raw.text ||
      raw.post ||
      raw.thread ||
      ""
  );

  // For templates that produce structured content (carousels, threads, memes)
  if (raw.slides && Array.isArray(raw.slides)) {
    content.primaryContent = raw.slides
      .map(
        (s: unknown, i: number) =>
          `Slide ${i + 1}: ${typeof s === "string" ? s : JSON.stringify(s)}`
      )
      .join("\n\n");
    content.slides = raw.slides;
  }

  if (raw.tweets && Array.isArray(raw.tweets)) {
    content.primaryContent = raw.tweets
      .map(
        (t: unknown, i: number) =>
          `${i + 1}/ ${typeof t === "string" ? t : JSON.stringify(t)}`
      )
      .join("\n\n");
    content.tweets = raw.tweets;
  }

  if (raw.panels && Array.isArray(raw.panels)) {
    content.primaryContent = raw.panels
      .map(
        (p: unknown, i: number) =>
          `Panel ${i + 1}: ${typeof p === "string" ? p : JSON.stringify(p)}`
      )
      .join("\n");
    content.panels = raw.panels;
  }

  // Meme-specific fields
  if (raw.top_text || raw.bottom_text) {
    content.primaryContent = [
      raw.format ? `Format: ${raw.format}` : "",
      raw.top_text ? `Top: ${raw.top_text}` : "",
      raw.bottom_text ? `Bottom: ${raw.bottom_text}` : "",
      raw.context ? `Context: ${raw.context}` : "",
    ]
      .filter(Boolean)
      .join("\n");
  }

  // Hook + script combo (TikTok, Reels)
  if (raw.hook && raw.script) {
    content.primaryContent = `HOOK: ${raw.hook}\n\nSCRIPT:\n${raw.script}`;
  }

  // Standard fields
  if (raw.headlines) content.headlines = toStringArray(raw.headlines);
  if (raw.titles) content.headlines = toStringArray(raw.titles);
  if (raw.hashtags) content.hashtags = toStringArray(raw.hashtags);
  if (raw.tags) content.hashtags = toStringArray(raw.tags);
  if (raw.cta) content.cta = String(raw.cta);
  if (raw.notes) content.notes = String(raw.notes);
  if (raw.visual_direction || raw.visualDirection) {
    content.visualDirection = String(raw.visual_direction || raw.visualDirection);
  }
  if (raw.visual_cues && Array.isArray(raw.visual_cues)) {
    content.visualDirection = raw.visual_cues.join(", ");
  }
  if (raw.sound_suggestion || raw.soundSuggestion) {
    content.soundSuggestion = String(raw.sound_suggestion || raw.soundSuggestion);
  }

  // Carry through any extra fields
  for (const [key, value] of Object.entries(raw)) {
    if (!(key in content) && value !== undefined) {
      content[key] = value;
    }
  }

  return content;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") return value.split(",").map((s) => s.trim());
  return [];
}
