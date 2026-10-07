"use client";

import {
  ArrowLeft,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Loader2,
  Search,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  useRef,
  useState,
} from "react";
import type { GeneratedCard } from "@/types";
import { CardPreview } from "@/components/flashcards/card-preview";

const ACCEPTED_FILES =
  ".txt,.md,.pdf,.docx,.epub,.jpg,.jpeg,.png,.webp,.gif";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

const supportedExtensions = [
  "txt",
  "md",
  "pdf",
  "docx",
  "epub",
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
];

const imageExtensions = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
];

function getExtension(name: string): string {
  return (
    name
      .split(".")
      .pop()
      ?.toLowerCase() || ""
  );
}

type ExtractionResponse = {
  success?: boolean;
  filename?: string;
  content?: string;
  characterCount?: number;
  warning?: string;
  pageCount?: number;
  error?: string;
  message?: string;
};

type GenerationResponse = {
  flashcards?: GeneratedCard[];
  error?: string;
  message?: string;
};

type CatalogBook = { id: number; title: string; authors: string[] };
type BookSection = { title: string; content: string };

function splitBookIntoSections(text: string): BookSection[] {
  const maxLength = 80_000;
  const sections: BookSection[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      sections.push({ title: `Section ${sections.length + 1}`, content: remaining.trim() });
      break;
    }
    let cut = remaining.lastIndexOf("\n", maxLength);
    if (cut < maxLength * 0.6) cut = maxLength;
    sections.push({ title: `Section ${sections.length + 1}`, content: remaining.slice(0, cut).trim() });
    remaining = remaining.slice(cut).trimStart();
  }
  return sections.filter((section) => section.content.length >= 20);
}

export default function CreatePage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<File | null>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [count, setCount] = useState("10");
  const [customCount, setCustomCount] =
    useState("10");

  const [fileName, setFileName] =
    useState("");
  const [fileType, setFileType] =
    useState("");

  const [extracting, setExtracting] =
    useState(false);
  const [generating, setGenerating] =
    useState(false);

  const [error, setError] =
    useState("");
  const [notice, setNotice] = useState("");

  const [cards, setCards] =
    useState<GeneratedCard[] | null>(null);
  const [bookQuery, setBookQuery] = useState("");
  const [bookResults, setBookResults] = useState<CatalogBook[]>([]);
  const [bookCatalogNotice, setBookCatalogNotice] = useState("");
  const [bookSections, setBookSections] = useState<BookSection[]>([]);
  const [selectedBookSection, setSelectedBookSection] = useState(0);
  const [searchingBooks, setSearchingBooks] = useState(false);
  const [loadingBook, setLoadingBook] = useState(false);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pdfStartPage, setPdfStartPage] = useState(1);
  const [pdfEndPage, setPdfEndPage] = useState(1);

  function goBack() {
    if (document.referrer.startsWith(window.location.origin)) {
      router.back();
    } else {
      router.push("/");
    }
  }

  async function handleFile(file: File) {
    setError("");
    setNotice("");
    setContent("");
    setBookSections([]);
    setPdfPageCount(null);
    pdfFileRef.current = null;

    const extension =
      getExtension(file.name);

    if (
      !supportedExtensions.includes(
        extension,
      )
    ) {
      setError(
        "Unsupported file type. Please use TXT, MD, PDF, EPUB, DOCX, JPG, JPEG, PNG, WEBP, or GIF.",
      );
      return;
    }

    if (file.size === 0) {
      setError(
        "The selected file is empty.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        "Files must be 100 MB or smaller.",
      );
      return;
    }

    setExtracting(true);
    setFileName(file.name);
    setFileType(extension);

    try {
      const formData = new FormData();

      formData.append(
        "file",
        file,
      );
      if (extension === "pdf") formData.append("mode", "info");

      const response =
        await fetch(
          "/api/extract-content",
          {
            method: "POST",
            body: formData,
          },
        );

      let data: ExtractionResponse;

      try {
        data =
          (await response.json()) as ExtractionResponse;
      } catch {
        throw new Error(
          "The server returned an invalid response while extracting the file.",
        );
      }

      if (!response.ok) {
        if (
          response.status === 429 ||
          data.error ===
            "IMAGE_EXTRACTION_QUOTA_EXCEEDED"
        ) {
          throw new Error(
            "Gemini’s free-tier quota has been reached. Scanned PDF text recognition and image extraction need Gemini. Try again after the quota resets.",
          );
        }

        if (data.error === "PDF_OCR_REQUIRES_API_KEY") {
          throw new Error(data.message || "Add GEMINI_API_KEY to .env.local to read this scanned PDF.");
        }

        if (
          data.error ===
          "TEMPORARY_EXTRACTION_ERROR"
        ) {
          throw new Error(
            "Image extraction is temporarily unavailable. Please wait a moment and try again.",
          );
        }

        throw new Error(
          data.message ||
            data.error ||
            "Could not extract content from this file.",
        );
      }

      if (extension === "pdf") {
        if (!data.pageCount || data.pageCount < 1) throw new Error("No pages could be read from this PDF.");
        pdfFileRef.current = file;
        setPdfPageCount(data.pageCount);
        setPdfStartPage(1);
        setPdfEndPage(Math.min(20, data.pageCount));
        setFileName(file.name);
        setFileType(extension);
        setTitle((current) => current.trim() || file.name.replace(/\.pdf$/i, ""));
        setNotice(`Book uploaded (${data.pageCount} pages). Choose the pages for this deck.`);
        return;
      }

      /*
       * The extraction API returns the extracted
       * material in `content`.
       */
      const extractedContent =
        data.content?.trim() || "";

      if (
        extractedContent.length < 20
      ) {
        throw new Error(
          "No readable study material was found in this file.",
        );
      }

      const sections = splitBookIntoSections(extractedContent);
      if (sections.length > 1) {
        setBookSections(sections);
        setSelectedBookSection(0);
        setContent(sections[0].content);
      } else {
        setBookSections([]);
        setContent(extractedContent);
      }

      if (data.filename) {
        setFileName(
          data.filename,
        );
      }

      /*
       * Keep the extension from the
       * uploaded file.
       */
      setFileType(extension);

      setError("");
      setNotice(data.warning || "");
    } catch (error) {
      setContent("");

      setError(
        error instanceof Error
          ? error.message
          : "Could not read this file.",
      );
    } finally {
      setExtracting(false);
    }
  }

  async function extractSelectedPdfPages() {
    const file = pdfFileRef.current;
    if (!file || !pdfPageCount) return;
    if (!Number.isInteger(pdfStartPage) || !Number.isInteger(pdfEndPage) || pdfStartPage < 1 || pdfEndPage < pdfStartPage || pdfEndPage > pdfPageCount) {
      setError(`Choose a page range between 1 and ${pdfPageCount}.`);
      return;
    }
    if (pdfEndPage - pdfStartPage + 1 > 100) {
      setError("Choose up to 100 pages at a time.");
      return;
    }

    setExtracting(true);
    setError("");
    setNotice("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("startPage", String(pdfStartPage));
      formData.append("endPage", String(pdfEndPage));
      const response = await fetch("/api/extract-content", { method: "POST", body: formData });
      const data = await response.json() as ExtractionResponse;
      if (!response.ok) throw new Error(data.message || data.error || "Could not extract those PDF pages.");
      const extractedContent = data.content?.trim() || "";
      if (extractedContent.length < 20) throw new Error("No readable text was found on those pages.");
      const sections = splitBookIntoSections(extractedContent);
      setBookSections(sections.length > 1 ? sections : []);
      setSelectedBookSection(0);
      setContent(sections.length > 1 ? sections[0].content : extractedContent);
      setFileName(`${file.name} · pages ${pdfStartPage}–${pdfEndPage}`);
      setFileType("pdf");
      const bookName = file.name.replace(/\.pdf$/i, "");
      setTitle((current) => !current.trim() || current === bookName || current.startsWith(`${bookName} — pages `)
        ? `${bookName} — pages ${pdfStartPage}–${pdfEndPage}`
        : current);
      setNotice(data.warning || `Extracted pages ${pdfStartPage}–${pdfEndPage}.`);
    } catch (error) {
      setContent("");
      setError(error instanceof Error ? error.message : "Could not extract those PDF pages.");
    } finally {
      setExtracting(false);
    }
  }

  async function searchCatalog() {
    if (bookQuery.trim().length < 2) return;
    setSearchingBooks(true);
    setError("");
    setBookCatalogNotice("");
    try {
      const response = await fetch(`/api/books/search?q=${encodeURIComponent(bookQuery.trim())}`);
      const data = await response.json() as { books?: CatalogBook[]; error?: string; catalogFallback?: boolean };
      if (!response.ok) throw new Error(data.error || "Book search failed.");
      setBookResults(data.books ?? []);
      if (data.catalogFallback) setBookCatalogNotice("The live catalog is unavailable. These built-in free classics can still be searched and loaded.");
      if (!data.books?.length) setBookCatalogNotice("No matching built-in books were found. You can still upload a PDF or EPUB below.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Book search failed.");
    } finally {
      setSearchingBooks(false);
    }
  }

  async function selectCatalogBook(book: CatalogBook) {
    setLoadingBook(true);
    setError("");
    try {
      const response = await fetch(`/api/books/${book.id}`);
      const data = await response.json() as { title?: string; authors?: string[]; content?: string; error?: string };
      if (!response.ok || !data.content) throw new Error(data.error || "Could not load this book.");
      const sections = splitBookIntoSections(data.content);
      if (!sections.length) throw new Error("No readable text was found in this book.");
      setTitle(data.title || book.title);
      setBookSections(sections);
      setSelectedBookSection(0);
      setContent(sections[0].content);
      setFileName(`${data.title || book.title}${data.authors?.length ? ` — ${data.authors.join(", ")}` : ""}`);
      setFileType("book");
      setBookResults([]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not load this book.");
    } finally {
      setLoadingBook(false);
    }
  }

  function onFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (file) {
      void handleFile(file);
    }

    event.target.value = "";
  }

  function clearFile() {
    setFileName("");
    setFileType("");
    setContent("");
    setError("");
    setNotice("");
    setPdfPageCount(null);
    pdfFileRef.current = null;
  }

  async function generate() {
    setError("");

    if (!title.trim()) {
      setError(
        "Give your deck a name first.",
      );
      return;
    }

    if (
      content.trim().length < 20
    ) {
      setError(
        "Add at least 20 characters of study material.",
      );
      return;
    }

    const numberOfCards =
      count === "custom"
        ? Number(customCount)
        : Number(count);

    if (
      !Number.isInteger(
        numberOfCards,
      ) ||
      numberOfCards < 1 ||
      numberOfCards > 200
    ) {
      setError(
        "Choose between 1 and 200 flashcards.",
      );
      return;
    }

    setGenerating(true);

    try {
      const response =
        await fetch(
          "/api/generate-flashcards",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              content,
              deckTitle: title,
              numberOfCards,
            }),
          },
        );

      let data: GenerationResponse;

      try {
        data =
          (await response.json()) as GenerationResponse;
      } catch {
        throw new Error(
          "The server returned an invalid response while generating flashcards.",
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Flashcard generation failed.",
        );
      }

      if (
        !data.flashcards ||
        data.flashcards.length === 0
      ) {
        throw new Error(
          "No flashcards were generated. Try adding more detailed study material.",
        );
      }

      setCards(
        data.flashcards,
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while generating your flashcards.",
      );
    } finally {
      setGenerating(false);
    }
  }

  if (cards) {
    return (
      <CardPreview
        title={title}
        sourceText={content}
        initialCards={cards}
        onBack={() =>
          setCards(null)
        }
        onSaved={(id) =>
          router.push(
            `/study/${id}`,
          )
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <button type="button" onClick={goBack} className="mb-5 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#606a72] transition hover:bg-black/[0.04] hover:text-[#202a35]" aria-label="Go back to the previous page">
          <ArrowLeft size={17} />
          Back
        </button>
        <p className="text-sm font-semibold text-[#9b713e]">
          CREATE A DECK
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Turn your study material into
          flashcards
        </h1>

        <p className="mt-2 max-w-2xl muted">
          Use your notes, upload an ebook, or find a free public-domain book. StudyBuddy turns the selected material into source-grounded flashcards.
        </p>
      </div>

      <section className="card mb-6 p-5 sm:p-6" aria-labelledby="book-search-title">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-1 shrink-0 text-[#9b713e]" size={20} />
          <div className="min-w-0 flex-1">
            <h2 id="book-search-title" className="font-semibold">Find a free public-domain book</h2>
            <p className="mt-1 text-sm muted">Search Project Gutenberg’s catalog. Availability may vary by country.</p>
            <form className="mt-4 flex flex-col gap-2 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void searchCatalog(); }}>
              <input value={bookQuery} onChange={(event) => setBookQuery(event.target.value)} placeholder="Search by title or author" className="min-w-0 flex-1 rounded-xl border bg-transparent px-4 py-2.5" style={{ borderColor: "var(--line)" }} aria-label="Search public-domain books" />
              <button type="submit" disabled={searchingBooks || bookQuery.trim().length < 2} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202a35] px-4 py-2.5 font-semibold text-white disabled:opacity-50">
                {searchingBooks ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                Search books
              </button>
            </form>
            {bookCatalogNotice && <p className="mt-3 text-sm muted" role="status">{bookCatalogNotice}</p>}
            {bookResults.length > 0 && <ul className="mt-3 divide-y" style={{ borderColor: "var(--line)" }}>
              {bookResults.map((book) => <li key={book.id} className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center">
                <div><p className="text-sm font-semibold">{book.title}</p><p className="text-xs muted">{book.authors.join(", ") || "Author unknown"}</p></div>
                <button type="button" disabled={loadingBook} onClick={() => void selectCatalogBook(book)} className="rounded-lg border px-3 py-2 text-sm font-semibold disabled:opacity-50" style={{ borderColor: "var(--line)" }}>{loadingBook ? "Loading…" : "Use this book"}</button>
              </li>)}
            </ul>}
          </div>
        </div>
      </section>

      <div className="card p-5 sm:p-7">
        <div className="grid gap-6">
          <label>
            <span className="mb-2 block text-sm font-semibold">
              Deck name
            </span>

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              maxLength={120}
              placeholder="Machine Learning — Chapter 1"
              className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:border-[#9b713e]"
              style={{
                borderColor:
                  "var(--line)",
              }}
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm font-semibold">
                Number of cards
              </span>

              <select
                value={count}
                onChange={(event) =>
                  setCount(
                    event.target.value,
                  )
                }
                className="w-full rounded-xl border bg-transparent px-4 py-3"
                style={{
                  borderColor:
                    "var(--line)",
                }}
              >
                {[10, 20, 30, 40, 50, 75, 100, 150, 200].map(
                  (number) => (
                    <option
                      key={number}
                      value={number}
                    >
                      {number} cards
                    </option>
                  ),
                )}

                <option value="custom">
                  Custom
                </option>
              </select>

              {count ===
                "custom" && (
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={
                    customCount
                  }
                  onChange={(
                    event,
                  ) =>
                    setCustomCount(
                      event.target
                        .value,
                    )
                  }
                  className="mt-2 w-full rounded-xl border bg-transparent px-4 py-3"
                  style={{
                    borderColor:
                      "var(--line)",
                  }}
                  aria-label="Custom number of cards"
                />
              )}
              <p className="mt-2 text-xs muted">Up to 200 cards. Larger requests are generated in smaller batches and use more Gemini quota.</p>
            </label>

            <div>
              <span className="mb-2 block text-sm font-semibold">
                Import study material
              </span>

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                disabled={
                  extracting
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold transition hover:border-[#e2d2b8] hover:bg-[#f5f2eb] disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-[#9b713e]/10"
                style={{
                  borderColor:
                    "var(--line)",
                }}
              >
                {extracting ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Extracting material…
                  </>
                ) : (
                  <>
                    <Upload
                      size={17}
                    />
                    Upload a file
                  </>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept={
                  ACCEPTED_FILES
                }
                className="sr-only"
                onChange={
                  onFileChange
                }
              />

              <p className="mt-2 text-xs muted">
                PDF, EPUB, DOCX, TXT, MD,
                JPG, PNG, WEBP, GIF ·
                max 100 MB
              </p>
            </div>
          </div>

          {fileName && (
            <div
              className="flex items-center justify-between gap-3 rounded-xl border bg-black/[.02] p-3 dark:bg-white/[.03]"
              style={{
                borderColor:
                  "var(--line)",
              }}
            >
              <div className="flex min-w-0 items-center gap-3">
                {imageExtensions.includes(
                  fileType,
                ) ? (
                  <ImageIcon
                    size={19}
                    className="shrink-0 text-[#9b713e]"
                  />
                ) : (
                  <FileText
                    size={19}
                    className="shrink-0 text-[#9b713e]"
                  />
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {fileName}
                  </p>

                  <p className="text-xs muted">
                    {fileType === "pdf" && !content
                      ? `${pdfPageCount ?? "Book"} pages available · choose a page range below`
                      : "Content extracted and ready for flashcard generation"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={
                  clearFile
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-black/5 dark:hover:bg-white/5"
                aria-label="Clear uploaded file"
              >
                <X size={17} />
              </button>
            </div>
          )}

          {pdfPageCount !== null && (
            <div className="rounded-xl border p-4 sm:p-5" style={{ borderColor: "var(--line)" }}>
              <h3 className="font-semibold">Choose a chapter or page range</h3>
              <p className="mt-1 text-sm muted">This book has {pdfPageCount} pages. Extract up to 100 pages per deck; you can repeat this for other chapters.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                <label className="text-sm font-medium">
                  First page
                  <input type="number" min={1} max={pdfPageCount} value={pdfStartPage} onChange={(event) => setPdfStartPage(Number(event.target.value))} className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2.5" style={{ borderColor: "var(--line)" }} />
                </label>
                <label className="text-sm font-medium">
                  Last page
                  <input type="number" min={pdfStartPage} max={pdfPageCount} value={pdfEndPage} onChange={(event) => setPdfEndPage(Number(event.target.value))} className="mt-1 w-full rounded-xl border bg-transparent px-3 py-2.5" style={{ borderColor: "var(--line)" }} />
                </label>
                <button type="button" onClick={() => void extractSelectedPdfPages()} disabled={extracting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202a35] px-4 py-2.5 font-semibold text-white disabled:opacity-50">
                  {extracting ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                  {extracting ? "Reading pages…" : "Use these pages"}
                </button>
              </div>
            </div>
          )}

          {bookSections.length > 1 && (
            <label>
              <span className="mb-2 block text-sm font-semibold">Book section</span>
              <select value={selectedBookSection} onChange={(event) => {
                const index = Number(event.target.value);
                setSelectedBookSection(index);
                setContent(bookSections[index]?.content ?? "");
              }} className="w-full rounded-xl border bg-transparent px-4 py-3" style={{ borderColor: "var(--line)" }}>
                {bookSections.map((section, index) => <option key={index} value={index}>{section.title}</option>)}
              </select>
              <span className="mt-1 block text-xs muted">Large books are divided into sections so you can make focused decks from each part.</span>
            </label>
          )}

          <label>
            <span className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <FileText size={16} />
              Study material
            </span>

            <textarea
              value={content}
              onChange={(event) => {
                setContent(
                  event.target.value,
                );

                if (fileName) {
                  setFileName(
                    "",
                  );
                  setFileType(
                    "",
                  );
                }
              }}
              rows={17}
              maxLength={100000}
              placeholder="Paste lecture notes, textbook material, revision notes, article text, or extracted content here…"
              className="w-full resize-y rounded-xl border bg-transparent px-4 py-3 leading-6 outline-none focus:border-[#9b713e]"
              style={{
                borderColor:
                  "var(--line)",
              }}
            />

            <div className="mt-1 flex justify-between text-xs muted">
              <span>
                Source-grounded AI generation
              </span>

              <span>
                {content.length.toLocaleString()}{" "}
                / 100,000
              </span>
            </div>
          </label>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm leading-6 text-red-700 dark:bg-red-950/20 dark:text-red-300"
            >
              {error}
            </div>
          )}

          {notice && (
            <div role="status" className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm leading-6 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
              {notice}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              void generate()
            }
            disabled={
              generating ||
              extracting ||
              (pdfPageCount !== null && !content.trim())
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#202a35] px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-[#354552] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {generating ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Creating your flashcards…
              </>
            ) : (
              <>
                <WandSparkles
                  size={18}
                />
                Generate Flashcards
              </>
            )}
          </button>

          {generating && (
            <p className="text-center text-sm muted">
              StudyBuddy is analyzing your
              material and creating useful
              recall questions…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
