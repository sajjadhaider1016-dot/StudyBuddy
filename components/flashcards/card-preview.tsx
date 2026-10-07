"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

import { createDeck } from "@/lib/flashcards";
import { saveDeck } from "@/lib/storage";

interface GeneratedCard {
  question: string;
  answer: string;
}

interface CardPreviewProps {
  title: string;
  sourceText: string;
  initialCards?: GeneratedCard[];
  cards?: GeneratedCard[];
  onBack: () => void;
  onSaved: (id: string) => void;
}

function MathText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function CardPreview({
  title,
  sourceText,
  initialCards,
  cards: cardsProp,
  onBack,
  onSaved,
}: CardPreviewProps) {
  const incomingCards =
    initialCards ?? cardsProp ?? [];

  const [cards, setCards] =
    useState<GeneratedCard[]>(incomingCards);

  const [editingIndex, setEditingIndex] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  function updateCard(
    index: number,
    field: "question" | "answer",
    value: string,
  ) {
    setCards((current) =>
      current.map((card, cardIndex) =>
        cardIndex === index
          ? {
              ...card,
              [field]: value,
            }
          : card,
      ),
    );
  }

  function deleteCard(index: number) {
    setCards((current) =>
      current.filter(
        (_, cardIndex) => cardIndex !== index,
      ),
    );

    setEditingIndex(null);
  }

  function addCard() {
    setCards((current) => [
      ...current,
      {
        question: "",
        answer: "",
      },
    ]);

    setEditingIndex(cards.length);
  }

  function saveCurrentDeck() {
    setError("");

    if (cards.length === 0) {
      setError(
        "Your deck needs at least one flashcard.",
      );
      return;
    }

    const hasInvalidCard = cards.some(
      (card) =>
        !card.question.trim() ||
        !card.answer.trim(),
    );

    if (hasInvalidCard) {
      setError(
        "Please make sure every card has both a question and an answer.",
      );
      return;
    }

    try {
      const deck = createDeck(
        title,
        sourceText,
        cards,
      );

      saveDeck(deck);

      onSaved(deck.id);
    } catch (error) {
      console.error(
        "StudyBuddy save deck error:",
        error,
      );

      setError(
        "We couldn't save your deck. Please try again.",
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Back */}
      <button
        type="button"
        onClick={onBack}
        className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--muted)] transition hover:text-[var(--foreground)]"
      >
        <ArrowLeft size={16} />
        Back to deck editor
      </button>

      {/* Heading */}
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
            Review generated cards
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[var(--foreground)] sm:text-4xl">
            {title}
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            {cards.length}{" "}
            {cards.length === 1
              ? "card"
              : "cards"}{" "}
            ready for review.
          </p>
        </div>

        <button
          type="button"
          onClick={addCard}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border-strong)] bg-[var(--card)] px-4 py-2.5 text-sm font-bold text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Plus size={17} />
          Add card
        </button>
      </div>

      {/* Empty state */}
      {cards.length === 0 && (
        <div className="soft-card p-10 text-center">
          <p className="text-base font-bold text-[var(--foreground)]">
            No flashcards available.
          </p>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Go back and generate your cards again.
          </p>

          <button
            type="button"
            onClick={onBack}
            className="gradient-primary mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to editor
          </button>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {cards.map((card, index) => {
          const isEditing =
            editingIndex === index;

          return (
            <article
              key={`${index}-${card.question.slice(
                0,
                10,
              )}`}
              className="soft-card overflow-hidden"
            >
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary-soft)] text-xs font-bold text-[var(--primary)]">
                    {String(index + 1).padStart(
                      2,
                      "0",
                    )}
                  </span>

                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                    Flashcard
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingIndex(
                        isEditing ? null : index,
                      )
                    }
                    className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-[var(--primary-soft)] hover:text-[var(--primary)]"
                    aria-label={
                      isEditing
                        ? "Finish editing"
                        : "Edit card"
                    }
                  >
                    {isEditing ? (
                      <Check size={17} />
                    ) : (
                      <Pencil size={17} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteCard(index)
                    }
                    className="rounded-lg p-2 text-[var(--muted)] transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    aria-label="Delete card"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {isEditing ? (
                  <div className="space-y-5">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                        Question
                      </label>

                      <textarea
                        value={card.question}
                        onChange={(event) =>
                          updateCard(
                            index,
                            "question",
                            event.target.value,
                          )
                        }
                        rows={4}
                        className="focus-ring w-full rounded-xl border border-[var(--border-strong)] bg-[var(--background)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[var(--muted)]">
                        Answer
                      </label>

                      <textarea
                        value={card.answer}
                        onChange={(event) =>
                          updateCard(
                            index,
                            "answer",
                            event.target.value,
                          )
                        }
                        rows={5}
                        className="focus-ring w-full rounded-xl border border-[var(--border-strong)] bg-[var(--background)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setEditingIndex(null)
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white"
                    >
                      <Check size={16} />
                      Finish editing
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Question */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Question
                      </p>

                      <MathText className="prose prose-slate max-w-none text-lg font-bold leading-7 text-[var(--foreground)] sm:text-xl dark:prose-invert">
                        {card.question}
                      </MathText>
                    </div>

                    {/* Answer */}
                    <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--background)] p-5">
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">
                        Answer
                      </p>

                      <MathText className="prose prose-slate max-w-none text-sm leading-7 text-[var(--foreground)] dark:prose-invert">
                        {card.answer}
                      </MathText>
                    </div>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/20 dark:text-red-300"
        >
          {error}
        </div>
      )}

      {/* Save */}
      {cards.length > 0 && (
        <button
          type="button"
          onClick={saveCurrentDeck}
          className="gradient-primary mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#17242c]/10 transition hover:-translate-y-0.5 hover:shadow-xl"
        >
          <Save size={18} />
          Save Deck
        </button>
      )}

      <p className="pb-8 pt-3 text-center text-xs text-[var(--muted)]">
        Review your cards before saving your deck.
      </p>
    </div>
  );
}