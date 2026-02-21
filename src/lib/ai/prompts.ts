import type { ContentExtraction } from "@/lib/db/schema";

export const EXTRACTION_SYSTEM_PROMPT = `You are an expert content strategist specializing in social media content atomization. Your job is to analyze articles and extract structured data that can be used to generate platform-specific social media content.

Be thorough, specific, and actionable. Every extracted element should be directly usable for content creation.`;

export function buildExtractionPrompt(article: {
  title: string;
  content: string;
  pillar: string;
}): string {
  return `Analyze this article and extract structured content for social media repurposing.

## Article
Title: ${article.title}
Pillar/Category: ${article.pillar}

${article.content}

## Extract the following as JSON:

{
  "takeaways": [
    { "point": "concise key point", "detail": "1-2 sentence elaboration" }
  ],
  "quotes": [
    { "quote": "exact or near-exact quotable line from the article", "context": "why this quote matters" }
  ],
  "stats": [
    { "stat": "the specific data point or statistic", "source": "where it came from in the article" }
  ],
  "hooks": ["attention-grabbing opening lines for social posts"],
  "themes": ["3-5 main themes"],
  "audienceInsights": "who this content is for and what pain points it addresses",
  "emotionalAngles": ["emotional hooks that could resonate with the audience"]
}

Requirements:
- takeaways: 5-10 key points
- quotes: 10-15 quotable lines (must be faithful to the article)
- stats: extract ALL statistics, data points, and numbers mentioned
- hooks: 8-12 attention-grabbing openers for social media
- themes: 3-5 main themes
- audienceInsights: detailed paragraph
- emotionalAngles: 3-5 emotional angles`;
}

export function buildGenerationPrompt(
  template: {
    name: string;
    slug: string;
    promptTemplate: string;
    description: string;
  },
  extraction: ContentExtraction,
  source: {
    title: string;
    pillar: string;
    primaryHandle: string;
    canonicalUrl: string;
  },
  brandVoice: {
    voiceGuidelines: string;
    tone: string;
    vocabulary: { preferred: string[]; avoided: string[] };
  }
): string {
  let prompt = template.promptTemplate;

  // Replace template variables
  prompt = prompt.replace(/\{\{title\}\}/g, source.title);
  prompt = prompt.replace(/\{\{pillar\}\}/g, source.pillar);
  prompt = prompt.replace(/\{\{handle\}\}/g, source.primaryHandle || "@YourHandle");
  prompt = prompt.replace(/\{\{canonical_url\}\}/g, source.canonicalUrl || "");
  prompt = prompt.replace(/\{\{extraction\}\}/g, JSON.stringify(extraction));
  prompt = prompt.replace(
    /\{\{takeaways\}\}/g,
    extraction.takeaways.map((t) => `- ${t.point}: ${t.detail}`).join("\n")
  );
  prompt = prompt.replace(
    /\{\{quotes\}\}/g,
    extraction.quotes.map((q) => `"${q.quote}" — ${q.context}`).join("\n")
  );
  prompt = prompt.replace(
    /\{\{stats\}\}/g,
    extraction.stats.map((s) => `${s.stat} (${s.source})`).join("\n")
  );
  prompt = prompt.replace(/\{\{hooks\}\}/g, extraction.hooks.join("\n"));
  prompt = prompt.replace(/\{\{themes\}\}/g, extraction.themes.join(", "));
  prompt = prompt.replace(/\{\{audience\}\}/g, extraction.audienceInsights);
  prompt = prompt.replace(
    /\{\{emotional_angles\}\}/g,
    extraction.emotionalAngles.join(", ")
  );

  return prompt;
}

const PLATFORM_RULES: Record<string, string> = {
  LinkedIn: `## LinkedIn Best Practices
- Hook in first 210 characters (visible before "see more") — this is CRITICAL. Only 15-25% click "see more."
- Use short paragraphs (1-2 sentences), generous line breaks
- Sweet spot: 1,200-1,600 chars for thought leadership. Engagement peaks at ~1,300 chars.
- Carousels (PDF) get 2-3x more engagement than text posts — always include "visual_direction"
- Carousels: 8-12 slides, slide 1 = thumbnail hook, slide 2 = immediate value (NOT setup), last slide = CTA
- 3-5 hashtags at the bottom, mix of broad (#leadership) and niche (#seniorliving)
- Write in first person. Be opinionated. Take a stand.
- Do NOT include external links in the post body — reach drops 40-50%. Note: link goes in first comment.
- Do NOT end with just "Agree?" or "Thoughts?" — ask a SPECIFIC, answerable question.
## LinkedIn AVOID
- "I'm excited to announce", "In today's fast-paced world", corporate jargon
- Broetry (one sentence per line for 20+ lines) — algorithm deprioritizes this
- Mass-tagging more than 3-5 people
- Posting more than once per day`,

  "X/Twitter": `## X/Twitter Best Practices
- Single tweets: 71-100 chars get highest engagement. Front-load the value. No filler.
- Thread tweets: 200-260 chars (nearly full 280 but with breathing room)
- Tweet 1 is the HOOK — if it doesn't compel a click, the thread dies
- Tweet 2 MUST deliver the first insight immediately. No "let me explain" or context-setting.
- Threads: 7-12 tweets, each standalone valuable
- Final tweet: CTA + summary. Include a TLDR reply tweet suggestion.
- Do NOT use hashtags in tweet body (except event-specific). Hashtags look spammy on X.
- Do NOT include external links in tweets — reach is suppressed. Links go in the reply.
- Short, punchy sentences. Every word earns its place.
## X/Twitter AVOID
- Threads that don't pay off tweet 1's promise
- "Like = agree, RT = disagree" engagement bait (flagged by algorithm)
- Long tweets without line breaks
- Posting links without commentary`,

  Instagram: `## Instagram Best Practices
- VISUAL-FIRST: Every post MUST have a compelling image/carousel concept
- First 125 characters of caption are visible before "...more" on mobile — treat this as your HEADLINE
- Carousels are the #1 format: 1.4x more reach, 3.1x more engagement than single images
- Carousels: 8-10 slides. Slide 1 = bold title + swipe indicator. Slide 2 = immediate value. Last = CTA.
- Reels: Hook in first 1.5 seconds. Pattern interrupt. Bold text overlay. Must work with SOUND OFF.
- 5-15 hashtags (mix of: 2-3 large 1M+, 3-5 medium 100K-1M, 3-5 niche 10K-100K)
- DM shares are the #1 engagement signal — create content people want to forward to a colleague
- CTA: "Save for later", "Share with someone who needs this", "Tag someone"
## Instagram AVOID
- More than 15 hashtags (the 30-hashtag era is over)
- Single image posts without a caption strategy
- Reels with a TikTok watermark (Instagram suppresses these)
- Same hashtags on every post (flagged as spam)`,

  TikTok: `## TikTok Best Practices
- HOOK IN FIRST 1-3 SECONDS or you lose them. Pattern interrupt is everything.
- Educational content: 30-60 seconds is the sweet spot. Completion rate drops after 60s.
- Text overlays are MANDATORY — 80%+ watch on mute. Position text in TOP-CENTER (avoid bottom/sides where buttons are).
- Trending sounds boost reach 3-5x. Always suggest a sound category.
- Script structure: HOOK (0-3s) → VALUE (3-45s) → CTA (last 5s)
- Write scripts that sound like a real person, not a narrator. Over-produced content fails.
- B2B on TikTok: be human, not corporate. Humor > polish.
## TikTok AVOID
- Slow intros. No logos, no "hey guys," no throat-clearing.
- Landscape video — TikTok is vertical (9:16) ONLY
- Directly promotional content — value-first, not product-first
- Content that looks like it was made for a different platform`,

  YouTube: `## YouTube Best Practices
- Thumbnail is 80% of the click: face with expression + 3-5 words MAX + one visual element. Must be readable at phone size.
- Title: Under 60 chars (40-50 ideal). Front-load value. Include primary SEO keyword.
- First 5 seconds must state the value proposition or create a pattern interrupt. NO channel intros, NO logos, NO "welcome back."
- If retention drops below 70% in first 30 seconds, algorithm stops promoting the video.
- Shorts: Vertical, 30-45s sweet spot, hook in first 2 seconds, text overlay required
- Description: First 200 chars = SEO-optimized summary. Include timestamps for Google key moments.
- Pinned comment = engagement goldmine. Ask a specific question.
## YouTube AVOID
- Clickbait that doesn't deliver (satisfaction signals tank your channel)
- Bad audio quality — viewers tolerate bad video before bad audio
- Long intros — get to value within 30 seconds
- No chapters/timestamps — always include them`,

  Facebook: `## Facebook Best Practices
- Posts under 80 characters get 66% more engagement — brevity is power on Facebook
- Questions drive 100% more comments than statements
- Native video gets 135% more reach than photo posts. Reels get 2-5x more than standard video.
- Group posts get 5-10x more organic reach than Page posts
- Design video for autoplay with sound off — first 3 seconds must have text overlay
- 1-3 hashtags MAX (more hurts reach on Facebook)
- Do NOT include external links as the main post — worst organic reach format
## Facebook AVOID
- External link posts (lowest reach on Facebook)
- Engagement bait patterns ("Like if you agree") — algorithm penalizes
- Cross-posting Instagram content directly (different audience, different conventions)
- More than 1-2 posts per day on a Page`,

  Memes: `## Meme Best Practices
- RELATABILITY is king — the audience must see themselves instantly
- Keep text SHORT: under 10 words per panel/section. Under 7 is ideal.
- Industry-specific memes build community and get shared in DMs
- The best B2B memes make people screenshot and send to coworkers in Slack
- Make memes about the AUDIENCE'S daily experience, NOT about a product
- Do NOT explain the joke. If it requires context to be funny, the concept isn't strong enough.
- Test: "Would someone share this in a work Slack channel?" If yes, it's good.
## Meme AVOID
- Making the meme about a product — make it about the audience's life
- Explaining the joke
- Using outdated formats dead for 2+ years
- More than 10 words per panel (kills the humor)`,
};

const PLATFORM_CTA_STRATEGY: Record<string, string> = {
  LinkedIn: `On LinkedIn, NEVER paste a URL in the post body — it triggers a 40-50% reach penalty.
The link goes in the FIRST COMMENT after publishing. Write the CTA to direct readers there:
- Good: "Full breakdown in the first comment 👇", "Link to the original article is in the comments", "Grab the full guide — first comment below"
- Never write a URL in the primaryContent or cta field. If you reference a link, say "first comment" or "comments section".`,

  "X/Twitter": `On X/Twitter, links in tweets suppress reach significantly.
The link goes in a REPLY TO YOUR OWN TWEET after posting. Write the CTA for this:
- Good: "Link in the reply below 👇", "Full article in the thread reply", "Dropping the link in my reply"
- Never paste a URL in any tweet text. The "cta" field should reference "the reply" or "thread" not a URL.`,

  Instagram: `On Instagram, NEVER paste URLs in captions — they are not clickable anyway.
All link CTAs use "Link in bio" or "Link in profile":
- Good: "Link in bio for the full breakdown 🔗", "Save this post + check the link in bio", "Full article in my bio link"
- Never write a URL in the caption. "Link in bio" is the only link CTA that works on Instagram.`,

  TikTok: `On TikTok, external links in video descriptions are suppressed unless you have 1K+ followers.
All link CTAs use "Link in bio":
- Good: "Link in bio for more", "Check the link in my bio 🔗", "Full guide in bio"
- Never paste a URL in the script or description. TikTok suppresses posts with external links.`,

  YouTube: `On YouTube, the URL belongs in the video description and the pinned first comment.
Write CTAs that reference both:
- Good: "Link in the description below", "Full resource linked in description + pinned comment", "Check description for the article"
- The "cta" field should say "link in description" — never expect the viewer to type a URL.`,

  Facebook: `On Facebook, link posts (posts with a URL preview) have the worst organic reach.
For engagement posts: no link in the post body. Reference it conversationally if needed ("dropped the link in the comments").
For link-share posts: the URL goes directly in the post, Facebook generates the preview automatically.
Decide based on the template — engagement/comment posts → "link in comments", share posts → URL is fine.`,

  Memes: `Memes should NEVER contain links. Zero. The goal is shareability, not traffic.
No CTA with a link — the only acceptable CTAs are:
- "Tag someone who needs this"
- "Share to your team"
- "Save this"
The "cta" field should be one of these share-focused CTAs. No URLs, no "link in bio".`,

  default: `Include a link only if the platform natively supports clickable links in posts.
For platforms that suppress links, reference where the link can be found (bio, comments, description).`,
};

export function buildGenerationSystemPrompt(
  platformName: string,
  brandVoice: {
    voiceGuidelines: string;
    tone: string;
    vocabulary: { preferred: string[]; avoided: string[] };
  }
): string {
  const parts = [
    `You are an elite ${platformName} content creator who understands what actually performs on this platform. Generate high-quality, platform-native content that feels authentic — not AI-generated. Every piece must stop the scroll, deliver real value, and drive engagement.

## AUTHENTICITY — Sound Human, Not AI
NEVER use these AI-tell phrases: "In today's fast-paced world", "It's no secret that", "At the end of the day", "Let's dive in", "Here's the thing", "Game-changer", "Landscape", "Leverage", "Synergy", "Disrupt", "Deep dive", "Move the needle", "Circle back", "Low-hanging fruit", "Excited to share".
Write as a real human with genuine opinions and specific experiences. Be conversational, slightly imperfect, and opinionated.

## SHAREABILITY — Optimize for Forwards/DMs
Create content people want to forward to a colleague because it:
- Signals something about the sharer's identity ("I'm the kind of person who thinks about this")
- Helps someone they know ("This would be useful for my coworker")
- Captures a shared frustration or experience ("This is SO our industry")
Shares/DM-forwards are the #1 engagement signal on most platforms in 2025.`,
  ];

  // Platform-specific rules
  const platformKey = Object.keys(PLATFORM_RULES).find(
    (k) =>
      platformName.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(platformName.toLowerCase())
  );
  if (platformKey) {
    parts.push(PLATFORM_RULES[platformKey]);
  }

  // Platform-specific link/CTA placement strategy
  const ctaStrategy = PLATFORM_CTA_STRATEGY[platformKey ?? ""] ?? PLATFORM_CTA_STRATEGY.default;
  parts.push(`## Link & CTA Placement Strategy\n${ctaStrategy}`);

  // Mandatory CTA requirement
  parts.push(`## MANDATORY: Strong Call-to-Action
EVERY piece of content MUST include a compelling CTA in the "cta" field. Not generic — specific and action-oriented.
Good CTAs: "Save this for your next strategy meeting 🔖", "Tag a colleague who needs to hear this", "Comment your biggest challenge with [topic]"
BAD CTAs: "Let me know what you think", "Leave a comment", "Follow for more"
The CTA should match the platform and content type AND the link placement strategy above.`);

  if (brandVoice.voiceGuidelines) {
    parts.push(`## Brand Voice\n${brandVoice.voiceGuidelines}`);
  }
  if (brandVoice.tone) {
    parts.push(`## Tone\n${brandVoice.tone}`);
  }
  if (brandVoice.vocabulary.preferred.length) {
    parts.push(
      `## Preferred Vocabulary\nUse these words/phrases when appropriate: ${brandVoice.vocabulary.preferred.join(", ")}`
    );
  }
  if (brandVoice.vocabulary.avoided.length) {
    parts.push(
      `## Avoid\nNever use these words/phrases: ${brandVoice.vocabulary.avoided.join(", ")}`
    );
  }

  parts.push(
    "Respond with valid JSON only. No markdown fences, no explanation — just the JSON."
  );

  return parts.join("\n\n");
}
