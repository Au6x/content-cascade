import { pdf } from "pdf-to-img";
import { uploadImage } from "@/lib/storage";

/**
 * Convert a PDF buffer to individual PNG images and upload to Supabase Storage.
 * Returns array of public URLs for the uploaded images.
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  derivativeId: string
): Promise<string[]> {
  const imageUrls: string[] = [];
  let pageIndex = 0;

  const document = await pdf(pdfBuffer, { scale: 2.0 });
  for await (const pageImage of document) {
    const filename = `image-${String(pageIndex + 1).padStart(2, "0")}.png`;
    const url = await uploadImage(derivativeId, filename, Buffer.from(pageImage));
    imageUrls.push(url);
    pageIndex++;
  }

  return imageUrls;
}
