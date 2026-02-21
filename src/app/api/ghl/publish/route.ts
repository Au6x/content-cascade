import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { derivatives, brandProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { publishToGHL } from "@/lib/ghl/client";

export async function POST(req: NextRequest) {
  try {
    const { derivativeId, scheduledAt } = (await req.json()) as {
      derivativeId: string;
      scheduledAt?: string;
    };

    if (!derivativeId) {
      return NextResponse.json({ error: "derivativeId required" }, { status: 400 });
    }

    // Load derivative with brand + platform
    const derivative = await db.query.derivatives.findFirst({
      where: eq(derivatives.id, derivativeId),
      with: {
        brand: true,
        platform: true,
      },
    });

    if (!derivative) {
      return NextResponse.json({ error: "Derivative not found" }, { status: 404 });
    }

    // Resolve brand — either from derivative or fall back to env default
    const brand = derivative.brand;
    const locationId = brand?.ghlLocationId ?? process.env.GHL_DEFAULT_LOCATION_ID;
    const apiKey = process.env.GHL_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GHL_API_KEY not configured. Add it to your environment variables." },
        { status: 500 }
      );
    }
    if (!locationId) {
      return NextResponse.json(
        { error: "No GHL location ID found. Set ghlLocationId on the brand profile or GHL_DEFAULT_LOCATION_ID in env." },
        { status: 400 }
      );
    }

    const platformName = derivative.platform?.name ?? "unknown";
    const content = buildPostContent(derivative.content, platformName);

    const result = await publishToGHL({
      apiKey,
      locationId,
      platform: platformName,
      content,
      scheduledAt,
      imageUrls: derivative.content.imageUrls,
    });

    // Update derivative with GHL post ID and status
    await db
      .update(derivatives)
      .set({
        ghlPostId: result.id,
        status: scheduledAt ? "scheduled" : "published",
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        publishedAt: scheduledAt ? null : new Date(),
        updatedAt: new Date(),
      })
      .where(eq(derivatives.id, derivativeId));

    return NextResponse.json({ success: true, ghlPostId: result.id, status: result.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function buildPostContent(
  content: {
    primaryContent: string;
    cta?: string;
    hashtags?: string[];
    [key: string]: unknown;
  },
  platform: string
): string {
  let text = content.primaryContent ?? "";

  if (content.cta) {
    text += `\n\n${content.cta}`;
  }

  // Only append hashtags for platforms that support them in the body
  const hashtagPlatforms = ["instagram", "linkedin", "facebook", "tiktok"];
  if (
    content.hashtags?.length &&
    hashtagPlatforms.some((p) => platform.toLowerCase().includes(p))
  ) {
    text += `\n\n${content.hashtags.join(" ")}`;
  }

  return text;
}
