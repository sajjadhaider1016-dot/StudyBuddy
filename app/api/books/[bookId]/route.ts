import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest, context: { params: Promise<{ bookId: string }> }) {
  const { bookId } = await context.params;
  if (!/^\d{1,8}$/.test(bookId)) return Response.json({ error: "Invalid book selection." }, { status: 400 });

  try {
    const metadataResponse = await fetch(`https://gutendex.com/books/${bookId}/`, { signal: AbortSignal.timeout(30000) });
    if (!metadataResponse.ok) return Response.json({ error: "This book could not be found in the public catalog." }, { status: 404 });
    const book = await metadataResponse.json() as { title: string; authors?: Array<{ name: string }>; formats?: Record<string, string> };
    const textUrl = Object.entries(book.formats ?? {}).find(([format]) => format.toLowerCase().startsWith("text/plain"))?.[1];
    if (!textUrl) return Response.json({ error: "No plain text edition is available for this book." }, { status: 404 });
    const url = new URL(textUrl);
    if (!["gutenberg.org", "www.gutenberg.org"].includes(url.hostname)) return Response.json({ error: "The book source is not supported." }, { status: 400 });
    const textResponse = await fetch(url, { signal: AbortSignal.timeout(30000) });
    if (!textResponse.ok) return Response.json({ error: "The book text is temporarily unavailable." }, { status: 502 });
    let text = await textResponse.text();
    if (text.length > 8_000_000) return Response.json({ error: "This book is too large to import. Try a smaller edition." }, { status: 413 });
    text = text.replace(/^.*?\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[^\n]*\n/i, "").replace(/\n\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK[\s\S]*$/i, "").trim();
    return Response.json({ title: book.title, authors: (book.authors ?? []).map((author) => author.name), content: text });
  } catch {
    return Response.json({ error: "Could not download this book. Please try again." }, { status: 502 });
  }
}
