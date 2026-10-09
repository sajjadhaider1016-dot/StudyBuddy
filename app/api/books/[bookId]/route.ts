import { NextRequest } from "next/server";
import { fallbackBooks } from "@/lib/gutenberg-fallback";

export const runtime = "nodejs";

async function loadInternetArchiveBook(identifier: string) {
  try {
    const metadataResponse = await fetch(`https://archive.org/metadata/${encodeURIComponent(identifier)}`, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!metadataResponse.ok) return Response.json({ error: "This full-text book is temporarily unavailable." }, { status: 502 });
    const data = await metadataResponse.json() as {
      metadata?: { title?: string; creator?: string | string[] };
      files?: Array<{ name?: string; size?: string }>;
    };
    const textFiles = (data.files ?? []).filter((file) => file.name && (file.name.endsWith("_djvu.txt") || file.name.endsWith(".txt")))
      .sort((a, b) => Number(b.name?.endsWith("_djvu.txt")) - Number(a.name?.endsWith("_djvu.txt")));
    for (const file of textFiles) {
      if (!file.name || Number(file.size) > 8_000_000) continue;
      const textResponse = await fetch(`https://archive.org/download/${encodeURIComponent(identifier)}/${encodeURIComponent(file.name)}`, { signal: AbortSignal.timeout(12000), cache: "no-store" });
      if (!textResponse.ok) continue;
      const content = (await textResponse.text()).trim();
      if (content.length < 20 || content.length > 8_000_000) continue;
      const creator = data.metadata?.creator;
      const authors = Array.isArray(creator) ? creator : creator ? [creator] : [];
      return Response.json({ title: data.metadata?.title ?? identifier, authors, content });
    }
    return Response.json({ error: "No downloadable plain-text edition was found for this book." }, { status: 404 });
  } catch {
    return Response.json({ error: "Could not download this book. Upload a PDF or EPUB copy instead." }, { status: 502 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await context.params;
  if (bookId.startsWith("ia-")) {
    const identifier = bookId.slice(3);
    if (!/^[A-Za-z0-9._-]{1,180}$/.test(identifier)) return Response.json({ error: "Invalid book selection." }, { status: 400 });
    return loadInternetArchiveBook(identifier);
  }
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
