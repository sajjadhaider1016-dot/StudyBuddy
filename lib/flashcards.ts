import type { Deck, Flashcard, GeneratedCard } from "@/types";

export function createDeck(title: string, sourceText: string, generated: GeneratedCard[]): Deck {
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const flashcards: Flashcard[] = generated.map((card) => ({
    id: crypto.randomUUID(), deckId: id, question: card.question.trim(), answer: card.answer.trim(),
    repetition: 0, interval: 0, easeFactor: 2.5, dueDate: now, createdAt: now, updatedAt: now,
    reviewCount: 0, correctCount: 0,
  }));
  return { id, title: title.trim(), sourceText, flashcards, createdAt: now, updatedAt: now };
}
