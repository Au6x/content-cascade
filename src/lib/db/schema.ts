import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  pgEnum,
  uuid,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Enums ───────────────────────────────────────────────

export const pillarEnum = pgEnum("pillar", [
  "general",
  "leadership",
  "culture",
  "technology",
  "investment",
  "operations",
  "senior_living",
  "proptech",
  "ai_automation",
  "marketing",
]);

export const sourceStatusEnum = pgEnum("source_status", [
  "draft",
  "pending",
  "processing",
  "completed",
  "error",
]);

export const jobStatusEnum = pgEnum("job_status", [
  "queued",
  "extracting",
  "generating",
  "imaging",
  "completed",
  "failed",
]);

export const derivativeStatusEnum = pgEnum("derivative_status", [
  "draft",
  "approved",
  "scheduled",
  "published",
  "archived",
]);

export const funnelStageEnum = pgEnum("funnel_stage", [
  "tofu",
  "mofu",
  "bofu",
]);

// ─── Tables ──────────────────────────────────────────────

export const brandProfiles = pgTable("brand_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  voiceGuidelines: text("voice_guidelines").notNull().default(""),
  tone: text("tone").notNull().default(""),
  vocabulary: jsonb("vocabulary").$type<{
    preferred: string[];
    avoided: string[];
  }>().default({ preferred: [], avoided: [] }),
  exampleContent: jsonb("example_content").$type<string[]>().default([]),
  ghlLocationId: text("ghl_location_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const brandAssets = pgTable(
  "brand_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brandProfiles.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    description: text("description").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().default([]),
    assetType: text("asset_type").notNull().default("headshot"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_brand_assets_brand").on(table.brandId),
  ]
);

export const contentSources = pgTable(
  "content_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id").references(() => brandProfiles.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    content: text("content").notNull(),
    pillar: pillarEnum("pillar").notNull().default("general"),
    canonicalUrl: text("canonical_url"),
    primaryHandle: text("primary_handle").default(""),
    secondaryHandles: text("secondary_handles").default(""),
    variationsCount: integer("variations_count").notNull().default(5),
    status: sourceStatusEnum("status").notNull().default("draft"),
    extraction: jsonb("extraction").$type<ContentExtraction | null>().default(null),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_sources_status").on(table.status),
    index("idx_sources_created").on(table.createdAt),
    index("idx_sources_brand").on(table.brandId),
  ]
);

export const platforms = pgTable("platforms", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull().default(""),
  config: jsonb("config").$type<PlatformConfig>().notNull(),
  enabled: boolean("enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const contentTemplates = pgTable(
  "content_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    platformId: uuid("platform_id")
      .notNull()
      .references(() => platforms.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    funnelStage: funnelStageEnum("funnel_stage").notNull().default("tofu"),
    promptTemplate: text("prompt_template").notNull(),
    outputSchema: jsonb("output_schema").$type<Record<string, unknown>>().default({}),
    enabled: boolean("enabled").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    index("idx_templates_platform").on(table.platformId),
    index("idx_templates_slug").on(table.slug),
  ]
);

export const cascadeJobs = pgTable(
  "cascade_jobs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => contentSources.id, { onDelete: "cascade" }),
    status: jobStatusEnum("status").notNull().default("queued"),
    progress: integer("progress").notNull().default(0),
    totalDerivatives: integer("total_derivatives").notNull().default(0),
    completedDerivatives: integer("completed_derivatives").notNull().default(0),
    error: text("error"),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_jobs_source").on(table.sourceId),
    index("idx_jobs_status").on(table.status),
  ]
);

export const derivatives = pgTable(
  "derivatives",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sourceId: uuid("source_id")
      .notNull()
      .references(() => contentSources.id, { onDelete: "cascade" }),
    jobId: uuid("job_id")
      .notNull()
      .references(() => cascadeJobs.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => contentTemplates.id, { onDelete: "cascade" }),
    platformId: uuid("platform_id")
      .notNull()
      .references(() => platforms.id, { onDelete: "cascade" }),
    brandId: uuid("brand_id").references(() => brandProfiles.id, { onDelete: "set null" }),
    variationIndex: integer("variation_index").notNull().default(0),
    content: jsonb("content").$type<DerivativeContent>().notNull(),
    status: derivativeStatusEnum("status").notNull().default("draft"),
    scheduledAt: timestamp("scheduled_at"),
    publishedAt: timestamp("published_at"),
    ghlPostId: text("ghl_post_id"),
    performance: jsonb("performance").$type<Record<string, unknown>>().default({}),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("idx_derivatives_source").on(table.sourceId),
    index("idx_derivatives_job").on(table.jobId),
    index("idx_derivatives_platform").on(table.platformId),
    index("idx_derivatives_status").on(table.status),
    index("idx_derivatives_brand").on(table.brandId),
  ]
);

// ─── Relations ───────────────────────────────────────────

export const brandProfilesRelations = relations(brandProfiles, ({ many }) => ({
  sources: many(contentSources),
  derivatives: many(derivatives),
  assets: many(brandAssets),
}));

export const brandAssetsRelations = relations(brandAssets, ({ one }) => ({
  brand: one(brandProfiles, {
    fields: [brandAssets.brandId],
    references: [brandProfiles.id],
  }),
}));

export const contentSourcesRelations = relations(contentSources, ({ one, many }) => ({
  brand: one(brandProfiles, {
    fields: [contentSources.brandId],
    references: [brandProfiles.id],
  }),
  jobs: many(cascadeJobs),
  derivatives: many(derivatives),
}));

export const platformsRelations = relations(platforms, ({ many }) => ({
  templates: many(contentTemplates),
  derivatives: many(derivatives),
}));

export const contentTemplatesRelations = relations(contentTemplates, ({ one, many }) => ({
  platform: one(platforms, {
    fields: [contentTemplates.platformId],
    references: [platforms.id],
  }),
  derivatives: many(derivatives),
}));

export const cascadeJobsRelations = relations(cascadeJobs, ({ one, many }) => ({
  source: one(contentSources, {
    fields: [cascadeJobs.sourceId],
    references: [contentSources.id],
  }),
  derivatives: many(derivatives),
}));

export const derivativesRelations = relations(derivatives, ({ one }) => ({
  source: one(contentSources, {
    fields: [derivatives.sourceId],
    references: [contentSources.id],
  }),
  job: one(cascadeJobs, {
    fields: [derivatives.jobId],
    references: [cascadeJobs.id],
  }),
  template: one(contentTemplates, {
    fields: [derivatives.templateId],
    references: [contentTemplates.id],
  }),
  platform: one(platforms, {
    fields: [derivatives.platformId],
    references: [platforms.id],
  }),
  brand: one(brandProfiles, {
    fields: [derivatives.brandId],
    references: [brandProfiles.id],
  }),
}));

// ─── Types ───────────────────────────────────────────────

export type ContentExtraction = {
  takeaways: { point: string; detail: string }[];
  quotes: { quote: string; context: string }[];
  stats: { stat: string; source: string }[];
  hooks: string[];
  themes: string[];
  audienceInsights: string;
  emotionalAngles: string[];
};

export type PlatformConfig = {
  charLimits: Record<string, number>;
  formats: string[];
  bestPractices: string[];
  hashtagRules: string;
};

export type BrandAsset = typeof brandAssets.$inferSelect;

export type DerivativeContent = {
  primaryContent: string;
  headlines?: string[];
  hashtags?: string[];
  cta?: string;
  notes?: string;
  visualDirection?: string;
  soundSuggestion?: string;
  imageUrls?: string[];
  imageGenerationStatus?: "pending" | "generating" | "completed" | "failed" | "skipped";
  imageGenerationError?: string;
  [key: string]: unknown;
};
