import { readFileSync } from "fs";
import { createClient } from "@supabase/supabase-js";
import { db } from "../src/lib/db";
import { brandProfiles } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";
import type { BrandGuide } from "../src/lib/db/schema";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET = "cascade-images";

const logos: { slug: string; path: string; filename: string }[] = [
  {
    slug: "iosl",
    path: "/Users/au6x/Downloads/OneDrive_1_2-23-2026-2/primary-dark.png",
    filename: "iosl-logo.png",
  },
  {
    slug: "ideal-ai",
    path: "/Users/au6x/Downloads/OneDrive_1_2-23-2026/idealai-wordmark-black.png",
    filename: "idealai-logo.png",
  },
  {
    slug: "colonial-oaks",
    path: "/Users/au6x/Downloads/Colonial Oaks.png",
    filename: "colonial-oaks-logo.png",
  },
];

async function main() {
  for (const logo of logos) {
    const buffer = readFileSync(logo.path);
    const storagePath = `brand-logos/${logo.filename}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: "image/png",
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload ${logo.slug}: ${error.message}`);
      continue;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
    const logoUrl = data.publicUrl;
    console.log(`[${logo.slug}] Uploaded → ${logoUrl}`);

    // Update brand profile's brandGuide with logoUrl
    const brand = await db.query.brandProfiles.findFirst({
      where: eq(brandProfiles.slug, logo.slug),
    });

    if (!brand) {
      console.error(`Brand ${logo.slug} not found in DB`);
      continue;
    }

    const existingGuide = (brand.brandGuide as BrandGuide | null) ?? {} as BrandGuide;
    const updatedGuide = { ...existingGuide, logoUrl };

    await db
      .update(brandProfiles)
      .set({ brandGuide: updatedGuide, updatedAt: new Date() })
      .where(eq(brandProfiles.id, brand.id));

    console.log(`[${logo.slug}] Updated brand profile with logoUrl`);
  }

  console.log("Done.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
