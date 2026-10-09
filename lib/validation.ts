import { z } from "zod";

export const generationRequestSchema = z.object({
  content: z.string().trim().min(20).max(100_000),
  deckTitle: z.string().trim().min(1).max(120),
  numberOfCards: z.number().int().min(1).max(40),
  previousQuestions: z.array(z.string().trim().min(1).max(500)).max(1_000).optional(),
});

export const generatedCardsSchema = z.object({
  flashcards: z.array(z.object({ question: z.string().trim().min(1).max(1500), answer: z.string().trim().min(1).max(6000) })).min(1).max(50),
});

export function normalizeCards(cards: Array<{ question: string; answer: string }>) {
  const seen = new Set<string>();
  return cards.filter((card) => {
    const key = card.question.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
