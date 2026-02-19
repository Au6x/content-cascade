import type { GammaGenerationRequest } from "./types";
import {
  createGeneration,
  pollUntilComplete,
  downloadExportPdf,
} from "./client";
import { convertPdfToImages } from "./pdf-to-png";

/**
 * Generate visuals via Gamma and save as local PNGs.
 * Submits a generation request, polls until complete, downloads the
 * exported PDF, converts each page to a PNG, and saves to disk.
 *
 * Returns array of API-route URLs: /api/images/{derivativeId}/image-NN.png
 */
export async function generateAndSaveVisuals(
  request: GammaGenerationRequest,
  derivativeId: string
): Promise<string[]> {
  // 1. Submit generation to Gamma API
  const generationId = await createGeneration(request);

  // 2. Poll until complete
  const result = await pollUntilComplete(generationId);

  if (result.status === "failed") {
    throw new Error(
      `Gamma generation failed: ${result.error?.message || "Unknown error"}`
    );
  }

  if (!result.exportUrl) {
    throw new Error(
      "Gamma generation completed but no exportUrl returned"
    );
  }

  if (result.credits) {
    console.log(
      `[Gamma] Credits: ${result.credits.deducted} used, ${result.credits.remaining} remaining`
    );
  }

  // 3. Download the exported PDF
  const pdfBuffer = await downloadExportPdf(result.exportUrl);

  // 4. Convert PDF pages to PNG images and save to disk
  const imageUrls = await convertPdfToImages(pdfBuffer, derivativeId);

  return imageUrls;
}
