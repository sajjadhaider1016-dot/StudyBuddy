import {
  generateFlashcards,
  GeminiTemporaryError,
} from "@/lib/gemini";
import {
  generationRequestSchema,
} from "@/lib/validation";

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

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const validation =
      generationRequestSchema.safeParse(body);

    if (!validation.success) {
      return Response.json(
        {
          error:
            "Invalid request. Please provide a deck title, study material, and a valid card count.",
        },
        {
          status: 400,
        },
      );
    }

    const {
      content,
      deckTitle,
      numberOfCards,
      previousQuestions,
    } = validation.data;

    const flashcards = await generateFlashcards(
      content,
      deckTitle,
      numberOfCards,
      previousQuestions,
    );

    return Response.json(
      {
        flashcards,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    const message = getErrorMessage(error);
    const lower = message.toLowerCase();

    if (process.env.NODE_ENV !== "production") {
      console.error(
        "StudyBuddy flashcard generation error:",
        error,
      );
    }

    if (message === "MISSING_API_KEY") {
      return Response.json(
        {
          error:
            "Gemini API is not configured. Please check your GEMINI_API_KEY.",
          retryable: false,
        },
        {
          status: 503,
        },
      );
    }

    if (message === "INSUFFICIENT_CONTENT") {
      return Response.json(
        {
          error:
            "Please provide more study material. At least 20 characters are required.",
          retryable: false,
        },
        {
          status: 400,
        },
      );
    }

    if (message === "INVALID_CARD_COUNT") {
      return Response.json(
        {
          error:
            "A generation request can contain between 1 and 40 cards.",
          retryable: false,
        },
        {
          status: 400,
        },
      );
    }

    if (
      message === "NO_VALID_CARDS" ||
      message === "INSUFFICIENT_GENERATED_CARDS"
    ) {
      return Response.json(
        {
          error:
            "The AI could not create enough valid flashcards from this material. Try adding more detailed notes.",
          retryable: true,
        },
        {
          status: 502,
        },
      );
    }

    if (
      message === "MALFORMED_MODEL_RESPONSE" ||
      message === "INVALID_MODEL_RESPONSE" ||
      message === "EMPTY_MODEL_RESPONSE"
    ) {
      return Response.json(
        {
          error:
            "Gemini returned an invalid flashcard response. Please try again.",
          retryable: true,
        },
        {
          status: 502,
        },
      );
    }

    if (
      lower.includes("generate_content_free_tier_requests") ||
      lower.includes("generaterequestsperday") ||
      lower.includes("daily quota")
    ) {
      return Response.json(
        {
          error: "Aaj ki Gemini free limit khatam ho gayi. Google ke mutabiq project quota reset hone tak intezar karein. Nayi API key se isi project ki limit reset nahi hoti.",
          retryable: false,
        },
        {
          status: 429,
        },
      );
    }

    if (lower.includes("429") || lower.includes("quota") || lower.includes("resource_exhausted")) {
      return Response.json(
        { error: "Gemini ki short-term rate limit lagi hai. App ne automatically wait karke retry kiya; thori dair baad dobara try karein.", retryable: true },
        { status: 429 },
      );
    }

    if (
      lower.includes("api key") ||
      lower.includes("unauthenticated") ||
      lower.includes("permission denied")
    ) {
      return Response.json(
        {
          error:
            "Gemini rejected the API request. Please verify your Gemini API key and model configuration.",
          retryable: false,
        },
        {
          status: 503,
        },
      );
    }

    if (
      error instanceof GeminiTemporaryError ||
      lower.includes("fetch failed") ||
      lower.includes("econnreset") ||
      lower.includes("econnrefused") ||
      lower.includes("etimedout") ||
      lower.includes("timeout") ||
      lower.includes("temporarily unavailable") ||
      lower.includes("503") ||
      lower.includes("502") ||
      lower.includes("504")
    ) {
      return Response.json(
        {
          error:
            "Gemini is temporarily unavailable. Please wait a few seconds and try again.",
          retryable: true,
        },
        {
          status: 503,
        },
      );
    }

    return Response.json(
      {
        error:
          "We couldn't generate flashcards right now. Please try again.",
        retryable: true,
      },
      {
        status: 500,
      },
    );
  }
}
