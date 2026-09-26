# StudyBuddy

**AI-Powered Smart Flashcards with Spaced Repetition**

StudyBuddy is a production-oriented Next.js application for turning user-provided notes into source-grounded flashcards with Gemini, reviewing them one at a time, and scheduling future reviews with a basic SM-2-style algorithm.

## Features

- Paste notes or upload `.txt` / `.md` study material.
- Server-side Gemini flashcard generation with structured JSON output.
- Review/edit/delete generated cards before saving.
- One-card-at-a-time study mode with answer reveal.
- Four self-ratings: Again, Hard, Good, Easy.
- Basic SM-2-style scheduling with repetition, interval, ease factor and due date.
- Local persistence of decks, review metadata and study sessions.
- Dashboard analytics based on real stored data.
- Due-card study mode and empty states.
- Search/sort-by-recent deck list.
- Light, dark and system themes.
- Responsive, keyboard-friendly UI with reduced-motion support.
- Vercel-ready server API route.

## AI Architecture

The browser sends only the study content, deck title and requested card count to `POST /api/generate-flashcards`. The route validates the request, creates a server-side Gemini client using `GEMINI_API_KEY`, asks Gemini for JSON-only flashcards, validates the model response with Zod, removes obvious duplicate questions, and returns only validated cards.

The API key never enters client-side JavaScript.

## Spaced Repetition

`lib/spaced-repetition.ts` contains the scheduling logic. It maintains the SM-2-style fields `repetition`, `interval`, `easeFactor`, and `dueDate`.

- **Again:** resets repetition progress, shortens the interval and lowers ease.
- **Hard:** increases the interval conservatively and slightly lowers ease.
- **Good:** follows the normal progression: first review 1 day, second 6 days, then interval × ease.
- **Easy:** advances more aggressively and raises ease within a bounded range.

This is intentionally a basic SM-2-style implementation rather than an exact Anki clone.

## Technology Stack

- Next.js 16.3.x
- React 19
- TypeScript
- Tailwind CSS 4
- Google `@google/genai` SDK
- Zod
- LocalStorage
- Vercel-compatible Route Handler

## Project Architecture

The project separates server AI integration, validation, storage, scheduling, domain types, reusable UI, dashboard views and study interactions.

## Folder Structure

```text
app/
  api/generate-flashcards/route.ts
  create/page.tsx
  dashboard/page.tsx
  study/[deckId]/page.tsx
  globals.css
  layout.tsx
  page.tsx
components/
  flashcards/card-preview.tsx
  study/study-card.tsx
  ui/app-shell.tsx
  ui/landing-actions.tsx
lib/
  flashcards.ts
  gemini.ts
  spaced-repetition.ts
  storage.ts
  validation.ts
types/index.ts
.env.example
.gitignore
package.json
```

## Environment Variables

Create `.env.local`:

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-3.8-flash
```

Never commit `.env.local`. The repository includes `.env.example` with empty values.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open `http://localhost:3000`.

## Production Build

```bash
npm run build
```

## Start

```bash
npm start
```

## Vercel Deployment

1. Push the repository to GitHub as `ProStackHub_StudyBuddy`.
2. Import the repository into Vercel.
3. Add `GEMINI_API_KEY` in the Vercel project Environment Variables.
4. Optionally add `GEMINI_MODEL` to override the default model.
5. Deploy.
6. Open the production URL and create a small test deck to verify Gemini generation, saving and review scheduling.

## Data Storage

Decks, flashcards, scheduling metadata and study sessions are stored locally in the browser under the versioned `studybuddy:v1` key. No application database is required. If browser storage is unavailable or corrupted, the app safely falls back to an empty local state rather than exposing raw storage errors.

## Security

The Gemini SDK is imported only by the server-side module used by the API route. The client never receives `GEMINI_API_KEY`. Input is validated server-side, model output is validated before use, and user notes are rendered as text rather than injected HTML.

## Future Improvements

- IndexedDB storage for very large libraries.
- Optional encrypted cloud sync.
- PDF extraction as a separate, carefully scoped feature.
- Import/export of decks.
- More advanced scheduling algorithms.
- Offline-first PWA support.
- Study reminders and richer analytics.

## Internship Requirement Audit

The application covers the required StudyBuddy workflow: notes upload/paste → Gemini Q&A generation → card review → self-rating → SM-2-style scheduling → local persistence. It is structured for local development, GitHub publication and Vercel deployment.
