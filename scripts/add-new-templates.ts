/**
 * Add new templates from Phase 5 & 6 without re-running the full seed.
 * - Updates x_article (longer target)
 * - Inserts x_deep_dive, x_case_study
 * - Inserts attractive_story, attractive_moment
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import { contentTemplates, platforms } from "../src/lib/db/schema";
import { eq, and } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL!;
const isPooler = connectionString.includes(":6543");
const client = postgres(connectionString, { prepare: isPooler ? false : true });
const db = drizzle(client, { schema });

async function run() {
  // Get platform IDs
  const allPlatforms = await db.select().from(platforms);
  const platformMap = Object.fromEntries(allPlatforms.map((p) => [p.slug, p.id]));

  const xId = platformMap["x"];
  const igId = platformMap["instagram"];

  if (!xId || !igId) {
    throw new Error("Platforms not found. Run the full seed first.");
  }

  // ── 1. Update x_article (longer) ────────────────────────
  await db
    .update(contentTemplates)
    .set({
      description: "Long-form X article (2500-4000 chars)",
      promptTemplate: `Create a long-form X article (2500-4000 characters). X Articles allow deep content — use the space to go beyond what a thread can do.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Quotes: {{quotes}}
Stats: {{stats}}
Audience: {{audience}}

## Requirements
- HEADLINE: Punchy, curiosity-driven. Under 60 chars. Front-load the value.
- OPENING PARAGRAPH: First 150 chars are visible in the feed — make it a scroll-stopper
- STRUCTURE:
  - Hook paragraph (1-2 paragraphs, establishes the tension or stakes)
  - 3-5 sections with clear subheadings (use ## for H2)
  - Pull a key quote or stat into a standalone paragraph for visual break
  - Real examples or specific scenarios — no vague generalities
  - Closing section: The bigger takeaway — what changes after reading this
- LENGTH: 2500-4000 characters (push for depth, not padding)
- TONE: Opinionated, expert, readable. Not academic. Not corporate.
- End with a strong closing line + the CTA pointing readers to the reply/comments

Return JSON: { "content": "the full article text with markdown subheadings", "headlines": ["3 title options"], "hashtags": ["3-5 hashtags"], "cta": "article CTA (reference 'reply below' not a URL)", "notes": "key thesis of the article" }`,
    })
    .where(and(eq(contentTemplates.platformId, xId), eq(contentTemplates.slug, "x_article")));
  console.log("Updated x_article");

  // ── 2. Insert new X templates ────────────────────────────
  const xNewTemplates = [
    {
      slug: "x_deep_dive",
      name: "X Deep Dive",
      description: "In-depth X article (3000-5000 chars)",
      funnelStage: "bofu" as const,
      sortOrder: 8,
      promptTemplate: `Create a comprehensive deep-dive X article (3000-5000 characters). This is flagship long-form content — thorough, authoritative, the kind of thing people bookmark.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Quotes: {{quotes}}
Stats: {{stats}}
Emotional Angles: {{emotional_angles}}
Audience: {{audience}}

## Requirements
- HEADLINE: Specific and authoritative. "How X Actually Works", "The Complete Guide to Y", "Everything Wrong With Z (And How to Fix It)"
- OPENING: 2 paragraphs. Set up the problem, stakes, or common misconception. Make the reader feel this is essential reading.
- BODY STRUCTURE (5-7 sections):
  ## Section headings that are themselves insightful
  - Each section = 300-600 chars minimum
  - Mix of explanatory prose, specific examples, and data points
  - At least 2 pull-quote or statistic callout paragraphs (bold and standalone)
  - Where relevant: list key points with bullet points for scanability
- EXPERT ANGLE: Take a clear point of view. This is not a Wikipedia article.
- CONCLUSION: 2 paragraphs. Synthesize the key insight. End with a forward-looking statement.
- LENGTH: 3000-5000 characters. This is a feature article, not a blog post.

Return JSON: { "content": "full article text with markdown", "headlines": ["3 title options"], "hashtags": ["3-5 hashtags"], "cta": "CTA directing to comments/reply", "notes": "core argument/thesis" }`,
    },
    {
      slug: "x_case_study",
      name: "X Case Study",
      description: "X article case study format (2000-3500 chars)",
      funnelStage: "bofu" as const,
      sortOrder: 9,
      promptTemplate: `Create an X article in case study format (2000-3500 characters). Case studies are the highest-converting content format for B2B audiences.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Takeaways: {{takeaways}}
Quotes: {{quotes}}
Stats: {{stats}}
Audience: {{audience}}

## Requirements
- HEADLINE: "How [X] Did [Y] in [Timeframe]" or "The [X] Framework That [Result]"
- STRUCTURE (Problem → Solution → Result):
  ## The Situation
  - Who or what is this about? Set the scene with specifics.
  - What was the core challenge or opportunity?

  ## The Approach
  - What strategy or framework was applied?
  - The key decisions and why they were made
  - What most people get wrong here

  ## The Results
  - Specific outcomes, metrics, or changes (use the stats from source material)
  - What was surprising or counterintuitive

  ## The Lesson
  - What does this mean for the reader?
  - The transferable principle they can apply immediately

- LENGTH: 2000-3500 characters
- Use real specifics — numbers, timeframes, decisions. Vague case studies don't convert.
- TONE: Journalistic. Let the results do the selling.

Return JSON: { "content": "full article with markdown structure", "headlines": ["3 headline options"], "hashtags": ["3-5 hashtags"], "cta": "CTA pointing to comments for questions/discussion", "notes": "the core transferable lesson" }`,
    },
  ];

  for (const t of xNewTemplates) {
    const existing = await db.query.contentTemplates.findFirst({
      where: and(eq(contentTemplates.platformId, xId), eq(contentTemplates.slug, t.slug)),
    });
    if (existing) {
      console.log(`Skipped (exists): ${t.slug}`);
      continue;
    }
    await db.insert(contentTemplates).values({
      platformId: xId,
      ...t,
      outputSchema: {},
      enabled: true,
    });
    console.log(`Inserted: ${t.slug}`);
  }

  // ── 3. Insert new Instagram templates ───────────────────
  const igNewTemplates = [
    {
      slug: "attractive_story",
      name: "Attractive Character Story",
      description: "Russell Brunson personal vulnerability + professional lesson post",
      funnelStage: "tofu" as const,
      sortOrder: 8,
      promptTemplate: `Create an Instagram "Attractive Character" personal story post. This is the Russell Brunson storytelling framework — personal vulnerability that leads to a professional lesson.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Emotional Angles: {{emotional_angles}}
Takeaways: {{takeaways}}
Audience: {{audience}}

## Requirements (Attractive Character Framework)
- HOOK (first line, visible before "more"): Start with a confession, near-failure, or vulnerability. Examples:
  "I almost quit last year."
  "Nobody told me this would be this hard."
  "I failed at this 3 times before it clicked."
- STORY (lines 2-10): The personal struggle — what happened, what was at stake, the moment of clarity
- LESSON (final 1/3): The professional insight derived from the personal story. Connect directly to {{pillar}}.
- Tone: Genuinely human. NOT corporate. First person. Specific details, not vague generalities.
- Length: 800-1400 characters
- End with: A question that invites the audience to share their own experience

## What this post is NOT:
- Not a listicle or tips post — this is a STORY
- Not fake vulnerability — the struggle must feel real
- Not a pitch — the lesson is the value, there's no product mention

Return JSON: {
  "content": "the full caption with line breaks",
  "headlines": ["3 hook first-line options"],
  "hashtags": ["8-12 hashtags: personal brand, industry, storytelling mix"],
  "cta": "question CTA inviting audience to share their story",
  "visual_direction": "candid, authentic photo concept — behind the scenes, real moment, not staged",
  "notes": "story arc summary"
}`,
    },
    {
      slug: "attractive_moment",
      name: "Attractive Character Moment",
      description: "Russell Brunson relatable humor / behind-the-scenes candid post",
      funnelStage: "tofu" as const,
      sortOrder: 9,
      promptTemplate: `Create an Instagram "Attractive Character Moment" post. This is the relatable humor and behind-the-scenes format from Russell Brunson's framework — showing the human side of professional life.

## Source Material
Title: {{title}} | Pillar: {{pillar}}
Audience: {{audience}}
Emotional Angles: {{emotional_angles}}

## Requirements (Attractive Character Moment)
- TYPE: Pick one of these angles based on the source material:
  A) Relatable struggle: A funny or honest admission about the daily reality of working in {{pillar}}
  B) Behind-the-scenes: An unexpected or candid moment from the work/business process
  C) Hot take / contrarian: A mildly controversial opinion that your audience secretly agrees with
  D) Self-deprecating win: "I looked ridiculous doing X, but here's what worked"

- STRUCTURE:
  - Line 1: The relatable/funny setup (1 sentence)
  - Lines 2-5: The details that make it real and funny/honest
  - Lines 6-8: The professional insight or twist ending
  - End: Invitation to engage ("Tell me I'm not the only one" / "Drop a 🙋 if this is you")

- Tone: Conversational, slightly informal, like texting a smart colleague
- Length: 400-800 characters
- Use line breaks and emojis strategically (not excessively)
- Do NOT be corporate. This should sound like a real person.

Return JSON: {
  "content": "the full caption",
  "headlines": ["3 first-line hook options"],
  "hashtags": ["5-10 hashtags, personal brand + industry"],
  "cta": "relatable engagement CTA",
  "visual_direction": "candid or minimalist photo concept — real moment, reaction face, workspace, or text-on-image",
  "notes": "which angle was used (A/B/C/D)"
}`,
    },
  ];

  for (const t of igNewTemplates) {
    const existing = await db.query.contentTemplates.findFirst({
      where: and(eq(contentTemplates.platformId, igId), eq(contentTemplates.slug, t.slug)),
    });
    if (existing) {
      console.log(`Skipped (exists): ${t.slug}`);
      continue;
    }
    await db.insert(contentTemplates).values({
      platformId: igId,
      ...t,
      outputSchema: {},
      enabled: true,
    });
    console.log(`Inserted: ${t.slug}`);
  }

  console.log("\nDone!");
  await client.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
