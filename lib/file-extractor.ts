import mammoth from "mammoth";
import JSZip from "jszip";
import { GoogleGenAI } from "@google/genai";

// IMPORTANT:
// CanvasFactory must be imported before pdf-parse.
// PDFParse itself comes from the main package.
import { CanvasFactory } from "pdf-parse/worker";
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

const MAX_OCR_PAGES = 30;
const OCR_BATCH_SIZE = 5;

async function extractScannedPdfPages(
  parser: PDFParse,
  pageNumbers: number[],
): Promise<Map<number, string>> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("PDF_OCR_REQUIRES_API_KEY");

  const ai = new GoogleGenAI({ apiKey });
  const screenshots = await parser.getScreenshot({
    partial: pageNumbers,
    desiredWidth: 1200,
    imageDataUrl: false,
  });
  const extracted = new Map<number, string>();
  const model = process.env.GEMINI_VISION_MODEL || process.env.GEMINI_MODEL || "gemini-3.8-flash";

  for (let index = 0; index < screenshots.pages.length; index += OCR_BATCH_SIZE) {
    const batch = screenshots.pages.slice(index, index + OCR_BATCH_SIZE);
    const parts = [
      { text: "Transcribe the readable study text from these scanned PDF pages in order. Preserve headings, paragraphs, lists, equations, and page order. Do not summarize or add commentary. Start each page with its marker exactly as shown in the accompanying text." },
      ...batch.flatMap((page) => [
        { text: `[[PAGE ${page.pageNumber}]]` },
        { inlineData: { mimeType: "image/png", data: Buffer.from(page.data).toString("base64") } },
      ]),
    ];
    let responseText = "";
    for (let attempt = 0; attempt <= MAX_IMAGE_RETRIES; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: "user", parts }],
          config: { temperature: 0.1, maxOutputTokens: 12000 },
        });
        responseText = response.text?.trim() ?? "";
        break;
      } catch (error) {
        if (isQuotaError(error) || !isRetryableGeminiError(error) || attempt >= MAX_IMAGE_RETRIES) throw error;
        await sleep(1000 * 2 ** attempt);
      }
    }
    const pageBlocks = [...responseText.matchAll(/\[\[PAGE\s+(\d+)\]\]([\s\S]*?)(?=\[\[PAGE\s+\d+\]\]|$)/gi)];
    if (pageBlocks.length) {
      for (const block of pageBlocks) extracted.set(Number(block[1]), block[2].trim());
    } else if (responseText && batch[0]) {
      extracted.set(batch[0].pageNumber, responseText);
    }
  }
  return extracted;
}

export async function getPdfPageCount(file: File): Promise<number> {
  const parser = new PDFParse({ data: Buffer.from(await file.arrayBuffer()), CanvasFactory });
  try {
    const result = await parser.getText({ first: 1 });
    return result.total;
  } finally {
    await parser.destroy();
  }
}

async function extractPdfFile(
  file: File,
  pageRange?: { startPage: number; endPage: number },
): Promise<{ text: string; warning?: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const parser = new PDFParse({
    data: buffer,
    CanvasFactory,
  });

  try {
    const selectedPages = pageRange
      ? Array.from({ length: pageRange.endPage - pageRange.startPage + 1 }, (_, index) => pageRange.startPage + index)
      : undefined;
    const result = await parser.getText(selectedPages ? { partial: selectedPages } : undefined);
    if (pageRange && pageRange.endPage > result.total) {
      throw new Error(`PDF_PAGE_RANGE_EXCEEDS_TOTAL:${result.total}`);
    }
    const pageTexts = new Map(result.pages.map((page) => [page.num, page.text.trim()]));
    const scannedPages = result.pages.filter((page) => page.text.trim().length < 20);
    const pagesToOcr = scannedPages.slice(0, MAX_OCR_PAGES).map((page) => page.num);
    if (pagesToOcr.length) {
      const ocrText = await extractScannedPdfPages(parser, pagesToOcr);
      for (const [pageNumber, text] of ocrText) {
        if (text) pageTexts.set(pageNumber, text);
      }
    }
    const text = result.pages.length
      ? result.pages.map((page) => pageTexts.get(page.num)).filter(Boolean).join("\n\n").trim()
      : result.text.trim();
    return {
      text,
      warning: scannedPages.length > MAX_OCR_PAGES
        ? `Only the first ${MAX_OCR_PAGES} scanned pages were OCR processed. Split the PDF into smaller parts to study the remaining pages.`
        : undefined,
    };
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
  pageRange?: { startPage: number; endPage: number },
): Promise<{ text: string; warning?: string }> {
  const filename = file.name.toLowerCase();

  const extension = filename.includes(".")
    ? filename.slice(filename.lastIndexOf("."))
    : "";

  if (
    extension === ".txt" ||
    extension === ".md" ||
    extension === ".markdown"
  ) {
    return { text: await extractTextFile(file) };
  }

  if (extension === ".docx") {
    return { text: await extractDocxFile(file) };
  }

  if (extension === ".pdf") {
    return extractPdfFile(file, pageRange);
  }

  if (extension === ".epub") {
    return { text: await extractEpubFile(file) };
  }

  if (IMAGE_MIME_TYPES.has(file.type)) {
    return { text: await extractImageWithGemini(file) };
  }

  throw new Error(
    `UNSUPPORTED_FILE_TYPE: ${file.name}`,
  );
}

function decodeXmlText(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const hex = code[1]?.toLowerCase() === "x";
      const point = Number.parseInt(code.slice(hex ? 2 : 1), hex ? 16 : 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }
    return ({ amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" } as Record<string, string>)[code.toLowerCase()] ?? entity;
  });
}

async function extractEpubFile(file: File): Promise<string> {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const container = await zip.file("META-INF/container.xml")?.async("text");
  const packagePath = container?.match(/<rootfile[^>]*full-path=["']([^"']+)["']/i)?.[1];
  if (!packagePath) throw new Error("This EPUB is missing its book manifest.");
  const packageXml = await zip.file(packagePath)?.async("text");
  if (!packageXml) throw new Error("This EPUB book manifest could not be read.");
  const manifest = new Map<string, string>();
  for (const item of packageXml.matchAll(/<item\b[^>]*>/gi)) {
    const id = item[0].match(/\bid=["']([^"']+)["']/i)?.[1];
    const href = item[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (id && href) manifest.set(id, href);
  }
  const spineIds = [...packageXml.matchAll(/<itemref\b[^>]*\bidref=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  const basePath = packagePath.includes("/") ? packagePath.slice(0, packagePath.lastIndexOf("/") + 1) : "";
  const sections: string[] = [];
  for (const id of spineIds) {
    const href = manifest.get(id);
    if (!href) continue;
    const pathParts: string[] = [];
    for (const part of `${basePath}${decodeURIComponent(href.split("#")[0])}`.split("/")) {
      if (part === "..") pathParts.pop();
      else if (part && part !== ".") pathParts.push(part);
    }
    const entry = zip.file(pathParts.join("/"));
    if (!entry) continue;
    const html = await entry.async("text");
    const text = decodeXmlText(html.replace(/<(script|style|nav)\b[^>]*>[\s\S]*?<\/\1>/gi, " ").replace(/<\/(p|div|h[1-6]|li|tr|br|section|article)>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
    if (text) sections.push(text);
  }
  if (!sections.length) throw new Error("No readable text was found in this EPUB.");
  return sections.join("\n\n");
}
