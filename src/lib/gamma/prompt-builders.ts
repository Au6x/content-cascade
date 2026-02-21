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

/**
 * Rotate through 4 image styles based on variationIndex % 4.
 * Keeps every set of 4 variations visually diverse.
 */
function getImageStyle(variationIndex: number): {
  imageOptions: { source: "aiGenerated" | "noImages"; style?: string };
  styleInstructions: string;
} {
  switch (variationIndex % 4) {
    case 0:
      return {
        imageOptions: {
          source: "aiGenerated",
          style: "photorealistic, high-quality photography, cinematic lighting, ultra-realistic",
        },
        styleInstructions:
          "VISUAL STYLE: Photorealistic cinematic background. Professional photography aesthetic with rich depth and natural lighting.",
      };
    case 1:
      return {
        imageOptions: {
          source: "aiGenerated",
          style: "cartoon illustration, bold outlines, vibrant flat design, vector art style",
        },
        styleInstructions:
          "VISUAL STYLE: Bold cartoon/illustrated background. Vibrant flat design with bold outlines and punchy colors.",
      };
    case 2:
      return {
        imageOptions: { source: "noImages" },
        styleInstructions:
          "VISUAL STYLE: Infographic layout — pure graphic design with data visualization elements, icons, structured information hierarchy. No photography.",
      };
    case 3:
    default:
      return {
        imageOptions: {
          source: "aiGenerated",
          style: "editorial photography, magazine layout, professional, editorial quality",
        },
        styleInstructions:
          "VISUAL STYLE: Editorial/magazine-quality aesthetic. Professional journalistic look with clean composition.",
      };
  }
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
    additionalInstructions: `Professional LinkedIn carousel slide deck. ${style} Category: ${formatPillar(context.pillar)}. First slide is a bold title slide. Last slide is a CTA. Each content slide has a numbered heading and supporting body text. No photos.`,
    imageOptions: { source: "noImages" },
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
    additionalInstructions: `Instagram educational carousel. ${style} Each slide has a step number badge, headline, and supporting text. Category: ${formatPillar(context.pillar)}. First slide is a bold title. Last slide is a CTA with "SWIPE" prompt. No photos.`,
    imageOptions: { source: "noImages" },
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
    additionalInstructions: `Instagram storytelling carousel with a cinematic, narrative feel. ${style} Large narrative text with decorative quotation marks on key slides. Category: ${formatPillar(context.pillar)}. Atmospheric and engaging. No photos.`,
    imageOptions: { source: "noImages" },
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
    imageOptions: { source: "aiGenerated", style: "contextual background, meme-style, bold graphic" },
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
    imageOptions: { source: "aiGenerated", style: "contextual, meme background, vivid" },
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
    imageOptions: { source: "aiGenerated", style: "glowing brain, cosmic escalation, neon, dramatic" },
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
    imageOptions: { source: "aiGenerated", style: "chaotic office on fire, cartoon flames, absurd humor" },
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
    imageOptions: { source: "aiGenerated", style: "debate setting, contextual, bold graphic background" },
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
    imageOptions: { source: "aiGenerated", style: "confused person, contextual background, vibrant meme" },
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
    imageOptions: { source: "aiGenerated", style: "stressed sweating person, two buttons, decision anxiety, vivid" },
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
    imageOptions: { source: "aiGenerated", style: "vivid contextual meme background, bold graphic, shareable" },
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
    additionalInstructions: `YouTube thumbnail concepts. Maximum visual impact. Bold uppercase text readable at small sizes. ${style} Category: ${formatPillar(context.pillar)}. Thick text, high energy. Include a dramatic, high-contrast AI-generated background image behind the text — faces showing emotion, action shots, or vivid scenes that create curiosity. Text MUST be large, bold, and readable at phone size.`,
    imageOptions: { source: "aiGenerated", style: "dramatic, high-contrast, YouTube thumbnail, cinematic" },
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
    additionalInstructions: `Instagram social graphic post. ${style} Large decorative quotation mark. Centered content text. Category: ${formatPillar(context.pillar)}. Include a beautiful, aesthetic AI-generated background image that complements the message. The image should be subtle and slightly blurred so the text overlay remains crisp and readable. Minimal, clean, and shareable.`,
    imageOptions: { source: "aiGenerated", style: "aesthetic, minimal, Instagram-worthy, soft focus" },
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
    useAiImages?: boolean;
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
    const useImages = options?.useAiImages ?? true;
    const imgStyle = useImages ? getImageStyle(context.variationIndex ?? 0) : null;

    return {
      inputText: displayText,
      textMode: "preserve",
      format: options?.format ?? "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `${baseStyle} ${style} Category: ${formatPillar(context.pillar)}.${imgStyle ? ` ${imgStyle.styleInstructions} Image should be subtle enough that text remains readable.` : " No photos."}`,
      imageOptions: imgStyle?.imageOptions ?? { source: "noImages" },
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
    const imgStyle = getImageStyle(context.variationIndex ?? 0);

    return {
      inputText: hookText,
      textMode: "preserve",
      format: "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `${baseStyle} ${style} Category: ${formatPillar(context.pillar)}. ${imgStyle.styleInstructions} Image creates visual interest and stops the scroll. Text must remain readable over the image.`,
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
  options?: { dimensions?: import("./types").GammaDimension; useAiImages?: boolean }
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
    const useImages = options?.useAiImages ?? true;
    const imgStyle = useImages ? getImageStyle(context.variationIndex ?? 0) : null;

    return {
      inputText: hookText,
      textMode: "preserve",
      format: "social",
      numCards: 1,
      exportAs: "pdf",
      additionalInstructions: `${baseStyle} ${style} Category: ${formatPillar(context.pillar)}.${imgStyle ? ` ${imgStyle.styleInstructions} Text must be large and readable over the image with strong contrast.` : " No photos."}`,
      imageOptions: imgStyle?.imageOptions ?? { source: "noImages" },
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
    additionalInstructions: `Instagram Story series frames. Bold vertical design. ${style} Each frame has a different vibrant background with an AI-generated image that matches the story's mood. Large text with strong contrast overlaying the image. Category: ${formatPillar(context.pillar)}. Each frame should feel immersive and visually rich.`,
    imageOptions: { source: "aiGenerated", style: "immersive, story-driven, vibrant, Instagram Stories" },
    cardOptions: { dimensions: "9x16" },
    textOptions: { amount: "brief" },
  };
}

// ─── Helpers ────────────────────────────────────────────

function formatPillar(pillar: string): string {
  return pillar.replace(/_/g, " ").toUpperCase();
}
