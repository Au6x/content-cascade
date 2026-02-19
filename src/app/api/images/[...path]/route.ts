import { NextRequest, NextResponse } from "next/server";
import { getImageUrl } from "@/lib/storage";

/**
 * Legacy image route — redirects to Supabase Storage public URL.
 * Kept for backwards compatibility with existing /api/images/ references.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;

  if (segments.length !== 2) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const [derivativeId, filename] = segments;

  if (
    derivativeId.includes("..") ||
    filename.includes("..") ||
    !/\.(png|jpg|jpeg)$/.test(filename)
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const publicUrl = getImageUrl(derivativeId, filename);
  return NextResponse.redirect(publicUrl, 301);
}
