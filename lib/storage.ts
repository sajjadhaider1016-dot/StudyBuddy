import type { Deck, Flashcard, StoredData, StudySession } from "@/types";
import { isDue } from "./spaced-repetition";

const KEY = "studybuddy:v1";
const defaultData: StoredData = { version: 1, decks: [], sessions: [], theme: "system" };

function read(): StoredData {
  if (typeof window === "undefined") return defaultData;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultData;
    const parsed = JSON.parse(raw) as StoredData;
    if (!Array.isArray(parsed.decks) || !Array.isArray(parsed.sessions)) return defaultData;
    return { ...defaultData, ...parsed };
  } catch { return defaultData; }
}
function write(data: StoredData) { localStorage.setItem(KEY, JSON.stringify(data)); }

export function getDecks(): Deck[] { return read().decks; }
export function getDeck(id: string): Deck | undefined { return read().decks.find((d) => d.id === id); }
export function saveDeck(deck: Deck) { const data = read(); data.decks = [deck, ...data.decks.filter((d) => d.id !== deck.id)]; write(data); }
export function updateDeck(deck: Deck) { saveDeck({ ...deck, updatedAt: new Date().toISOString() }); }
export function deleteDeck(id: string) { const data = read(); data.decks = data.decks.filter((d) => d.id !== id); data.sessions = data.sessions.filter((s) => s.deckId !== id); write(data); }
export function updateFlashcard(deckId: string, card: Flashcard) { const deck = getDeck(deckId); if (!deck) throw new Error("Deck not found"); updateDeck({ ...deck, flashcards: deck.flashcards.map((c) => c.id === card.id ? card : c) }); }
export function getDueCards(deckId?: string): Flashcard[] { return getDecks().flatMap((d) => !deckId || d.id === deckId ? d.flashcards.filter((c) => isDue(c)) : []); }
export function saveStudySession(session: StudySession) { const data = read(); data.sessions = [session, ...data.sessions.filter((s) => s.id !== session.id)]; write(data); }
export function getSessions(): StudySession[] { return read().sessions; }
export function getTheme(): StoredData["theme"] { return read().theme; }
export function setTheme(theme: StoredData["theme"]) { const data = read(); data.theme = theme; write(data); }
