import { NextRequest } from "next/server";
import { findFallbackBooks } from "@/lib/gutenberg-fallback";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) return Response.json({ books: [] });

  try {
    const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}&languages=en`, { signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!response.ok) throw new Error("The catalog request failed.");
    const data = await response.json() as { results?: Array<{ id: number; title: string; authors?: Array<{ name: string }>; formats?: Record<string, string> }> };
    const books = (data.results ?? []).filter((book) =>
      Object.keys(book.formats ?? {}).some((format) => format.toLowerCase().startsWith("text/plain")),
    ).slice(0, 12).map((book) => ({
      id: book.id,
      title: book.title,
      authors: (book.authors ?? []).map((author) => author.name),
    }));
    if (books.length) return Response.json({ books });
    return Response.json({ books: findFallbackBooks(query), catalogFallback: true });
  } catch {
    return Response.json({ books: findFallbackBooks(query), catalogFallback: true });
  }
}
