import { GoogleGenAI } from "@google/genai";
import {
  generatedCardsSchema,
  normalizeCards,
} from "./validation";
import type { GeneratedCard } from "@/types";

const PRIMARY_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ||
  "gemini-3.5-flash-lite";

export class GeminiTemporaryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiTemporaryError";
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function isQuotaError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("429") ||
    message.includes("quota") ||
    message.includes("resource_exhausted") ||
    message.includes("free_tier_requests") ||
    message.includes("daily quota")
  );
}

function isRetryableError(error: unknown): boolean {
  if (isQuotaError(error)) {
    return false;
  }

  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("fetch failed") ||
    message.includes("econnreset") ||
    message.includes("econnrefused") ||
    message.includes("etimedout") ||
    message.includes("timeout") ||
    message.includes("temporarily unavailable") ||
    message.includes("503") ||
    message.includes("500") ||
    message.includes("502") ||
    message.includes("504")
  );
}

function buildPrompt(
  content: string,
  deckTitle: string,
  numberOfCards: number,
): string {
  return `
You are StudyBuddy's expert educational flashcard generator.

Your job is to create exactly ${numberOfCards} accurate flashcards from the supplied study material.

DECK TITLE:
"${deckTitle}"

==================================================
SOURCE FIDELITY — HIGHEST PRIORITY
==================================================

The supplied material is the ONLY authoritative source.

Do NOT use outside knowledge to repair, complete, reinterpret, or improve the source.

Every fact, definition, equation, relationship, variable, number, condition, and example in a flashcard must be supported by the source.

If the source appears ambiguous, corrupted, incomplete, or OCR-misread:

- Do NOT invent the missing information.
- Do NOT silently correct it using outside knowledge.
- Prefer a simpler question that can be answered confidently from the source.
- Do not create a flashcard from an equation whose meaning is uncertain.
- Never combine two separate statements into a new mathematical statement.

==================================================
MATHEMATICS / EQUATIONS
==================================================

Mathematical accuracy is extremely important.

When mathematics appears in the source:

1. Preserve the exact mathematical meaning.
2. Preserve variable names exactly.
3. Preserve signs exactly.
4. Preserve exponents exactly.
5. Preserve fractions exactly.
6. Preserve equality and inequality symbols exactly.
7. Preserve conditions exactly.
8. Never invent a missing variable.
9. Never change an equation because another equation seems more familiar.
10. Never combine separate equations unless the source explicitly combines them.

Use LaTeX.

Examples:

Inline:
$x^2$

Fraction:
$\\frac{x^2}{a^2}$

Square root:
$\\sqrt{x}$

Exponent:
$x^n$

Equation:
$$x^2 + y^2 = 1$$

Inequality:
$$K \\le C$$

IMPORTANT:

Do not produce mathematically suspicious constructions such as:

$$A x^2 + B y^2 + C z^2 = -J = 1$$

unless the source explicitly and clearly contains that exact chain of equalities.

If the source contains OCR corruption, do not guess what the intended equation was.

==================================================
HANDWRITTEN / OCR CONTENT
==================================================

The source may contain text extracted from handwritten notes or screenshots.

Treat extracted handwritten text carefully.

Common OCR errors may include:

- O vs 0
- l vs 1
- S vs 5
- x vs ×
- k vs K
- c vs C
- minus vs dash
- superscripts becoming normal text
- fractions becoming a/b
- subscripts being lost

Do not automatically correct these using outside knowledge.

Only use a correction when the surrounding source material makes it unambiguous.

If something remains uncertain, do not build a card around that uncertain detail.

==================================================
FLASHCARD QUALITY
==================================================

Create exactly ${numberOfCards} cards.

Each card must:

- contain one clear question
- contain one accurate answer
- test useful knowledge
- be directly supported by the source
- avoid unnecessary wording
- avoid duplicates
- avoid near-duplicates
- avoid trivial questions

Prefer questions about:

- definitions
- concepts
- formulas
- relationships
- conditions
- classifications
- comparisons
- causes and effects
- examples
- important observations
- mathematical interpretations

Do NOT create cards merely by turning every sentence into a question.

==================================================
ANSWER QUALITY
==================================================

Answers must directly answer the question.

Do not use vague answers when the source contains a clearer answer.

Do not add external explanations.

==================================================
DUPLICATE CHECK
==================================================

Before returning the cards:

1. Compare every question with every other question.
2. Remove duplicate concepts.
3. Make sure each card tests a distinct piece of information.
4. Make sure mathematical cards are not merely repeated versions of the same equation.

==================================================
FINAL VERIFICATION
==================================================

Before returning JSON, internally verify:

- Exactly ${numberOfCards} cards exist.
- Every card is supported by SOURCE MATERIAL.
- No outside facts were added.
- Every equation matches the source.
- Every mathematical symbol is preserved.
- No suspicious equation was invented.
- No duplicate card exists.
- Every answer actually answers its question.
- LaTeX syntax is valid.
- There is no Markdown outside the JSON.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "flashcards": [
    {
      "question": "Question text",
      "answer": "Answer text"
    }
  ]
}

Do NOT include:

- Markdown fences
- explanations
- comments
- additional fields
- text before the JSON
- text after the JSON

==================================================
SOURCE MATERIAL
==================================================

--------------------------------
${content}
--------------------------------
`;
}

export async function generateFlashcards(
  content: string,
  deckTitle: string,
  numberOfCards: number,
): Promise<GeneratedCard[]> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  if (content.trim().length < 20) {
    throw new Error("INSUFFICIENT_CONTENT");
  }

  if (
    !Number.isInteger(numberOfCards) ||
    numberOfCards < 1 ||
    numberOfCards > 50
  ) {
    throw new Error("INVALID_CARD_COUNT");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const prompt = buildPrompt(
    content,
    deckTitle,
    numberOfCards,
  );

  async function callModel(
    model: string,
  ): Promise<GeneratedCard[]> {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          maxOutputTokens: 12000,
        },
      });

      const rawText = response.text?.trim();

      if (!rawText) {
        throw new Error("EMPTY_MODEL_RESPONSE");
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(rawText);
      } catch {
        throw new Error("MALFORMED_MODEL_RESPONSE");
      }

      const validation =
        generatedCardsSchema.safeParse(parsed);

      if (!validation.success) {
        throw new Error("INVALID_MODEL_RESPONSE");
      }

      const cards = normalizeCards(
        validation.data.flashcards,
      );

      if (cards.length === 0) {
        throw new Error("NO_VALID_CARDS");
      }

      if (cards.length < numberOfCards) {
        throw new Error(
          "INSUFFICIENT_GENERATED_CARDS",
        );
      }

      return cards.slice(0, numberOfCards);
    } catch (error) {
      if (isQuotaError(error)) {
        throw error;
      }

      if (isRetryableError(error)) {
        throw new GeminiTemporaryError(
          getErrorMessage(error),
        );
      }

      throw error;
    }
  }

  try {
    return await callModel(PRIMARY_MODEL);
  } catch (primaryError) {
    if (isQuotaError(primaryError)) {
      throw primaryError;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `Primary Gemini model failed. Trying fallback model ${FALLBACK_MODEL}.`,
        getErrorMessage(primaryError),
      );
    }

    return await callModel(FALLBACK_MODEL);
  }
}