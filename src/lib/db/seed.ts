import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  brandProfiles,
  platforms,
  contentTemplates,
} from "./schema";
import type { PlatformConfig } from "./schema";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

// ─── Platform Definitions ────────────────────────────────

const PLATFORMS: {
  name: string;
  slug: string;
  icon: string;
  config: PlatformConfig;
  sortOrder: number;
}[] = [
  {
    name: "LinkedIn",
    slug: "linkedin",
    icon: "linkedin",
    config: {
      charLimits: { post: 3000, comment: 1250, article: 120000 },
      formats: ["text", "carousel", "poll", "article", "video"],
      bestPractices: [
        "Use line breaks for readability",
        "Start with a hook in first 2 lines",
        "Include 3-5 relevant hashtags at bottom",
        "Tag relevant people when appropriate",
      ],
      hashtagRules: "3-5 hashtags at end of post, mix broad and niche",
    },
    sortOrder: 0,
  },
  {
    name: "X/Twitter",
    slug: "x",
    icon: "twitter",
    config: {
      charLimits: { tweet: 280, thread_tweet: 280, article: 25000 },
      formats: ["tweet", "thread", "poll", "article", "spaces"],
      bestPractices: [
        "Front-load value in first tweet",
        "Use thread format for depth",
        "Engage in replies within first hour",
        "Use 1-2 hashtags max",
      ],
      hashtagRules: "Do NOT use hashtags in tweet body except event-specific tags",
    },
    sortOrder: 1,
  },
  {
    name: "Instagram",
    slug: "instagram",
    icon: "instagram",
    config: {
      charLimits: { caption: 2200, reel_caption: 2200, bio: 150 },
      formats: ["post", "carousel", "reel", "story", "live"],
      bestPractices: [
        "Visual-first — every post needs a strong image concept",
        "First line of caption is the hook (visible before 'more')",
        "20-30 hashtags in first comment or end of caption",
        "Use line breaks and emojis for readability",
      ],
      hashtagRules: "5-15 hashtags in caption, mix of large (1M+), medium (100K-1M), and niche (10K-100K)",
    },
    sortOrder: 2,
  },
  {
    name: "TikTok",
    slug: "tiktok",
    icon: "tiktok",
    config: {
      charLimits: { caption: 2200, comment: 150 },
      formats: ["video", "duet", "stitch", "live", "photo"],
      bestPractices: [
        "Hook in first 1-3 seconds is critical",
        "Use trending sounds when relevant",
        "Keep educational content under 90 seconds",
        "End with a call to action or cliffhanger",
      ],
      hashtagRules: "3-5 hashtags, include 1-2 trending + niche",
    },
    sortOrder: 3,
  },
  {
    name: "YouTube",
    slug: "youtube",
    icon: "youtube",
    config: {
      charLimits: {
        title: 100,
        description: 5000,
        comment: 10000,
        shorts_caption: 100,
      },
      formats: ["long_form", "shorts", "community", "live"],
      bestPractices: [
        "SEO-optimize titles and descriptions",
        "First 200 chars of description are most important",
        "Use timestamps for long-form content",
        "Pinned comment drives engagement",
      ],
      hashtagRules: "3-5 hashtags in description, include in tags",
    },
    sortOrder: 4,
  },
  {
    name: "Facebook",
    slug: "facebook",
    icon: "facebook",
    config: {
      charLimits: { post: 63206, comment: 8000 },
      formats: ["post", "reel", "live", "event", "group_post"],
      bestPractices: [
        "Questions drive 100% more comments",
        "Native video outperforms links",
        "Group posts get higher organic reach",
        "Shorter posts (under 80 chars) get 66% more engagement",
      ],
      hashtagRules: "1-3 hashtags only, more hurts reach",
    },
    sortOrder: 5,
  },
  {
    name: "Memes",
    slug: "memes",
    icon: "smile",
    config: {
      charLimits: { top_text: 100, bottom_text: 100 },
      formats: ["image_macro", "multi_panel", "custom"],
      bestPractices: [
        "Relatability is king — audience must see themselves",
        "Keep text short and punchy",
        "Reference current cultural moments when possible",
        "Industry-specific memes build community",
      ],
      hashtagRules: "Platform-dependent, follow parent platform rules",
    },
    sortOrder: 6,
  },
];

// ─── Template Definitions ────────────────────────────────

type TemplateDef = {
  name: string;
  slug: string;
  description: string;
  funnelStage: "tofu" | "mofu" | "bofu";
  promptTemplate: string;
  sortOrder: number;
};

function linkedInTemplates(): TemplateDef[] {
  return [
    {
      name: "Thought Leadership",
      slug: "thought_leadership",
      description: "Deep-dive LinkedIn post with personal insights (1200-1600 chars)",
      funnelStage: "tofu",
      promptTemplate: `Create a thought leadership LinkedIn post (1200-1600 characters — engagement peaks at ~1300).

## Source Material
Title: {{title}}
Pillar: {{pillar}}
Handle: {{handle}}

Key Takeaways:
{{takeaways}}

Themes: {{themes}}
Audience: {{audience}}

## Requirements
- Start with a bold, counterintuitive hook in the first 210 characters (visible before "see more")
- Share a personal perspective or learned insight
- Use short paragraphs (1-2 sentences each) with line breaks
- Include a specific example or data point from the article
- End with a SPECIFIC question (not "Agree?" or "Thoughts?" — ask something answerable)
- Write in first person, conversational but authoritative tone
- Do NOT include any external links in the post body (link goes in first comment)

Return JSON: { "content": "the full post text", "headlines": ["3 alternative hook lines"], "hashtags": ["5 relevant hashtags"], "cta": "specific call to action", "visual_direction": "describe the ideal companion image: mood, colors, composition, subject", "notes": "posting tips" }`,
      sortOrder: 0,
    },
    {
      name: "Story Post",
      slug: "story_post",
      description: "Narrative format with relatable story (1200-1500 chars)",
      funnelStage: "mofu",
      promptTemplate: `Create a narrative LinkedIn story post (1200-1500 characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}} | Handle: {{handle}}

Key Quotes:
{{quotes}}

Emotional Angles: {{emotional_angles}}
Audience: {{audience}}

## Requirements
- Open with "I" + a specific moment, observation, or experience
- Build a narrative arc: setup → tension → insight → takeaway
- Make it feel like a real story, not a content piece
- Connect the personal story to a broader professional lesson
- End with a single powerful takeaway line

Return JSON: { "content": "the full post text", "headlines": ["3 hook options"], "hashtags": ["5 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 1,
    },
    {
      name: "Contrarian Take",
      slug: "contrarian_take",
      description: "Bold perspective challenging conventional wisdom (800-1200 chars)",
      funnelStage: "tofu",
      promptTemplate: `Create a contrarian take LinkedIn post (800-1200 characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Hooks: {{hooks}}
Themes: {{themes}}

## Requirements
- Open with a bold, contrarian statement that challenges industry consensus
- Back it up with evidence or logic from the article
- Acknowledge the opposing view fairly
- Deliver a punchline insight
- This should feel brave but not reckless

Return JSON: { "content": "the full post text", "headlines": ["3 contrarian opener options"], "hashtags": ["5 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 2,
    },
    {
      name: "Data Spotlight",
      slug: "data_spotlight",
      description: "Lead with a compelling statistic (600-1000 chars)",
      funnelStage: "tofu",
      promptTemplate: `Create a data-driven LinkedIn post (600-1000 characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Statistics: {{stats}}
Takeaways: {{takeaways}}

## Requirements
- Open with the most surprising or impactful statistic
- Provide context for why this number matters
- Connect to a practical implication for the reader
- Keep it concise and scannable
- End with a question or reflection

Return JSON: { "content": "the full post text", "headlines": ["3 stat-led hooks"], "hashtags": ["5 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 3,
    },
    {
      name: "Listicle",
      slug: "listicle",
      description: "Numbered insights format (1000-1400 chars)",
      funnelStage: "tofu",
      promptTemplate: `Create a numbered listicle LinkedIn post (1000-1400 characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Themes: {{themes}}

## Requirements
- Open with a hook line + "Here's what I've learned:" or similar
- 5-7 numbered points, each 1-2 sentences
- Each point should deliver standalone value
- Use a mix of practical tips and mindset shifts
- End with a bonus insight or invitation to discuss

Return JSON: { "content": "the full post text", "headlines": ["3 hook options"], "hashtags": ["5 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 4,
    },
    {
      name: "Question Post",
      slug: "question_post",
      description: "Opens with a provocative question (600-800 chars)",
      funnelStage: "tofu",
      promptTemplate: `Create a question-led LinkedIn post (600-800 characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Hooks: {{hooks}}
Audience: {{audience}}

## Requirements
- Open with a genuinely thought-provoking question
- Provide 2-3 sentences of context or your initial take
- Invite specific types of responses
- Keep it short to encourage commenting

Return JSON: { "content": "the full post text", "headlines": ["3 question variations"], "hashtags": ["4 hashtags"], "cta": "engagement prompt", "notes": "" }`,
      sortOrder: 5,
    },
    {
      name: "Carousel Outline",
      slug: "carousel_outline",
      description: "10-slide LinkedIn carousel concept",
      funnelStage: "mofu",
      promptTemplate: `Create a 10-slide LinkedIn carousel concept.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Statistics: {{stats}}

## Requirements
- Slide 1: Bold headline + hook (this is the thumbnail)
- Slides 2-9: One key insight per slide with a short explanation
- Slide 10: Summary + CTA
- Each slide: headline (5-8 words) + body (2-3 sentences max)
- Design for visual clarity — minimal text per slide

Return JSON: { "content": "carousel summary", "slides": [{"title": "slide headline", "body": "slide content"}], "headlines": ["3 carousel title options"], "hashtags": ["5 hashtags"], "cta": "final slide CTA", "visual_direction": "design style notes" }`,
      sortOrder: 6,
    },
    {
      name: "Poll Concept",
      slug: "poll_concept",
      description: "Engaging LinkedIn poll with 4 options",
      funnelStage: "bofu",
      promptTemplate: `Create a LinkedIn poll concept.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Themes: {{themes}}
Audience: {{audience}}

## Requirements
- Write a compelling poll question related to the article's core theme
- 4 answer options that are distinct, interesting, and non-obvious
- Include context text (2-3 sentences) to set up the poll
- The poll should spark debate and drive comments

Return JSON: { "content": "poll context text", "headlines": ["the poll question"], "hashtags": ["4 hashtags"], "cta": "comment prompt", "notes": "poll_options: option1 | option2 | option3 | option4" }`,
      sortOrder: 7,
    },
  ];
}

function xTemplates(): TemplateDef[] {
  return [
    {
      name: "Viral Thread",
      slug: "viral_thread",
      description: "8-12 tweet thread optimized for engagement",
      funnelStage: "tofu",
      promptTemplate: `Create a viral X/Twitter thread (8-12 tweets, each under 280 characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}} | Handle: {{handle}}
Takeaways: {{takeaways}}
Hooks: {{hooks}}
Stats: {{stats}}

## Requirements
- Tweet 1: Irresistible hook that demands the reader click "Show thread"
- Tweet 2: MUST deliver the first insight immediately — no "let me explain" or context-setting
- Tweets 3-10: Each tweet delivers one insight, builds on the last
- Final tweet: Summary + CTA (follow, repost tweet 1, bookmark)
- Use line breaks within tweets for readability
- Each tweet should work as a standalone insight too
- No hashtags in tweet body
- Include a TLDR reply tweet at the end
- Do NOT include external links in tweets (put in reply)

Return JSON: { "content": "thread summary", "tweets": ["tweet 1 text", "tweet 2 text", ...], "hashtags": ["2 hashtags"], "cta": "final tweet CTA", "visual_direction": "thread header image concept", "notes": "thread strategy + suggested TLDR reply" }`,
      sortOrder: 0,
    },
    {
      name: "Hot Take",
      slug: "hot_take",
      description: "Single provocative tweet that sparks debate (71-100 chars)",
      funnelStage: "tofu",
      promptTemplate: `Create a hot take tweet (71-100 characters — short tweets get highest engagement on X).

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Themes: {{themes}}

## Requirements
- Bold, opinionated statement that people will agree OR disagree with
- Should feel authentic, not clickbait
- Designed to drive quote tweets and replies
- No hashtags in the tweet body
- Keep it punchy — 71-100 chars is the sweet spot

Return JSON: { "content": "the tweet text", "headlines": ["3 variations"], "hashtags": ["2 hashtags for reply"], "cta": "", "visual_direction": "companion image concept if applicable", "notes": "expected reactions" }`,
      sortOrder: 1,
    },
    {
      name: "Stat Bomb",
      slug: "stat_bomb",
      description: "Data-driven tweet with visual hook",
      funnelStage: "tofu",
      promptTemplate: `Create a stat-driven tweet (under 280 characters).

## Source Material
Title: {{title}} | Stats: {{stats}}

## Requirements
- Lead with the most surprising number
- Add context in 1 sentence
- End with implication or question
- Format the number prominently

Return JSON: { "content": "the tweet text", "headlines": ["3 stat-led variations"], "hashtags": ["2 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 2,
    },
    {
      name: "Quote Tweet",
      slug: "quote_tweet",
      description: "Engagement-sparking quote-style tweet",
      funnelStage: "mofu",
      promptTemplate: `Create a quote-tweet style post (under 280 characters).

## Source Material
Title: {{title}} | Quotes: {{quotes}}

## Requirements
- Pull the most compelling quote or insight from the article
- Add a brief personal reaction or amplification
- Designed to feel like you're reacting to breaking news or a fresh insight

Return JSON: { "content": "the tweet text", "headlines": ["3 options"], "hashtags": ["2 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 3,
    },
    {
      name: "Poll Tweet",
      slug: "poll_tweet",
      description: "Engagement-focused X poll",
      funnelStage: "bofu",
      promptTemplate: `Create an X/Twitter poll.

## Source Material
Title: {{title}} | Themes: {{themes}} | Audience: {{audience}}

## Requirements
- Question under 280 characters that relates to the article's theme
- 4 answer options (each under 25 characters)
- Should be genuinely debatable

Return JSON: { "content": "poll question", "headlines": ["question variations"], "hashtags": [], "cta": "", "notes": "poll_options: opt1 | opt2 | opt3 | opt4" }`,
      sortOrder: 4,
    },
    {
      name: "Thread Hook",
      slug: "thread_hook",
      description: "Compelling thread opener designed to maximize clicks",
      funnelStage: "tofu",
      promptTemplate: `Create 5 thread hook options (each under 280 characters).

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Stats: {{stats}}

## Requirements
- Each hook should make people NEED to read the thread
- Use patterns: "I spent X doing Y. Here's what I learned:", numbers, bold claims
- Vary the styles: curiosity gap, authority, controversy, storytelling

Return JSON: { "content": "best hook option", "headlines": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"], "hashtags": [], "cta": "", "notes": "hook strategy notes" }`,
      sortOrder: 5,
    },
    {
      name: "Reply Bait",
      slug: "reply_bait",
      description: "Tweet designed to drive replies and comments",
      funnelStage: "bofu",
      promptTemplate: `Create a reply-bait tweet (under 280 characters).

## Source Material
Title: {{title}} | Themes: {{themes}} | Emotional Angles: {{emotional_angles}}

## Requirements
- A tweet that people can't resist replying to
- Use patterns: "Wrong answers only:", "Unpopular opinion:", fill-in-the-blank, either/or
- Related to the article's topic but accessible to a broad audience

Return JSON: { "content": "the tweet text", "headlines": ["3 variations"], "hashtags": [], "cta": "", "notes": "" }`,
      sortOrder: 6,
    },
    {
      name: "X Article",
      slug: "x_article",
      description: "Long-form X article (1500-2500 chars)",
      funnelStage: "mofu",
      promptTemplate: `Create a long-form X article (1500-2500 characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Quotes: {{quotes}}
Stats: {{stats}}

## Requirements
- Headline that works in X's article format
- Structured with subheadings
- Key insights from the source material
- More depth than a thread but concise
- End with a clear takeaway

Return JSON: { "content": "the full article text", "headlines": ["3 title options"], "hashtags": ["3 hashtags"], "cta": "article CTA", "notes": "" }`,
      sortOrder: 7,
    },
  ];
}

function instagramTemplates(): TemplateDef[] {
  return [
    {
      name: "Educational Carousel",
      slug: "carousel_educational",
      description: "10-slide educational carousel with practical takeaways",
      funnelStage: "mofu",
      promptTemplate: `Create a 10-slide Instagram educational carousel.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Stats: {{stats}}

## Requirements
- Slide 1: Eye-catching title slide (thumbnail) with swipe indicator (→ or "Swipe")
- Slide 2: MUST deliver the first key insight immediately — reward the swipe, don't waste it on context
- Slides 3-9: One clear lesson per slide, easy to understand visually
- Slide 10: Summary + follow CTA + "Save this post"
- Each slide: bold headline (3-6 words) + supporting text (1-2 sentences max)
- Include page numbers (e.g., "3/10") on each slide
- Aspect ratio: 4:5 (portrait) for maximum feed real estate
- Optimize for DM sharing — make content people want to forward to a colleague

Return JSON: { "content": "carousel summary", "slides": [{"title": "headline", "body": "supporting text"}], "headlines": ["3 title options"], "hashtags": ["10-15 hashtags, mix of large/medium/niche"], "cta": "follow CTA", "visual_direction": "design notes including color palette and typography", "notes": "" }`,
      sortOrder: 0,
    },
    {
      name: "Storytelling Carousel",
      slug: "carousel_storytelling",
      description: "Visual story format carousel",
      funnelStage: "mofu",
      promptTemplate: `Create a 10-slide storytelling Instagram carousel.

## Source Material
Title: {{title}} | Quotes: {{quotes}} | Emotional Angles: {{emotional_angles}}

## Requirements
- Build a narrative arc across slides
- Slide 1: Intriguing hook question or statement + swipe indicator
- Slide 2: Begin the story immediately — reward the swipe
- Slides 3-9: Story unfolds with tension, insight, resolution
- Slide 10: Powerful conclusion + save/share CTA + "Share with someone who needs this"
- Conversational, human tone
- Include page numbers on each slide
- Optimize for DM sharing

Return JSON: { "content": "story summary", "slides": [{"title": "headline", "body": "text"}], "headlines": ["3 title options"], "hashtags": ["10-15 hashtags, mix of large/medium/niche"], "cta": "CTA", "visual_direction": "design notes including mood and color palette", "notes": "" }`,
      sortOrder: 1,
    },
    {
      name: "Single Image Post",
      slug: "single_image",
      description: "Caption for a powerful single image post",
      funnelStage: "tofu",
      promptTemplate: `Create an Instagram single image post caption (800-1500 characters).

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Themes: {{themes}}

## Requirements
- First 125 characters are visible before "...more" on mobile — treat this as your HEADLINE. Make it irresistible.
- Body: share insight, story, or value with line breaks for readability
- End: CTA (save, share, comment, tag someone)
- Include detailed image concept
- Optimize for DM sharing — make people want to forward this to a colleague

Return JSON: { "content": "the caption", "headlines": ["3 hook first lines (under 125 chars each)"], "hashtags": ["10-15 hashtags, mix of large/medium/niche"], "cta": "specific engagement CTA", "visual_direction": "detailed image concept: mood, colors, composition, subject matter", "notes": "" }`,
      sortOrder: 2,
    },
    {
      name: "Reel Script",
      slug: "reel_script",
      description: "30-60 second Instagram Reel script",
      funnelStage: "tofu",
      promptTemplate: `Create a 30-60 second Instagram Reel script.

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Takeaways: {{takeaways}}

## Requirements
- HOOK (0-3s): Pattern interrupt that stops the scroll
- BODY (3-45s): Deliver 1-3 key insights with visual transitions
- CTA (45-60s): Follow, save, or comment prompt
- MANDATORY: Include text overlay for EVERY key point — 80%+ watch with sound off
- Position text overlays in top-center (avoid bottom where caption/buttons overlap)
- Include visual cues and transition notes
- Must work completely with sound OFF
- Suggest a trending sound

Return JSON: { "content": "caption text", "hook": "the opening hook line", "script": "full script with [VISUAL CUE] and [TEXT OVERLAY] markers", "headlines": ["3 hook options"], "hashtags": ["10-15 hashtags, mix of large/medium/niche"], "cta": "specific CTA", "visual_direction": "visual notes + text overlay positioning", "sound_suggestion": "sound idea", "notes": "" }`,
      sortOrder: 3,
    },
    {
      name: "Reel Hook",
      slug: "reel_hook",
      description: "Pattern-interrupt Reel opener (first 3 seconds)",
      funnelStage: "tofu",
      promptTemplate: `Create 5 Instagram Reel hook options (first 3 seconds).

## Source Material
Title: {{title}} | Hooks: {{hooks}}

## Requirements
- Each hook must stop someone mid-scroll in under 3 seconds
- Mix styles: question, bold claim, "wait for it", controversial, relatable
- Include visual action for each (what's happening on screen)

Return JSON: { "content": "best hook", "headlines": ["hook 1", "hook 2", "hook 3", "hook 4", "hook 5"], "hashtags": [], "cta": "", "visual_direction": "visual action per hook", "notes": "" }`,
      sortOrder: 4,
    },
    {
      name: "Story Series",
      slug: "story_series",
      description: "5-7 Instagram Story sequence outline",
      funnelStage: "tofu",
      promptTemplate: `Create a 5-7 slide Instagram Story series.

## Source Material
Title: {{title}} | Takeaways: {{takeaways}} | Themes: {{themes}}

## Requirements
- Story 1: Hook question or bold statement + poll/quiz sticker
- Stories 2-5: Key insights, one per story
- Story 6: Summary or "hot take"
- Story 7: CTA (link, DM, see post)
- Use interactive elements: polls, quizzes, sliders, questions

Return JSON: { "content": "series summary", "slides": [{"title": "story label", "body": "content + interactive element"}], "headlines": ["series title"], "hashtags": [], "cta": "final story CTA", "visual_direction": "design notes", "notes": "" }`,
      sortOrder: 5,
    },
    {
      name: "Long Caption",
      slug: "caption_long",
      description: "Detailed caption with hooks (2000+ chars)",
      funnelStage: "mofu",
      promptTemplate: `Create a long Instagram caption (2000+ characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Quotes: {{quotes}}
Audience: {{audience}}

## Requirements
- First line: irresistible hook (visible before "more")
- Share value: insights, lessons, or story from the article
- Use line breaks and spacing for readability
- Personal and conversational tone
- End with engagement CTA + hashtags

Return JSON: { "content": "the full caption", "headlines": ["3 first-line hooks"], "hashtags": ["10-15 hashtags, mix of large/medium/niche"], "cta": "engagement CTA", "notes": "" }`,
      sortOrder: 6,
    },
    {
      name: "Short Caption",
      slug: "caption_short",
      description: "Punchy caption under 500 characters",
      funnelStage: "tofu",
      promptTemplate: `Create a short, punchy Instagram caption (under 500 characters).

## Source Material
Title: {{title}} | Hooks: {{hooks}}

## Requirements
- Sharp, memorable, share-worthy
- 1-3 sentences max
- Can be a quote, question, bold statement, or mic-drop insight
- Include image/visual concept suggestion

Return JSON: { "content": "the caption", "headlines": ["3 options"], "hashtags": ["10-15 hashtags, mix of large/medium/niche"], "cta": "", "visual_direction": "image concept", "notes": "" }`,
      sortOrder: 7,
    },
  ];
}

function tiktokTemplates(): TemplateDef[] {
  return [
    {
      name: "Hook Video",
      slug: "hook_video",
      description: "15-30 second hook-focused video script",
      funnelStage: "tofu",
      promptTemplate: `Create a 15-30 second TikTok hook video script.

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Stats: {{stats}}

## Requirements
- HOOK (0-3s): Stop the scroll immediately — pattern interrupt
- BODY (3-25s): Rapid-fire delivery of 1-2 key insights
- CTA (25-30s): Follow for more / comment your take
- MANDATORY: Text overlays for every key point (80%+ watch on mute)
- Position text in top-center (avoid bottom/side button areas)
- Write the script like a real person talking, not a narrator
- Suggest a sound or trending audio

Return JSON: { "content": "caption text", "hook": "the opening hook", "script": "full script with [TEXT OVERLAY] and [VISUAL CUE] markers", "hashtags": ["5 hashtags"], "cta": "CTA", "visual_direction": "on-screen text content + positioning", "sound_suggestion": "audio idea", "notes": "" }`,
      sortOrder: 0,
    },
    {
      name: "Educational",
      slug: "educational",
      description: "30-60 second educational content script",
      funnelStage: "mofu",
      promptTemplate: `Create a 30-60 second educational TikTok script (completion rate drops hard after 60s).

## Source Material
Title: {{title}} | Takeaways: {{takeaways}} | Stats: {{stats}}

## Requirements
- Hook (0-3s): "Here's something most people don't know about..."
- Setup (3-10s): Frame the problem or question
- Teaching (10-45s): 2-3 clear points with examples (not 5 — keep it tight)
- Recap (45-60s): Quick summary + CTA
- Conversational, fast-paced delivery — sound like a real person, NOT a narrator
- MANDATORY: Text overlays for EVERY key point (80%+ watch on mute)
- Position text in top-center of frame (avoid bottom/side button areas)

Return JSON: { "content": "caption text", "hook": "opening hook", "script": "full script with [TEXT OVERLAY] and [VISUAL CUE] markers", "hashtags": ["5 hashtags"], "cta": "CTA", "visual_direction": "visual notes + text overlay content and positioning", "sound_suggestion": "", "notes": "" }`,
      sortOrder: 1,
    },
    {
      name: "Storytime",
      slug: "storytime",
      description: "Narrative format TikTok script",
      funnelStage: "mofu",
      promptTemplate: `Create a storytime TikTok script (45-90 seconds).

## Source Material
Title: {{title}} | Quotes: {{quotes}} | Emotional Angles: {{emotional_angles}}

## Requirements
- Open with "So this happened..." or similar storytime opener
- Build tension and curiosity
- Deliver a surprising insight or lesson
- Keep it personal and authentic
- End with a cliffhanger or powerful takeaway

Return JSON: { "content": "caption text", "hook": "storytime opener", "script": "full script", "hashtags": ["5 hashtags"], "cta": "CTA", "visual_direction": "visual notes", "sound_suggestion": "", "notes": "" }`,
      sortOrder: 2,
    },
    {
      name: "Trend Adaptation",
      slug: "trend_adaptation",
      description: "Trending TikTok format adapted to topic",
      funnelStage: "tofu",
      promptTemplate: `Create a trend-adapted TikTok concept (15-60 seconds).

## Source Material
Title: {{title}} | Themes: {{themes}} | Hooks: {{hooks}}

## Requirements
- Suggest a current trending TikTok format to adapt
- Show how the article's topic fits the trend
- Script the content to feel native to the trend
- Include sound/audio suggestion

Return JSON: { "content": "caption text", "hook": "trend hook", "script": "full script with format notes", "hashtags": ["5 hashtags"], "cta": "", "visual_direction": "trend format description", "sound_suggestion": "trending sound suggestion", "notes": "trend being adapted" }`,
      sortOrder: 3,
    },
    {
      name: "Duet Response",
      slug: "duet_response",
      description: "Designed for duet engagement",
      funnelStage: "bofu",
      promptTemplate: `Create a TikTok designed to invite duets and stitches (15-30 seconds).

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Themes: {{themes}}

## Requirements
- Make a statement or ask a question that demands a response
- Leave "space" for someone to react or add their perspective
- Controversial enough to engage, not enough to alienate
- End with an explicit invitation to duet/stitch

Return JSON: { "content": "caption text", "hook": "opening", "script": "full script", "hashtags": ["5 hashtags"], "cta": "duet invitation", "visual_direction": "setup notes", "sound_suggestion": "", "notes": "" }`,
      sortOrder: 4,
    },
    {
      name: "Greenscreen",
      slug: "greenscreen",
      description: "Greenscreen talking head format",
      funnelStage: "mofu",
      promptTemplate: `Create a greenscreen TikTok script (30-60 seconds).

## Source Material
Title: {{title}} | Takeaways: {{takeaways}} | Stats: {{stats}}

## Requirements
- Background: article screenshot, headline, or relevant image
- Speaker talks to camera reacting to / explaining the content
- 2-3 key points maximum
- Conversational and opinionated tone

Return JSON: { "content": "caption text", "hook": "opening reaction", "script": "full talking head script", "hashtags": ["5 hashtags"], "cta": "CTA", "visual_direction": "greenscreen background description", "sound_suggestion": "", "notes": "" }`,
      sortOrder: 5,
    },
    {
      name: "Quick Tip",
      slug: "quick_tip",
      description: "Under 15 second quick tip",
      funnelStage: "tofu",
      promptTemplate: `Create a quick tip TikTok (under 15 seconds).

## Source Material
Title: {{title}} | Takeaways: {{takeaways}}

## Requirements
- One single actionable tip in under 15 seconds
- Start with "Quick tip:" or "Did you know:"
- Maximum impact in minimum time
- On-screen text reinforces spoken words

Return JSON: { "content": "caption text", "hook": "quick tip opener", "script": "the full 15-second script", "hashtags": ["5 hashtags"], "cta": "follow for more tips", "visual_direction": "on-screen text", "sound_suggestion": "", "notes": "" }`,
      sortOrder: 6,
    },
    {
      name: "Series Episode",
      slug: "series_episode",
      description: "Part of an ongoing series",
      funnelStage: "mofu",
      promptTemplate: `Create a TikTok series episode concept (30-60 seconds).

## Source Material
Title: {{title}} | Pillar: {{pillar}} | Takeaways: {{takeaways}}

## Requirements
- Frame as "Part X of [series name]" (suggest a series name)
- Each episode covers one key insight from the article
- Include a teaser for the next episode to drive follows
- Consistent format viewers can expect and anticipate

Return JSON: { "content": "caption with Part X", "hook": "series intro hook", "script": "full episode script", "hashtags": ["5 hashtags"], "cta": "follow for Part X+1", "visual_direction": "series branding notes", "sound_suggestion": "", "notes": "suggested series name" }`,
      sortOrder: 7,
    },
  ];
}

function youtubeTemplates(): TemplateDef[] {
  return [
    {
      name: "Long Form Outline",
      slug: "long_form",
      description: "10-15 minute video outline with timestamps",
      funnelStage: "mofu",
      promptTemplate: `Create a 10-15 minute YouTube video outline.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Stats: {{stats}}
Quotes: {{quotes}}

## Requirements
- First 5 seconds: State the value proposition or create a pattern interrupt. NO channel intro, NO logo, NO "hey guys, welcome back."
- If retention drops below 70% in first 30 seconds, algorithm stops promoting — make every second count
- Hook (0:00-0:30): Compelling opener that previews the value
- Intro (0:30-1:30): What the video covers and why it matters
- Section 1-4 (1:30-12:00): Key sections with timestamps
- Conclusion (12:00-14:00): Summary + CTA
- Include B-roll suggestions for each section
- Title: under 60 chars, front-load value, include primary SEO keyword

Return JSON: { "content": "full outline with timestamps and notes per section", "headlines": ["3 video title options (under 60 chars, SEO-optimized, front-load value)"], "hashtags": ["5 tags"], "cta": "subscribe + like CTA", "visual_direction": "B-roll suggestions + thumbnail concept (face + 3-5 words + one visual element)", "notes": "" }`,
      sortOrder: 0,
    },
    {
      name: "Shorts Hook",
      slug: "shorts_hook",
      description: "YouTube Shorts script under 60 seconds",
      funnelStage: "tofu",
      promptTemplate: `Create a YouTube Shorts script (under 60 seconds).

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Stats: {{stats}}

## Requirements
- Instant hook in first 2 seconds
- One clear insight or value drop
- Fast pacing, no filler
- End with subscribe nudge
- Vertical format (9:16)

Return JSON: { "content": "shorts caption", "hook": "opening hook", "script": "full script with timing notes", "headlines": ["3 title options"], "hashtags": ["3 tags"], "cta": "subscribe CTA", "notes": "" }`,
      sortOrder: 1,
    },
    {
      name: "Shorts Tip",
      slug: "shorts_tip",
      description: "Quick tip YouTube Shorts format",
      funnelStage: "tofu",
      promptTemplate: `Create a quick-tip YouTube Short (30-45 seconds).

## Source Material
Title: {{title}} | Takeaways: {{takeaways}}

## Requirements
- "Here's a quick tip about {{pillar}}..."
- Single actionable tip with brief explanation
- On-screen text reinforcement
- End card: "More tips on my channel"

Return JSON: { "content": "shorts caption", "hook": "tip opener", "script": "full script", "headlines": ["3 titles"], "hashtags": ["3 tags"], "cta": "channel CTA", "notes": "" }`,
      sortOrder: 2,
    },
    {
      name: "Community Post",
      slug: "community_post",
      description: "YouTube Community tab engagement post",
      funnelStage: "bofu",
      promptTemplate: `Create a YouTube Community tab post.

## Source Material
Title: {{title}} | Themes: {{themes}} | Audience: {{audience}}

## Requirements
- Poll OR text post that drives engagement
- Related to upcoming or recent video content
- Builds community and conversation
- Under 500 characters

Return JSON: { "content": "the post text", "headlines": [], "hashtags": [], "cta": "engagement prompt", "notes": "poll_options if applicable: opt1 | opt2 | opt3 | opt4" }`,
      sortOrder: 3,
    },
    {
      name: "Video Description",
      slug: "video_description",
      description: "SEO-optimized YouTube video description",
      funnelStage: "mofu",
      promptTemplate: `Create an SEO-optimized YouTube video description (1000-2000 characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
URL: {{canonical_url}}

## Requirements
- First 200 characters: compelling summary (visible before "Show more")
- Timestamps section
- Key links section
- About section
- Relevant keywords naturally integrated
- 3-5 hashtags

Return JSON: { "content": "full description text", "headlines": ["3 SEO video title options"], "hashtags": ["5 hashtags/tags"], "cta": "subscribe line", "notes": "target keywords" }`,
      sortOrder: 4,
    },
    {
      name: "Thumbnail Concepts",
      slug: "thumbnail_concepts",
      description: "3 YouTube thumbnail ideas with text overlays",
      funnelStage: "tofu",
      promptTemplate: `Create 3 YouTube thumbnail concepts.

## Source Material
Title: {{title}} | Themes: {{themes}} | Hooks: {{hooks}}

## Requirements
Per thumbnail:
- Text overlay (3-5 words max, large readable font)
- Facial expression/emotion to convey
- Background concept
- Color scheme
- What makes it click-worthy

Return JSON: { "content": "thumbnail strategy notes", "slides": [{"title": "Concept 1", "body": "text overlay + visual description"}, {"title": "Concept 2", "body": "..."}, {"title": "Concept 3", "body": "..."}], "headlines": [], "hashtags": [], "cta": "", "visual_direction": "overall thumbnail style guide", "notes": "" }`,
      sortOrder: 5,
    },
    {
      name: "End Screen Script",
      slug: "end_screen",
      description: "End screen CTA script (last 20 seconds)",
      funnelStage: "bofu",
      promptTemplate: `Create a YouTube end screen script (last 20 seconds of video).

## Source Material
Title: {{title}} | Pillar: {{pillar}}

## Requirements
- Thank viewer for watching
- Tease the next video or related content
- Clear CTA: subscribe, bell, next video
- Natural and enthusiastic, not salesy

Return JSON: { "content": "the end screen script", "headlines": [], "hashtags": [], "cta": "subscribe + next video CTA", "notes": "" }`,
      sortOrder: 6,
    },
    {
      name: "Pinned Comment",
      slug: "pinned_comment",
      description: "Engagement-driving pinned comment",
      funnelStage: "bofu",
      promptTemplate: `Create a pinned comment for a YouTube video.

## Source Material
Title: {{title}} | Themes: {{themes}} | Audience: {{audience}}

## Requirements
- Ask a question that relates to the video content
- Should drive replies and discussion
- Under 500 characters
- Conversational and inviting

Return JSON: { "content": "the pinned comment text", "headlines": ["3 question variations"], "hashtags": [], "cta": "reply invitation", "notes": "" }`,
      sortOrder: 7,
    },
  ];
}

function facebookTemplates(): TemplateDef[] {
  return [
    {
      name: "Long Post",
      slug: "long_post",
      description: "Detailed Facebook post (2000+ chars) for engagement",
      funnelStage: "mofu",
      promptTemplate: `Create a long Facebook post (2000+ characters).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Quotes: {{quotes}}
Audience: {{audience}}

## Requirements
- Strong opening line that hooks in the feed
- Share insights, story, or value from the article
- Use line breaks for readability
- End with a question to drive comments
- Conversational tone, like talking to a friend

Return JSON: { "content": "the full post text", "headlines": ["3 opening hook options"], "hashtags": ["3 hashtags"], "cta": "engagement question", "notes": "" }`,
      sortOrder: 0,
    },
    {
      name: "Short Post",
      slug: "short_post",
      description: "Ultra-short Facebook post under 80 characters",
      funnelStage: "tofu",
      promptTemplate: `Create a short Facebook post (under 80 characters — this is the #1 engagement sweet spot on Facebook).

## Source Material
Title: {{title}} | Hooks: {{hooks}}

## Requirements
- UNDER 80 CHARACTERS. Posts under 80 chars get 66% more engagement.
- Maximum impact in minimum words
- Can be a question, bold statement, or observation
- Questions drive 100% more comments than statements on Facebook
- Designed to stop the scroll and spark comments
- Do NOT include external links

Return JSON: { "content": "the post text (under 80 chars)", "headlines": ["3 variations (each under 80 chars)"], "hashtags": ["2 hashtags"], "cta": "engagement question", "visual_direction": "companion image concept", "notes": "" }`,
      sortOrder: 1,
    },
    {
      name: "Link Post",
      slug: "link_post",
      description: "Post optimized for link preview sharing",
      funnelStage: "mofu",
      promptTemplate: `Create a Facebook link post (share article with commentary, 300-800 chars).

## Source Material
Title: {{title}} | URL: {{canonical_url}}
Takeaways: {{takeaways}}

## Requirements
- Teaser text that makes people want to click the link
- Add personal commentary or key insight
- Don't give away everything — create curiosity gap
- Designed to work with link preview card below

Return JSON: { "content": "the post text above the link", "headlines": ["3 teaser options"], "hashtags": ["2 hashtags"], "cta": "read more prompt", "notes": "" }`,
      sortOrder: 2,
    },
    {
      name: "Video Post",
      slug: "video_post",
      description: "Video post description/script",
      funnelStage: "tofu",
      promptTemplate: `Create a Facebook video post (description + brief script outline).

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Takeaways: {{takeaways}}

## Requirements
- Post description (200-500 chars) that accompanies the video
- Brief video script outline (60-120 seconds)
- Facebook native video outperforms links — design for autoplay (sound off first 3s)

Return JSON: { "content": "post description", "hook": "video hook", "script": "video script outline", "headlines": ["3 descriptions"], "hashtags": ["2 hashtags"], "cta": "CTA", "visual_direction": "video concept", "notes": "" }`,
      sortOrder: 3,
    },
    {
      name: "Live Outline",
      slug: "live_outline",
      description: "Facebook Live event outline",
      funnelStage: "mofu",
      promptTemplate: `Create a Facebook Live event outline (30-45 minutes).

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Quotes: {{quotes}}
Audience: {{audience}}

## Requirements
- Pre-live announcement post text
- Structured outline with timing
- Interactive segments (Q&A, polls)
- Key talking points per section

Return JSON: { "content": "pre-live announcement post", "headlines": ["live event title options"], "hashtags": ["3 hashtags"], "cta": "set reminder CTA", "notes": "full outline with timing and talking points" }`,
      sortOrder: 4,
    },
    {
      name: "Group Post",
      slug: "group_post",
      description: "Optimized for Facebook Group engagement",
      funnelStage: "bofu",
      promptTemplate: `Create a Facebook Group post (500-1000 chars).

## Source Material
Title: {{title}} | Themes: {{themes}} | Audience: {{audience}}

## Requirements
- Designed for group engagement (higher organic reach than page posts)
- Ask for the community's experience or opinion
- Share a key insight then invite discussion
- No self-promotion feel — value-first

Return JSON: { "content": "the group post text", "headlines": ["3 opener options"], "hashtags": [], "cta": "discussion prompt", "notes": "" }`,
      sortOrder: 5,
    },
    {
      name: "Event Post",
      slug: "event_post",
      description: "Event announcement format",
      funnelStage: "tofu",
      promptTemplate: `Create a Facebook event announcement post (500-800 chars).

## Source Material
Title: {{title}} | Themes: {{themes}}

## Requirements
- Frame article topic as an event/webinar/discussion to attend
- What attendees will learn
- Urgency element (limited spots, happening soon)
- Clear CTA to register/attend

Return JSON: { "content": "event announcement text", "headlines": ["3 event title options"], "hashtags": ["2 hashtags"], "cta": "registration CTA", "notes": "" }`,
      sortOrder: 6,
    },
    {
      name: "Facebook Reel",
      slug: "reel_script",
      description: "Facebook Reel script (30-60 seconds)",
      funnelStage: "tofu",
      promptTemplate: `Create a Facebook Reel script (30-60 seconds).

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Takeaways: {{takeaways}}

## Requirements
- Hook in first 2 seconds (sound off friendly)
- 1-3 key insights, fast paced
- On-screen text for key points
- CTA at the end
- Vertical format (9:16)

Return JSON: { "content": "reel caption", "hook": "opening hook", "script": "full reel script with visual cues", "headlines": ["3 hook options"], "hashtags": ["3 hashtags"], "cta": "CTA", "visual_direction": "visual notes", "sound_suggestion": "audio idea", "notes": "" }`,
      sortOrder: 7,
    },
  ];
}

function memeTemplates(): TemplateDef[] {
  return [
    {
      name: "Drake Format",
      slug: "drake_format",
      description: "Drake approving/disapproving meme",
      funnelStage: "tofu",
      promptTemplate: `Create a Drake format meme concept.

## Source Material
Title: {{title}} | Themes: {{themes}} | Hooks: {{hooks}}

## Requirements
- Top panel (disapprove): Common but wrong approach related to the article
- Bottom panel (approve): The better approach from the article
- Both should be immediately recognizable to the target audience
- Keep text under 10 words per panel (under 7 is ideal)

Return JSON: { "content": "meme description", "top_text": "what Drake rejects", "bottom_text": "what Drake approves", "format": "drake", "headlines": ["caption options"], "hashtags": ["5 hashtags"], "cta": "", "notes": "context for why this is funny/relatable" }`,
      sortOrder: 0,
    },
    {
      name: "Distracted Boyfriend",
      slug: "distracted_boyfriend",
      description: "Distracted boyfriend meme format",
      funnelStage: "tofu",
      promptTemplate: `Create a Distracted Boyfriend meme concept.

## Source Material
Title: {{title}} | Themes: {{themes}}

## Requirements
- Boyfriend: The target audience (label)
- Girlfriend (being ignored): What they should be doing
- Other woman (being looked at): The tempting distraction
- Related to article's theme

Return JSON: { "content": "meme description", "panels": [{"label": "boyfriend = ...", "text": "audience label"}, {"label": "girlfriend = ...", "text": "what's being ignored"}, {"label": "other woman = ...", "text": "the distraction"}], "format": "distracted_boyfriend", "headlines": ["caption"], "hashtags": ["5 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 1,
    },
    {
      name: "Expanding Brain",
      slug: "expanding_brain",
      description: "4-level expanding brain meme",
      funnelStage: "tofu",
      promptTemplate: `Create an Expanding Brain meme (4 levels).

## Source Material
Title: {{title}} | Takeaways: {{takeaways}}

## Requirements
- Level 1 (small brain): The basic/obvious take
- Level 2 (medium brain): Slightly better understanding
- Level 3 (big brain): Advanced insight from the article
- Level 4 (galaxy brain): The ultimate enlightened take (can be slightly absurd)

Return JSON: { "content": "meme description", "panels": ["level 1 text", "level 2 text", "level 3 text", "level 4 text"], "format": "expanding_brain", "headlines": ["caption"], "hashtags": ["5 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 2,
    },
    {
      name: "This Is Fine",
      slug: "this_is_fine",
      description: "This is fine dog meme format",
      funnelStage: "mofu",
      promptTemplate: `Create a "This Is Fine" meme concept.

## Source Material
Title: {{title}} | Themes: {{themes}} | Emotional Angles: {{emotional_angles}}

## Requirements
- The "fire" = a problem or challenge from the article
- The "dog" = who's ignoring/coping with the problem
- The "This is fine" statement = their rationalization
- Should be relatable to the target audience

Return JSON: { "content": "meme description", "top_text": "the situation (fire)", "bottom_text": "This is fine / rationalization", "format": "this_is_fine", "context": "who the dog represents", "headlines": ["caption"], "hashtags": ["5 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 3,
    },
    {
      name: "Change My Mind",
      slug: "change_my_mind",
      description: "Change My Mind format",
      funnelStage: "tofu",
      promptTemplate: `Create a "Change My Mind" meme concept.

## Source Material
Title: {{title}} | Hooks: {{hooks}} | Themes: {{themes}}

## Requirements
- A bold, debatable statement from or inspired by the article
- Should be something the audience has strong opinions about
- Phrased to invite engagement and debate
- Under 10 words on the sign (brevity is critical for memes)

Return JSON: { "content": "meme description", "top_text": "[bold statement]", "bottom_text": "Change my mind.", "format": "change_my_mind", "headlines": ["caption"], "hashtags": ["5 hashtags"], "cta": "comment your take", "notes": "" }`,
      sortOrder: 4,
    },
    {
      name: "Is This A...?",
      slug: "is_this_a",
      description: "Butterfly 'Is this a...?' meme",
      funnelStage: "tofu",
      promptTemplate: `Create an "Is This A Pigeon?" butterfly meme concept.

## Source Material
Title: {{title}} | Themes: {{themes}}

## Requirements
- Person = someone or a group misidentifying something
- Butterfly = what they're looking at
- Caption = their incorrect interpretation
- Should highlight a common misconception related to the article

Return JSON: { "content": "meme description", "panels": [{"label": "person", "text": "who's confused"}, {"label": "butterfly", "text": "what it actually is"}, {"label": "caption", "text": "Is this [wrong interpretation]?"}], "format": "is_this_a", "headlines": ["caption"], "hashtags": ["5 hashtags"], "cta": "", "notes": "" }`,
      sortOrder: 5,
    },
    {
      name: "Two Buttons",
      slug: "two_buttons",
      description: "Two buttons anxiety meme format",
      funnelStage: "mofu",
      promptTemplate: `Create a Two Buttons anxiety meme concept.

## Source Material
Title: {{title}} | Themes: {{themes}} | Emotional Angles: {{emotional_angles}}

## Requirements
- Two buttons represent two conflicting choices from the article's theme
- The sweating person = the target audience who faces this dilemma
- Both options should feel equally compelling or difficult
- Captures a real tension the audience experiences

Return JSON: { "content": "meme description", "panels": [{"label": "button 1", "text": "first option"}, {"label": "button 2", "text": "second option"}, {"label": "person", "text": "who faces the dilemma"}], "format": "two_buttons", "headlines": ["caption"], "hashtags": ["5 hashtags"], "cta": "which would you choose?", "notes": "" }`,
      sortOrder: 6,
    },
    {
      name: "Custom Concept",
      slug: "custom_concept",
      description: "Original meme concept tailored to the content",
      funnelStage: "tofu",
      promptTemplate: `Create an original meme concept.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Themes: {{themes}}
Hooks: {{hooks}}
Audience: {{audience}}

## Requirements
- Create a completely original meme concept (not a standard template)
- Can be a screenshot-style tweet, fake text convo, comparison image, etc.
- Must be highly shareable and relatable to the target audience
- Make the meme about the AUDIENCE'S daily experience, NOT about a product
- Do NOT explain the joke. If it requires context to be funny, the concept isn't strong enough.
- Include detailed visual description for creation

Return JSON: { "content": "detailed meme description and concept", "format": "custom", "top_text": "primary text element", "bottom_text": "secondary text element if applicable", "headlines": ["caption for posting"], "hashtags": ["5 hashtags"], "cta": "share if you relate", "visual_direction": "detailed visual creation instructions", "notes": "why this will resonate with the audience" }`,
      sortOrder: 7,
    },
  ];
}

// ─── Seed Execution ──────────────────────────────────────

async function seed() {
  console.log("Seeding database...\n");

  // 1. Brand Profile
  console.log("Creating default brand profile...");
  await db.insert(brandProfiles).values({
    name: "Default Brand",
    voiceGuidelines:
      "Professional yet approachable. Speak with authority backed by data, but keep it conversational. Avoid jargon unless the audience expects it. Be bold in opinions but respectful of alternatives. Use active voice.",
    tone: "Confident, insightful, conversational, and occasionally witty. Think 'smart friend who explains complex things simply.'",
    vocabulary: {
      preferred: [
        "insight",
        "strategy",
        "transform",
        "leverage",
        "growth",
        "impact",
        "innovation",
      ],
      avoided: [
        "synergy",
        "disrupt",
        "circle back",
        "low-hanging fruit",
        "move the needle",
        "deep dive",
      ],
    },
    exampleContent: [],
    isActive: true,
  });
  console.log("  Brand profile created.\n");

  // 2. Platforms
  console.log("Creating platforms...");
  const insertedPlatforms = await db
    .insert(platforms)
    .values(PLATFORMS)
    .returning();

  const platformMap: Record<string, string> = {};
  for (const p of insertedPlatforms) {
    platformMap[p.slug] = p.id;
    console.log(`  ${p.name} (${p.slug})`);
  }
  console.log();

  // 3. Content Templates
  console.log("Creating content templates...");

  const templateSets: [string, TemplateDef[]][] = [
    ["linkedin", linkedInTemplates()],
    ["x", xTemplates()],
    ["instagram", instagramTemplates()],
    ["tiktok", tiktokTemplates()],
    ["youtube", youtubeTemplates()],
    ["facebook", facebookTemplates()],
    ["memes", memeTemplates()],
  ];

  let totalTemplates = 0;

  for (const [platformSlug, templates] of templateSets) {
    const platformId = platformMap[platformSlug];
    if (!platformId) {
      console.error(`  Platform ${platformSlug} not found!`);
      continue;
    }

    for (const template of templates) {
      await db.insert(contentTemplates).values({
        platformId,
        name: template.name,
        slug: template.slug,
        description: template.description,
        funnelStage: template.funnelStage as any,
        promptTemplate: template.promptTemplate,
        outputSchema: {},
        enabled: true,
        sortOrder: template.sortOrder,
      });
      totalTemplates++;
    }
    console.log(
      `  ${platformSlug}: ${templates.length} templates`
    );
  }

  console.log(`\nSeed complete!`);
  console.log(`  1 brand profile`);
  console.log(`  ${insertedPlatforms.length} platforms`);
  console.log(`  ${totalTemplates} content templates`);

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
