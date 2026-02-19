import { pdf } from "pdf-to-img";
import path from "path";
import fs from "fs/promises";

/**
 * Convert a PDF buffer to individual PNG files saved to disk.
 * Returns array of API-route URLs: /api/images/{derivativeId}/image-01.png
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  derivativeId: string
): Promise<string[]> {
  const storageDir = path.join(
    process.cwd(),
    "storage",
    "images",
    derivativeId
  );
  await fs.mkdir(storageDir, { recursive: true });

  const imageUrls: string[] = [];
  let pageIndex = 0;

  const document = await pdf(pdfBuffer, { scale: 2.0 });
  for await (const pageImage of document) {
    const filename = `image-${String(pageIndex + 1).padStart(2, "0")}.png`;
    const filePath = path.join(storageDir, filename);
    await fs.writeFile(filePath, pageImage);
    imageUrls.push(`/api/images/${derivativeId}/${filename}`);
    pageIndex++;
  }

  return imageUrls;
}
