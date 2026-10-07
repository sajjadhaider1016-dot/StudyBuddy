"use client";

import {
  useEffect,
  useState,
} from "react";
import {
  useParams,
  useRouter,
} from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";
import {
  getDeck,
  getDueCards,
  saveStudySession,
  updateFlashcard,
} from "@/lib/storage";
import { scheduleCard } from "@/lib/spaced-repetition";
import type {
  Deck,
  Rating,
  StudyReview,
} from "@/types";
import { StudyCard } from "@/components/study/study-card";

export default function StudyPage() {
  const params =
    useParams<{ deckId: string }>();

  const router = useRouter();

  const [deck, setDeck] =
    useState<Deck | null>(null);

  const [cards, setCards] =
    useState<ReturnType<
      typeof getDueCards
    >>([]);

  const [index, setIndex] =
    useState(0);

  const [startedAt] = useState(
    () => new Date().toISOString(),
  );

  const [reviews, setReviews] =
    useState<StudyReview[]>([]);

  const [completedReviews, setCompletedReviews] =
    useState<StudyReview[]>([]);

  const [done, setDone] =
    useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (params.deckId !== "today") {
        const storedDeck =
          getDeck(params.deckId);

        setDeck(storedDeck ?? null);

        setCards(
          storedDeck
            ? storedDeck.flashcards.filter(
                (card) =>
                  new Date(
                    card.dueDate,
                  ).getTime() <=
                  Date.now(),
              )
            : [],
        );

        return;
      }

      const dueCards =
        getDueCards();

      setDeck({
        id: "today",
        title: "Today",
        flashcards: dueCards,
        createdAt: "",
        updatedAt: "",
      });

      setCards(dueCards);
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [params.deckId]);

  const current = cards[index];

  const progress = cards.length
    ? Math.round(
        (index / cards.length) * 100,
      )
    : 0;

  function rate(rating: Rating) {
    if (!current || !deck) {
      return;
    }

    const now =
      new Date().toISOString();

    const updated = scheduleCard(
      current,
      rating,
      now,
    );

    updateFlashcard(
      current.deckId,
      updated,
    );

    const review: StudyReview = {
      cardId: current.id,
      rating,
      reviewedAt: now,
    };

    const finalReviews = [
      ...reviews,
      review,
    ];

    setReviews(finalReviews);

    if (
      index + 1 >= cards.length
    ) {
      setCompletedReviews(
        finalReviews,
      );

      saveStudySession({
        id: crypto.randomUUID(),
        deckId: deck.id,
        startedAt,
        completedAt: now,
        reviews: finalReviews,
      });

      setDone(true);
      return;
    }

    setIndex(
      (currentIndex) =>
        currentIndex + 1,
    );
  }

  if (!deck) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-xl font-bold">
          Deck not found
        </h1>

        <Link
          href="/dashboard"
          className="mt-3 inline-block text-[#865a3a]"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  if (done) {
    const counts = {
      again: 0,
      hard: 0,
      good: 0,
      easy: 0,
    };

    completedReviews.forEach(
      (review) => {
        counts[review.rating] += 1;
      },
    );

    return (
      <div className="mx-auto max-w-xl py-12 text-center">
        <CheckCircle2 className="mx-auto size-14 text-emerald-500" />

        <h1 className="mt-4 text-3xl font-bold">
          Study Session Complete!
        </h1>

        <p className="mt-2 muted">
          You reviewed{" "}
          {completedReviews.length}{" "}
          cards.
        </p>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(
            [
              "again",
              "hard",
              "good",
              "easy",
            ] as const
          ).map((rating) => (
            <div
              key={rating}
              className="card p-3"
            >
              <p className="text-xs uppercase muted">
                {rating}
              </p>

              <p className="mt-1 text-xl font-bold">
                {counts[rating]}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border px-4 py-2.5 font-semibold"
            style={{
              borderColor: "var(--line)",
            }}
          >
            Back to Dashboard
          </Link>

          <button
            type="button"
            onClick={() => {
              const refreshedCards =
                deck.flashcards.filter(
                  (card) =>
                    new Date(
                      card.dueDate,
                    ).getTime() <=
                    Date.now(),
                );

              setIndex(0);
              setReviews([]);
              setCompletedReviews([]);
              setDone(false);
              setCards(
                refreshedCards,
              );
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#17242c] px-4 py-2.5 font-semibold text-white"
          >
            <RotateCcw size={16} />
            Study Again
          </button>
        </div>
      </div>
    );
  }

  if (!cards.length) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <CheckCircle2 className="mx-auto size-12 text-emerald-500" />

        <h1 className="mt-4 text-2xl font-bold">
          You&apos;re all caught up.
        </h1>

        <p className="mt-2 muted">
          There are no cards due right now.
        </p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-xl border px-4 py-2.5 font-semibold"
            style={{
              borderColor: "var(--line)",
            }}
          >
            Dashboard
          </Link>

          <Link
            href="/create"
            className="rounded-xl bg-[#17242c] px-4 py-2.5 font-semibold text-white"
          >
            Create new flashcards
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-2 text-sm muted"
      >
        <ArrowLeft size={16} />
        Dashboard
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">
            {deck.title}
          </span>

          <span className="muted">
            {index + 1} / {cards.length}
          </span>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-[#17242c] transition-all"
            style={{
              width: `${Math.max(
                progress,
                3,
              )}%`,
            }}
          />
        </div>
      </div>

      {current && (
        <StudyCard
          key={current.id}
          card={current}
          onRate={rate}
        />
      )}
    </div>
  );
}