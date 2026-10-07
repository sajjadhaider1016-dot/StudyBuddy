"use client";

import Link from "next/link";
import {
  ArrowRight,
  Play,
} from "lucide-react";

export function LandingActions() {
  return (
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Link
        href="/create"
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#202a35] px-5 py-3 font-semibold text-white shadow-lg shadow-[#202a35]/10 transition hover:bg-[#354552]"
      >
        Create Flashcards
        <ArrowRight size={17} />
      </Link>

      <Link
        href="/dashboard"
        className="inline-flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold transition hover:bg-black/5 dark:hover:bg-white/5"
        style={{
          borderColor: "var(--line)",
        }}
      >
        <Play size={17} />
        Start Studying
      </Link>
    </div>
  );
}