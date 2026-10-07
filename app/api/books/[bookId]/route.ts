import { NextRequest } from "next/server";
import { fallbackBooks } from "@/lib/gutenberg-fallback";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await context.params;
  if (!/^\d{1,8}$/.test(bookId)) return Response.json({ error: "Invalid book selection." }, { status: 400 });

  const fallback = fallbackBooks.find((book) => String(book.id) === bookId);
  let title = fallback?.title;
  let authors = fallback?.authors ?? [];
  let textUrl: string | undefined;

  try {
    const metadataResponse = await fetch(`https://gutendex.com/books/${bookId}/`, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (metadataResponse.ok) {
      const book = await metadataResponse.json() as { title: string; authors?: Array<{ name: string }>; formats?: Record<string, string> };
      title = book.title;
      authors = (book.authors ?? []).map((author) => author.name);
      textUrl = Object.entries(book.formats ?? {}).find(([format]) => format.toLowerCase().startsWith("text/plain"))?.[1];
    }
  } catch {
    // The direct Gutenberg URLs below keep the built-in list usable without Gutendex.
  }

  const candidateUrls = textUrl ? [textUrl] : fallback
    ? [`https://www.gutenberg.org/cache/epub/${bookId}/pg${bookId}.txt`, `https://www.gutenberg.org/files/${bookId}/${bookId}-0.txt`, `https://www.gutenberg.org/files/${bookId}/${bookId}.txt`]
    : [];
  if (!candidateUrls.length) return Response.json({ error: "This book could not be found in the public catalog." }, { status: 404 });

  for (const candidate of candidateUrls) {
    try {
      const url = new URL(candidate);
      if (!["gutenberg.org", "www.gutenberg.org"].includes(url.hostname)) continue;
      const response = await fetch(url, { signal: AbortSignal.timeout(12000), cache: "no-store" });
      if (!response.ok) continue;
      let text = await response.text();
      if (text.length > 8_000_000) return Response.json({ error: "This book is too large to import. Try a smaller edition." }, { status: 413 });
      text = text.replace(/^.*?\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\n/i, "").replace(/\n\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*$/i, "").trim();
      if (text.length >= 20) return Response.json({ title: title ?? `Project Gutenberg book ${bookId}`, authors, content: text });
    } catch {
      // Try the next known plain-text URL.
    }
  }
  return Response.json({ error: "The book download is unavailable. Upload a PDF or EPUB copy instead." }, { status: 502 });
}
