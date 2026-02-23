import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, readdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { uploadImage } from "@/lib/storage";

export type BrandOverlay = {
  name: string;
  bgColor: string;   // dark background color (hex)
  textColor: string;  // light text color (hex)
};

/**
 * Convert a PDF buffer to individual PNG images and upload to Supabase Storage.
 * Returns array of public URLs for the uploaded images.
 *
 * Uses PyMuPDF (via python3) for rendering instead of pdf-to-img,
 * because pdf-to-img (pdfjs) fails to render embedded photographic images
 * in Gamma's PDFs — producing abstract texture artifacts instead.
 *
 * If brandOverlay is provided, stamps the brand name at the bottom of each image.
 */
export async function convertPdfToImages(
  pdfBuffer: Buffer,
  derivativeId: string,
  brandOverlay?: BrandOverlay
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

    // Stamp brand name at bottom of each image
    if (brandOverlay) {
      const safeName = brandOverlay.name.replace(/'/g, "\\'");
      const bgHex = brandOverlay.bgColor;
      const textHex = brandOverlay.textColor;
      execSync(
        `python3 -c "
import glob
from PIL import Image, ImageDraw, ImageFont

files = sorted(glob.glob('${workDir}/page-*.png'))
for f in files:
    img = Image.open(f).convert('RGBA')
    w, h = img.size
    bar_h = max(int(h * 0.045), 28)
    font_size = max(int(bar_h * 0.55), 12)
    try:
        font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', font_size)
    except Exception:
        try:
            font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', font_size)
        except Exception:
            font = ImageFont.load_default()
    overlay = Image.new('RGBA', (w, bar_h), '${bgHex}' + 'CC')
    draw = ImageDraw.Draw(overlay)
    bbox = draw.textbbox((0, 0), '${safeName}', font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = (w - tw) // 2
    ty = (bar_h - th) // 2
    draw.text((tx, ty), '${safeName}', fill='${textHex}', font=font)
    img.paste(overlay, (0, h - bar_h), overlay)
    img.convert('RGB').save(f)
"`,
        { timeout: 30000 }
      );
    }

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
