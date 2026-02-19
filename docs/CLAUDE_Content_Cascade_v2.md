# Content Cascade v2: Production Build Guide

> **LATTICE-Aligned Content Automation System**
> Transform articles into 56+ platform-optimized social media assets
> Version: 2.0 | Last Updated: December 2024

---

## 🎯 OAFLOT FRAMEWORK ALIGNMENT

This system maps to the LATTICE content strategy framework:

| OAFLOT Dimension | Content Cascade Application |
|------------------|----------------------------|
| **O**ffer | Generated content pieces (56+ per article) |
| **A**vatar | Platform-specific audience targeting |
| **F**unnel Stage | TOFU (awareness), MOFU (consideration), BOFU (decision) content types |
| **L**ocation | UTM tracking, geo-targeting in content |
| **T**opic | Pillar-based content categorization |

### Content Output by Funnel Stage

| Stage | Platforms | Content Types |
|-------|-----------|---------------|
| TOFU | LinkedIn, X, Instagram, TikTok, Facebook | Thought leadership, viral threads, carousels, hooks |
| MOFU | YouTube, LinkedIn, Instagram | Long-form, educational, story posts |
| BOFU | All platforms | CTAs, polls, community posts |

---

## 📐 SYSTEM ARCHITECTURE

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CONTENT CASCADE v2 ARCHITECTURE                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   AIRTABLE                    n8n AUTOMATION                 AIRTABLE       │
│  ┌──────────┐               ┌─────────────────┐            ┌──────────┐    │
│  │ Source   │   Poll 2min   │   WORKFLOW 1    │   Create   │ Social   │    │
│  │ Articles │──────────────▶│ Content Generator│───────────▶│ Content  │    │
│  │          │               │                 │            │          │    │
│  │ Status:  │               │ 7 AI Experts    │            │ 56+      │    │
│  │ Pending  │               │ (parallel)      │            │ pieces   │    │
│  └──────────┘               └─────────────────┘            └────┬─────┘    │
│                                                                  │          │
│                             ┌─────────────────┐                  │          │
│                  Poll 5min  │   WORKFLOW 2    │◀─────────────────┘          │
│                             │  CRUD Manager   │                             │
│                             │                 │                             │
│                             │ • Approvals     │                             │
│                             │ • Scheduling    │                             │
│                             │ • Publishing    │                             │
│                             │ • Deletions     │                             │
│                             └─────────────────┘                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Database | Airtable | - | CRUD operations, team interface |
| Automation | n8n | 1.x+ | Workflow orchestration |
| AI Model | OpenRouter → Gemini 2.5 Pro | - | Content generation |
| Email | Microsoft Outlook / SMTP | - | Notifications |

---

## 📊 SECTION 1: AIRTABLE SETUP

### 1.1 Base Configuration

```
Base Name: Content Cascade
Base ID: [Your Base ID - found in URL: airtable.com/appXXXXXXXXXXX]
```

### 1.2 API Token Setup

1. Go to: https://airtable.com/create/tokens
2. Click "Create new token"
3. **Name:** Content Cascade Token
4. **Scopes:** Select these:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
5. **Access:** Add your Content Cascade base
6. Click "Create token"
7. **COPY AND SAVE** the token (starts with `pat...`)

> ⚠️ **CRITICAL:** Tokens are scoped per-base. If you create a new base, you must update token access!

---

### 1.3 Table 1: Source_Articles

> **IMPORTANT:** Table name must use underscore: `Source_Articles` (not spaces!)

#### Field Definitions

| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| `Article_ID` | Single line text | No | Auto-generated unique ID |
| `Title` | Single line text | **Yes** | Article title |
| `Pillar` | Single select | **Yes** | Content category/topic |
| `Article_Text` | Long text | **Yes** | Full article content |
| `Canonical_URL` | **URL** | No | Original article link |
| `Primary_Handle` | Single line text | No | Main social handle (e.g., @YourHandle) |
| `Secondary_Handles` | Long text | No | Additional handles (one per line) |
| `Publish_Date` | Date | No | Target publish date |
| `Status` | Single select | **Yes** | Workflow status |
| `Approval_Recipients` | Email | No | Notification recipients |
| `Processing_Started` | Date time | Auto | Set when processing begins |
| `Processing_Completed` | Date time | Auto | Set when processing ends |
| `Total_Assets_Generated` | Number (integer) | Auto | Count of pieces created |
| `Created_At` | Date time | Auto | Record creation timestamp |
| `Notes` | Long text | No | Internal notes |

#### Pillar Options (Single Select)

Configure these options with colors:

| Option | Color |
|--------|-------|
| General | Blue Light |
| Leadership | Cyan Light |
| Culture | Teal Light |
| Technology | Green Light |
| Investment | Yellow Light |
| Operations | Orange Light |
| Senior Living | Red Light |
| PropTech | Pink Light |
| AI & Automation | Purple Light |
| Marketing | Gray Light |

#### Status Options (Single Select)

| Option | Color | Description |
|--------|-------|-------------|
| `Pending` | 🟡 Yellow | Ready for processing |
| `Processing` | 🔵 Blue | Currently being processed |
| `Completed` | 🟢 Green | Processing finished |
| `Error` | 🔴 Red | Processing failed |

---

### 1.4 Table 2: Social_Content

> **IMPORTANT:** Table name must use underscore: `Social_Content` (not spaces!)

#### Field Definitions

| Field Name | Field Type | Required | Description |
|------------|------------|----------|-------------|
| `Content_ID` | Single line text | Auto | Unique content piece ID |
| `Source_Article_ID` | Single line text | Auto | Reference to source article |
| `Platform` | Single select | Auto | Target platform |
| `Content_Type` | Single select | Auto | Type of content piece |
| `Primary_Content` | Long text | Auto | Main content body |
| `Headlines` | Long text | Auto | JSON array of headlines |
| `Hashtags` | Long text | Auto | Comma-separated hashtags |
| `CTA` | Long text | Auto | Call to action |
| `Notes` | Long text | Auto | Production notes |
| `Visual_Direction` | Long text | Auto | Creative direction |
| `Sound_Suggestion` | Single line text | Auto | Audio for video content |
| `UTM_URL` | **URL** | Auto | Trackable link |
| `Status` | Single select | Auto/Manual | Content lifecycle status |
| `Scheduled_DateTime` | Date time | Manual | When to publish |
| `Published_At` | Date time | Auto | Actual publish timestamp |
| `Published_URL` | **URL** | Auto | Link to live post |
| `Platform_Response` | Long text | Auto | API response data |
| `Approved_At` | Date time | Auto | Approval timestamp |
| `Approved_By` | Single line text | Manual | Who approved |
| `Performance_Metrics` | Long text | Manual | JSON engagement data |
| `Created_At` | Date time | Auto | Record creation timestamp |
| `Priority` | Single select | Manual | Content priority |

> ⚠️ **CRITICAL:** `UTM_URL`, `Published_URL` fields MUST be **URL** type, NOT Single Select!

#### Platform Options (Single Select)

| Option | Color |
|--------|-------|
| `LINKEDIN` | Blue |
| `X` | Gray |
| `INSTAGRAM` | Pink |
| `TIKTOK` | Cyan |
| `YOUTUBE` | Red |
| `FACEBOOK` | Dark Blue |
| `MEMES` | Yellow |

#### Status Options (Single Select)

| Option | Color | Description |
|--------|-------|-------------|
| `Draft` | ⚪ Gray | Initial state, needs review |
| `Review` | 🟡 Yellow | Under review |
| `Approved` | 🔵 Cyan | Approved, awaiting scheduling |
| `Ready_to_Schedule` | 🔵 Blue | System-set after approval |
| `Scheduled` | 🟣 Purple | Has Scheduled_DateTime set |
| `Published` | 🟢 Green | Posted to platform |
| `Archived` | ⚫ Dark Gray | No longer active |
| `Delete` | 🔴 Red | Marked for deletion |

#### Content_Type Options (Single Select)

All 56 content types across 7 platforms:

**LinkedIn (8):**
`thought_leadership`, `story_post`, `contrarian_take`, `data_spotlight`, `listicle`, `question_post`, `carousel_outline`, `poll_concept`

**X/Twitter (8):**
`viral_thread`, `hot_take`, `stat_bomb`, `quote_tweet`, `poll_tweet`, `thread_hook`, `reply_bait`, `x_article`

**Instagram (8):**
`carousel_educational`, `carousel_storytelling`, `single_image`, `reel_script`, `reel_hook`, `story_series`, `caption_long`, `caption_short`

**TikTok (8):**
`hook_video`, `educational`, `storytime`, `trend_adaptation`, `duet_response`, `greenscreen`, `quick_tip`, `series_episode`

**YouTube (8):**
`long_form`, `shorts_hook`, `shorts_tip`, `community_post`, `video_description`, `thumbnail_concepts`, `end_screen`, `pinned_comment`

**Facebook (8):**
`long_post`, `short_post`, `link_post`, `video_post`, `live_outline`, `group_post`, `event_post`, `reel_script`

**Memes (8):**
`drake_format`, `distracted_boyfriend`, `expanding_brain`, `this_is_fine`, `change_my_mind`, `is_this_a`, `two_buttons`, `custom_concept`

#### Priority Options (Single Select)

| Option | Color |
|--------|-------|
| `High` | Red |
| `Medium` | Yellow |
| `Low` | Green |

---

### 1.5 Recommended Views

Create these views in Airtable for your media team:

#### Source_Articles Views
- **📝 Pending** - Filter: Status = "Pending"
- **⚙️ Processing** - Filter: Status = "Processing"
- **✅ Completed** - Filter: Status = "Completed"
- **❌ Errors** - Filter: Status = "Error"

#### Social_Content Views
- **📝 Needs Review** - Filter: Status = "Draft"
- **👀 In Review** - Filter: Status = "Review"
- **✅ Approved** - Filter: Status = "Approved" OR "Ready_to_Schedule"
- **📅 Scheduled** - Filter: Status = "Scheduled", Sort by Scheduled_DateTime
- **🚀 Published** - Filter: Status = "Published"
- **📊 By Platform** - Group by Platform
- **🗓️ Calendar** - Calendar view on Scheduled_DateTime
- **🗑️ To Delete** - Filter: Status = "Delete"

---

## 🔧 SECTION 2: N8N CREDENTIALS

### 2.1 Required Credentials

| Credential | Type | Purpose |
|------------|------|---------|
| Airtable Token | API Key | Database operations |
| OpenRouter | API Key | AI model access |
| Microsoft Outlook | OAuth2 | Email notifications |

### 2.2 OpenRouter Setup

1. Go to: https://openrouter.ai/
2. Create account and get API key
3. In n8n: Settings → Credentials → Add "OpenRouter"
4. Paste API key
5. Model to use: `google/gemini-2.5-pro`

### 2.3 Airtable HTTP Headers

For all Airtable HTTP Request nodes, use:

```
Authorization: Bearer YOUR_AIRTABLE_TOKEN
Content-Type: application/json
```

---

## 🔄 SECTION 3: WORKFLOW 1 - CONTENT GENERATOR

### 3.1 Workflow Overview

| Property | Value |
|----------|-------|
| Name | Content Cascade v2: Airtable CRUD System |
| Trigger | Schedule (every 2 minutes) + Manual |
| Nodes | 38 |
| Purpose | Generate 56+ content pieces per article |

### 3.2 Node Configuration

#### Node 1: Schedule Trigger
```
Type: n8n-nodes-base.scheduleTrigger
Name: Every 2 Minutes
Parameters:
  rule.interval[0].field: minutes
  rule.interval[0].minutesInterval: 2
```

#### Node 2: Manual Trigger
```
Type: n8n-nodes-base.manualTrigger
Name: Manual Test
```

#### Node 3: Poll Pending Articles
```
Type: n8n-nodes-base.httpRequest
Name: Poll Pending Articles
Method: GET
URL: https://api.airtable.com/v0/{BASE_ID}/Source_Articles
Query Parameters:
  filterByFormula: {Status}='Pending'
  maxRecords: 1
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
```

#### Node 4: Check Has Records
```
Type: n8n-nodes-base.code
Name: Check Has Records
```

**Code:**
```javascript
const records = $input.first().json?.records || [];
if (!records.length) {
  // No pending records - stop workflow gracefully
  return [];
}
// Return first record for processing
return [{ json: records[0] }];
```

#### Node 5: Extract Article Data
```
Type: n8n-nodes-base.code
Name: Extract Article Data
```

**Code:**
```javascript
const record = $input.first().json;
const fields = record.fields || record;

const articleId = record.id;
const text = (fields.Article_Text || '').replace(/\s+/g, ' ').trim();
const truncated = text.length > 80000 
  ? text.slice(0, 60000) + '\n[...TRUNCATED...]\n' + text.slice(-20000) 
  : text;

return [{
  json: {
    record_id: articleId,
    article_id: fields.Article_ID || `art-${Date.now()}`,
    pillar: fields.Pillar || 'General',
    title: fields.Title || 'Untitled',
    canonical_url: fields.Canonical_URL || '',
    article_text: truncated,
    primary_handle: fields.Primary_Handle || '@YourHandle',
    secondary_handles: fields.Secondary_Handles || [],
    publish_date: fields.Publish_Date || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    approval_recipients: fields.Approval_Recipients || ['content@example.com'],
    created_at: new Date().toISOString()
  }
}];
```

#### Node 6: Set Status Processing
```
Type: n8n-nodes-base.httpRequest
Name: Set Status: Processing
Method: PATCH
URL: =https://api.airtable.com/v0/{BASE_ID}/Source_Articles/{{ $json.record_id }}
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
  Content-Type: application/json
Body (JSON):
  {
    "fields": {
      "Status": "Processing",
      "Processing_Started": "{{ new Date().toISOString() }}"
    }
  }
```

#### Node 7: Extract Key Content (LLM Chain)
```
Type: @n8n/n8n-nodes-langchain.chainLlm
Name: Extract Key Content
Connected to: OpenRouter LLM node
```

**Prompt:**
```
You are a content strategist. Extract key content for social media repurposing. Return valid JSON only.

Pillar: {{ $('Extract Article Data').item.json.pillar }}
Title: {{ $('Extract Article Data').item.json.title }}

Article:
{{ $('Extract Article Data').item.json.article_text }}

Return JSON with:
- takeaways: array of 5-10 key points with 'point' and 'detail'
- quotes: array of 10-15 quotable lines with 'quote' and 'context'
- stats: array of 5-10 statistics with 'stat' and 'source'
- hooks: array of 8-12 attention-grabbing hooks for social
- themes: array of 3-5 main themes
- audience_insights: who this content is for and their pain points
- emotional_angles: 3-5 emotional hooks that could resonate
```

#### Node 8: OpenRouter Extraction
```
Type: @n8n/n8n-nodes-langchain.lmChatOpenRouter
Name: OpenRouter: Extraction
Model: google/gemini-2.5-pro
Credentials: OpenRouter API
```

#### Node 9: Parse Extraction
```
Type: n8n-nodes-base.code
Name: Parse Extraction
```

**Code:**
```javascript
const input = $input.first().json;
const prev = $('Extract Article Data').first().json;
let extraction = {};
try {
  let content = input.text || input.output || '{}';
  content = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  extraction = JSON.parse(content);
} catch(e) {
  extraction = { error: 'Parse failed', raw: String(input).substring(0,500) };
}
return [{ json: { ...prev, extraction } }];
```

#### Node 10: Split to 7 Platforms
```
Type: n8n-nodes-base.code
Name: Split to 7 Platforms
```

**Code:**
```javascript
const input = $input.first().json;
const platforms = ['linkedin', 'x', 'instagram', 'tiktok', 'youtube', 'facebook', 'memes'];

return platforms.map(platform => ({
  json: {
    ...input,
    target_platform: platform
  }
}));
```

---

## 🤖 SECTION 4: AI EXPERT PROMPTS

### 4.1 LinkedIn Expert

```
Type: @n8n/n8n-nodes-langchain.chainLlm
Name: LinkedIn Expert
Connected to: OR: LinkedIn (OpenRouter node with google/gemini-2.5-pro)
```

**Prompt:**
```
You are a LinkedIn content strategist with 10+ years experience. Create ALL 8 LinkedIn content pieces. Return valid JSON only.

## CONTEXT
Pillar: {{ $json.pillar }}
Handle: {{ $json.primary_handle }}
Title: {{ $json.title }}
Extraction: {{ JSON.stringify($json.extraction) }}

## CREATE THESE 8 PIECES:

1. **thought_leadership** - Deep-dive post (1500-2000 chars) with personal insights
2. **story_post** - Narrative format with relatable story (1200-1500 chars)
3. **contrarian_take** - Bold perspective that challenges conventional wisdom (800-1200 chars)
4. **data_spotlight** - Lead with compelling statistic (600-1000 chars)
5. **listicle** - Numbered insights format (1000-1400 chars)
6. **question_post** - Opens with provocative question (600-800 chars)
7. **carousel_outline** - 10 slide carousel concept (slide titles + key points)
8. **poll_concept** - Engaging poll question with 4 options

Return JSON: { "platform": "linkedin", "pieces": [{ "type": "...", "content": "...", "headlines": [], "hashtags": [], "cta": "", "notes": "" }] }
```

### 4.2 X/Twitter Expert

**Prompt:**
```
You are an X/Twitter expert. Create 8 pieces optimized for X's algorithm. Return valid JSON only.

## CONTEXT
Pillar: {{ $json.pillar }}
Handle: {{ $json.primary_handle }}
Title: {{ $json.title }}
Extraction: {{ JSON.stringify($json.extraction) }}

## CREATE THESE 8 PIECES:

1. **viral_thread** - 8-12 tweet thread (each <280 chars)
2. **hot_take** - Provocative single tweet
3. **stat_bomb** - Data-driven tweet with visual hook
4. **quote_tweet** - Designed to spark engagement
5. **poll_tweet** - Engagement-focused poll
6. **thread_hook** - Compelling thread opener
7. **reply_bait** - Designed to drive comments
8. **x_article** - Long-form X article (1500-2500 chars)

Return JSON: { "platform": "x", "pieces": [{ "type": "...", "content": "...", "headlines": [], "hashtags": [], "cta": "", "notes": "" }] }
```

### 4.3 Instagram Expert

**Prompt:**
```
You are an Instagram content strategist. Create 8 pieces optimized for Instagram. Return valid JSON only.

## CONTEXT
Pillar: {{ $json.pillar }}
Handle: {{ $json.primary_handle }}
Title: {{ $json.title }}
Extraction: {{ JSON.stringify($json.extraction) }}

## CREATE THESE 8 PIECES:

1. **carousel_educational** - 10-slide educational carousel with slide titles and content
2. **carousel_storytelling** - Visual story format carousel
3. **single_image** - Impactful single image post with caption
4. **reel_script** - 30-60 second Reel script with hook, body, CTA
5. **reel_hook** - Pattern-interrupt Reel opener (first 3 seconds)
6. **story_series** - 5-7 story sequence outline
7. **caption_long** - Detailed caption (2000+ chars) with hooks
8. **caption_short** - Punchy caption (<500 chars)

Return JSON: { "platform": "instagram", "pieces": [{ "type": "...", "content": "...", "visual_direction": "...", "headlines": [], "hashtags": [], "cta": "", "notes": "" }] }
```

### 4.4 TikTok Expert

**Prompt:**
```
You are a TikTok content creator expert. Create 8 TikTok-optimized pieces. Return valid JSON only.

## CONTEXT
Pillar: {{ $json.pillar }}
Handle: {{ $json.primary_handle }}
Title: {{ $json.title }}
Extraction: {{ JSON.stringify($json.extraction) }}

## CREATE THESE 8 PIECES:

1. **hook_video** - 15-30 sec hook-focused video script
2. **educational** - 60-90 sec educational content script
3. **storytime** - Narrative format script
4. **trend_adaptation** - Trending format application
5. **duet_response** - Designed for duet engagement
6. **greenscreen** - Greenscreen talking head format
7. **quick_tip** - Under 15 second quick tip
8. **series_episode** - Part of ongoing series

Return JSON: { "platform": "tiktok", "pieces": [{ "type": "...", "hook": "...", "script": "...", "visual_cues": [], "sound_suggestion": "", "hashtags": [], "cta": "", "notes": "" }] }
```

### 4.5 YouTube Expert

**Prompt:**
```
You are a YouTube content strategist. Create 8 YouTube-optimized pieces. Return valid JSON only.

## CONTEXT
Pillar: {{ $json.pillar }}
Handle: {{ $json.primary_handle }}
Title: {{ $json.title }}
Extraction: {{ JSON.stringify($json.extraction) }}

## CREATE THESE 8 PIECES:

1. **long_form** - 10-15 min video outline with timestamps
2. **shorts_hook** - YouTube Shorts script (<60 sec)
3. **shorts_tip** - Quick tip Shorts format
4. **community_post** - YouTube Community tab post
5. **video_description** - SEO-optimized video description
6. **thumbnail_concepts** - 3 thumbnail ideas with text overlays
7. **end_screen** - End screen CTA script
8. **pinned_comment** - Engagement-driving pinned comment

Return JSON: { "platform": "youtube", "pieces": [{ "type": "...", "content": "...", "titles": [], "tags": [], "cta": "", "notes": "" }] }
```

### 4.6 Facebook Expert

**Prompt:**
```
You are a Facebook content expert. Create 8 Facebook-optimized pieces. Return valid JSON only.

## CONTEXT
Pillar: {{ $json.pillar }}
Handle: {{ $json.primary_handle }}
Title: {{ $json.title }}
Extraction: {{ JSON.stringify($json.extraction) }}

## CREATE THESE 8 PIECES:

1. **long_post** - Detailed post (2000+ chars) optimized for engagement
2. **short_post** - Punchy engagement post (<500 chars)
3. **link_post** - Post with link preview optimization
4. **video_post** - Video post script/description
5. **live_outline** - Facebook Live event outline
6. **group_post** - Optimized for group engagement
7. **event_post** - Event announcement format
8. **reel_script** - Facebook Reel script

Return JSON: { "platform": "facebook", "pieces": [{ "type": "...", "content": "...", "headlines": [], "hashtags": [], "cta": "", "notes": "" }] }
```

### 4.7 Meme Expert

**Prompt:**
```
You are a meme creator expert. Create 8 meme concepts. Return valid JSON only.

## CONTEXT
Pillar: {{ $json.pillar }}
Handle: {{ $json.primary_handle }}
Title: {{ $json.title }}
Extraction: {{ JSON.stringify($json.extraction) }}

## CREATE THESE 8 MEME CONCEPTS:

1. **drake_format** - Drake approving/disapproving format
2. **distracted_boyfriend** - Distracted boyfriend meme
3. **expanding_brain** - Expanding brain with 4 levels
4. **this_is_fine** - This is fine dog format
5. **change_my_mind** - Change my mind format
6. **is_this_a** - Butterfly meme 'Is this a...?'
7. **two_buttons** - Two buttons anxiety format
8. **custom_concept** - Original meme concept

Return JSON: { "platform": "memes", "pieces": [{ "type": "...", "format": "...", "top_text": "...", "bottom_text": "...", "panels": [], "context": "...", "headlines": [], "hashtags": [], "cta": "", "notes": "" }] }
```

---

## 📝 SECTION 5: PARSE & MERGE NODES

### 5.1 Parse Platform Results (7 nodes - one per platform)

Each platform expert output goes through a Parse node:

```
Type: n8n-nodes-base.code
Names: Parse LinkedIn, Parse X, Parse Instagram, Parse TikTok, Parse YouTube, Parse Facebook, Parse Memes
```

**Code (same for all, just change platform name in error fallback):**
```javascript
const input = $input.first().json;
const prev = $('Split to 7 Platforms').item.json;
let result = {};
try {
  let content = input.text || input.output || '{}';
  content = content.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
  result = JSON.parse(content);
} catch(e) {
  result = { platform: 'linkedin', pieces: [], error: e.message };
}
return [{ json: { ...prev, platform_result: result } }];
```

### 5.2 Merge All Platforms

```
Type: n8n-nodes-base.merge
Name: Merge All Platforms
Mode: Append
Inputs: 7 (one from each Parse node)
```

### 5.3 Flatten to Assets

```
Type: n8n-nodes-base.code
Name: Flatten to Assets
```

**Code:**
```javascript
const items = $input.all();
const first = items[0]?.json || {};
const assets = [];

for (const item of items) {
  const data = item.json;
  const platformResult = data.platform_result || {};
  const pieces = platformResult.pieces || [];
  
  for (const piece of pieces) {
    let primaryContent = piece.content || '';
    if (piece.script) primaryContent = piece.script;
    if (piece.hook && piece.script) primaryContent = `HOOK: ${piece.hook}\n\nSCRIPT:\n${piece.script}`;
    if (piece.panels && piece.panels.length) primaryContent = piece.panels.map((p, i) => `Panel ${i+1}: ${typeof p === 'string' ? p : JSON.stringify(p)}`).join('\n');
    if (piece.top_text || piece.bottom_text) {
      primaryContent = `Format: ${piece.format || piece.type}\nTop: ${piece.top_text || ''}\nBottom: ${piece.bottom_text || ''}`;
      if (piece.context) primaryContent += `\nContext: ${piece.context}`;
    }
    
    // Ensure primaryContent is a string
    primaryContent = String(primaryContent || '');
    
    const asset = {
      fields: {
        Content_ID: `${data.article_id}-${platformResult.platform || data.target_platform}-${piece.type}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        Source_Article_ID: data.record_id,
        Platform: (platformResult.platform || data.target_platform || '').toUpperCase(),
        Content_Type: piece.type || 'unknown',
        Primary_Content: primaryContent.substring(0, 100000),
        Headlines: JSON.stringify(piece.headlines || piece.titles || []).substring(0, 10000),
        Hashtags: Array.isArray(piece.hashtags || piece.tags) ? (piece.hashtags || piece.tags).join(', ').substring(0, 2000) : String(piece.hashtags || piece.tags || '').substring(0, 2000),
        CTA: String(piece.cta || '').substring(0, 2000),
        Notes: String(piece.notes || '').substring(0, 5000),
        Visual_Direction: String(piece.visual_direction || (Array.isArray(piece.visual_cues) ? piece.visual_cues.join(', ') : '') || '').substring(0, 5000),
        Sound_Suggestion: String(piece.sound_suggestion || '').substring(0, 1000),
        UTM_URL: `${data.canonical_url || 'https://example.com'}?utm_source=${platformResult.platform || data.target_platform}&utm_medium=social&utm_campaign=${data.article_id}`,
        Status: 'Draft',
        Created_At: new Date().toISOString()
      }
    };
    
    assets.push({ json: asset });
  }
}

const metadata = {
  record_id: first.record_id,
  article_id: first.article_id,
  title: first.title,
  pillar: first.pillar,
  canonical_url: first.canonical_url,
  total_assets: assets.length
};

return assets.map(a => ({ json: { ...a.json, _metadata: metadata } }));
```

### 5.4 Create Social Content Records

```
Type: n8n-nodes-base.httpRequest
Name: Create Social Content Records
Method: POST
URL: https://api.airtable.com/v0/{BASE_ID}/Social_Content
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
  Content-Type: application/json
Body: ={{ JSON.stringify({ fields: $json.fields }) }}
```

### 5.5 Aggregate Results

```
Type: n8n-nodes-base.code
Name: Aggregate Results
```

**Code:**
```javascript
const items = $input.all();
const first = items[0]?.json?._metadata || items[0]?.json || {};

const platformCounts = {};
for (const item of items) {
  const platform = item.json?.fields?.Platform || item.json?.Platform || 'unknown';
  platformCounts[platform] = (platformCounts[platform] || 0) + 1;
}

return [{
  json: {
    record_id: first.record_id,
    article_id: first.article_id,
    title: first.title,
    pillar: first.pillar,
    total_assets: items.length,
    platform_breakdown: platformCounts,
    created_at: new Date().toISOString()
  }
}];
```

### 5.6 Set Status Completed

```
Type: n8n-nodes-base.httpRequest
Name: Set Status: Completed
Method: PATCH
URL: =https://api.airtable.com/v0/{BASE_ID}/Source_Articles/{{ $json.record_id }}
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
  Content-Type: application/json
Body:
  {
    "fields": {
      "Status": "Completed",
      "Processing_Completed": "{{ new Date().toISOString() }}",
      "Total_Assets_Generated": {{ $json.total_assets }}
    }
  }
```

### 5.7 Build Notification

```
Type: n8n-nodes-base.code
Name: Build Notification
```

**Code:**
```javascript
const data = $input.first().json;
const breakdown = data.platform_breakdown || {};

const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8fafc; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 32px; color: white; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 8px 0 0; opacity: 0.9; }
    .content { padding: 32px; }
    .stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
    .stat { background: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: bold; color: #1e293b; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    .platforms { margin: 24px 0; }
    .platform { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
    .platform:last-child { border-bottom: none; }
    .btn { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Content Pack Ready!</h1>
      <p>${data.title}</p>
    </div>
    <div class="content">
      <div class="stat-grid">
        <div class="stat">
          <div class="stat-value">${data.total_assets}</div>
          <div class="stat-label">TOTAL PIECES</div>
        </div>
        <div class="stat">
          <div class="stat-value">7</div>
          <div class="stat-label">PLATFORMS</div>
        </div>
      </div>
      
      <h3 style="color:#1e293b;margin-bottom:16px;">Platform Breakdown</h3>
      <div class="platforms">
        ${Object.entries(breakdown).map(([platform, count]) => `
          <div class="platform">
            <span>${platform.charAt(0).toUpperCase() + platform.slice(1)}</span>
            <strong>${count} pieces</strong>
          </div>
        `).join('')}
      </div>
      
      <p style="color:#64748b;font-size:14px;">All content is now available in Airtable with Status = "Draft". Review, approve, and schedule as needed.</p>
      
      <a href="https://airtable.com/{YOUR_BASE_ID}" class="btn">Open Airtable →</a>
    </div>
  </div>
</body>
</html>
`;

return [{
  json: {
    ...data,
    email: {
      subject: `📦 Content Pack: ${data.title} (${data.total_assets} pieces ready)`,
      html
    }
  }
}];
```

### 5.8 Send Notification Email

```
Type: n8n-nodes-base.microsoftOutlook (or n8n-nodes-base.emailSend for SMTP)
Name: Send Notification Email
To: your-team@example.com
Subject: ={{ $json.email.subject }}
Body: ={{ $json.email.html }}
Body Type: HTML
```

---

## 🔄 SECTION 6: WORKFLOW 2 - CRUD MANAGER

### 6.1 Workflow Overview

| Property | Value |
|----------|-------|
| Name | Content Cascade v2: CRUD Manager |
| Trigger | Schedule (every 5 minutes) + Manual |
| Nodes | 23 |
| Purpose | Handle approvals, scheduling, publishing, deletions |

### 6.2 Three Parallel Operations

The workflow runs three parallel polling operations:

```
Trigger (5 min)
    │
    ├──▶ Poll Approved → Mark Ready_to_Schedule
    │
    ├──▶ Poll Scheduled (due) → Route by Platform → Mark Published
    │
    └──▶ Poll Delete → Delete Records
```

### 6.3 Poll Status Changes (Approvals)

```
Type: n8n-nodes-base.httpRequest
Name: Poll Status Changes
Method: GET
URL: https://api.airtable.com/v0/{BASE_ID}/Social_Content
Query Parameters:
  filterByFormula: {Status}='Approved'
  maxRecords: 50
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
```

### 6.4 Check Approvals

```
Type: n8n-nodes-base.code
Name: Check Approvals
```

**Code:**
```javascript
const records = $input.first().json?.records || [];
if (!records.length) return [];
return records.map(r => ({ json: { id: r.id, ...r.fields } }));
```

### 6.5 Mark Ready for Scheduling

```
Type: n8n-nodes-base.httpRequest
Name: Mark Ready for Scheduling
Method: PATCH
URL: =https://api.airtable.com/v0/{BASE_ID}/Social_Content/{{ $json.id }}
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
  Content-Type: application/json
Body:
  {
    "fields": {
      "Status": "Ready_to_Schedule",
      "Approved_At": "{{ new Date().toISOString() }}"
    }
  }
```

### 6.6 Poll Scheduled Content

```
Type: n8n-nodes-base.httpRequest
Name: Poll Scheduled Content
Method: GET
URL: https://api.airtable.com/v0/{BASE_ID}/Social_Content
Query Parameters:
  filterByFormula: AND({Status}='Scheduled',{Scheduled_DateTime}<=NOW())
  maxRecords: 20
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
```

### 6.7 Route by Platform

```
Type: n8n-nodes-base.switch
Name: Route by Platform
Rules:
  - LINKEDIN → LinkedIn Handler
  - X → X Handler
  - INSTAGRAM → Instagram Handler
  - FACEBOOK → Facebook Handler
  - default → Other Platforms
```

### 6.8 Platform Handlers (Placeholder)

Each platform handler is a Code node that returns a success response. Replace with actual API integration:

```javascript
// LinkedIn Handler example
const item = $input.first().json;
return [{ 
  json: { 
    ...item,
    platform_response: { 
      success: true, 
      platform: 'linkedin',
      posted_at: new Date().toISOString(),
      note: 'Ready for LinkedIn API integration' 
    } 
  } 
}];
```

### 6.9 Mark Published

```
Type: n8n-nodes-base.httpRequest
Name: Mark Published
Method: PATCH
URL: =https://api.airtable.com/v0/{BASE_ID}/Social_Content/{{ $json.id }}
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
  Content-Type: application/json
Body:
  {
    "fields": {
      "Status": "Published",
      "Published_At": "{{ new Date().toISOString() }}",
      "Platform_Response": "{{ JSON.stringify($json.platform_response) }}"
    }
  }
```

### 6.10 Poll Delete Requests

```
Type: n8n-nodes-base.httpRequest
Name: Poll Delete Requests
Method: GET
URL: https://api.airtable.com/v0/{BASE_ID}/Social_Content
Query Parameters:
  filterByFormula: {Status}='Delete'
  maxRecords: 50
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
```

### 6.11 Delete Records

```
Type: n8n-nodes-base.httpRequest
Name: Delete Records
Method: DELETE
URL: =https://api.airtable.com/v0/{BASE_ID}/Social_Content/{{ $json.id }}
Headers:
  Authorization: Bearer {YOUR_AIRTABLE_TOKEN}
```

---

## 📋 SECTION 7: WORKFLOW CONNECTIONS

### 7.1 Workflow 1 Connections

```
Manual Test ──────────────────────────────────────┐
                                                  ▼
Every 2 Minutes ──▶ Poll Pending Articles ──▶ Check Has Records ──▶ Extract Article Data
                                                                           │
                                                                           ▼
Set Status: Processing ◀────────────────────────────────────────────────────┘
         │
         ▼
Extract Key Content (with OpenRouter LLM)
         │
         ▼
Parse Extraction ──▶ Split to 7 Platforms
                            │
         ┌──────────────────┼──────────────────┐
         ▼                  ▼                  ▼
    LinkedIn Expert    X Expert    ... (7 total, parallel)
         │                  │                  │
         ▼                  ▼                  ▼
    Parse LinkedIn     Parse X         ... (7 parse nodes)
         │                  │                  │
         └──────────────────┼──────────────────┘
                            ▼
                    Merge All Platforms
                            │
                            ▼
                    Flatten to Assets
                            │
                            ▼
                Create Social Content Records
                            │
                            ▼
                    Aggregate Results
                            │
                            ▼
                 Set Status: Completed
                            │
                            ▼
                    Build Notification
                            │
                            ▼
                  Send Notification Email
```

### 7.2 Workflow 2 Connections

```
Manual Test ────────────────────┐
                                │
Every 5 Minutes ────────────────┼──▶ Poll Status Changes ──▶ Check Approvals ──▶ Mark Ready for Scheduling
                                │
                                ├──▶ Poll Scheduled Content ──▶ Check Due Posts ──▶ Route by Platform
                                │                                                         │
                                │         ┌───────────────────────────────────────────────┼───────────────────┐
                                │         ▼                   ▼                           ▼                   ▼
                                │    LinkedIn Handler    X Handler    Instagram Handler    Other Platforms
                                │         │                   │                           │                   │
                                │         └───────────────────┴───────────────────────────┴───────────────────┘
                                │                                         │
                                │                                         ▼
                                │                                  Mark Published
                                │
                                └──▶ Poll Delete Requests ──▶ Process Deletes ──▶ Delete Records
```

---

## 👥 SECTION 8: OPERATIONS GUIDE

### 8.1 Media Team Workflow

```
1. ARTICLE SUBMISSION
   └─▶ Add article to Source_Articles
   └─▶ Set Status = "Pending"
   └─▶ Wait 2-5 minutes

2. CONTENT REVIEW
   └─▶ Open Social_Content table
   └─▶ Use "Needs Review" view
   └─▶ Review generated content
   └─▶ Edit as needed

3. APPROVAL
   └─▶ Change Status to "Approved"
   └─▶ System auto-changes to "Ready_to_Schedule"

4. SCHEDULING
   └─▶ Set Scheduled_DateTime
   └─▶ Change Status to "Scheduled"

5. PUBLISHING
   └─▶ System auto-publishes when datetime arrives
   └─▶ Status changes to "Published"

6. CLEANUP
   └─▶ Set Status = "Archived" (keep) or "Delete" (remove)
```

### 8.2 Expected Output

Per article processed:

| Platform | Content Pieces |
|----------|---------------|
| LinkedIn | 8 |
| X/Twitter | 8 |
| Instagram | 8 |
| TikTok | 8 |
| YouTube | 8 |
| Facebook | 8 |
| Memes | 8 |
| **TOTAL** | **56** |

---

## 🔧 SECTION 9: TROUBLESHOOTING

### 9.1 Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Forbidden - check credentials` | Token doesn't have access to base | Update token scopes at airtable.com/create/tokens |
| `Table not found` | Table name has space instead of underscore | Rename table: `Social Content` → `Social_Content` |
| `Invalid permissions to create select option` | Field is Single Select, should be URL | Change field type from Single Select to URL |
| `primaryContent.substring is not a function` | Value is not a string | Use `String(value)` wrapper before `.substring()` |
| `No records returned` | Filter doesn't match or Status is wrong | Check Status field value matches exactly (case-sensitive) |

### 9.2 Status Field Values

**CRITICAL:** Status values are case-sensitive and must match exactly:

✅ Correct: `Pending`, `Processing`, `Completed`, `Draft`, `Approved`
❌ Wrong: `pending`, `PENDING`, ` Pending`, `Pending `

### 9.3 Field Type Checklist

Before running workflows, verify these field types:

| Field | Must Be |
|-------|---------|
| `Status` (both tables) | Single Select |
| `Platform` | Single Select |
| `Content_Type` | Single Select |
| `UTM_URL` | **URL** (not Single Select!) |
| `Published_URL` | **URL** (not Single Select!) |
| `Canonical_URL` | **URL** (not Single Select!) |
| `Scheduled_DateTime` | Date Time |
| `Processing_Started` | Date Time |
| `Processing_Completed` | Date Time |

### 9.4 Testing Checklist

- [ ] Airtable token has access to the correct base
- [ ] Table names use underscores (not spaces)
- [ ] All Status options are created in Single Select fields
- [ ] All Platform options are created
- [ ] All Content_Type options are created
- [ ] URL fields are URL type (not Single Select)
- [ ] OpenRouter credential is configured
- [ ] Email credential is configured
- [ ] Both workflows are active

---

## 📎 SECTION 10: QUICK REFERENCE

### API Endpoints

```
Base URL: https://api.airtable.com/v0/{BASE_ID}

GET    /Source_Articles              - List articles
GET    /Source_Articles?filterByFormula={Status}='Pending'
PATCH  /Source_Articles/{record_id}  - Update article
GET    /Social_Content               - List content
POST   /Social_Content               - Create content
PATCH  /Social_Content/{record_id}   - Update content
DELETE /Social_Content/{record_id}   - Delete content
```

### Timing

| Workflow | Poll Interval |
|----------|--------------|
| Content Generator | Every 2 minutes |
| CRUD Manager | Every 5 minutes |

### Replace These Values

When building in a new environment, replace:

```
{BASE_ID}            → Your Airtable Base ID (e.g., appXXXXXXXXXXXXX)
{YOUR_AIRTABLE_TOKEN} → Your Airtable API Token (starts with pat...)
{YOUR_BASE_ID}       → Same as BASE_ID (used in email link)
@YourHandle          → Your primary social media handle
your-team@example.com → Your notification email addresses
```

---

## 📄 VERSION HISTORY

| Version | Date | Changes |
|---------|------|---------|
| 2.0 | Dec 2024 | Complete rebuild with Airtable CRUD, 7 parallel AI experts |
| 1.0 | Original | Webhook-based input, email-only output |

---

*Built with LATTICE/OAFLOT content strategy framework alignment.*
*Designed for production deployment with full lifecycle management.*
