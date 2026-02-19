# All AI Prompts Used in Content Cascade

This document catalogs every AI prompt used in the system — from content extraction through derivative generation to visual asset creation.

---

## 1. Content Extraction

**File:** `src/lib/ai/prompts.ts` — `EXTRACTION_SYSTEM_PROMPT` + `buildExtractionPrompt()`
**Model:** Gemini 2.0 Flash (8192 max tokens)
**Purpose:** Analyze a source article and extract structured data for social media repurposing.

### System Prompt

```
You are an expert content strategist specializing in social media content atomization. Your job is to analyze articles and extract structured data that can be used to generate platform-specific social media content.

Be thorough, specific, and actionable. Every extracted element should be directly usable for content creation.
```

### User Prompt Template

```
Analyze this article and extract structured content for social media repurposing.

## Article
Title: {{title}}
Pillar/Category: {{pillar}}

{{content}}

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
- emotionalAngles: 3-5 emotional angles
```

---

## 2. Derivative Generation

**File:** `src/lib/ai/prompts.ts` — `buildGenerationSystemPrompt()` + `buildGenerationPrompt()`
**File:** `src/lib/ai/generate.ts` — variation angle injection
**Model:** Gemini 2.0 Flash (4096 max tokens)
**Purpose:** Generate platform-specific content from extracted data using per-template prompt templates.

### System Prompt (dynamically built per platform)

```
You are an expert {{platformName}} content creator. Generate high-quality, platform-native content that feels authentic — not AI-generated.

## Brand Voice
{{voiceGuidelines}}

## Tone
{{tone}}

## Preferred Vocabulary
Use these words/phrases when appropriate: {{preferred words}}

## Avoid
Never use these words/phrases: {{avoided words}}

Respond with valid JSON only. No markdown fences, no explanation — just the JSON.
```

### Variation Angle Injection

When generating multiple variations (default 5), each gets a unique creative directive appended:

| Variation | Angle |
|-----------|-------|
| 1 | Take a bold, contrarian angle. Challenge assumptions. Be provocative and thought-provoking. |
| 2 | Use a storytelling approach. Lead with a personal anecdote or vivid scenario. Make it narrative-driven. |
| 3 | Be data-first and analytical. Lead with numbers, stats, or logical frameworks. Cerebral and authoritative. |
| 4 | Go emotional and inspirational. Tap into aspirations, fears, or triumphs. Make people feel something. |
| 5 | Be practical and tactical. Give concrete, actionable steps. No fluff — just usable advice. |
| 6 | Use humor and wit. Be clever, playful, self-aware. Make people smile while they learn. |
| 7 | Take a minimalist, zen approach. Say more with less. Every word earns its place. Poetic brevity. |
| 8 | Be conversational and raw. Write like you're texting a friend. Authentic, unpolished, real. |
| 9 | Go big-picture and visionary. Connect to macro trends. Position the insight within a larger movement. |
| 10 | Be urgency-driven. Frame as 'this matters right now.' Create FOMO. Time-sensitive energy. |

Each variation also includes:
```
This MUST be meaningfully different from any other variation. Use a different opening hook, different structure, different examples, and different tone. Do NOT produce generic or safe content — be distinctive and memorable.
```

### Template Variables (replaced in each prompt)

| Variable | Source |
|----------|--------|
| `{{title}}` | Source article title |
| `{{pillar}}` | Content pillar/category |
| `{{handle}}` | Primary social handle |
| `{{canonical_url}}` | Article URL |
| `{{extraction}}` | Full extraction JSON |
| `{{takeaways}}` | Formatted takeaway points |
| `{{quotes}}` | Formatted quotes |
| `{{stats}}` | Formatted statistics |
| `{{hooks}}` | Hook lines |
| `{{themes}}` | Theme list |
| `{{audience}}` | Audience insights |
| `{{emotional_angles}}` | Emotional angles |

---

## 3. Per-Platform Template Prompts

Each template has a `promptTemplate` stored in the database (seeded from `src/lib/db/seed.ts`). Below is every template grouped by platform.

### LinkedIn (8 templates)

**Thought Leadership** (`thought_leadership`) — TOFU, 1500-2000 chars
- Starts with bold, counterintuitive hook
- Personal perspective with data points
- Short paragraphs with line breaks
- Ends with thought-provoking question
- Output: `{ content, headlines[3], hashtags[5], cta, notes }`

**Story Post** (`story_post`) — MOFU, 1200-1500 chars
- Opens with "I" + specific moment
- Narrative arc: setup → tension → insight → takeaway
- Connects personal story to professional lesson
- Output: `{ content, headlines[3], hashtags[5], cta, notes }`

**Contrarian Take** (`contrarian_take`) — TOFU, 800-1200 chars
- Bold statement challenging industry consensus
- Evidence-backed, acknowledges opposing view
- Output: `{ content, headlines[3], hashtags[5], cta, notes }`

**Data Spotlight** (`data_spotlight`) — TOFU, 600-1000 chars
- Leads with most surprising statistic
- Context + practical implication
- Output: `{ content, headlines[3], hashtags[5], cta, notes }`

**Listicle** (`listicle`) — TOFU, 1000-1400 chars
- 5-7 numbered points, each standalone value
- Mix of practical tips and mindset shifts
- Output: `{ content, headlines[3], hashtags[5], cta, notes }`

**Question Post** (`question_post`) — TOFU, 600-800 chars
- Thought-provoking question opener
- 2-3 sentences context
- Output: `{ content, headlines[3], hashtags[4], cta, notes }`

**Carousel Outline** (`carousel_outline`) — MOFU, 10 slides
- Slide 1: bold headline + hook
- Slides 2-9: one insight per slide
- Slide 10: summary + CTA
- Output: `{ content, slides[{title, body}], headlines[3], hashtags[5], cta, visual_direction }`

**Poll Concept** (`poll_concept`) — BOFU
- Compelling poll question + 4 options
- Context text to set up the poll
- Output: `{ content, headlines[question], hashtags[4], cta, notes }`

### X/Twitter (8 templates)

**Viral Thread** (`viral_thread`) — TOFU, 8-12 tweets (each <280 chars)
- Tweet 1: irresistible hook
- Each tweet: standalone insight that builds on the last
- Final tweet: summary + CTA
- Output: `{ content, tweets[], hashtags[2], cta, notes }`

**Hot Take** (`hot_take`) — TOFU, <280 chars
- Bold, opinionated single tweet
- Designed for quote tweets and replies
- Output: `{ content, headlines[3], hashtags[2], cta, notes }`

**Stat Bomb** (`stat_bomb`) — TOFU, <280 chars
- Leads with surprising number
- Context + implication
- Output: `{ content, headlines[3], hashtags[2], cta, notes }`

**Quote Tweet** (`quote_tweet`) — MOFU, <280 chars
- Compelling quote + personal reaction
- Output: `{ content, headlines[3], hashtags[2], cta, notes }`

**Poll Tweet** (`poll_tweet`) — BOFU, <280 chars
- Debatable question + 4 options (<25 chars each)
- Output: `{ content, headlines[], hashtags[], cta, notes }`

**Thread Hook** (`thread_hook`) — TOFU, 5 options (<280 chars each)
- Curiosity gap, authority, controversy, storytelling patterns
- Output: `{ content, headlines[5], hashtags[], cta, notes }`

**Reply Bait** (`reply_bait`) — BOFU, <280 chars
- "Wrong answers only:", "Unpopular opinion:", fill-in-the-blank patterns
- Output: `{ content, headlines[3], hashtags[], cta, notes }`

**X Article** (`x_article`) — MOFU, 1500-2500 chars
- Structured with subheadings
- Output: `{ content, headlines[3], hashtags[3], cta, notes }`

### Instagram (8 templates)

**Educational Carousel** (`carousel_educational`) — MOFU, 10 slides
- One clear lesson per slide
- Bold headline (3-6 words) + supporting text
- Output: `{ content, slides[{title, body}], headlines[3], hashtags[25], cta, visual_direction, notes }`

**Storytelling Carousel** (`carousel_storytelling`) — MOFU, 10 slides
- Narrative arc across slides
- Conversational, human tone
- Output: `{ content, slides[{title, body}], headlines[3], hashtags[25], cta, visual_direction, notes }`

**Single Image Post** (`single_image`) — TOFU, 800-1500 chars
- Hook first line visible in feed
- Image concept suggestion included
- Output: `{ content, headlines[3], hashtags[25], cta, visual_direction, notes }`

**Reel Script** (`reel_script`) — TOFU, 30-60 seconds
- HOOK (0-3s) → BODY (3-45s) → CTA (45-60s)
- Visual cues, transition notes, sound suggestion
- Output: `{ content, hook, script, headlines[3], hashtags[25], cta, visual_direction, sound_suggestion, notes }`

**Reel Hook** (`reel_hook`) — TOFU, 5 options (first 3 seconds)
- Question, bold claim, "wait for it", controversial, relatable
- Output: `{ content, headlines[5], hashtags[], cta, visual_direction, notes }`

**Story Series** (`story_series`) — TOFU, 5-7 slides
- Interactive elements: polls, quizzes, sliders
- Output: `{ content, slides[{title, body}], headlines[], hashtags[], cta, visual_direction, notes }`

**Long Caption** (`caption_long`) — MOFU, 2000+ chars
- Irresistible first-line hook
- Line breaks and spacing
- Output: `{ content, headlines[3], hashtags[25], cta, notes }`

**Short Caption** (`caption_short`) — TOFU, <500 chars
- Sharp, memorable, share-worthy
- Output: `{ content, headlines[3], hashtags[25], cta, visual_direction, notes }`

### TikTok (8 templates)

**Hook Video** (`hook_video`) — TOFU, 15-30 seconds
**Educational** (`educational`) — MOFU, 60-90 seconds
**Storytime** (`storytime`) — MOFU, 45-90 seconds
**Trend Adaptation** (`trend_adaptation`) — TOFU, 15-60 seconds
**Duet Response** (`duet_response`) — BOFU, 15-30 seconds
**Greenscreen** (`greenscreen`) — MOFU, 30-60 seconds
**Quick Tip** (`quick_tip`) — TOFU, <15 seconds
**Series Episode** (`series_episode`) — MOFU, 30-60 seconds

All TikTok templates output: `{ content, hook, script, hashtags[5], cta, visual_direction, sound_suggestion, notes }`

### YouTube (8 templates)

**Long Form Outline** (`long_form`) — MOFU, 10-15 min video outline with timestamps
**Shorts Hook** (`shorts_hook`) — TOFU, <60 seconds
**Shorts Tip** (`shorts_tip`) — TOFU, 30-45 seconds
**Community Post** (`community_post`) — BOFU, <500 chars
**Video Description** (`video_description`) — MOFU, 1000-2000 chars SEO-optimized
**Thumbnail Concepts** (`thumbnail_concepts`) — TOFU, 3 concepts
**End Screen Script** (`end_screen`) — BOFU, last 20 seconds
**Pinned Comment** (`pinned_comment`) — BOFU, <500 chars

### Facebook (8 templates)

**Long Post** (`long_post`) — MOFU, 2000+ chars
**Short Post** (`short_post`) — TOFU, <500 chars (ideally <80)
**Link Post** (`link_post`) — MOFU, 300-800 chars
**Video Post** (`video_post`) — TOFU, description + 60-120s script
**Live Outline** (`live_outline`) — MOFU, 30-45 min structured outline
**Group Post** (`group_post`) — BOFU, 500-1000 chars
**Event Post** (`event_post`) — TOFU, 500-800 chars
**Facebook Reel** (`reel_script`) — TOFU, 30-60 seconds

### Memes (8 templates)

**Drake Format** (`drake_format`) — TOFU
- Top panel (disapprove) + Bottom panel (approve)
- Output: `{ content, top_text, bottom_text, format, headlines[], hashtags[5], cta, notes }`

**Distracted Boyfriend** (`distracted_boyfriend`) — TOFU
- Three panels: boyfriend, girlfriend, other woman
- Output: `{ content, panels[{label, text}], format, headlines[], hashtags[5], cta, notes }`

**Expanding Brain** (`expanding_brain`) — TOFU
- 4 levels: basic → smart → galaxy brain → transcended
- Output: `{ content, panels[4 strings], format, headlines[], hashtags[5], cta, notes }`

**This Is Fine** (`this_is_fine`) — MOFU
- Fire situation + calm response
- Output: `{ content, top_text, bottom_text, format, context, headlines[], hashtags[5], cta, notes }`

**Change My Mind** (`change_my_mind`) — TOFU
- Bold debatable statement (<15 words)
- Output: `{ content, top_text, bottom_text, format, headlines[], hashtags[5], cta, notes }`

**Is This A...?** (`is_this_a`) — TOFU
- Person + thing + misidentification caption
- Output: `{ content, panels[{label, text}], format, headlines[], hashtags[5], cta, notes }`

**Two Buttons** (`two_buttons`) — MOFU
- Two conflicting choices + sweating person
- Output: `{ content, panels[{label, text}], format, headlines[], hashtags[5], cta, notes }`

**Custom Concept** (`custom_concept`) — TOFU
- Original meme format (screenshot tweet, fake text, comparison, etc.)
- Output: `{ content, format, top_text, bottom_text, headlines[], hashtags[5], cta, visual_direction, notes }`

---

## 4. Visual Generation (Gamma API)

**File:** `src/lib/gamma/prompt-builders.ts` + `src/lib/gamma/specs.ts`
**Purpose:** Build Gamma API requests that generate visual assets (carousels, social graphics, memes, thumbnails, cover frames) for each derivative.

### Dynamic Style System

Each variation gets a unique visual style to prevent duplicate-looking visuals. The style is deterministic based on `variationIndex`:

**10 Color Palettes:**
- Deep navy + electric cyan
- Charcoal black + hot magenta
- Rich emerald + lime green
- Midnight purple + golden yellow
- Warm slate + coral orange
- Ocean blue + seafoam mint
- Burnt umber + peach
- Forest dark + amber
- Royal indigo + rose pink
- Volcanic red + ice blue

**10 Gradient Styles:** Linear, radial, diagonal split, glowing center, mesh, vertical fade, duotone grain, aurora, sunset, neon glow

**10 Typography Styles:** Ultra-bold condensed, elegant serif, rounded friendly, geometric sharp, hand-drawn brush, monospace clean, extra-wide stretched, thin elegant, stacked hierarchy, mixed type contrast

**10 Layout Approaches:** Centered, off-center asymmetric, full-bleed, card-within-card, split divider, diagonal slice, floating shadow, magazine pull-quote, grid modular, bordered frame

### Visual Spec Categories

| Category | Templates | Description |
|----------|-----------|-------------|
| `social_graphic` | Most text-based posts | Single-card graphic with quote/insight |
| `carousel` | carousel_outline, carousel_educational, carousel_storytelling | Multi-slide deck |
| `meme` | All 8 meme templates | Format-specific meme cards |
| `thumbnail` | thumbnail_concepts | 3 YouTube thumbnail variants |
| `cover_frame` | Reels, Shorts, TikTok videos, end screens | Video cover/thumbnail frames |
| `story_frame` | story_series | Multi-card Instagram Story frames |

### Builder Factories

**`makePostGraphicBuilder(baseStyle, options?)`** — Single-card social post graphic
**`makeThreadHeaderBuilder(baseStyle)`** — Thread or article header graphic
**`makeCoverFrameBuilder(baseStyle, options?)`** — Video cover frame (default 9:16)

All builders:
1. Extract display text from derivative content
2. Append the variation-specific style string
3. Return a `GammaGenerationRequest` with `noImages` (text-only, no AI photos)
4. Export as PDF (converted to PNG later)

### Gamma Request Structure

```typescript
{
  inputText: string;          // The text content to render
  textMode: "preserve";       // Keep text as-is
  format: "social" | "presentation";
  numCards: number;            // 1 for single, N for carousels
  cardSplit?: "inputTextBreaks"; // Split on --- markers
  exportAs: "pdf";
  additionalInstructions: string; // Style + category instructions
  imageOptions: { source: "noImages" };
  cardOptions: { dimensions: "1x1" | "4x3" | "4x5" | "9x16" | "16x9" };
  textOptions: { amount: "brief" };
}
```

---

## 5. JSON Enforcement

**File:** `src/lib/ai/client.ts` — `generateJSON()`

All generation calls use:
- `responseMimeType: "application/json"` (Gemini structured output)
- System instruction: `"You MUST respond with valid JSON only. No markdown, no code fences, no explanation — just the JSON object."`
- Post-processing: strips any remaining markdown fences before parsing

---

## 6. Brand Voice Configuration

**File:** `src/lib/db/seed.ts` — default brand profile

```
Voice Guidelines: Professional yet approachable. Speak with authority backed by data,
but keep it conversational. Avoid jargon unless the audience expects it. Be bold in
opinions but respectful of alternatives. Use active voice.

Tone: Confident, insightful, conversational, and occasionally witty. Think 'smart
friend who explains complex things simply.'

Preferred: insight, strategy, transform, leverage, growth, impact, innovation
Avoided: synergy, disrupt, circle back, low-hanging fruit, move the needle, deep dive
```
