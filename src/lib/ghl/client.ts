const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";

// GHL platform slugs for the social posting API
const PLATFORM_MAP: Record<string, string> = {
  linkedin: "linkedin",
  "x/twitter": "twitter",
  x: "twitter",
  twitter: "twitter",
  instagram: "instagram",
  facebook: "facebook",
  tiktok: "tiktok",
  youtube: "youtube",
  gmb: "gmb",
};

export type GHLPostResult = {
  id: string;
  status: string;
};

export async function publishToGHL({
  apiKey,
  locationId,
  platform,
  content,
  scheduledAt,
  imageUrls,
}: {
  apiKey: string;
  locationId: string;
  platform: string;
  content: string;
  scheduledAt?: string; // ISO 8601
  imageUrls?: string[];
}): Promise<GHLPostResult> {
  const ghlPlatform = PLATFORM_MAP[platform.toLowerCase()];
  if (!ghlPlatform) {
    throw new Error(`Unsupported GHL platform: ${platform}`);
  }

  const body: Record<string, unknown> = {
    type: "post",
    locationId,
    channels: [ghlPlatform],
    post: content,
    status: scheduledAt ? "scheduled" : "published",
  };

  if (scheduledAt) {
    body.scheduleAt = scheduledAt;
  }

  if (imageUrls && imageUrls.length > 0) {
    body.mediaUrls = imageUrls;
  }

  const res = await fetch(`${GHL_BASE}/social-media-posting/create-post`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Version: GHL_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GHL API error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as { post?: { id: string; status: string }; id?: string; status?: string };
  const post = data.post;
  return { id: post?.id ?? data.id ?? "", status: post?.status ?? data.status ?? "published" };
}
