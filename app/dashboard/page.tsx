"use client";

import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  Clock3,
  Download,
  Layers3,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  deleteDeck,
  exportData,
  getDecks,
  getSessions,
  importData,
} from "@/lib/storage";
import { isDue } from "@/lib/spaced-repetition";
import type { Deck } from "@/types";

export default function Dashboard() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [query, setQuery] = useState("");
  const [backupMessage, setBackupMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDecks(getDecks());
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, []);

  const sessions = getSessions();

  const today = new Date().toDateString();

  const cards = decks.flatMap(
    (deck) => deck.flashcards,
  );

  const due = cards.filter((card) =>
    isDue(card),
  ).length;

  const studied = cards.filter(
    (card) =>
      Boolean(card.updatedAt) &&
      new Date(card.updatedAt).toDateString() ===
        today &&
      card.reviewCount > 0,
  ).length;

  const todaySessions = sessions.filter(
    (session) =>
      new Date(session.startedAt).toDateString() ===
      today,
  );

  const streak = computeStreak(sessions);

  const normalizedQuery =
    query.trim().toLowerCase();

  const filtered = decks
    .filter((deck) =>
      deck.title
        .toLowerCase()
        .includes(normalizedQuery),
    )
    .sort((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );

  function remove(id: string) {
    if (
      !confirm(
        "Delete this deck and its study history? This cannot be undone.",
      )
    ) {
      return;
    }

    deleteDeck(id);

    // Refresh the dashboard after the deletion.
    setDecks(getDecks());
  }

  function downloadBackup() {
    const backup = new Blob([JSON.stringify(exportData(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(backup);
    const link = document.createElement("a");
    link.href = url;
    link.download = `studybuddy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setBackupMessage("Backup downloaded.");
  }

  async function restoreBackup(file?: File) {
    if (!file) return;
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!confirm("Restore this backup? It will replace the decks and study history saved in this browser.")) return;
      importData(parsed);
      setDecks(getDecks());
      setBackupMessage("Backup restored.");
    } catch (error) {
      setBackupMessage(error instanceof Error ? error.message : "Could not read this backup file.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-[#865a3a]">
            YOUR STUDY SPACE
          </p>

          <h1 className="mt-1 text-3xl font-bold">
            Dashboard
          </h1>

          <p className="mt-2 muted">
            A live view of your decks and review workload.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={downloadBackup} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 font-semibold" style={{ borderColor: "var(--line)" }}>
            <Download size={16} /> Backup
          </button>
          <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 font-semibold" style={{ borderColor: "var(--line)" }}>
            <Upload size={16} /> Restore
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" className="sr-only" onChange={(event) => void restoreBackup(event.target.files?.[0])} />
          <Link
            href="/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#17242c] px-4 py-2.5 font-semibold text-white"
          >
            <Plus size={17} />
            Create deck
          </Link>
        </div>
      </div>

      {backupMessage && <p role="status" className="mb-4 text-sm muted">{backupMessage}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Total cards"
          value={cards.length}
        />

        <Stat
          label="Due today"
          value={due}
        />

        <Stat
          label="Studied today"
          value={studied}
        />

        <Stat
          label="Study streak"
          value={`${streak} day${streak === 1 ? "" : "s"}`}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <h2 className="text-xl font-bold">
              Your decks
            </h2>

            <label className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 muted"
              />

              <input
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search decks"
                className="w-full rounded-xl border bg-transparent py-2.5 pl-9 pr-3 text-sm sm:w-64"
                style={{
                  borderColor: "var(--line)",
                }}
                aria-label="Search decks"
              />
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="card p-10 text-center">
              <Layers3 className="mx-auto mb-3 muted" />

              <h3 className="font-semibold">
                {decks.length
                  ? "No matching decks"
                  : "No decks yet"}
              </h3>

              <p className="mt-1 text-sm muted">
                {decks.length
                  ? "Try another search."
                  : "Create your first AI-powered study deck."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((deck) => (
                <div
                  className="card flex items-center justify-between gap-3 p-4"
                  key={deck.id}
                >
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold">
                      {deck.title}
                    </h3>

                    <p className="mt-1 text-sm muted">
                      {deck.flashcards.length} cards ·{" "}
                      {
                        deck.flashcards.filter(
                          (card) => isDue(card),
                        ).length
                      }{" "}
                      due
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      href={`/dashboard/deck/${deck.id}`}
                      className="rounded-lg p-2 text-slate-600 hover:bg-black/5 dark:hover:bg-white/5"
                      aria-label={`Edit ${deck.title}`}
                    >
                      <Pencil size={16} />
                    </Link>

                    <Link
                      href={`/study/${deck.id}`}
                      className="rounded-lg p-2 text-[#865a3a] hover:bg-[#f4f1eb] dark:hover:bg-[#865a3a]/10"
                      aria-label={`Study ${deck.title}`}
                    >
                      <ChevronRight size={18} />
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        remove(deck.id)
                      }
                      className="rounded-lg p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      aria-label={`Delete ${deck.title}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="card p-5">
          <h2 className="font-semibold">
            Today
          </h2>

          <div className="mt-5 space-y-4">
            <Mini
              icon={<CalendarClock size={17} />}
              label="Cards due"
              value={due.toString()}
            />

            <Mini
              icon={<Clock3 size={17} />}
              label="Sessions"
              value={todaySessions.length.toString()}
            />

            <Mini
              icon={<Layers3 size={17} />}
              label="Total decks"
              value={decks.length.toString()}
            />
          </div>

          {due > 0 && (
            <Link
              href="/study/today"
              className="mt-6 block rounded-xl bg-[#17242c] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Study today
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm muted">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Mini({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-[#865a3a]">
          {icon}
        </span>

        {label}
      </div>

      <b>{value}</b>
    </div>
  );
}

function computeStreak(
  sessions: {
    startedAt: string;
    completedAt?: string;
  }[],
) {
  const days = new Set(
    sessions
      .filter((session) => session.completedAt)
      .map((session) =>
        new Date(
          session.startedAt,
        ).toDateString(),
      ),
  );

  const date = new Date();
  let count = 0;

  while (
    days.has(date.toDateString())
  ) {
    count += 1;
    date.setDate(
      date.getDate() - 1,
    );
  }

  return count;
}
