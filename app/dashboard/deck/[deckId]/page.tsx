"use client";
import MathText from "@/components/flashcards/math-text";
import { useState } from "react";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import type { Deck, Flashcard } from "@/types";
import {
  deleteDeck,
  getDeck,
  updateDeck,
} from "@/lib/storage";

export default function EditDeckPage() {
  const { deckId } = useParams<{ deckId: string }>();
  const router = useRouter();

  const [deck, setDeck] = useState<Deck | null>(() =>
    getDeck(deckId) ?? null,
  );

  const [error, setError] = useState("");

  function updateCurrentDeck(
    updater: (currentDeck: Deck) => Deck,
  ) {
    setDeck((currentDeck) => {
      if (!currentDeck) {
        return currentDeck;
      }

      return updater(currentDeck);
    });
  }

  function updateCard(
    index: number,
    changes: Partial<Flashcard>,
  ) {
    updateCurrentDeck((currentDeck) => ({
      ...currentDeck,
      flashcards: currentDeck.flashcards.map(
        (card, cardIndex) =>
          cardIndex === index
            ? { ...card, ...changes }
            : card,
      ),
    }));

    setError("");
  }

  function addCard() {
    updateCurrentDeck((currentDeck) => {
      const now = new Date().toISOString();

      const newCard: Flashcard = {
        id: crypto.randomUUID(),
        deckId: currentDeck.id,
        question: "",
        answer: "",
        repetition: 0,
        interval: 0,
        easeFactor: 2.5,
        dueDate: now,
        createdAt: now,
        updatedAt: now,
        reviewCount: 0,
        correctCount: 0,
      };

      return {
        ...currentDeck,
        flashcards: [
          ...currentDeck.flashcards,
          newCard,
        ],
        updatedAt: now,
      };
    });

    setError("");
  }

  function save() {
    setError("");

    if (!deck) {
      return;
    }

    if (!deck.title.trim()) {
      setError("Deck title is required.");
      return;
    }

    const hasInvalidCard = deck.flashcards.some(
      (card) =>
        !card.question.trim() ||
        !card.answer.trim(),
    );

    if (hasInvalidCard) {
      setError(
        "Every flashcard needs both a question and an answer.",
      );
      return;
    }

    updateDeck({
      ...deck,
      title: deck.title.trim(),
    });

    router.push("/dashboard");
  }

  function removeCard(index: number) {
    if (!confirm("Delete this flashcard?")) {
      return;
    }

    updateCurrentDeck((currentDeck) => ({
      ...currentDeck,
      flashcards: currentDeck.flashcards.filter(
        (_, cardIndex) =>
          cardIndex !== index,
      ),
    }));

    setError("");
  }

  function removeDeck() {
    if (!deck) {
      return;
    }

    if (
      !confirm(
        "Delete this deck and its study history? This cannot be undone.",
      )
    ) {
      return;
    }

    deleteDeck(deck.id);
    router.push("/dashboard");
  }

  if (!deck) {
    return (
      <div className="mx-auto max-w-4xl py-20 text-center">
        <h1 className="text-xl font-bold">
          Deck not found
        </h1>

        <p className="mt-2 text-sm muted">
          This deck may have been deleted or no longer exists.
        </p>

        <Link
          href="/dashboard"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#17242c] px-4 py-2.5 font-semibold text-white"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-sm muted"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[#865a3a]">
            EDIT DECK
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Deck settings
          </h1>

          <p className="mt-2 text-sm muted">
            Review, edit, add, or remove your flashcards.
          </p>
        </div>

        <button
          type="button"
          onClick={save}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17242c] px-4 py-2.5 font-semibold text-white"
        >
          <Save size={17} />
          Save changes
        </button>
      </div>

      <div className="card p-5">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold">
            Deck name
          </span>

          <input
            value={deck.title}
            onChange={(event) => {
              const value = event.target.value;

              updateCurrentDeck(
                (currentDeck) => ({
                  ...currentDeck,
                  title: value,
                }),
              );
            }}
            className="w-full rounded-xl border bg-transparent px-3 py-2.5"
            style={{
              borderColor: "var(--line)",
            }}
          />
        </label>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold">
          Flashcards
        </h2>

        <button
          type="button"
          onClick={addCard}
          className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold"
          style={{
            borderColor: "var(--line)",
          }}
        >
          <Plus size={16} />
          Add card
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {deck.flashcards.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="font-semibold">
              No flashcards in this deck.
            </p>

            <p className="mt-1 text-sm muted">
              Add a card to continue editing.
            </p>

            <button
              type="button"
              onClick={addCard}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#17242c] px-4 py-2.5 text-sm font-semibold text-white"
            >
              <Plus size={16} />
              Add first card
            </button>
          </div>
        ) : (
          deck.flashcards.map(
            (card, index) => (
              <div
                className="card p-5"
                key={card.id}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider muted">
                    Card {index + 1}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      removeCard(index)
                    }
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    aria-label={`Delete card ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <label className="block">
                  <span className="mb-1 block text-xs font-semibold muted">
                    Question
                  </span>

                  <textarea
                    rows={2}
                    value={card.question}
                    onChange={(event) =>
                      updateCard(index, {
                        question:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border bg-transparent px-3 py-2.5"
                    style={{
                      borderColor: "var(--line)",
                    }}
                  />
                </label>

                <label className="mt-3 block">
                  <span className="mb-1 block text-xs font-semibold muted">
                    Answer
                  </span>

                  <textarea
                    rows={4}
                    value={card.answer}
                    onChange={(event) =>
                      updateCard(index, {
                        answer:
                          event.target.value,
                      })
                    }
                    className="w-full rounded-xl border bg-transparent px-3 py-2.5"
                    style={{
                      borderColor: "var(--line)",
                    }}
                  />
                </label>
              </div>
            ),
          )
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <div
        className="mt-8 border-t pt-6"
        style={{
          borderColor: "var(--line)",
        }}
      >
        <button
          type="button"
          onClick={removeDeck}
          className="text-sm font-semibold text-red-600 hover:text-red-700"
        >
          Delete entire deck
        </button>
      </div>
    </div>
  );
}
