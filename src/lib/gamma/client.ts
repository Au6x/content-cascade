import type { GammaGenerationRequest } from "./types";

const GAMMA_BASE_URL = "https://public-api.gamma.app/v1.0";
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes max

export type GammaStatusResponse = {
  generationId: string;
  status: "pending" | "completed" | "failed";
  gammaUrl?: string;
  exportUrl?: string;
  error?: { message: string; statusCode: number };
  credits?: { deducted: number; remaining: number };
};

function getApiKey(): string {
  const key = process.env.GAMMA_API_KEY;
  if (!key) throw new Error("GAMMA_API_KEY environment variable is required");
  return key;
}

/**
 * Submit a generation request to Gamma. Returns the generationId.
 * Retries on 429 with exponential backoff.
 */
export async function createGeneration(
  request: GammaGenerationRequest,
  maxRetries = 2
): Promise<string> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const response = await fetch(`${GAMMA_BASE_URL}/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": getApiKey(),
      },
      body: JSON.stringify(request),
    });

    if (response.status === 429) {
      const delay = 3000 * Math.pow(2, attempt);
      console.log(
        `[Gamma] Rate limited, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries + 1})`
      );
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `Gamma API error ${response.status}: ${body}`
      );
    }

    const data = (await response.json()) as { generationId: string };
    if (!data.generationId) {
      throw new Error("Gamma API did not return a generationId");
    }
    return data.generationId;
  }

  throw lastError || new Error("Gamma API rate limit exceeded after retries");
}

/**
 * Poll a generation until it completes or fails.
 * Polls every 5s, up to 5 minutes.
 */
export async function pollUntilComplete(
  generationId: string
): Promise<GammaStatusResponse> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    const response = await fetch(
      `${GAMMA_BASE_URL}/generations/${generationId}`,
      {
        headers: { "X-API-KEY": getApiKey() },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Gamma poll error ${response.status}: ${await response.text()}`
      );
    }

    const data = (await response.json()) as GammaStatusResponse;

    if (data.status === "completed") {
      return data;
    }

    if (data.status === "failed") {
      return data;
    }

    // Still pending — wait and poll again
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }

  throw new Error(
    `Gamma generation ${generationId} timed out after ${MAX_POLL_ATTEMPTS * POLL_INTERVAL_MS / 1000}s`
  );
}

/**
 * Download the exported PDF from Gamma's CDN.
 */
export async function downloadExportPdf(
  exportUrl: string
): Promise<Buffer> {
  const response = await fetch(exportUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download Gamma PDF: ${response.status} ${response.statusText}`
    );
  }
  return Buffer.from(await response.arrayBuffer());
}
