import type { DerivativeContent } from "@/lib/db/schema";
import type { GammaGenerationRequest, VisualContext } from "./types";

// ─── Photo-First Layout System ──────────────────────────
//
// Every card uses a full-bleed photorealistic background image.
// Text overlays the image with contrast treatment.
// Variation comes from composition direction, not color palettes.

const PHOTO_LAYOUTS = [
  "Full-bleed background photo filling the entire card edge-to-edge. Bold white text overlaid with a dark gradient overlay at the bottom third for readability. The photo is the HERO element.",
  "Full-bleed background photo covering the entire card. Text positioned top-left in a semi-transparent dark banner. The photographic image dominates at least 80% of the card.",
  "Full-bleed cinematic background photo. Large centered text with a subtle dark vignette around the edges. Minimal text, maximum photo impact.",
  "Full-bleed background photo. Text at the bottom with a frosted-glass bar overlay. The photographic image fills the entire card and is the primary visual.",
  "Full-bleed background photo with a dramatic dark-to-transparent gradient from bottom. Text anchored at the bottom. Photo visible across the full card.",
];

// ─── Image Style Rotation ────────────────────────────────
//
// Carl's requirement: high-quality, photo-realistic images.
// Every variation cycles through 5 distinct visual approaches
// using premium Gamma models for maximum quality.
//
// Model guide (Gamma API):
//   flux-1-pro       (8 cr)  — best photorealism-per-credit, vibrant color grading
//   imagen-4-pro     (20 cr) — highest fidelity photorealism + text rendering
//   ideogram-v3      (20 cr) — best text rendering, great for graphics/posters
//   imagen-3-pro     (8 cr)  — strong photorealism, lower cost
//   flux-kontext-pro (20 cr) — great contextual scene composition

type ImageStyleResult = {
  imageOptions: {
    source: "aiGenerated" | "pexels" | "noImages";
    model?: string;
    style?: string;
  };
  styleInstructions: string;
};

function getImageStyle(variationIndex: number): ImageStyleResult {
  switch (variationIndex % 5) {
    case 0:
      // Cinematic photorealism — flagship quality
      return {
        imageOptions: {
          source: "aiGenerated",
          model: "imagen-4-pro",
          style:
            "photorealistic, cinematic lighting, professional DSLR photography, shallow depth of field, golden hour warmth, ultra-high resolution",
        },
        styleInstructions:
          "Generate a photorealistic image of a scene relevant to the content topic — real people, real settings. Cinematic DSLR quality with shallow depth of field and warm golden-hour lighting.",
      };
    case 1:
      // Editorial / magazine photography
      return {
        imageOptions: {
          source: "aiGenerated",
          model: "flux-1-pro",
          style:
            "editorial photography, magazine quality, clean composition, professional studio lighting, commercial advertising",
        },
        styleInstructions:
          "Generate a photorealistic editorial image showing professionals in a modern workplace or industry setting. Clean composition, professional lighting, magazine-quality photography.",
      };
    case 2:
      // Real stock photography — actual photos from Pexels
      return {
        imageOptions: {
          source: "pexels",
        },
        styleInstructions:
          "Select a real stock photo showing real people in professional settings — offices, conference rooms, technology environments. Authentic, diverse representation.",
      };
    case 3:
      // GPT Image — structured/composed photorealism
      return {
        imageOptions: {
          source: "aiGenerated",
          model: "gpt-image-1-medium",
          style:
            "photorealistic, professional photography, well-composed scene, natural lighting, authentic people and environments",
        },
        styleInstructions:
          "Generate a photorealistic composed scene relevant to the content. Real people in professional or industry settings. Natural lighting, authentic environment, high production quality.",
      };
    case 4:
    default:
      // Contextual scene composition
      return {
        imageOptions: {
          source: "aiGenerated",
          model: "flux-kontext-pro",
          style:
            "photorealistic scene, contextual composition, lifestyle photography, candid natural moments, warm authentic feel, real people",
        },
        styleInstructions:
          "Generate a photorealistic lifestyle scene relevant to the content topic. Candid, natural moments showing real people in real settings. Warm, authentic, relatable photography.",
      };
  }
}

/**
 * Get a premium photorealistic style for templates that should ALWAYS
 * use high-quality AI photography (thumbnails, cover frames, etc.)
 */
function getPhotoRealisticStyle(variationIndex: number): ImageStyleResult {
  const styles = [
    {
      model: "imagen-4-pro",
      style:
        "photorealistic, cinematic lighting, professional DSLR, shallow depth of field, award-winning photo",
      instructions:
        "Generate a photorealistic scene relevant to the content. Professional DSLR quality, cinematic lighting, crisp detail.",
    },
    {
      model: "flux-1-pro",
      style:
        "cinematic photography, anamorphic lens, film grain, Hollywood production quality, dramatic lighting",
      instructions:
        "Generate a cinematic photorealistic scene. Anamorphic lens feel, film grain, Hollywood-grade production value.",
    },
    {
      model: "gpt-image-1-medium",
      style:
        "photorealistic, professional advertising photography, clean studio lighting, premium commercial quality",
      instructions:
        "Generate a high-end photorealistic image. Advertising-quality photography with professional lighting and composition.",
    },
    {
      model: "flux-kontext-pro",
      style:
        "documentary photography, authentic candid shot, natural light, photojournalism, real people",
      instructions:
        "Generate a documentary-style photorealistic image. Authentic, candid, natural light, real people in real settings.",
    },
    {
      model: "imagen-4-pro",
      style:
        "photorealistic landscape, aerial perspective, golden hour, dramatic scale, sweeping vista",
      instructions:
        "Generate a sweeping photorealistic landscape or environment shot. Golden hour lighting, dramatic scale.",
    },
  ];

  const s = styles[variationIndex % styles.length];
  return {
    imageOptions: { source: "aiGenerated", model: s.model, style: s.style },
    styleInstructions: s.instructions,
  };
}

/**
 * Get a style specifically for meme templates — bold, contextual backgrounds
 * that serve the text overlay without overwhelming it.
 */
function getMemeImageStyle(variationIndex: number): ImageStyleResult {
  const styles = [
    {
      model: "flux-1-pro",
      style:
        "bold contextual background, slightly blurred, vibrant colors, supports text overlay, meme-ready",
    },
    {
      model: "imagen-3-pro",
      style:
        "dramatic scene background, high contrast, bold graphic, cinematic blur, text-friendly",
    },
    {
      model: "flux-1-pro",
      style:
        "vivid illustration background, semi-abstract, strong colors, perfect for text overlay",
    },
  ];

  const s = styles[variationIndex % styles.length];
  return {
    imageOptions: { source: "aiGenerated", model: s.model, style: s.style },
    styleInstructions:
      "VISUAL STYLE: Bold contextual background image that supports the text overlay. Image should be slightly out of focus or stylized so text pops. Vivid but not distracting.",
  };
}

const MEME_FONT_RULE =
  "TYPOGRAPHY RULE: Use MASSIVE font — text must occupy minimum 40% of the card height. Max 7 words per text section. Bold, high-contrast. No small text.";

/**
 * Get a photo-first layout direction for a given variation index.
 * Tells Gamma to use full-bleed photorealistic backgrounds with text overlay.
 */
function getPhotoLayout(variationIndex: number): string {
  return PHOTO_LAYOUTS[variationIndex % PHOTO_LAYOUTS.length];
}

// ─── Carousels ──────────────────────────────────────────

export function buildCarouselOutlineRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const slides =
    (content.slides as Array<{ title: string; body: string }>) || [];
  if (slides.length === 0) return null;

  const inputText = slides
    .map((s) => `## ${s.title}\n\n${s.body || ""}`)
    .join("\n---\n");

  const vi = context.variationIndex ?? 0;
  const imgStyle = getImageStyle(vi);

  return {
    inputText,
    textMode: "condense",
    format: "presentation",
    numCards: slides.length,
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `This is a photo-centric LinkedIn carousel. Use the image as a BACKGROUND that covers each slide. Keep text minimal on each slide — short headlines overlaid on the photos. Dark overlay for readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}. First slide: bold title with hero photo. Last slide: CTA.`,
    imageOptions: imgStyle.imageOptions,
    cardOptions: { dimensions: "4x3" },
  };
}

export function buildCarouselEduRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const slides =
    (content.slides as Array<{ title: string; body: string }>) || [];
  if (slides.length === 0) return null;

  const inputText = slides
    .map((s, i) => `## Step ${i + 1}: ${s.title}\n\n${s.body || ""}`)
    .join("\n---\n");

  const vi = context.variationIndex ?? 0;
  const imgStyle = getImageStyle(vi);

  return {
    inputText,
    textMode: "condense",
    format: "social",
    numCards: slides.length,
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `This is a photo-centric Instagram educational carousel. Use the image as a BACKGROUND that covers each slide. Keep text minimal — short headlines overlaid on the photos. Dark overlay for readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}. First slide: bold title. Last slide: CTA.`,
    imageOptions: imgStyle.imageOptions,
    cardOptions: { dimensions: "1x1" },
  };
}

export function buildCarouselStoryRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const slides =
    (content.slides as Array<{ title: string; body: string }>) || [];
  if (slides.length === 0) return null;

  const inputText = slides
    .map((s, i) => `## Chapter ${i + 1}: ${s.title}\n\n${s.body || ""}`)
    .join("\n---\n");

  const vi = context.variationIndex ?? 0;
  const imgStyle = getPhotoRealisticStyle(vi);

  return {
    inputText,
    textMode: "condense",
    format: "social",
    numCards: slides.length,
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `This is a photo-centric Instagram storytelling carousel. Use the image as a BACKGROUND that covers each slide. Keep text minimal — short headlines overlaid on the photos. Dark cinematic overlay for readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}. Atmospheric, immersive.`,
    imageOptions: imgStyle.imageOptions,
    cardOptions: { dimensions: "1x1" },
  };
}

// ─── Memes ──────────────────────────────────────────────

export function buildDrakeRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const topText = (content.top_text as string) || "";
  const bottomText = (content.bottom_text as string) || "";
  if (!topText && !bottomText) return null;

  const memeImg = getMemeImageStyle(context.variationIndex ?? 0);

  return {
    inputText: `## ❌ ${topText}\n\n## ✅ ${bottomText}`,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Drake meme comparison card. Split into two halves — top is rejected, bottom is approved. LAYOUT: Full-bleed background image filling the entire card. Strong visual contrast between reject and approve. ${MEME_FONT_RULE}`,
    imageOptions: getMemeImageStyle(context.variationIndex ?? 0).imageOptions,
    cardOptions: { dimensions: "1x1" },
    textOptions: { amount: "brief" },
  };
}

export function buildDistractedRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const panels =
    (content.panels as Array<{ label: string; text: string }>) || [];
  if (panels.length < 2) return null;

  const left = panels[0];
  const center = panels[1];
  const right = panels[2] || { label: "The New Thing", text: "" };
  const memeImg = getMemeImageStyle(context.variationIndex ?? 0);

  return {
    inputText: `## ${left.label || "The Old Way"}\n${left.text}\n\n## ${center.label || "You"}\n${center.text}\n\n## ${right.label || "The New Thing"}\n${right.text}`,
    textMode: "preserve",
    format: "presentation",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Distracted boyfriend meme layout. Three-column comparison. LAYOUT: Full-bleed background image. Left is old boring option, center is audience, right is exciting new thing. ${MEME_FONT_RULE}`,
    imageOptions: memeImg.imageOptions,
    cardOptions: { dimensions: "4x3" },
    textOptions: { amount: "brief" },
  };
}

export function buildExpandingBrainRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const panels = (content.panels as string[]) || [];
  if (panels.length === 0) return null;

  const levels = ["🧠 Basic", "💡 Smart", "🌌 Galaxy Brain", "✨ Transcended"];
  const items = panels.slice(0, 4);

  const inputText = items
    .map((text, i) => `## ${levels[i] || `Level ${i + 1}`}\n\n${text}`)
    .join("\n\n");

  return {
    inputText,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Expanding brain meme. Four panels stacked vertically, escalating intensity. LAYOUT: Full-bleed photorealistic background that escalates from normal to cosmic. ${MEME_FONT_RULE}`,
    imageOptions: { source: "aiGenerated", model: "imagen-4-pro", style: "photorealistic escalation, cosmic brain, dramatic volumetric lighting, neon plasma glow" },
    cardOptions: { dimensions: "4x5" },
    textOptions: { amount: "brief" },
  };
}

export function buildThisIsFineRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const topText = (content.top_text as string) || "";
  const bottomText = (content.bottom_text as string) || "";
  if (!topText && !bottomText) return null;

  const memeImg = getMemeImageStyle(context.variationIndex ?? 0);

  return {
    inputText: `## 🔥 ${topText}\n\n💬 "${bottomText}"`,
    textMode: "preserve",
    format: "presentation",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `"This is fine" meme card. LAYOUT: Full-bleed photorealistic background of a chaotic office/fire scene. Situation text at top, calm speech bubble at bottom. ${MEME_FONT_RULE}`,
    imageOptions: memeImg.imageOptions,
    cardOptions: { dimensions: "4x3" },
    textOptions: { amount: "brief" },
  };
}

export function buildChangeMyMindRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const statement =
    (content.top_text as string) ||
    content.primaryContent?.slice(0, 100) ||
    "";
  if (!statement) return null;

  const memeImg = getMemeImageStyle(context.variationIndex ?? 0);

  return {
    inputText: `## ${statement}\n\n**CHANGE MY MIND**`,
    textMode: "preserve",
    format: "presentation",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `"Change my mind" meme card. LAYOUT: Full-bleed photorealistic background of a debate/outdoor scene. Large bold statement text overlaid. "CHANGE MY MIND" badge below. ${MEME_FONT_RULE}`,
    imageOptions: memeImg.imageOptions,
    cardOptions: { dimensions: "4x3" },
    textOptions: { amount: "brief" },
  };
}

export function buildIsThisARequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const panels =
    (content.panels as Array<{ label: string; text: string }>) || [];
  if (panels.length < 2) return null;

  const person = panels[0];
  const thing = panels[1];
  const caption = panels[2];
  const memeImg = getMemeImageStyle(context.variationIndex ?? 0);

  return {
    inputText: `## ${person.label || "Person"}\n${person.text}\n\n## ${thing.label || "Thing"}\n${thing.text}\n\n## Is this a ${caption?.text || "..."}?`,
    textMode: "preserve",
    format: "presentation",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `"Is this a...?" meme layout. LAYOUT: Full-bleed photorealistic background. Three labeled regions — person left, thing right, question at bottom. ${MEME_FONT_RULE}`,
    imageOptions: memeImg.imageOptions,
    cardOptions: { dimensions: "4x3" },
    textOptions: { amount: "brief" },
  };
}

export function buildTwoButtonsRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const panels =
    (content.panels as Array<{ label: string; text: string }>) || [];
  if (panels.length < 2) return null;

  const buttonA = panels[0];
  const buttonB = panels[1];
  const memeImg = getMemeImageStyle(context.variationIndex ?? 0);

  return {
    inputText: `## 🔵 ${buttonA.label || "Option A"}\n${buttonA.text}\n\n## 🔴 ${buttonB.label || "Option B"}\n${buttonB.text}`,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Two buttons meme card. LAYOUT: Full-bleed photorealistic background of a stressed/sweating scene. Two large buttons side by side with VS badge. ${MEME_FONT_RULE}`,
    imageOptions: memeImg.imageOptions,
    cardOptions: { dimensions: "1x1" },
    textOptions: { amount: "brief" },
  };
}

export function buildCustomConceptRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const displayText =
    (content.visualDirection as string) ||
    content.primaryContent?.slice(0, 150) ||
    context.title;
  if (!displayText) return null;

  const memeImg = getMemeImageStyle(context.variationIndex ?? 0);

  return {
    inputText: displayText,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Custom meme concept card. LAYOUT: Full-bleed photorealistic background relevant to the topic. Large bold centered text overlaid. Category: ${formatPillar(context.pillar)}. ${MEME_FONT_RULE}`,
    imageOptions: memeImg.imageOptions,
    cardOptions: { dimensions: "1x1" },
    textOptions: { amount: "brief" },
  };
}

// ─── Thumbnails ─────────────────────────────────────────

export function buildThumbnailRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const slides =
    (content.slides as Array<{ title: string; body: string }>) || [];
  const concepts =
    slides.length > 0
      ? slides.slice(0, 3)
      : [{ title: context.title.slice(0, 50), body: "" }];

  while (concepts.length < 3) {
    concepts.push({
      title: concepts[0].title,
      body: concepts[0].body || "",
    });
  }

  const inputText = concepts
    .map(
      (c, i) =>
        `## Variant ${i + 1}: ${c.title}${c.body ? `\n\n${c.body}` : ""}`
    )
    .join("\n---\n");

  const vi = context.variationIndex ?? 0;
  const imgStyle = getPhotoRealisticStyle(vi);

  return {
    inputText,
    textMode: "condense",
    format: "presentation",
    numCards: 3,
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `These are photo-centric YouTube thumbnail concepts. Use the image as a BACKGROUND that covers each slide. Keep text to absolute minimum — bold uppercase headlines overlaid on the photos. Dark overlay for readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}. The photo IS the thumbnail.`,
    imageOptions: imgStyle.imageOptions,
    cardOptions: { dimensions: "16x9" },
    textOptions: { amount: "brief" },
  };
}

// ─── Social Graphics ────────────────────────────────────

export function buildSocialGraphicRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const displayText =
    content.primaryContent?.slice(0, 120) ||
    (content.visualDirection as string)?.slice(0, 120) ||
    context.title;
  if (!displayText) return null;

  const vi = context.variationIndex ?? 0;
  const imgStyle = getImageStyle(vi);

  const inputText = `A photorealistic photograph related to: ${context.title}. Overlay text: ${displayText.slice(0, 80)}`;

  return {
    inputText,
    textMode: "generate",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `This is a photo-centric Instagram social graphic. Use the image as a BACKGROUND that covers the entire card. Keep text to an absolute minimum — just a short headline overlaid on the photo. Dark overlay for text readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}.`,
    imageOptions: imgStyle.imageOptions,
    cardOptions: { dimensions: "1x1" },
    textOptions: { amount: "brief" },
  };
}

// ─── Generic Builder Factories ──────────────────────────

/**
 * Factory: single-card social post graphic.
 * Uses textMode "generate" so Gamma creates a photo-dominant layout
 * with minimal text overlaid on the photograph.
 */
export function makePostGraphicBuilder(
  baseStyle: string,
  options?: {
    dimensions?: import("./types").GammaDimension;
    format?: import("./types").GammaFormat;
    maxLen?: number;
  }
) {
  return (
    content: DerivativeContent,
    context: VisualContext
  ): GammaGenerationRequest | null => {
    const maxLen = options?.maxLen ?? 200;
    const displayText =
      content.primaryContent?.slice(0, maxLen) ||
      content.headlines?.[0] ||
      context.title;
    if (!displayText) return null;

    const vi = context.variationIndex ?? 0;
    const imgStyle = getImageStyle(vi);

    // Build image-first inputText: scene description + overlay text
    const inputText = `A photorealistic photograph related to: ${context.title}. Overlay text: ${displayText.slice(0, 80)}`;

    return {
      inputText,
      textMode: "generate",
      format: options?.format ?? "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `This is a photo-centric social media post. ${baseStyle} Use the image as a BACKGROUND that covers the entire card. The card style should use the background image layout with the photo filling the card. Keep text to an absolute minimum — just a short headline overlaid on the photo. Dark overlay for text readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}.`,
      imageOptions: imgStyle.imageOptions,
      cardOptions: { dimensions: options?.dimensions ?? "1x1" },
      textOptions: { amount: "brief" },
    };
  };
}

/**
 * Factory: thread or article header graphic.
 * Uses textMode "generate" for photo-dominant layout.
 */
export function makeThreadHeaderBuilder(baseStyle: string) {
  return (
    content: DerivativeContent,
    context: VisualContext
  ): GammaGenerationRequest | null => {
    const tweets = content.tweets as string[] | undefined;
    const hookText =
      tweets?.[0] ||
      content.primaryContent?.slice(0, 150) ||
      content.headlines?.[0] ||
      context.title;
    if (!hookText) return null;

    const vi = context.variationIndex ?? 0;
    const imgStyle = getPhotoRealisticStyle(vi);

    const inputText = `A photorealistic photograph related to: ${context.title}. Overlay text: ${hookText.slice(0, 80)}`;

    return {
      inputText,
      textMode: "generate",
      format: "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `This is a photo-centric social media post. ${baseStyle} Use the image as a BACKGROUND that covers the entire card. Keep text to an absolute minimum — just a short headline overlaid on the photo. Dark overlay for text readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}.`,
      imageOptions: imgStyle.imageOptions,
      cardOptions: { dimensions: "4x3" },
      textOptions: { amount: "brief" },
    };
  };
}

/**
 * Factory: video cover frame.
 * Uses textMode "generate" for photo-dominant layout.
 */
export function makeCoverFrameBuilder(
  baseStyle: string,
  options?: { dimensions?: import("./types").GammaDimension }
) {
  return (
    content: DerivativeContent,
    context: VisualContext
  ): GammaGenerationRequest | null => {
    const hookText =
      (content.hook as string) ||
      content.headlines?.[0] ||
      content.primaryContent?.slice(0, 100) ||
      context.title;
    if (!hookText) return null;

    const vi = context.variationIndex ?? 0;
    const imgStyle = getPhotoRealisticStyle(vi);

    const inputText = `A photorealistic photograph related to: ${context.title}. Overlay text: ${hookText.slice(0, 80)}`;

    return {
      inputText,
      textMode: "generate",
      format: "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `This is a photo-centric cover frame. ${baseStyle} Use the image as a BACKGROUND that covers the entire card. Keep text to an absolute minimum — just a short headline overlaid on the photo. Dark overlay for text readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}.`,
      imageOptions: imgStyle.imageOptions,
      cardOptions: { dimensions: options?.dimensions ?? "9x16" },
      textOptions: { amount: "brief" },
    };
  };
}

/**
 * Story series builder — multi-card output from slides.
 */
export function buildStorySeriesRequest(
  content: DerivativeContent,
  context: VisualContext
): GammaGenerationRequest | null {
  const slides =
    (content.slides as Array<{ title: string; body: string }>) || [];
  if (slides.length === 0) return null;

  const inputText = slides
    .map((s, i) => `## Story ${i + 1}: ${s.title}\n\n${s.body || ""}`)
    .join("\n---\n");

  const vi = context.variationIndex ?? 0;
  const imgStyle = getPhotoRealisticStyle(vi);

  return {
    inputText,
    textMode: "condense",
    format: "social",
    numCards: Math.min(slides.length, 7),
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `This is a photo-centric Instagram Story series. Use the image as a BACKGROUND that covers each card. Keep text minimal on each frame — just short headlines overlaid on the photos. Dark overlay for readability. ${imgStyle.styleInstructions} Category: ${formatPillar(context.pillar)}.`,
    imageOptions: imgStyle.imageOptions,
    cardOptions: { dimensions: "9x16" },
    textOptions: { amount: "brief" },
  };
}

// ─── Helpers ────────────────────────────────────────────

function formatPillar(pillar: string): string {
  return pillar.replace(/_/g, " ").toUpperCase();
}
