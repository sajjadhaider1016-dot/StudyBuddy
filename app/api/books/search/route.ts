import { NextRequest } from "next/server";
import { findFallbackBooks } from "@/lib/gutenberg-fallback";

export const runtime = "nodejs";

type SearchBook = { id: number | string; title: string; authors: string[] };

async function searchGutendex(query: string): Promise<SearchBook[]> {
  const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}&languages=en`, { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!response.ok) throw new Error("Gutendex unavailable");
  const data = await response.json() as { results?: Array<{ id: number; title: string; authors?: Array<{ name: string }>; formats?: Record<string, string> }> };
  return (data.results ?? []).filter((book) => Object.keys(book.formats ?? {}).some((format) => format.toLowerCase().startsWith("text/plain")))
    .slice(0, 12).map((book) => ({ id: book.id, title: book.title, authors: (book.authors ?? []).map((author) => author.name) }));
}

async function searchOpenLibrary(query: string): Promise<SearchBook[]> {
  const url = new URL("https://openlibrary.org/search.json");
  url.searchParams.set("q", query);
  url.searchParams.set("ebook_access", "public");
  url.searchParams.set("has_fulltext", "true");
  url.searchParams.set("fields", "title,author_name,ebook_access,has_fulltext,ia");
  url.searchParams.set("limit", "20");
  const response = await fetch(url, { signal: AbortSignal.timeout(5000), cache: "no-store" });
  if (!response.ok) throw new Error("Open Library unavailable");
  const data = await response.json() as { docs?: Array<{ title?: string; author_name?: string[]; ebook_access?: string; has_fulltext?: boolean; ia?: string[] }> };
  return (data.docs ?? []).filter((book) => book.title && book.has_fulltext && book.ebook_access === "public" && book.ia?.length)
    .slice(0, 12).map((book) => ({ id: `ia-${book.ia![0]}`, title: book.title!, authors: book.author_name ?? [] }));
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) return Response.json({ books: [] });

  try {
    const catalogs = await Promise.any([
      searchGutendex(query).then((books) => {
        if (!books.length) throw new Error("No Gutendex matches");
        return { books, catalogFallback: false };
      }),
      searchOpenLibrary(query).then((books) => {
        if (!books.length) throw new Error("No Open Library matches");
        return { books, catalogFallback: true };
      }),
    ]);
    return Response.json(catalogs);
  } catch {
    return Response.json({ books: findFallbackBooks(query), catalogFallback: true, builtInFallback: true });
  }
}
