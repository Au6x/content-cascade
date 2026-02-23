import { execSync } from "child_process";
import { writeFileSync, readFileSync, mkdirSync, readdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { uploadImage } from "@/lib/storage";

export type BrandOverlay = {
  name: string;
  primaryColor: string;  // brand primary hex
  logoUrl?: string;      // optional logo image URL (PNG w/ transparency)
};

/**
 * Convert a PDF buffer to individual PNG images and upload to Supabase Storage.
 *
 * Uses PyMuPDF (via python3) for rendering instead of pdf-to-img.
 *
 * If brandOverlay is provided, adds professional branding to each image:
 * - With logo: semi-transparent logo in bottom-right corner
 * - Without logo: small pill badge with brand name in bottom-right corner
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

    // Apply brand overlay
    if (brandOverlay) {
      // Download logo if provided
      let logoPath: string | null = null;
      if (brandOverlay.logoUrl) {
        logoPath = join(workDir, "brand-logo.png");
        try {
          execSync(`curl -sL "${brandOverlay.logoUrl}" -o "${logoPath}"`, { timeout: 10000 });
          if (!existsSync(logoPath)) logoPath = null;
        } catch {
          logoPath = null;
        }
      }

      const safeName = brandOverlay.name.replace(/'/g, "\\'");
      const brandColor = brandOverlay.primaryColor;
      const hasLogo = logoPath ? "True" : "False";
      const logoPathPy = logoPath ?? "";

      // Write Python script to file to avoid shell escaping issues
      const scriptPath = join(workDir, "brand.py");
      writeFileSync(scriptPath, `
import glob, os
from PIL import Image, ImageDraw, ImageFont

HAS_LOGO = ${hasLogo}
LOGO_PATH = '${logoPathPy}'
BRAND_NAME = '${safeName}'
BRAND_COLOR = '${brandColor}'

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def get_font(size):
    for path in [
        '/System/Library/Fonts/Helvetica.ttc',
        '/System/Library/Fonts/SFNSText.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
    ]:
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            continue
    return ImageFont.load_default()

files = sorted(glob.glob('${workDir}/page-*.png'))
for f in files:
    img = Image.open(f).convert('RGBA')
    w, h = img.size
    margin = int(w * 0.03)

    if HAS_LOGO and os.path.exists(LOGO_PATH):
        # Logo mode: semi-transparent logo in bottom-right
        logo = Image.open(LOGO_PATH).convert('RGBA')
        logo_w = int(w * 0.18)
        logo_h = int(logo.height * (logo_w / logo.width))
        logo = logo.resize((logo_w, logo_h), Image.LANCZOS)
        # Apply 75% opacity
        alpha = logo.split()[3]
        alpha = alpha.point(lambda p: int(p * 0.75))
        logo.putalpha(alpha)
        x = w - logo_w - margin
        y = h - logo_h - margin
        img.paste(logo, (x, y), logo)
    else:
        # Text badge mode: rounded pill in bottom-right corner
        font_size = max(int(h * 0.018), 13)
        font = get_font(font_size)
        bbox = font.getbbox(BRAND_NAME)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        pad_x = int(tw * 0.4)
        pad_y = int(th * 0.5)
        badge_w = tw + pad_x * 2
        badge_h = th + pad_y * 2
        badge = Image.new('RGBA', (badge_w, badge_h), (0, 0, 0, 0))
        draw = ImageDraw.Draw(badge)
        r = badge_h // 2
        # Rounded rectangle background
        rgb = hex_to_rgb(BRAND_COLOR)
        fill = rgb + (190,)  # ~75% opacity
        draw.rounded_rectangle([0, 0, badge_w, badge_h], radius=r, fill=fill)
        # White text
        draw.text((pad_x, pad_y - 1), BRAND_NAME, fill=(255, 255, 255, 240), font=font)
        x = w - badge_w - margin
        y = h - badge_h - margin
        img.paste(badge, (x, y), badge)

    img.convert('RGB').save(f)
`);

      execSync(`python3 "${scriptPath}"`, { timeout: 60000 });
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
