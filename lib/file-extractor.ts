import mammoth from "mammoth";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";

const IMAGE_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const MAX_IMAGE_RETRIES = 2;

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function isQuotaError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("resource_exhausted") ||
    message.includes("free_tier_requests") ||
    message.includes("daily quota") ||
    message.includes("rate limit") ||
    message.includes("rate_limit")
  );
}

function isRetryableGeminiError(error: unknown): boolean {
  if (isQuotaError(error)) {
    return false;
  }

  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("500") ||
    message.includes("502") ||
    message.includes("503") ||
    message.includes("504") ||
    message.includes("temporarily unavailable") ||
    message.includes("service unavailable") ||
    message.includes("fetch failed") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("timeout")
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function extractTextFile(file: File): Promise<string> {
  const text = await file.text();

  return text.trim();
}

async function extractDocxFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value.trim();
}

async function extractPdfFile(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const parser = new PDFParse({
    data: buffer,
  });

  try {
    const result = await parser.getText();

    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

function getImagePrompt(): string {
  return `
You are an expert academic document reader.

Extract ALL useful study material from the supplied image.

The image may contain:
- typed text
- handwritten notes
- mathematical equations
- formulas
- diagrams
- tables
- definitions
- examples
- headings
- bullet points
- annotations

IMPORTANT:

1. Preserve the original meaning.
2. Do not invent missing information.
3. Do not summarize the material.
4. Extract as much readable content as possible.
5. Preserve headings and structure when possible.
6. For mathematical expressions, use readable LaTeX.
7. Use inline LaTeX with $...$.
8. Use standalone equations with $$...$$.
9. Convert fractions to proper LaTeX.
10. Convert square roots to proper LaTeX.
11. Convert exponents and subscripts to proper LaTeX.
12. Preserve Greek letters and mathematical symbols.
13. If something is genuinely unreadable, write [unclear] rather than guessing.
14. For handwritten content, carefully interpret the handwriting.
15. For diagrams, describe important labels and relationships in text.
16. Do not add explanations that are not present in the image.

Return ONLY the extracted study material.
`;
}

function createImageQuotaError(error: unknown): Error {
  return new Error(
    `IMAGE_EXTRACTION_QUOTA_EXCEEDED: ${getErrorMessage(error)}`,
  );
}

function createImageTemporaryError(error: unknown): Error {
  return new Error(
    `IMAGE_EXTRACTION_TEMPORARY_ERROR: ${getErrorMessage(error)}`,
  );
}

async function extractImageWithGemini(file: File): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const arrayBuffer = await file.arrayBuffer();
  const base64Data = Buffer.from(arrayBuffer).toString("base64");

  const model =
    process.env.GEMINI_VISION_MODEL ||
    process.env.GEMINI_MODEL ||
    "gemini-3.8-flash";

  let lastError: unknown = null;

  for (let attempt = 0; attempt <= MAX_IMAGE_RETRIES; attempt++) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [
              {
                text: getImagePrompt(),
              },
              {
                inlineData: {
                  mimeType: file.type,
                  data: base64Data,
                },
              },
            ],
          },
        ],
        config: {
          temperature: 0.1,
          maxOutputTokens: 16000,
        },
      });

      const text = response.text?.trim();

      if (!text) {
        throw new Error("EMPTY_IMAGE_EXTRACTION");
      }

      return text;
    } catch (error) {
      lastError = error;

      if (isQuotaError(error)) {
        console.error(
          "Gemini image extraction quota exceeded:",
          getErrorMessage(error),
        );

        throw createImageQuotaError(error);
      }

      if (!isRetryableGeminiError(error)) {
        throw error;
      }

      if (attempt >= MAX_IMAGE_RETRIES) {
        console.error(
          "Gemini image extraction failed after retries:",
          getErrorMessage(error),
        );

        throw createImageTemporaryError(error);
      }

      const delay = 1000 * 2 ** attempt;

      console.warn(
        `Gemini image extraction temporarily failed. ` +
          `Retry ${attempt + 1}/${MAX_IMAGE_RETRIES} in ${delay}ms...`,
        getErrorMessage(error),
      );

      await sleep(delay);
    }
  }

  throw lastError ?? new Error("IMAGE_EXTRACTION_FAILED");
}

export async function extractContentFromFile(
  file: File,
): Promise<string> {
  const filename = file.name.toLowerCase();

  const extension = filename.includes(".")
    ? filename.slice(filename.lastIndexOf("."))
    : "";

  if (
    extension === ".txt" ||
    extension === ".md" ||
    extension === ".markdown"
  ) {
    return extractTextFile(file);
  }

  if (extension === ".docx") {
    return extractDocxFile(file);
  }

  if (extension === ".pdf") {
    return extractPdfFile(file);
  }

  if (IMAGE_MIME_TYPES.has(file.type)) {
    return extractImageWithGemini(file);
  }

  throw new Error(
    `UNSUPPORTED_FILE_TYPE: ${file.name}`,
  );
}