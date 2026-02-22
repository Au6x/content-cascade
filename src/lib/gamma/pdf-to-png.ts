import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { uploadImage } from "@/lib/storage";

/**
 * Convert a PDF buffer to individual PNG images and upload to Supabase Storage.
 * Returns array of public URLs for the uploaded images.
 *
 * Uses PyMuPDF (via python3) for rendering instead of pdf-to-img,
 * because pdf-to-img (pdfjs) fails to render embedded photographic images
 * in Gamma's PDFs — producing abstract texture artifacts instead.
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  derivativeId: string
): Promise<string[]> {
  const workDir = join(tmpdir(), `gamma-pdf-${derivativeId}`);
  const pdfPath = join(workDir, "input.pdf");

  mkdirSync(workDir, { recursive: true });
  writeFileSync(pdfPath, pdfBuffer);

  try {
    // PyMuPDF renders embedded images correctly (unlike pdfjs/pdf-to-img)
    // Use % formatting instead of f-strings to avoid JS template literal conflicts
    execSync(
      `python3 -c "
import fitz
doc = fitz.open('${pdfPath}')
for i, page in enumerate(doc):
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
    pix.save('${workDir}/page-%02d.png' % i)
"`,
      { timeout: 30000 }
    );

    // Read generated PNGs and upload
    const files = readdirSync(workDir)
      .filter((f) => f.startsWith("page-") && f.endsWith(".png"))
      .sort();

    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const pngBuffer = readFileSync(join(workDir, files[i]));
      const filename = `image-${String(i + 1).padStart(2, "0")}.png`;
      const url = await uploadImage(derivativeId, filename, pngBuffer);
      imageUrls.push(url);
    }

    return imageUrls;
  } finally {
    rmSync(workDir, { recursive: true, force: true });
  }
}
