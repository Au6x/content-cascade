import "dotenv/config";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });

async function migrate() {
  console.log("Running migrations...\n");

  // 1. Add slug column to brand_profiles
  await sql`
    ALTER TABLE brand_profiles
    ADD COLUMN IF NOT EXISTS slug text UNIQUE
  `;
  console.log("✓ brand_profiles.slug added");

  // 2. Add ghl_location_id to brand_profiles
  await sql`
    ALTER TABLE brand_profiles
    ADD COLUMN IF NOT EXISTS ghl_location_id text
  `;
  console.log("✓ brand_profiles.ghl_location_id added");

  // 3. Change isActive default to true
  await sql`
    ALTER TABLE brand_profiles
    ALTER COLUMN is_active SET DEFAULT true
  `;
  console.log("✓ brand_profiles.is_active default updated");

  // 4. Create brand_assets table
  await sql`
    CREATE TABLE IF NOT EXISTS brand_assets (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      brand_id uuid NOT NULL REFERENCES brand_profiles(id) ON DELETE CASCADE,
      url text NOT NULL,
      description text NOT NULL DEFAULT '',
      tags jsonb DEFAULT '[]'::jsonb,
      asset_type text NOT NULL DEFAULT 'headshot',
      created_at timestamp NOT NULL DEFAULT now()
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_brand_assets_brand ON brand_assets(brand_id)`;
  console.log("✓ brand_assets table created");

  // 5. Add brandId to content_sources
  await sql`
    ALTER TABLE content_sources
    ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brand_profiles(id) ON DELETE SET NULL
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_sources_brand ON content_sources(brand_id)`;
  console.log("✓ content_sources.brand_id added");

  // 6. Add brandId and ghlPostId to derivatives
  await sql`
    ALTER TABLE derivatives
    ADD COLUMN IF NOT EXISTS brand_id uuid REFERENCES brand_profiles(id) ON DELETE SET NULL
  `;
  await sql`
    ALTER TABLE derivatives
    ADD COLUMN IF NOT EXISTS ghl_post_id text
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_derivatives_brand ON derivatives(brand_id)`;
  console.log("✓ derivatives.brand_id and ghl_post_id added");

  console.log("\nMigrations complete!");
  await sql.end();
}

migrate().catch((e) => {
  console.error("Migration failed:", e.message || e);
  process.exit(1);
});
