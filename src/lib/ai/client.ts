import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type ModelId = "gemini-2.0-flash" | "gemini-2.0-flash-lite";

export const models = {
  /** Fast, high-quality generation — default for content creation */
  flash: "gemini-2.0-flash" as const,
  /** Lightweight tasks — summaries, classification, quick checks */
  lite: "gemini-2.0-flash-lite" as const,
};

export async function generateText(
  prompt: string,
  options: {
    model?: ModelId;
    system?: string;
    maxTokens?: number;
  } = {}
): Promise<string> {
  const response = await ai.models.generateContent({
    model: options.model ?? models.flash,
    contents: prompt,
    config: {
      maxOutputTokens: options.maxTokens ?? 4096,
      systemInstruction: options.system || undefined,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Empty response from Gemini");
  }
  return text;
}

export async function generateJSON<T>(
  prompt: string,
  options: {
    model?: ModelId;
    system?: string;
    maxTokens?: number;
  } = {}
): Promise<T> {
  const systemPrompt = [
    options.system ?? "",
    "You MUST respond with valid JSON only. No markdown, no code fences, no explanation — just the JSON object.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const response = await ai.models.generateContent({
    model: options.model ?? models.flash,
    contents: prompt,
    config: {
      maxOutputTokens: options.maxTokens ?? 4096,
      systemInstruction: systemPrompt,
      responseMimeType: "application/json",
    },
  });

  const text = response.text ?? "";

  const cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  return JSON.parse(cleaned) as T;
}
