import type { DerivativeContent } from "@/lib/db/schema";

export type GammaFormat = "social" | "presentation";
export type GammaDimension =
  | "1x1"
  | "4x5"
  | "9x16"
  | "16x9"
  | "4x3"
  | "fluid";

export type GammaGenerationRequest = {
  inputText: string;
  textMode: "preserve" | "generate" | "condense";
  format: GammaFormat;
  numCards: number;
  exportAs: "pdf";
  cardSplit?: "auto" | "inputTextBreaks";
  additionalInstructions?: string;
  imageOptions?: {
    source: "noImages" | "aiGenerated" | "pexels" | "webFreeToUseCommercially" | "unsplash";
    model?: string;
    style?: string;
  };
  cardOptions?: { dimensions: GammaDimension };
  textOptions?: { amount?: "brief" | "medium"; tone?: string };
};

export type VisualCategory =
  | "carousel"
  | "meme"
  | "thumbnail"
  | "social_graphic"
  | "cover_frame"
  | "story_frame";

export type VisualContext = {
  title: string;
  pillar: string;
  variationIndex?: number;
};

export type GammaVisualSpec = {
  shouldGenerate: true;
  category: VisualCategory;
  buildRequest: (
    content: DerivativeContent,
    context: VisualContext
  ) => GammaGenerationRequest | null;
};

export type NoVisualSpec = { shouldGenerate: false };
export type TemplateVisualSpec = GammaVisualSpec | NoVisualSpec;
