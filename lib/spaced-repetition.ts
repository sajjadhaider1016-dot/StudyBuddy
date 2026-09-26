import type { Flashcard, Rating } from "@/types";

const MIN_EASE = 1.3;
const MAX_EASE = 2.8;
const MAX_INTERVAL_DAYS = 3650;

function addDays(iso: string, days: number): string {
  const date = new Date(iso);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function scheduleCard(card: Flashcard, rating: Rating, now = new Date().toISOString()): Flashcard {
  let { repetition, interval, easeFactor } = card;

  if (rating === "again") {
    repetition = 0;
    interval = 0.01;
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.2);
  } else if (rating === "hard") {
    repetition += 1;
    interval = Math.max(1, interval === 0 ? 1 : interval * 1.2);
    easeFactor = Math.max(MIN_EASE, easeFactor - 0.15);
  } else if (rating === "good") {
    repetition += 1;
    interval = repetition === 1 ? 1 : repetition === 2 ? 6 : interval * easeFactor;
  } else {
    repetition += 1;
    interval = repetition === 1 ? 1 : repetition === 2 ? 4 : interval * easeFactor * 1.3;
    easeFactor = Math.min(MAX_EASE, easeFactor + 0.1);
  }

  interval = Math.min(MAX_INTERVAL_DAYS, Math.max(0.01, interval));
  return {
    ...card,
    repetition,
    interval,
    easeFactor: Math.min(MAX_EASE, Math.max(MIN_EASE, easeFactor)),
    dueDate: addDays(now, interval),
    updatedAt: now,
    reviewCount: card.reviewCount + 1,
    correctCount: card.correctCount + (rating === "good" || rating === "easy" ? 1 : 0),
  };
}

export function isDue(card: Flashcard, now = new Date()): boolean {
  return new Date(card.dueDate).getTime() <= now.getTime();
}
