import { GoogleGenAI } from "@google/genai";
import {
  generatedCardsSchema,
  normalizeCards,
} from "./validation";
import type { GeneratedCard } from "@/types";

const PRIMARY_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const FALLBACK_MODEL =
  process.env.GEMINI_FALLBACK_MODEL ||
  "gemini-3.8-flash";

const MAX_CARDS_PER_REQUEST = 40;

const FLASHCARD_RESPONSE_SCHEMA = {
  type: "object",
  properties: {
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
        propertyOrdering: ["question", "answer"],
        additionalProperties: false,
      },
    },
  },
  required: ["flashcards"],
  propertyOrdering: ["flashcards"],
  additionalProperties: false,
};


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
  previousQuestions: string[] = [],
): string {
  return `
You are StudyBuddy's expert educational flashcard generator.

Analyze the selected book/chapter material and create exactly ${numberOfCards} useful flashcards from its actual educational content. The flashcards themselves are the student's notes: each card must contain a well-chosen question and its correct, study-ready answer. Do not return a book description, author summary, or separate notes section.

DECK TITLE:
"${deckTitle}"

==================================================
SOURCE FIDELITY — HIGHEST PRIORITY
==================================================

The supplied material is the authority for facts, definitions, methods, equations, values, and conditions. Do NOT use outside knowledge to repair, complete, reinterpret, or improve the source.

For a clearly stated exercise in the supplied material, you MAY apply ordinary mathematical reasoning to solve it. Use the exercise's given data and the methods/formulas in the material where available. Do not invent missing data or silently change the problem.

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

Use valid KaTeX-compatible LaTeX whenever a question or answer contains a mathematical expression. Put every inline expression inside single dollar delimiters, for example $\\bar{x}$ or $x_{1}$, and put standalone equations on their own line inside double-dollar delimiters. Use proper commands such as \\frac{a}{b}, \\sqrt{x}, \\sum_{i=1}^{n} x_i, and \\bar{x}. Do not output bare LaTeX commands or plain-text approximations like x_1 when they are meant to be mathematical notation. Do not use parenthesis or bracket delimiters for math.

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

For every selected solvable textbook exercise or worked example, create a card that preserves the complete problem and provides a worked solution, not just the final answer. Show the formula/rule, substitutions, each meaningful calculation step, units where applicable, and a clearly marked final answer. For proofs, give the logical steps. Do not replace a solvable exercise with a definition-only card when the requested card count allows exercise coverage. If a problem is ambiguous or missing data, explain exactly what is missing instead of guessing.

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

When the chosen pages contain worked examples or end-of-chapter exercises, include useful problems as cards when they fit the requested deck. Do not generate a card for every exercise if that would create duplicates; prioritize distinct methods and representative problems.

First identify the material's important facts, concepts, processes, comparisons, causes, examples, formulas, worked examples, and exercises. Choose the best question form for each idea; do not make every question a short definition lookup. Create a balanced mix of direct recall, explain/why/how, compare, and application questions. If the source contains enough solvable math exercises, devote about one third of the requested cards to representative exercise problems with worked solutions. Use one-word answers only when the question explicitly asks for a name, term, value, or other one-word fact. Definitions and conceptual questions must include a complete explanation and, when useful, a source-based example.

${previousQuestions.length ? `QUESTIONS ALREADY GENERATED FOR THIS DECK (do not repeat or paraphrase):\n${previousQuestions.map((question) => `- ${question}`).join("\n")}` : ""}

==================================================
ANSWER QUALITY
==================================================

Answers must directly answer the question.

Do not use vague answers when the source contains a clearer answer.

Analyze what each question is asking, then match the answer to it:
- A direct fact or explicit one-word/name/value question gets a short, complete answer.
- A definition or concept question gets enough explanation to understand the idea, not just its label.
- A "why", "how", compare, process, or multi-part question gets a fuller answer with the key reasoning and points, using steps or bullets where useful.
- A textbook math problem gets the complete problem in the question and a worked answer with formula/rule, substitution, intermediate steps, units where applicable, and a clearly marked final answer. Never give only the number/result.
- Do not pad a simple answer, but never shorten an explanation or solution so much that the student cannot learn or reproduce it.

Do not add unsupported factual claims or unrelated explanations.

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
- Short recall answers are concise, while explanation and math exercise answers contain the needed detail.
- Solvable textbook exercise cards include a faithful problem statement and a checked, step-by-step solution.
- LaTeX syntax is valid.
- There is no Markdown outside the JSON.

==================================================
OUTPUT FORMAT
==================================================

Return ONLY valid JSON.

When putting LaTeX in JSON strings, escape each LaTeX backslash for JSON. For example, emit "\\\\frac{a}{b}" in the JSON source so the parsed card text contains "\\frac{a}{b}". Never let commands such as \\frac, \\text, \\big, or \\neq become JSON escape sequences.

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

function escapeLatexCommandsInJson(rawJson: string): string {
  const latexCommands = [
    "frac", "sqrt", "sum", "prod", "int", "infty", "neq", "leq", "geq",
    "times", "cdot", "pm", "sigma", "mu", "gamma", "beta", "alpha",
    "theta", "bar", "hat", "text", "mathrm", "mathbf", "left", "right",
    "big", "Big", "bigg", "Bigg", "begin", "end", "log", "ln", "exp",
    "partial", "Delta", "approx", "propto", "rightarrow", "leftarrow",
  ].join("|");

  return rawJson.replace(
    new RegExp(`(^|[^\\\\])\\\\(${latexCommands})(?=[{\\s_^\\\\])`, "g"),
    (_match, prefix: string, command: string) => prefix + String.fromCharCode(92, 92) + command,
  );
}

export async function generateFlashcards(
  content: string,
  deckTitle: string,
  numberOfCards: number,
  excludedQuestions: string[] = [],
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
    numberOfCards > MAX_CARDS_PER_REQUEST
  ) {
    throw new Error("INVALID_CARD_COUNT");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  async function callModel(
    model: string,
    source: string,
    requestedCards: number,
    previousQuestions: string[],
  ): Promise<GeneratedCard[]> {
    try {
      const prompt = buildPrompt(source, deckTitle, requestedCards, previousQuestions);
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature: 0.1,
          responseMimeType: "application/json",
          responseJsonSchema: FLASHCARD_RESPONSE_SCHEMA,
          maxOutputTokens: 18000,
        },
      });

      const rawText = response.text?.trim();

      if (!rawText) {
        throw new Error("EMPTY_MODEL_RESPONSE");
      }

      let parsed: unknown;

      try {
        parsed = JSON.parse(escapeLatexCommandsInJson(rawText));
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

      if (cards.length < requestedCards) {
        throw new Error(
          "INSUFFICIENT_GENERATED_CARDS",
        );
      }

      return cards.slice(0, requestedCards);
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

  async function callModelWithRetry(
    model: string,
    source: string,
    requestedCards: number,
    previousQuestions: string[],
  ): Promise<GeneratedCard[]> {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      try {
        return await callModel(model, source, requestedCards, previousQuestions);
      } catch (error) {
        const malformed = error instanceof Error && [
          "MALFORMED_MODEL_RESPONSE",
          "INVALID_MODEL_RESPONSE",
          "EMPTY_MODEL_RESPONSE",
        ].includes(error.message);
        const temporary = error instanceof GeminiTemporaryError;
        const shortWindowQuota = isShortWindowQuotaError(error);
        if (isDailyQuotaError(error) || (!shortWindowQuota && (attempt > 0 || (!malformed && !temporary) || isQuotaError(error)))) throw error;
        if (attempt > 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, shortWindowQuota ? getRetryDelayMs(error) : 800));
      }
    }
    throw new GeminiTemporaryError("Gemini did not return a usable response.");
  }

  const allCards: GeneratedCard[] = [];
  const previousQuestions = [...excludedQuestions];
  try {
    allCards.push(...await callModelWithRetry(PRIMARY_MODEL, content, numberOfCards, previousQuestions));
  } catch (primaryError) {
    if (isQuotaError(primaryError)) throw primaryError;
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Primary Gemini model failed${isQuotaError(primaryError) ? " or its free quota is exhausted" : ""}. Trying fallback model ${FALLBACK_MODEL}.`, getErrorMessage(primaryError));
    }
    allCards.push(...await callModelWithRetry(FALLBACK_MODEL, content, numberOfCards, previousQuestions));
  }

  const uniqueCards = normalizeCards(allCards);
  if (uniqueCards.length < numberOfCards) throw new Error("INSUFFICIENT_GENERATED_CARDS");
  return uniqueCards.slice(0, numberOfCards);
}

function isDailyQuotaError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("generate_content_free_tier_requests") ||
    message.includes("generaterequestsperday") || message.includes("daily quota");
}

function isShortWindowQuotaError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("free_tier_input_token_count") ||
    message.includes("perminute") || message.includes("per minute") ||
    message.includes("rate_limit_exceeded");
}

function getRetryDelayMs(error: unknown): number {
  const message = getErrorMessage(error);
  const seconds = message.match(/retry in\s+([\d.]+)s/i)?.[1] ??
    message.match(/"retryDelay"\s*:\s*"([\d.]+)s"/i)?.[1];
  if (!seconds) return 20_000;
  return Math.min(60_000, Math.max(2_000, (Number(seconds) + 1) * 1_000));
}
