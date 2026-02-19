import "dotenv/config";
import { db } from "../src/lib/db";
import { contentTemplates, platforms } from "../src/lib/db/schema";
import type { PlatformConfig } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Reads the current seed template definitions and updates
 * all existing DB templates to match. This ensures the DB
 * has the latest research-backed prompt improvements:
 * - Corrected character targets
 * - Updated hashtag counts (Instagram 25 → 10-15)
 * - Mandatory text overlay instructions (TikTok/Reels)
 * - visual_direction and cta in all return JSON schemas
 * - Slide 2 "reward the swipe" rules for carousels
 * - Anti-AI authenticity improvements
 */

// Import the same template definitions used by seed.ts
// We inline them here to avoid circular imports

const TEMPLATE_UPDATES: Record<string, { promptTemplate?: string; description?: string }> = {};

// ─── Collect updated prompts from the template functions ────

// Rather than duplicating all 56 templates, we do targeted patches
// on the fields that changed from the research findings.

const PATCHES: {
  slug: string;
  patches: Array<{ find: string | RegExp; replace: string }>;
  descriptionUpdate?: string;
}[] = [
  // ── LinkedIn ──
  {
    slug: "thought_leadership",
    descriptionUpdate: "Deep-dive LinkedIn post with personal insights (1200-1600 chars)",
    patches: [
      { find: "1500-2000 characters", replace: "1200-1600 characters — engagement peaks at ~1300" },
      { find: "Start with a bold, counterintuitive hook that stops scrolling", replace: "Start with a bold, counterintuitive hook in the first 210 characters (visible before \"see more\")" },
      { find: "End with a thought-provoking question or call to reflect", replace: "End with a SPECIFIC question (not \"Agree?\" or \"Thoughts?\" — ask something answerable)\n- Do NOT include any external links in the post body (link goes in first comment)" },
      { find: '"notes": "posting tips" }', replace: '"cta": "specific call to action", "visual_direction": "describe the ideal companion image: mood, colors, composition, subject", "notes": "posting tips" }' },
    ],
  },

  // ── X/Twitter ──
  {
    slug: "hot_take",
    descriptionUpdate: "Single provocative tweet that sparks debate (71-100 chars)",
    patches: [
      { find: "under 280 characters", replace: "71-100 characters — short tweets get highest engagement on X" },
      { find: "No hashtags in the tweet itself", replace: "No hashtags in the tweet body\n- Keep it punchy — 71-100 chars is the sweet spot" },
      { find: '"notes": "expected reactions" }', replace: '"visual_direction": "companion image concept if applicable", "notes": "expected reactions" }' },
    ],
  },
  {
    slug: "viral_thread",
    patches: [
      { find: "Tweet 2-10: Each tweet delivers one insight, builds on the last", replace: "Tweet 2: MUST deliver the first insight immediately — no \"let me explain\" or context-setting\n- Tweets 3-10: Each tweet delivers one insight, builds on the last" },
      { find: "Use line breaks within tweets for readability\n- Each tweet should work as a standalone insight too", replace: "Use line breaks within tweets for readability\n- Each tweet should work as a standalone insight too\n- No hashtags in tweet body\n- Include a TLDR reply tweet at the end\n- Do NOT include external links in tweets (put in reply)" },
      { find: '"notes": "thread strategy" }', replace: '"visual_direction": "thread header image concept", "notes": "thread strategy + suggested TLDR reply" }' },
    ],
  },

  // ── Instagram ──
  {
    slug: "carousel_educational",
    patches: [
      { find: "Slide 1: Eye-catching title slide (thumbnail)", replace: "Slide 1: Eye-catching title slide (thumbnail) with swipe indicator" },
      { find: "Slides 2-9: One clear lesson per slide", replace: "Slide 2: MUST deliver the first key insight immediately — reward the swipe\n- Slides 3-9: One clear lesson per slide" },
      { find: "Each slide: bold headline (3-6 words) + supporting text (1-2 sentences)", replace: "Each slide: bold headline (3-6 words) + supporting text (1-2 sentences max)\n- Include page numbers (e.g., \"3/10\") on each slide\n- Optimize for DM sharing" },
    ],
  },
  {
    slug: "carousel_storytelling",
    patches: [
      { find: "Slide 1: Intriguing hook question or statement", replace: "Slide 1: Intriguing hook question or statement + swipe indicator" },
      { find: "Slides 2-9: Story unfolds with tension, insight, resolution", replace: "Slide 2: Begin the story immediately — reward the swipe\n- Slides 3-9: Story unfolds with tension, insight, resolution" },
      { find: "Conversational, human tone", replace: "Conversational, human tone\n- Include page numbers on each slide\n- Optimize for DM sharing" },
    ],
  },
  {
    slug: "single_image",
    patches: [
      { find: "First line: hook visible in feed preview", replace: "First 125 characters are visible before \"...more\" on mobile — treat this as your HEADLINE" },
      { find: "End: CTA (save, share, comment)", replace: "End: CTA (save, share, comment, tag someone)\n- Optimize for DM sharing" },
    ],
  },
  {
    slug: "reel_script",
    patches: [
      { find: "Include visual cues and transition notes\n- Suggest a trending sound if relevant", replace: "MANDATORY: Include text overlay for EVERY key point — 80%+ watch with sound off\n- Position text overlays in top-center (avoid bottom where caption/buttons overlap)\n- Include visual cues and transition notes\n- Must work completely with sound OFF\n- Suggest a trending sound" },
    ],
  },

  // ── TikTok ──
  {
    slug: "educational",
    descriptionUpdate: "30-60 second educational content script",
    patches: [
      { find: "60-90 second educational TikTok script", replace: "30-60 second educational TikTok script (completion rate drops hard after 60s)" },
      { find: "Teaching (15-70s): 3-5 clear points with examples", replace: "Teaching (10-45s): 2-3 clear points with examples (not 5 — keep it tight)" },
      { find: "Recap (70-90s): Quick summary + CTA", replace: "Recap (45-60s): Quick summary + CTA" },
      { find: "Include on-screen text for key points", replace: "MANDATORY: Text overlays for EVERY key point (80%+ watch on mute)\n- Position text in top-center of frame (avoid bottom/side button areas)\n- Write like a real person, NOT a narrator" },
    ],
  },
  {
    slug: "hook_video",
    patches: [
      { find: "Include on-screen text suggestions\n- Suggest a sound or trending audio", replace: "MANDATORY: Text overlays for every key point (80%+ watch on mute)\n- Position text in top-center (avoid bottom/side button areas)\n- Write the script like a real person talking, not a narrator\n- Suggest a sound or trending audio" },
    ],
  },

  // ── YouTube ──
  {
    slug: "long_form",
    patches: [
      { find: "Hook (0:00-0:30): Compelling opener", replace: "First 5 seconds: State the value proposition or pattern interrupt. NO channel intro, NO logo, NO \"welcome back.\"\n- If retention drops below 70% in first 30 seconds, algorithm stops promoting\n- Hook (0:00-0:30): Compelling opener that previews the value" },
    ],
  },

  // ── Facebook ──
  {
    slug: "short_post",
    descriptionUpdate: "Ultra-short Facebook post under 80 characters",
    patches: [
      { find: "under 500 characters — ideally under 80", replace: "under 80 characters — this is the #1 engagement sweet spot on Facebook" },
      { find: "Maximum impact in minimum words\n- Posts under 80 chars get 66% more engagement on Facebook\n- Can be a question, bold statement, or observation\n- Designed to stop the scroll", replace: "UNDER 80 CHARACTERS. Posts under 80 chars get 66% more engagement.\n- Maximum impact in minimum words\n- Questions drive 100% more comments than statements on Facebook\n- Designed to stop the scroll and spark comments\n- Do NOT include external links" },
    ],
  },

  // ── Memes ──
  {
    slug: "drake_format",
    patches: [
      { find: /Keep text under 15 words per panel/g, replace: "Keep text under 10 words per panel (under 7 is ideal)" },
    ],
  },
  {
    slug: "change_my_mind",
    patches: [
      { find: /Under 15 words on the sign/g, replace: "Under 10 words on the sign (brevity is critical for memes)" },
    ],
  },
  {
    slug: "custom_concept",
    patches: [
      { find: "Must be highly shareable and relatable to the target audience", replace: "Must be highly shareable and relatable to the target audience\n- Make the meme about the AUDIENCE'S daily experience, NOT about a product\n- Do NOT explain the joke. If it requires context, the concept isn't strong enough." },
    ],
  },
];

// Also patch all Instagram hashtag counts
const INSTAGRAM_HASHTAG_SLUGS = [
  "carousel_educational", "carousel_storytelling", "single_image",
  "reel_script", "reel_hook", "story_series", "caption_long", "caption_short",
];

for (const slug of INSTAGRAM_HASHTAG_SLUGS) {
  const existing = PATCHES.find(p => p.slug === slug);
  const hashtagPatch = { find: '"25 hashtags"', replace: '"10-15 hashtags, mix of large/medium/niche"' };
  if (existing) {
    existing.patches.push(hashtagPatch);
  } else {
    PATCHES.push({ slug, patches: [hashtagPatch] });
  }
}

// ─── Execution ──────────────────────────────────────────

async function updateTemplates() {
  console.log("Updating content templates with research-backed improvements...\n");

  const allTemplates = await db.query.contentTemplates.findMany();
  let updated = 0;
  let patched = 0;

  for (const template of allTemplates) {
    let prompt = template.promptTemplate;
    let description = template.description;
    let changed = false;

    // Apply slug-specific patches
    const patchSet = PATCHES.find(p => p.slug === template.slug);
    if (patchSet) {
      for (const patch of patchSet.patches) {
        const before = prompt;
        if (typeof patch.find === "string") {
          prompt = prompt.replace(patch.find, patch.replace);
        } else {
          prompt = prompt.replace(patch.find, patch.replace);
        }
        if (prompt !== before) {
          changed = true;
          patched++;
        }
      }
      if (patchSet.descriptionUpdate) {
        description = patchSet.descriptionUpdate;
        changed = true;
      }
    }

    // Universal: Ensure "visual_direction" is in Return JSON
    if (prompt.includes("Return JSON:") && !prompt.includes("visual_direction")) {
      prompt = prompt.replace(
        /("notes":\s*"[^"]*")\s*\}/,
        '$1, "visual_direction": "describe the ideal companion image: mood, colors, composition, subject matter" }'
      );
      changed = true;
    }

    // Universal: Ensure "cta" is in Return JSON
    if (prompt.includes("Return JSON:") && !prompt.includes('"cta"')) {
      prompt = prompt.replace(
        /("notes":\s*"[^"]*")\s*\}/,
        '$1, "cta": "specific, action-oriented call to action" }'
      );
      changed = true;
    }

    if (changed) {
      await db
        .update(contentTemplates)
        .set({ promptTemplate: prompt, description })
        .where(eq(contentTemplates.id, template.id));
      updated++;
      console.log(`  Updated: ${template.name} (${template.slug})`);
    } else {
      console.log(`  Skipped: ${template.name} (no changes needed)`);
    }
  }

  // Also update platform hashtag rules
  console.log("\nUpdating platform configs...");

  // Instagram hashtag rule
  const instagram = await db.query.platforms.findFirst({
    where: eq(platforms.slug, "instagram"),
  });
  if (instagram) {
    const config: PlatformConfig = {
      ...instagram.config,
      hashtagRules: "5-15 hashtags in caption, mix of large (1M+), medium (100K-1M), and niche (10K-100K)",
    };
    await db.update(platforms).set({ config }).where(eq(platforms.id, instagram.id));
    console.log("  Updated Instagram hashtag rules");
  }

  // X/Twitter hashtag rule
  const xTwitter = await db.query.platforms.findFirst({
    where: eq(platforms.slug, "x"),
  });
  if (xTwitter) {
    const config: PlatformConfig = {
      ...xTwitter.config,
      hashtagRules: "Do NOT use hashtags in tweet body except event-specific tags",
    };
    await db.update(platforms).set({ config }).where(eq(platforms.id, xTwitter.id));
    console.log("  Updated X/Twitter hashtag rules");
  }

  console.log(`\nDone! Updated ${updated}/${allTemplates.length} templates (${patched} individual patches applied).`);
  process.exit(0);
}

updateTemplates().catch((err) => {
  console.error("Update failed:", err);
  process.exit(1);
});
