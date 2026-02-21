import type { DerivativeContent } from "@/lib/db/schema";
import type { GammaGenerationRequest, VisualContext } from "./types";

// ─── Dynamic Style System ───────────────────────────────
//
// Every variation gets a unique visual identity. No two
// visuals for the same template should look alike.

const COLOR_PALETTES = [
  { bg: "deep navy (#0A1628)", accent: "electric cyan (#00E5FF)", text: "white" },
  { bg: "charcoal black (#1A1A2E)", accent: "hot magenta (#FF2E63)", text: "white" },
  { bg: "rich emerald (#064E3B)", accent: "lime green (#A3E635)", text: "white" },
  { bg: "midnight purple (#2D1B69)", accent: "golden yellow (#FBBF24)", text: "white" },
  { bg: "warm slate (#334155)", accent: "coral orange (#FF6B6B)", text: "white" },
  { bg: "ocean blue (#1E3A5F)", accent: "seafoam mint (#34D399)", text: "white" },
  { bg: "burnt umber (#7C2D12)", accent: "peach (#FCA5A5)", text: "white" },
  { bg: "forest dark (#14532D)", accent: "amber (#F59E0B)", text: "white" },
  { bg: "royal indigo (#312E81)", accent: "rose pink (#FB7185)", text: "white" },
  { bg: "volcanic red (#7F1D1D)", accent: "ice blue (#67E8F9)", text: "white" },
];

const GRADIENT_STYLES = [
  "bold linear gradient from top-left to bottom-right",
  "dramatic radial gradient from center",
  "diagonal split with two solid colors",
  "subtle gradient with a glowing center accent",
  "mesh-style multi-color gradient",
  "dark-to-light vertical fade",
  "duotone gradient with grain texture effect",
  "aurora borealis-style flowing gradient",
  "sunset gradient with warm tones shifting across the card",
  "neon glow gradient with dark edges fading to bright center",
];

const TYPOGRAPHY_STYLES = [
  "Ultra-bold condensed sans-serif. All caps. Tight letter-spacing.",
  "Elegant serif with generous spacing. Mixed case. Sophisticated feel.",
  "Rounded friendly sans-serif. Bold weight. Approachable and modern.",
  "Geometric sans-serif with sharp edges. High contrast weights.",
  "Hand-drawn brush style. Organic, energetic, authentic feel.",
  "Monospace-inspired clean type. Technical, modern coder aesthetic.",
  "Extra-wide stretched sans-serif. Impactful and commanding.",
  "Thin elegant sans with one word in extra-bold for emphasis.",
  "Stacked typography with words at different sizes creating visual hierarchy.",
  "Italic serif for quotes, bold sans for statements. Mixed type contrast.",
];

const LAYOUT_APPROACHES = [
  "Centered layout with generous whitespace. Text is the hero.",
  "Off-center asymmetric layout. Text aligned left with a bold accent bar on the right.",
  "Full-bleed edge-to-edge design. Text overlaps the background boldly.",
  "Card-within-card layout. Inset panel with contrasting background.",
  "Split layout with a thin divider line. Header above, body below.",
  "Diagonal slice layout. Background divided at an angle.",
  "Floating text with a soft shadow. Layered depth effect.",
  "Magazine-style layout with a large pull-quote and smaller supporting text.",
  "Grid-based modular layout. Content in organized blocks.",
  "Bordered frame layout. Thick decorative border around content.",
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
            "photorealistic, cinematic lighting, professional DSLR photography, shallow depth of field, golden hour warmth, ultra-high resolution, 8K detail",
        },
        styleInstructions:
          "VISUAL STYLE: Cinematic photorealistic imagery. Professional DSLR quality with shallow depth of field, cinematic color grading, and golden-hour warmth. Images should look indistinguishable from professional photography.",
      };
    case 1:
      // Editorial / magazine photography
      return {
        imageOptions: {
          source: "aiGenerated",
          model: "flux-1-pro",
          style:
            "editorial photography, magazine quality, clean composition, professional lighting, commercial advertising style, product photography, crisp detail",
        },
        styleInstructions:
          "VISUAL STYLE: Editorial magazine photography. Clean, composed shots with professional studio lighting. Think Forbes, Bloomberg, or Harvard Business Review imagery — polished, authoritative, corporate-grade.",
      };
    case 2:
      // Real stock photography — actual photos from Pexels
      return {
        imageOptions: {
          source: "pexels",
        },
        styleInstructions:
          "VISUAL STYLE: Use real stock photography from Pexels. Select images that show real people in professional settings — offices, conference rooms, technology environments. Authentic, diverse, corporate-appropriate photos.",
      };
    case 3:
      // Dramatic / cinematic dark mood
      return {
        imageOptions: {
          source: "aiGenerated",
          model: "imagen-4-pro",
          style:
            "dramatic cinematic photography, moody dark lighting, film noir inspired, high contrast, atmospheric fog, volumetric light rays, professional film quality",
        },
        styleInstructions:
          "VISUAL STYLE: Dramatic cinematic mood. Dark, atmospheric lighting with volumetric rays and high contrast. Film noir meets modern corporate — sophisticated, powerful, authoritative imagery.",
      };
    case 4:
    default:
      // Lifestyle / human-centric photography
      return {
        imageOptions: {
          source: "aiGenerated",
          model: "flux-1-pro",
          style:
            "lifestyle photography, candid natural moments, warm authentic feel, real people, natural light, documentary style, genuine emotion, professional quality",
        },
        styleInstructions:
          "VISUAL STYLE: Warm lifestyle photography. Candid, human-centric shots with natural light. Real people in real settings — authentic, warm, relatable. Documentary-style with professional quality.",
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
        "ultra photorealistic, 8K resolution, professional photography, perfect lighting, commercial quality, award-winning photo",
      instructions:
        "Use ultra-photorealistic imagery. Every image should look like an award-winning photograph — perfect lighting, crisp detail, professional composition.",
    },
    {
      model: "flux-1-pro",
      style:
        "cinematic photography, anamorphic lens, film grain, professional color grading, Hollywood production quality",
      instructions:
        "Cinematic photography style. Anamorphic lens feel with subtle film grain and Hollywood-grade color grading. Dramatic and aspirational.",
    },
    {
      model: "imagen-4-pro",
      style:
        "high-end advertising photography, luxury brand aesthetic, clean studio lighting, premium product shot quality",
      instructions:
        "High-end advertising photography. Luxury brand aesthetic with pristine studio lighting. Premium, aspirational, polished.",
    },
    {
      model: "flux-1-pro",
      style:
        "documentary photography, authentic candid shot, natural light, photojournalism, raw and real",
      instructions:
        "Documentary-style photography. Authentic, candid, photojournalistic. Natural light and real moments captured with professional skill.",
    },
    {
      model: "imagen-4-pro",
      style:
        "aerial drone photography, sweeping landscape, golden hour, dramatic scale, breathtaking vista",
      instructions:
        "Aerial/landscape photography. Dramatic scale, golden hour lighting, breathtaking vistas. Creates a sense of ambition and vision.",
    },
  ];

  const s = styles[variationIndex % styles.length];
  return {
    imageOptions: { source: "aiGenerated", model: s.model, style: s.style },
    styleInstructions: `VISUAL STYLE: ${s.instructions}`,
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
  "TYPOGRAPHY RULE: Use MASSIVE font — text must occupy minimum 40% of the card height. Max 7 words per text section. Text must be readable at thumbnail size (small phone screen). Bold, high-contrast. No small text.";

/**
 * Get a unique visual style string for a given variation index.
 * Deterministic but varied — same index always produces the same style.
 */
function getVariationStyle(variationIndex: number): string {
  const palette = COLOR_PALETTES[variationIndex % COLOR_PALETTES.length];
  const gradient = GRADIENT_STYLES[(variationIndex * 3) % GRADIENT_STYLES.length];
  const typography = TYPOGRAPHY_STYLES[(variationIndex * 7) % TYPOGRAPHY_STYLES.length];
  const layout = LAYOUT_APPROACHES[(variationIndex * 11) % LAYOUT_APPROACHES.length];

  return `UNIQUE VISUAL STYLE (Variation ${variationIndex + 1}): Background: ${palette.bg} with ${gradient}. Accent color: ${palette.accent}. Text color: ${palette.text}. Typography: ${typography} Layout: ${layout}. This design MUST be visually distinct from all other variations.`;
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText,
    textMode: "preserve",
    format: "presentation",
    numCards: slides.length,
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `Professional LinkedIn carousel slide deck. ${style} Category: ${formatPillar(context.pillar)}. First slide is a bold title slide. Last slide is a CTA. Each content slide has a numbered heading and supporting body text. Use high-quality background photography that relates to the content topic.`,
    imageOptions: { source: "aiGenerated", model: "flux-1-pro", style: "professional corporate photography, clean composition, subtle background, supports text overlay" },
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText,
    textMode: "preserve",
    format: "social",
    numCards: slides.length,
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `Instagram educational carousel. ${style} Each slide has a step number badge, headline, and supporting text. Category: ${formatPillar(context.pillar)}. First slide is a bold title. Last slide is a CTA with "SWIPE" prompt. Use photorealistic background imagery that matches the educational content.`,
    imageOptions: { source: "aiGenerated", model: "imagen-4-pro", style: "photorealistic, educational, clean aesthetic, Instagram-worthy, professional photography" },
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText,
    textMode: "preserve",
    format: "social",
    numCards: slides.length,
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `Instagram storytelling carousel with a cinematic, narrative feel. ${style} Large narrative text with decorative quotation marks on key slides. Category: ${formatPillar(context.pillar)}. Atmospheric and engaging. Use cinematic photorealistic backgrounds that create mood and emotion.`,
    imageOptions: { source: "aiGenerated", model: "imagen-4-pro", style: "cinematic photography, moody atmospheric, storytelling, film-quality, dramatic lighting, emotional" },
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText: `## ❌ ${topText}\n\n## ✅ ${bottomText}`,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Drake meme comparison card. Split into two halves — top half is the rejected option, bottom half is the approved option. ${style} Strong visual contrast between reject and approve sections. ${MEME_FONT_RULE} Use a contextual AI-generated background image that reflects the meme's topic.`,
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
  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText: `## ${left.label || "The Old Way"}\n${left.text}\n\n## ${center.label || "You"}\n${center.text}\n\n## ${right.label || "The New Thing"}\n${right.text}`,
    textMode: "preserve",
    format: "presentation",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Distracted boyfriend meme layout. Three-column comparison. ${style} Left column is the old boring option, center is the audience, right is the exciting new thing. Clear labels. ${MEME_FONT_RULE} Use a contextual background image that fits the topic.`,
    imageOptions: getMemeImageStyle(context.variationIndex ?? 0).imageOptions,
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
  const style = getVariationStyle(context.variationIndex ?? 0);

  const inputText = items
    .map((text, i) => `## ${levels[i] || `Level ${i + 1}`}\n\n${text}`)
    .join("\n\n");

  return {
    inputText,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Expanding brain meme format. Four horizontal panels stacked vertically, escalating in intensity. ${style} Visual intensity and font weight increase with each level. ${MEME_FONT_RULE} Add a glowing brain or cosmic AI-generated background image that escalates in brightness/intensity.`,
    imageOptions: { source: "aiGenerated", model: "imagen-4-pro", style: "glowing brain, cosmic escalation, neon plasma, dramatic volumetric lighting, photorealistic sci-fi" },
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText: `## 🔥 ${topText}\n\n💬 "${bottomText}"`,
    textMode: "preserve",
    format: "presentation",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `"This is fine" meme card. ${style} The situation text at top, a speech bubble at center-bottom with the calm response. Fire emoji decorations. The contrast between chaos and calm is the humor. ${MEME_FONT_RULE} Use a chaotic fire/office background image to reinforce the joke.`,
    imageOptions: getMemeImageStyle(context.variationIndex ?? 0).imageOptions,
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText: `## ${statement}\n\n**CHANGE MY MIND**`,
    textMode: "preserve",
    format: "presentation",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `"Change my mind" meme card. ${style} A large prominent sign/placard with the bold statement. "CHANGE MY MIND" label in a pill badge below. The statement is the dominant visual element. ${MEME_FONT_RULE} Use a contextual background image that relates to the topic being debated.`,
    imageOptions: getMemeImageStyle(context.variationIndex ?? 0).imageOptions,
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
  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText: `## ${person.label || "Person"}\n${person.text}\n\n## ${thing.label || "Thing"}\n${thing.text}\n\n## Is this a ${caption?.text || "..."}?`,
    textMode: "preserve",
    format: "presentation",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `"Is this a...?" meme layout. ${style} Three labeled regions. Person on the left, thing on the right, "Is this a...?" question at the bottom. ${MEME_FONT_RULE} Use a contextual AI-generated background matching the meme's topic.`,
    imageOptions: getMemeImageStyle(context.variationIndex ?? 0).imageOptions,
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
  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText: `## 🔵 ${buttonA.label || "Option A"}\n${buttonA.text}\n\n## 🔴 ${buttonB.label || "Option B"}\n${buttonB.text}`,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Two buttons meme card. ${style} Two large button-shaped rectangles side by side. A "VS" badge between them. The humor is in the impossible choice. ${MEME_FONT_RULE} Use a sweating/stressed background image to reinforce the difficult decision humor.`,
    imageOptions: getMemeImageStyle(context.variationIndex ?? 0).imageOptions,
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText: displayText,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Custom meme concept card. ${style} Category: ${formatPillar(context.pillar)}. Creative, eye-catching. Large centered text as the focal point. Shareable and visually striking. ${MEME_FONT_RULE} Use a contextual, vivid AI-generated background image that reinforces the meme concept.`,
    imageOptions: getMemeImageStyle(context.variationIndex ?? 0).imageOptions,
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText,
    textMode: "preserve",
    format: "presentation",
    numCards: 3,
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `YouTube thumbnail concepts. Maximum visual impact. Bold uppercase text readable at small sizes. ${style} Category: ${formatPillar(context.pillar)}. Thick text, high energy. Include a dramatic, high-contrast photorealistic background image behind the text — faces showing emotion, action shots, or vivid scenes that create curiosity. Text MUST be large, bold, and readable at phone size.`,
    imageOptions: { source: "aiGenerated", model: "imagen-4-pro", style: "dramatic photorealistic, high-contrast, cinematic, YouTube thumbnail, expressive faces, action shot, 8K quality" },
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText: displayText,
    textMode: "preserve",
    format: "social",
    numCards: 1,
    exportAs: "pdf",
    additionalInstructions: `Instagram social graphic post. ${style} Large decorative quotation mark. Centered content text. Category: ${formatPillar(context.pillar)}. Include a beautiful, photorealistic AI-generated background image that complements the message. The image should be subtle and slightly blurred so the text overlay remains crisp and readable. Minimal, clean, and shareable.`,
    imageOptions: { source: "aiGenerated", model: "imagen-4-pro", style: "photorealistic, aesthetic, Instagram-worthy, soft focus bokeh, warm tones, professional photography" },
    cardOptions: { dimensions: "1x1" },
    textOptions: { amount: "brief" },
  };
}

// ─── Generic Builder Factories ──────────────────────────

/**
 * Factory: single-card social post graphic.
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

    const style = getVariationStyle(context.variationIndex ?? 0);
    const imgStyle = getImageStyle(context.variationIndex ?? 0);

    return {
      inputText: displayText,
      textMode: "preserve",
      format: options?.format ?? "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `${baseStyle} ${style} Category: ${formatPillar(context.pillar)}. ${imgStyle.styleInstructions} Image should be subtle enough that text remains readable — use slight blur or dark overlay to maintain text contrast.`,
      imageOptions: imgStyle.imageOptions,
      cardOptions: { dimensions: options?.dimensions ?? "1x1" },
      textOptions: { amount: "brief" },
    };
  };
}

/**
 * Factory: thread or article header graphic.
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

    const style = getVariationStyle(context.variationIndex ?? 0);
    const imgStyle = getPhotoRealisticStyle(context.variationIndex ?? 0);

    return {
      inputText: hookText,
      textMode: "preserve",
      format: "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `${baseStyle} ${style} Category: ${formatPillar(context.pillar)}. ${imgStyle.styleInstructions} Image creates visual interest and stops the scroll. Text must remain readable over the image with strong contrast or dark overlay.`,
      imageOptions: imgStyle.imageOptions,
      cardOptions: { dimensions: "4x3" },
      textOptions: { amount: "brief" },
    };
  };
}

/**
 * Factory: video cover frame.
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

    const style = getVariationStyle(context.variationIndex ?? 0);
    const imgStyle = getPhotoRealisticStyle(context.variationIndex ?? 0);

    return {
      inputText: hookText,
      textMode: "preserve",
      format: "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `${baseStyle} ${style} Category: ${formatPillar(context.pillar)}. ${imgStyle.styleInstructions} Text must be large and readable over the image with strong contrast — use dark gradient overlay if needed.`,
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

  const style = getVariationStyle(context.variationIndex ?? 0);

  return {
    inputText,
    textMode: "preserve",
    format: "social",
    numCards: Math.min(slides.length, 7),
    cardSplit: "inputTextBreaks",
    exportAs: "pdf",
    additionalInstructions: `Instagram Story series frames. Bold vertical design. ${style} Each frame has a different vibrant photorealistic background that matches the story's mood. Large text with strong contrast overlaying the image. Category: ${formatPillar(context.pillar)}. Each frame should feel immersive and visually rich with real-photo quality.`,
    imageOptions: { source: "aiGenerated", model: "imagen-4-pro", style: "photorealistic, immersive, cinematic, vibrant, Instagram Stories, vertical composition, dramatic lighting" },
    cardOptions: { dimensions: "9x16" },
    textOptions: { amount: "brief" },
  };
}

// ─── Helpers ────────────────────────────────────────────

function formatPillar(pillar: string): string {
  return pillar.replace(/_/g, " ").toUpperCase();
}
