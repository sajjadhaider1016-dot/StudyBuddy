"use client";

import {
  FileText,
  Image as ImageIcon,
  Loader2,
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
  ".txt,.md,.pdf,.docx,.jpg,.jpeg,.png,.webp,.gif";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const supportedExtensions = [
  "txt",
  "md",
  "pdf",
  "docx",
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
  error?: string;
  message?: string;
};

type GenerationResponse = {
  flashcards?: GeneratedCard[];
  error?: string;
  message?: string;
};

export default function CreatePage() {
  const router = useRouter();

  const fileInputRef =
    useRef<HTMLInputElement>(null);

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

  const [cards, setCards] =
    useState<GeneratedCard[] | null>(null);

  async function handleFile(file: File) {
    setError("");
    setContent("");

    const extension =
      getExtension(file.name);

    if (
      !supportedExtensions.includes(
        extension,
      )
    ) {
      setError(
        "Unsupported file type. Please use TXT, MD, PDF, DOCX, JPG, JPEG, PNG, WEBP, or GIF.",
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
        "Files must be 10 MB or smaller.",
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
            "Image extraction is temporarily unavailable because the Gemini free-tier quota has been reached. You can still use TXT, MD, PDF, and DOCX files. Please try the image again after the quota resets.",
          );
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

      setContent(
        extractedContent,
      );

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
      numberOfCards > 50
    ) {
      setError(
        "Choose between 1 and 50 flashcards.",
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
        <p className="text-sm font-semibold text-indigo-600">
          CREATE A DECK
        </p>

        <h1 className="mt-1 text-3xl font-bold">
          Turn your study material into
          flashcards
        </h1>

        <p className="mt-2 max-w-2xl muted">
          Paste your notes or upload a
          document, PDF, or image. StudyBuddy
          extracts the material and uses AI to
          build source-grounded flashcards.
        </p>
      </div>

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
              className="w-full rounded-xl border bg-transparent px-4 py-3 outline-none focus:border-indigo-500"
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
                {[10, 20, 30, 40, 50].map(
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
                  max="50"
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
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold transition hover:border-indigo-400 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-indigo-950/20"
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
                PDF, DOCX, TXT, MD,
                JPG, PNG, WEBP, GIF ·
                max 10 MB
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
                    className="shrink-0 text-indigo-600"
                  />
                ) : (
                  <FileText
                    size={19}
                    className="shrink-0 text-indigo-600"
                  />
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {fileName}
                  </p>

                  <p className="text-xs muted">
                    Content extracted and
                    ready for flashcard
                    generation
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
              className="w-full resize-y rounded-xl border bg-transparent px-4 py-3 leading-6 outline-none focus:border-indigo-500"
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

          <button
            type="button"
            onClick={() =>
              void generate()
            }
            disabled={
              generating ||
              extracting
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
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