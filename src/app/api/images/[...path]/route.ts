import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;

  // Expected: /api/images/{derivativeId}/{filename}
  if (segments.length !== 2) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const [derivativeId, filename] = segments;

  // Sanitize to prevent directory traversal
  if (
    derivativeId.includes("..") ||
    filename.includes("..") ||
    !/\.(png|jpg|jpeg)$/.test(filename)
  ) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const filePath = path.join(
    process.cwd(),
    "storage",
    "images",
    derivativeId,
    filename
  );

  const ext = path.extname(filename).toLowerCase();
  const contentType =
    ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";

  try {
    const fileBuffer = await fs.readFile(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }
}
