import type { GammaVisualSpec, TemplateVisualSpec } from "./types";
import {
  // Existing bespoke builders
  buildCarouselOutlineRequest,
  buildCarouselEduRequest,
  buildCarouselStoryRequest,
  buildDrakeRequest,
  buildDistractedRequest,
  buildExpandingBrainRequest,
  buildThisIsFineRequest,
  buildChangeMyMindRequest,
  buildIsThisARequest,
  buildTwoButtonsRequest,
  buildCustomConceptRequest,
  buildThumbnailRequest,
  buildSocialGraphicRequest,
  // Generic factories
  makePostGraphicBuilder,
  makeThreadHeaderBuilder,
  makeCoverFrameBuilder,
  buildStorySeriesRequest,
} from "./prompt-builders";

const VISUAL_SPECS: Record<string, TemplateVisualSpec> = {
  // ═══════════════════════════════════════════════════════
  //  LINKEDIN (8 templates)
  // ═══════════════════════════════════════════════════════

  thought_leadership: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric LinkedIn thought leadership post. Scene: a professional in a modern executive office or conference room. Headline text overlaid on the photograph."
    ),
  },
  story_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric LinkedIn storytelling post. Scene: warm, intimate professional setting. The photograph evokes the narrative mood. Key lesson overlaid as text."
    ),
  },
  contrarian_take: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric bold contrarian post. Scene: dramatic, high-contrast professional setting. The provocative headline overlaid on a striking photograph. Scroll-stopping visual."
    ),
  },
  data_spotlight: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric data-driven post. Scene: modern technology or analytics setting. The key statistic overlaid as large bold text on the photograph."
    ),
  },
  listicle: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric LinkedIn listicle preview. Scene: dynamic professional workplace. The first few items overlaid on the photograph."
    ),
  },
  question_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric LinkedIn engagement post. Scene: collaborative professional environment. The question text overlaid boldly on the photograph."
    ),
  },
  carousel_outline: {
    shouldGenerate: true,
    category: "carousel",
    buildRequest: buildCarouselOutlineRequest,
  },
  poll_concept: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "LinkedIn poll teaser graphic. Split design with the poll question prominently displayed. Abstract icons representing choices. Vibrant accent colors. 'What do you think?' engagement prompt."
    ),
  },

  // ═══════════════════════════════════════════════════════
  //  X / TWITTER (8 templates)
  // ═══════════════════════════════════════════════════════

  viral_thread: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makeThreadHeaderBuilder(
      "Photo-centric X/Twitter thread hook. Scene: dynamic, attention-grabbing professional setting. The opening hook overlaid boldly on the photograph."
    ),
  },
  hot_take: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric bold hot take. Scene: dramatic, intense setting. The statement overlaid in large impactful text on the photograph. Maximum attitude."
    ),
  },
  stat_bomb: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric data bomb card. Scene: modern technology or industry setting. A massive highlighted number overlaid on the photograph."
    ),
  },
  quote_tweet: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric quote card. Scene: elegant, thoughtful setting. The key quote overlaid boldly on the photograph."
    ),
  },
  poll_tweet: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric poll teaser. Scene: engaging professional environment. The poll question overlaid on the photograph."
    ),
  },
  thread_hook: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric thread hook. Scene: attention-grabbing, bold setting. The hook text overlaid on the photograph. Designed to make people click."
    ),
  },
  reply_bait: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric engagement bait. Scene: playful, eye-catching setting. Bold question text overlaid on the photograph."
    ),
  },
  x_article: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makeThreadHeaderBuilder(
      "Photo-centric X article header. Scene: clean, magazine-style professional environment. Bold headline overlaid on the photograph."
    ),
  },

  // ═══════════════════════════════════════════════════════
  //  INSTAGRAM (8 templates)
  // ═══════════════════════════════════════════════════════

  carousel_educational: {
    shouldGenerate: true,
    category: "carousel",
    buildRequest: buildCarouselEduRequest,
  },
  carousel_storytelling: {
    shouldGenerate: true,
    category: "carousel",
    buildRequest: buildCarouselStoryRequest,
  },
  single_image: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: buildSocialGraphicRequest,
  },
  reel_script: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "Reel cover frame. Vertical format. Bold hook text overlaid on a photorealistic background. High energy, scroll-stopping visual."
    ),
  },
  reel_hook: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "Reel hook frame. Vertical format. Bold oversized text overlaid on a striking photorealistic background. Pattern-interrupt design."
    ),
  },
  story_series: {
    shouldGenerate: true,
    category: "story_frame",
    buildRequest: buildStorySeriesRequest,
  },
  caption_long: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric Instagram post. Scene: aesthetic, visually rich setting relevant to the topic. Key message overlaid on the photograph. Square format for feed grid."
    ),
  },
  caption_short: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric punchy Instagram graphic. Scene: bold, striking setting. Short impactful text overlaid on the photograph."
    ),
  },

  // ═══════════════════════════════════════════════════════
  //  TIKTOK (8 templates)
  // ═══════════════════════════════════════════════════════

  hook_video: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok video cover. Vertical format. Ultra-bold hook text overlaid on a vibrant photorealistic background. Designed to stand out in the For You page."
    ),
  },
  educational: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok educational cover. Vertical format. Bold text overlaid on a photorealistic background scene. Educational, bookmarking-friendly."
    ),
  },
  storytime: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok storytime cover. Vertical format. Narrative hook text overlaid on a warm cinematic photorealistic scene. Creates curiosity."
    ),
  },
  trend_adaptation: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok trend cover. Vertical format. Bold text overlaid on a dynamic photorealistic scene. Trendy, pop culture energy."
    ),
  },
  duet_response: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok duet invitation cover. Vertical format. Bold statement overlaid on a photorealistic scene. Engaging challenge-style visual."
    ),
  },
  greenscreen: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok greenscreen background. Vertical format. Key information overlaid on a photorealistic background. Large text, high contrast. Designed for behind a talking head."
    ),
  },
  quick_tip: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok quick tip cover. Vertical format. Single actionable insight overlaid boldly on a photorealistic background."
    ),
  },
  series_episode: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok series cover. Vertical format. Episode branding with topic text overlaid on a photorealistic background."
    ),
  },

  // ═══════════════════════════════════════════════════════
  //  YOUTUBE (8 templates)
  // ═══════════════════════════════════════════════════════

  long_form: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "YouTube thumbnail. Maximum visual impact. Bold uppercase text (3-5 words) overlaid on a dramatic photorealistic scene. Readable at small sizes.",
      { dimensions: "16x9" }
    ),
  },
  shorts_hook: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "YouTube Shorts cover. Vertical format. Bold hook text overlaid on a photorealistic background. Mobile-first design."
    ),
  },
  shorts_tip: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "YouTube Shorts tip cover. Vertical format. Tip text overlaid on a photorealistic educational scene."
    ),
  },
  community_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric YouTube Community post. Scene: engaging environment. Key question overlaid on the photograph."
    ),
  },
  video_description: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric video companion graphic. Scene: professional production setting. Video title overlaid on the photograph.",
      { dimensions: "16x9", format: "presentation" }
    ),
  },
  thumbnail_concepts: {
    shouldGenerate: true,
    category: "thumbnail",
    buildRequest: buildThumbnailRequest,
  },
  end_screen: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "YouTube end screen. Professional outro with text overlaid on a photorealistic background. Subscribe prompt and next video teaser.",
      { dimensions: "16x9" }
    ),
  },
  pinned_comment: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric YouTube comment graphic. Scene: engaging discussion setting. Discussion question overlaid on the photograph."
    ),
  },

  // ═══════════════════════════════════════════════════════
  //  FACEBOOK (8 templates)
  // ═══════════════════════════════════════════════════════

  long_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric Facebook post. Scene: warm, friendly professional environment. Key insight overlaid on the photograph."
    ),
  },
  short_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric Facebook quick-read. Scene: bold, simple setting. Short text overlaid on the photograph."
    ),
  },
  link_post: { shouldGenerate: false },
  video_post: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "Facebook video cover. Horizontal format. Bold hook text overlaid on a photorealistic scene. High contrast, readable at small sizes.",
      { dimensions: "16x9" }
    ),
  },
  live_outline: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric Facebook Live announcement. Scene: energetic event or broadcast setting. Event topic overlaid on the photograph.",
      { dimensions: "4x3", format: "presentation" }
    ),
  },
  group_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric Facebook Group discussion. Scene: warm, community-focused setting. Discussion question overlaid on the photograph."
    ),
  },
  event_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Photo-centric Facebook event announcement. Scene: professional event or gathering setting. Event title overlaid on the photograph.",
      { dimensions: "4x3", format: "presentation" }
    ),
  },
  // Note: Facebook's reel_script shares slug with Instagram's reel_script.
  // The cover frame builder above (under Instagram) handles both.

  // ═══════════════════════════════════════════════════════
  //  MEMES (8 templates)
  // ═══════════════════════════════════════════════════════

  drake_format: {
    shouldGenerate: true,
    category: "meme",
    buildRequest: buildDrakeRequest,
  },
  distracted_boyfriend: {
    shouldGenerate: true,
    category: "meme",
    buildRequest: buildDistractedRequest,
  },
  expanding_brain: {
    shouldGenerate: true,
    category: "meme",
    buildRequest: buildExpandingBrainRequest,
  },
  this_is_fine: {
    shouldGenerate: true,
    category: "meme",
    buildRequest: buildThisIsFineRequest,
  },
  change_my_mind: {
    shouldGenerate: true,
    category: "meme",
    buildRequest: buildChangeMyMindRequest,
  },
  is_this_a: {
    shouldGenerate: true,
    category: "meme",
    buildRequest: buildIsThisARequest,
  },
  two_buttons: {
    shouldGenerate: true,
    category: "meme",
    buildRequest: buildTwoButtonsRequest,
  },
  custom_concept: {
    shouldGenerate: true,
    category: "meme",
    buildRequest: buildCustomConceptRequest,
  },
};

export function getVisualSpec(templateSlug: string): TemplateVisualSpec {
  return VISUAL_SPECS[templateSlug] || { shouldGenerate: false };
}
