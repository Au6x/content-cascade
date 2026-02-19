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

const VISUAL_SPECS: Record<string, GammaVisualSpec> = {
  // ═══════════════════════════════════════════════════════
  //  LINKEDIN (8 templates)
  // ═══════════════════════════════════════════════════════

  thought_leadership: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Professional LinkedIn companion graphic. Dark navy background with elegant white typography. Feature a bold quote or key insight from the post. Clean, corporate design with subtle accent lines."
    ),
  },
  story_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Narrative LinkedIn companion graphic. Warm-toned gradient background (amber to deep brown). Feature a pivotal quote or the story's key lesson in large serif typography. Intimate, reflective mood."
    ),
  },
  contrarian_take: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Bold contrarian statement card. Striking red-to-black gradient. Large bold uppercase text with the provocative claim. Designed to stop the scroll. Minimal, confrontational design."
    ),
  },
  data_spotlight: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Data-driven LinkedIn graphic. Clean white background with a large emphasized number or statistic as the hero element. Accent color underline. Supporting context text below in smaller type."
    ),
  },
  listicle: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "LinkedIn listicle preview card. Dark background with the first 3-4 numbered items in a clean layout. Modern typography with colored number badges. Suggests more value inside the post.",
      { maxLen: 300 }
    ),
  },
  question_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "LinkedIn question card. Blue-to-purple gradient background. Large decorative question mark icon. Bold centered question text. Designed to spark engagement and comments."
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
      "X/Twitter thread hook card. Dark background with bold white text. Thread emoji (🧵) accent. The opening hook text prominently displayed. Designed as a shareable thread preview image."
    ),
  },
  hot_take: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Bold hot take card. High-contrast black background with fiery gradient text or orange accent. The statement in large, impactful typography. Minimal design, maximum attitude.",
      { maxLen: 280 }
    ),
  },
  stat_bomb: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Data bomb card for X/Twitter. Dark background with a massive highlighted number. Supporting context in smaller text below. Clean, modern data visualization aesthetic."
    ),
  },
  quote_tweet: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Quote card for X/Twitter. Elegant design with large decorative quotation marks. The key quote centered in bold. Subtle gradient background. Designed for sharing."
    ),
  },
  poll_tweet: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "X poll teaser card. Clean design with the poll question prominently displayed. Abstract representations of choices. Modern, engagement-focused design."
    ),
  },
  thread_hook: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Thread hook graphic. Bold, attention-grabbing design with the hook text. Thread icon (🧵). Dark background, bright text. Designed to make people click 'Show thread'."
    ),
  },
  reply_bait: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Engagement bait card. Playful, eye-catching design. Bold text with a provocative question or fill-in-the-blank. Vibrant gradient colors. Designed to be irresistible to reply to.",
      { maxLen: 280 }
    ),
  },
  x_article: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makeThreadHeaderBuilder(
      "X article header graphic. Clean, magazine-style design. Bold headline text with a subtle accent line. Professional yet modern aesthetic. Designed as an article preview card."
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
      "Reel cover frame. Vertical format. Bold hook text in large white font. Eye-catching gradient background (vibrant pink-to-orange or blue-to-purple). Designed for Reels discovery feed. High energy, scroll-stopping."
    ),
  },
  reel_hook: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "Reel hook frame. Vertical format. Pattern-interrupt design. Bold, oversized text with the hook line. Striking contrast. Emoji accents. Designed to stop mid-scroll in under 1 second."
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
      "Instagram post companion graphic. Aesthetic, branded design with the key message or quote from the caption. Gradient background. Square format optimized for the Instagram feed grid. Elegant typography."
    ),
  },
  caption_short: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Punchy Instagram graphic. Bold minimalist design with short impactful text. Strong contrast, single vibrant background color. Designed to pair with a short caption for maximum feed impact.",
      { maxLen: 120 }
    ),
  },

  // ═══════════════════════════════════════════════════════
  //  TIKTOK (8 templates)
  // ═══════════════════════════════════════════════════════

  hook_video: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok video cover frame. Vertical format. Ultra-bold hook text. Vibrant gradient background (neon green, electric blue, or hot pink). Gen-Z aesthetic. Designed to stand out in the For You page."
    ),
  },
  educational: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok educational cover. Vertical format. 'Did you know?' or topic header badge at top. Clean educational aesthetic with bold white text on dark background. Bookmarking-friendly design."
    ),
  },
  storytime: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok storytime cover. Vertical format. Narrative hook text with 'Storytime' badge at top. Warm cinematic tones (amber, burgundy gradients). Creates curiosity and invites tapping."
    ),
  },
  trend_adaptation: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok trend cover. Vertical format. Trendy, dynamic design with bold text and the trend hook. Pop culture aesthetic. Bright, saturated colors."
    ),
  },
  duet_response: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok duet invitation cover. Vertical format. Bold statement or question with 'Duet this' prompt badge. Split-screen visual suggestion. Engaging, challenge-style design."
    ),
  },
  greenscreen: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok greenscreen background card. Vertical format. Key information or data displayed as a clean, readable background image. Large text, high contrast. Designed to be used behind a talking head."
    ),
  },
  quick_tip: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok quick tip cover. Vertical format. 'Quick Tip 💡' badge at top. Single actionable insight in bold below. Clean, snappy design. Bright background color."
    ),
  },
  series_episode: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "TikTok series cover. Vertical format. Series branding with episode number badge. Consistent design template feel. Topic text in bold. Dark background with colored accent border."
    ),
  },

  // ═══════════════════════════════════════════════════════
  //  YOUTUBE (8 templates)
  // ═══════════════════════════════════════════════════════

  long_form: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "YouTube video thumbnail. Maximum visual impact. Bold uppercase text overlay (3-5 words). High contrast. Vibrant background color. Designed to be readable at small sizes in YouTube sidebar.",
      { dimensions: "16x9" }
    ),
  },
  shorts_hook: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "YouTube Shorts cover frame. Vertical format. Bold hook text. Eye-catching gradient background. Large readable typography. Designed for mobile-first vertical viewing."
    ),
  },
  shorts_tip: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "YouTube Shorts tip cover. Vertical format. 'Quick Tip' badge at top. Main tip text below in bold. Clean, educational aesthetic with a bright accent color."
    ),
  },
  community_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "YouTube Community post graphic. Clean card design with the post's key question or prompt. YouTube-red accents. Engagement-focused. Designed for the Community tab feed."
    ),
  },
  video_description: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Video companion graphic. Horizontal presentation-style layout. Video title in bold with supporting description text. Professional design with YouTube-red accent.",
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
      "YouTube end screen card. Professional outro graphic. 'Thanks for watching!' text with subscribe button visual area and next video teaser placeholder. YouTube-red accents. Clean layout.",
      { dimensions: "16x9" }
    ),
  },
  pinned_comment: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "YouTube comment companion graphic. Clean card with the discussion question in bold. 'Join the conversation 💬' prompt. Engagement-focused design. YouTube-red accent."
    ),
  },

  // ═══════════════════════════════════════════════════════
  //  FACEBOOK (8 templates)
  // ═══════════════════════════════════════════════════════

  long_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Facebook post companion graphic. Warm, friendly design. Key insight or quote in large text. Gradient background (soft blue-to-teal). Designed to boost engagement alongside a long text post."
    ),
  },
  short_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Facebook quick-read graphic. Bold, simple design with the post text as the hero element. Strong single-color background. Maximum readability at any size.",
      { maxLen: 100 }
    ),
  },
  link_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Facebook link preview companion. Clean design with article title or hook text. Subtle arrow or link icon suggesting 'click to read more'. Professional layout. Blue accent.",
      { dimensions: "4x3", format: "presentation" }
    ),
  },
  video_post: {
    shouldGenerate: true,
    category: "cover_frame",
    buildRequest: makeCoverFrameBuilder(
      "Facebook video cover frame. Horizontal format. Bold hook text overlay. Designed for autoplay preview (sound-off friendly). High contrast, readable at small sizes.",
      { dimensions: "16x9" }
    ),
  },
  live_outline: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Facebook Live announcement graphic. Vibrant, energetic design with 'LIVE 🔴' badge. Event topic in bold. Exciting, event-style design. Bright gradient background.",
      { dimensions: "4x3", format: "presentation" }
    ),
  },
  group_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Facebook Group discussion graphic. Community-focused design. Discussion question in bold. Warm, inclusive color palette (teal, soft green). Feels conversational, not promotional."
    ),
  },
  event_post: {
    shouldGenerate: true,
    category: "social_graphic",
    buildRequest: makePostGraphicBuilder(
      "Facebook event announcement card. Bold event title with calendar icon. Urgency elements. Registration CTA area. Professional event marketing design. Blue-purple gradient.",
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
