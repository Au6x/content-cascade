import { readFileSync } from "fs";
// @ts-ignore - pdfjs-dist legacy build
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

async function main() {
  const file = process.argv[2];
  if (!file) { console.error("Usage: read-pdf.ts <file>"); process.exit(1); }

  const buf = new Uint8Array(readFileSync(file));
  const doc = await getDocument({ data: buf }).promise;
  const pages = doc.numPages;
  console.log(`Pages: ${pages}\n`);

  for (let i = 1; i <= Math.min(pages, 30); i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((item: any) => item.str).join(" ");
    if (text.trim()) {
      console.log(`--- Page ${i} ---`);
      console.log(text);
      console.log();
    }
  }
}

main().catch(e => { console.error(e); process.exit(1); });
