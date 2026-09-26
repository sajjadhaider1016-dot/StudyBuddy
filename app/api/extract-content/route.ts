import { NextRequest } from "next/server";
import { extractContentFromFile } from "@/lib/file-extractor";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = new Set([
  ".txt",
  ".md",
  ".markdown",
  ".pdf",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
]);

const ALLOWED_IMAGE_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
]);

const ALLOWED_IMAGE_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".gif",
]);

function getExtension(filename: string): string {
  const lastDot = filename.lastIndexOf(".");

  if (lastDot === -1) {
    return "";
  }

  return filename.slice(lastDot).toLowerCase();
}

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

function isImageQuotaError(error: unknown): boolean {
  const message =
    getErrorMessage(error).toLowerCase();

  return (
    message.includes(
      "image_extraction_quota_exceeded",
    ) ||
    message.includes("free_tier_requests") ||
    message.includes(
      "generate_content_free_tier_requests",
    ) ||
    message.includes("resource_exhausted") ||
    message.includes("quota exceeded") ||
    message.includes("you exceeded your current quota")
  );
}

function isTemporaryError(error: unknown): boolean {
  const message =
    getErrorMessage(error).toLowerCase();

  if (isImageQuotaError(error)) {
    return false;
  }

  return (
    message.includes("503") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("504") ||
    message.includes(
      "temporarily unavailable",
    ) ||
    message.includes("service unavailable") ||
    message.includes("fetch failed") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("timeout")
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    const formData =
      await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        {
          error: "NO_FILE",
          message:
            "Please select a file to upload.",
        },
        { status: 400 },
      );
    }

    if (!file.name.trim()) {
      return Response.json(
        {
          error: "INVALID_FILENAME",
          message:
            "The uploaded file does not have a valid filename.",
        },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return Response.json(
        {
          error: "EMPTY_FILE",
          message:
            "The uploaded file is empty.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        {
          error: "FILE_TOO_LARGE",
          message:
            "File size must be 10 MB or smaller.",
        },
        { status: 413 },
      );
    }

    const extension =
      getExtension(file.name);

    if (
      !ALLOWED_EXTENSIONS.has(
        extension,
      )
    ) {
      return Response.json(
        {
          error:
            "UNSUPPORTED_FILE_TYPE",
          message:
            "Unsupported file type. Use TXT, Markdown, PDF, DOCX, PNG, JPG, JPEG, WEBP, or GIF.",
        },
        { status: 415 },
      );
    }

    const isImageExtension =
      ALLOWED_IMAGE_EXTENSIONS.has(
        extension,
      );

    const isImageMimeType =
      ALLOWED_IMAGE_TYPES.has(
        file.type,
      );

    if (
      isImageMimeType &&
      !isImageExtension
    ) {
      return Response.json(
        {
          error:
            "INVALID_IMAGE_EXTENSION",
          message:
            "The image extension does not match the uploaded image type.",
        },
        { status: 415 },
      );
    }

    if (
      isImageExtension &&
      file.type &&
      !isImageMimeType
    ) {
      return Response.json(
        {
          error:
            "INVALID_IMAGE_TYPE",
          message:
            "The uploaded image type is not supported.",
        },
        { status: 415 },
      );
    }

    const content =
      await extractContentFromFile(
        file,
      );

    if (!content.trim()) {
      return Response.json(
        {
          error:
            "EMPTY_EXTRACTED_CONTENT",
          message:
            "No readable study material could be extracted from this file.",
        },
        { status: 422 },
      );
    }

    return Response.json({
      success: true,
      filename: file.name,
      content,
      characterCount:
        content.length,
    });
  } catch (error) {
    console.error(
      "Content extraction error:",
      error,
    );

    if (
      isImageQuotaError(error)
    ) {
      return Response.json(
        {
          error:
            "IMAGE_EXTRACTION_QUOTA_EXCEEDED",
          message:
            "Image extraction is temporarily unavailable because the Gemini API free-tier quota has been reached. Please try again after the quota resets or use a different Gemini API project.",
        },
        { status: 429 },
      );
    }

    if (isTemporaryError(error)) {
      return Response.json(
        {
          error:
            "TEMPORARY_EXTRACTION_ERROR",
          message:
            "The extraction service is temporarily unavailable. Please try again in a moment.",
        },
        { status: 503 },
      );
    }

    const message =
      getErrorMessage(error);

    return Response.json(
      {
        error:
          "EXTRACTION_FAILED",
        message:
          process.env.NODE_ENV ===
          "development"
            ? message
            : "We could not extract content from this file.",
      },
      { status: 500 },
    );
  }
}