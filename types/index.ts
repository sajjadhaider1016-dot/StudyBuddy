export type Rating = "again" | "hard" | "good" | "easy";

export interface Flashcard {
  id: string;
  deckId: string;
  question: string;
  answer: string;
  repetition: number;
  interval: number;
  easeFactor: number;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  correctCount: number;
}

export interface Deck {
  id: string;
  title: string;
  sourceText?: string;
  flashcards: Flashcard[];
  createdAt: string;
  updatedAt: string;
}

export interface StudyReview {
  cardId: string;
  rating: Rating;
  reviewedAt: string;
}

export interface StudySession {
  id: string;
  deckId: string;
  startedAt: string;
  completedAt?: string;
  reviews: StudyReview[];
}

export interface StoredData {
  version: number;
  decks: Deck[];
  sessions: StudySession[];
  theme: "light" | "dark" | "system";
}

export interface GeneratedCard {
  question: string;
  answer: string;
}
