import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query || query.length < 2) return Response.json({ books: [] });

  try {
    const response = await fetch(`https://gutendex.com/books/?search=${encodeURIComponent(query)}&languages=en`, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) return Response.json({ error: "The public book catalog is temporarily unavailable." }, { status: 502 });
    const data = await response.json() as { results?: Array<{ id: number; title: string; authors?: Array<{ name: string }>; formats?: Record<string, string> }> };
    const books = (data.results ?? []).filter((book) =>
      Object.keys(book.formats ?? {}).some((format) => format.toLowerCase().startsWith("text/plain")),
    ).slice(0, 12).map((book) => ({
      id: book.id,
      title: book.title,
      authors: (book.authors ?? []).map((author) => author.name),
    }));
    return Response.json({ books });
  } catch {
    return Response.json({ error: "Could not reach the public book catalog. Please try again." }, { status: 502 });
  }
}
