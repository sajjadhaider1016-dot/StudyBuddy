"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  ChevronRight,
  FileText,
  Layers3,
  Menu,
  Repeat2,
  Target,
  Upload,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const subjectPreviews = [
  {
    name: "Calculus",
    chapter: "Chapter 4",
    topic: "Derivatives and applications",
    cards: 36,
    pages: 28,
    question: "What does the derivative tell us about a function?",
    progress: "68%",
  },
  {
    name: "Biology",
    chapter: "Chapter 6",
    topic: "Cell structure and transport",
    cards: 42,
    pages: 31,
    question: "How does a cell membrane control what enters the cell?",
    progress: "74%",
  },
  {
    name: "World history",
    chapter: "Chapter 8",
    topic: "Trade routes and cultural exchange",
    cards: 28,
    pages: 22,
    question: "How did trade routes shape cultural exchange?",
    progress: "56%",
  },
  {
    name: "Computer science",
    chapter: "Chapter 3",
    topic: "Algorithms and complexity",
    cards: 32,
    pages: 24,
    question: "What makes one algorithm more efficient than another?",
    progress: "82%",
  },
  {
    name: "Chemistry",
    chapter: "Chapter 5",
    topic: "Chemical bonds and reactions",
    cards: 34,
    pages: 26,
    question: "How do ionic and covalent bonds differ?",
    progress: "63%",
  },
  {
    name: "Physics",
    chapter: "Chapter 7",
    topic: "Forces and motion",
    cards: 30,
    pages: 24,
    question: "How does net force affect an object's motion?",
    progress: "71%",
  },
  {
    name: "Literature",
    chapter: "Chapter 2",
    topic: "Themes and narrative voice",
    cards: 26,
    pages: 19,
    question: "How does the narrator shape the reader's view?",
    progress: "58%",
  },
  {
    name: "Geography",
    chapter: "Chapter 9",
    topic: "Climate and physical landscapes",
    cards: 31,
    pages: 23,
    question: "What factors influence a region's climate?",
    progress: "66%",
  },
  {
    name: "Economics",
    chapter: "Chapter 3",
    topic: "Supply, demand, and markets",
    cards: 29,
    pages: 21,
    question: "What happens to demand when a product's price rises?",
    progress: "62%",
  },
  {
    name: "Psychology",
    chapter: "Chapter 6",
    topic: "Memory and learning",
    cards: 35,
    pages: 27,
    question: "How does working memory differ from long-term memory?",
    progress: "77%",
  },
  {
    name: "Medicine",
    chapter: "Chapter 10",
    topic: "Human anatomy and physiology",
    cards: 44,
    pages: 33,
    question: "How does the body regulate its internal temperature?",
    progress: "69%",
  },
  {
    name: "Engineering",
    chapter: "Chapter 5",
    topic: "Materials and structural design",
    cards: 33,
    pages: 25,
    question: "How does material choice affect structural strength?",
    progress: "73%",
  },
  {
    name: "Law",
    chapter: "Chapter 4",
    topic: "Legal principles and case analysis",
    cards: 27,
    pages: 20,
    question: "What role does precedent play in a court decision?",
    progress: "61%",
  },
  {
    name: "Philosophy",
    chapter: "Chapter 2",
    topic: "Ethics and moral reasoning",
    cards: 24,
    pages: 18,
    question: "How does consequentialism assess a moral choice?",
    progress: "54%",
  },
  {
    name: "Environmental science",
    chapter: "Chapter 8",
    topic: "Ecosystems and conservation",
    cards: 38,
    pages: 29,
    question: "How does biodiversity support ecosystem stability?",
    progress: "79%",
  },
  {
    name: "Astronomy",
    chapter: "Chapter 6",
    topic: "Stars, galaxies, and the universe",
    cards: 30,
    pages: 22,
    question: "How do astronomers estimate the distance to a star?",
    progress: "64%",
  },
];

const features = [
  {
    icon: Brain,
    title: "Turn chapters into flashcards",
    text: "Create focused questions and answers from a book chapter or your own notes in minutes.",
  },
  {
    icon: FileText,
    title: "Bring your own material",
    text: "Upload a PDF or EPUB, choose the pages you need, or start with notes and documents.",
  },
  {
    icon: Repeat2,
    title: "Review at the right time",
    text: "Revisit cards at the right time with four simple self-ratings.",
  },
  {
    icon: Target,
    title: "Practise active recall",
    text: "Test yourself instead of simply reading the same material again and again.",
  },
  {
    icon: Layers3,
    title: "Stay in control",
    text: "Choose the chapter pages and card count, then edit or remove anything before studying.",
  },
  {
    icon: BookOpen,
    title: "Keep your subjects organised",
    text: "Create separate decks for courses, chapters, topics, exams, or anything else you are learning.",
  },
];

const process = [
  {
    number: "01",
    title: "Bring your material",
    text: "Upload a book or paste the notes you are already studying.",
    icon: Upload,
  },
  {
    number: "02",
    title: "Create your deck",
    text: "Choose chapter pages and turn them into a focused flashcard deck.",
    icon: Brain,
  },
  {
    number: "03",
    title: "Review the cards",
    text: "Read through the questions and answers and make any changes you need.",
    icon: Check,
  },
  {
    number: "04",
    title: "Study with purpose",
    text: "Work through your cards and use spaced repetition to strengthen recall.",
    icon: Repeat2,
  },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSubject, setActiveSubject] = useState(0);
  const preview = subjectPreviews[activeSubject];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveSubject((current) => (current + 1) % subjectPreviews.length);
    }, 5200);

    return () => window.clearInterval(interval);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <main className="marketing-page min-h-screen bg-[#f5f2eb] text-[#202a35]">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-[#202a35]/[0.08] bg-[#f5f2eb]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#202a35] text-[#eee9df] transition-transform group-hover:-rotate-3">
              <BookOpen size={20} strokeWidth={2} />
            </div>

            <div>
              <div className="text-[17px] font-bold tracking-[-0.02em] text-[#202a35]">
                StudyBuddy
              </div>

              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-[#606a72] sm:block">
                Your study companion
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-[13px] font-semibold text-[#4e5963] transition-colors hover:text-[#202a35]"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-[13px] font-semibold text-[#4e5963] transition-colors hover:text-[#202a35]"
            >
              How it works
            </a>

            <a
              href="#about"
              className="text-[13px] font-semibold text-[#4e5963] transition-colors hover:text-[#202a35]"
            >
              About
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/dashboard"
              className="px-3 py-2 text-[13px] font-semibold text-[#4e5963] transition-colors hover:text-[#202a35]"
            >
              Dashboard
            </Link>

            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-lg bg-[#202a35] px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#354552] hover:shadow-lg"
            >
              Create deck
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={
              mobileOpen ? "Close navigation" : "Open navigation"
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#202a35]/10 bg-white md:hidden"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#202a35]/10 bg-[#eee9df] md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-5 py-4">
              <a
                href="#features"
                onClick={closeMobile}
                className="border-b border-[#202a35]/5 py-3 text-sm font-semibold text-[#4e5963]"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                onClick={closeMobile}
                className="border-b border-[#202a35]/5 py-3 text-sm font-semibold text-[#4e5963]"
              >
                How it works
              </a>

              <a
                href="#about"
                onClick={closeMobile}
                className="border-b border-[#202a35]/5 py-3 text-sm font-semibold text-[#4e5963]"
              >
                About
              </a>

              <Link
                href="/dashboard"
                onClick={closeMobile}
                className="border-b border-[#202a35]/5 py-3 text-sm font-semibold text-[#4e5963]"
              >
                Dashboard
              </Link>

              <Link
                href="/create"
                onClick={closeMobile}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#202a35] px-4 py-3 text-sm font-bold text-white"
              >
                Create deck
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative isolate overflow-hidden border-b border-[#202a35]/[0.08] bg-[#f5f2eb]">
        <div className="pointer-events-none absolute -right-32 -top-44 -z-10 h-[680px] w-[680px] rounded-full bg-[radial-gradient(circle,rgba(170,133,83,0.13)_0%,rgba(239,232,218,0.12)_42%,transparent_72%)]" />
        <div className="pointer-events-none absolute -bottom-48 left-[32%] -z-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(239,232,218,0.13)_0%,transparent_70%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-16 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10 lg:px-10 lg:py-[76px]">
          <div className="max-w-[620px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#9b713e]/15 bg-white/80 px-3.5 py-2 shadow-sm shadow-[#202a35]/[0.03]">
              <BookOpen size={14} className="text-[#9b713e]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9b713e]">
                Made for focused study
              </span>
            </div>

            <h1 className="max-w-[600px] font-sans text-[42px] font-semibold leading-[1.08] tracking-[-0.04em] text-[#202a35] sm:text-[54px] lg:text-[60px]">
              Study the whole book.
              <span className="mt-1 block text-[#9b713e]">
                One chapter at a time.
              </span>
            </h1>

            <p className="mt-6 max-w-[540px] text-[16px] leading-7 text-[#4e5963] sm:text-[17px] sm:leading-[1.8]">
              Upload a PDF or EPUB, choose the pages you want to study, and turn them into editable flashcards. Notes work too.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="group inline-flex items-center justify-center gap-3 rounded-xl bg-[#202a35] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#202a35]/15 transition-all hover:-translate-y-0.5 hover:bg-[#354552] hover:shadow-xl"
              >
                Create a study deck
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#202a35]/10 bg-white/85 px-6 py-3.5 text-sm font-bold text-[#202a35] transition-all hover:border-[#9b713e]/30 hover:bg-white"
              >
                See how it works
                <ChevronRight size={16} />
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 text-[11px] font-semibold text-[#747b7f]">
              {["PDF & EPUB books", "Choose chapter pages", "Up to 200 cards"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#ede5d8] text-[#9b713e]"><Check size={10} strokeWidth={3} /></span>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* PRODUCT PREVIEW */}
          <div className="relative lg:pl-3">
            <div className="relative mx-auto max-w-[570px]">
              <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-[#202a35]/10 bg-white px-3.5 py-2.5 shadow-sm shadow-[#202a35]/[0.03]">
                <div className="min-w-0">
                  <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#747b7f]">
                    Subject preview
                  </p>
                  <p
                    key={preview.name}
                    className="subject-swap truncate text-sm font-semibold text-[#202a35]"
                  >
                    {preview.name}
                  </p>
                </div>
                <label className="sr-only" htmlFor="subject-preview">
                  Choose a subject for the preview
                </label>
                <select
                  id="subject-preview"
                  value={activeSubject}
                  onChange={(event) => setActiveSubject(Number(event.target.value))}
                  className="max-w-[155px] rounded-lg border border-[#202a35]/10 bg-[#f5f2eb] px-2.5 py-2 text-xs font-semibold text-[#4e5963] outline-none focus:border-[#9b713e] focus:ring-2 focus:ring-[#9b713e]/15"
                >
                  {subjectPreviews.map((subject, index) => (
                    <option key={subject.name} value={index}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="overflow-hidden rounded-[26px] border border-white/80 bg-white shadow-[0_34px_90px_rgba(30,57,86,0.16)] ring-1 ring-[#202a35]/[0.06]">
                <div className="flex h-14 items-center justify-between border-b border-[#202a35]/[0.08] bg-white/90 px-5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#202a35] text-white shadow-sm">
                      <BookOpen size={16} />
                    </div>

                    <div>
                      <span className="block text-xs font-bold text-[#202a35]">StudyBuddy</span>
                      <span className="mt-0.5 block text-[8px] font-semibold uppercase tracking-[0.14em] text-[#8a8e8e]">Your study space</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="rounded-full border border-[#202a35]/[0.08] bg-[#f5f2eb] px-2.5 py-1 text-[8px] font-semibold text-[#747b7f]">TODAY</span>
                  </div>
                </div>

                <div className="grid grid-cols-[88px_1fr] sm:grid-cols-[104px_1fr]">
                  <aside className="border-r border-[#202a35]/[0.07] bg-[#f7f8fa] p-3 sm:p-4">
                    <div className="mb-6 h-2 w-14 rounded-full bg-[#202a35]/10" />

                    <div className="space-y-2">
                      <div className="rounded-lg bg-[#202a35] px-2.5 py-2 text-[8px] font-bold text-white shadow-sm">
                        Overview
                      </div>

                      <div className="px-2 py-2 text-[8px] font-semibold text-[#747b7f]">
                        My decks
                      </div>

                      <div className="px-2 py-2 text-[8px] font-semibold text-[#747b7f]">
                        Review
                      </div>

                      <div className="px-2 py-2 text-[8px] font-semibold text-[#747b7f]">
                        Progress
                      </div>
                    </div>
                  </aside>

                  <div className="bg-white p-4 sm:p-6">
                    <div className="mb-5">
                      <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#8a8e8e]">
                        Today&apos;s study
                      </p>

                      <p className="mt-1 text-lg font-bold tracking-tight text-[#202a35]">
                        Your next review.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-[#202a35]/[0.08] bg-[#f5f2eb] p-4 sm:p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#9b713e]">
                            Book deck
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#202a35]">
                            {preview.name} · {preview.chapter}
                          </p>

                          <p className="mt-1 text-[9px] text-[#747b7f]">
                            {preview.topic}
                          </p>
                        </div>

                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ede5d8] text-[#9b713e]">
                          <Brain size={14} />
                        </div>
                      </div>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-[#202a35]">
                            {preview.cards}
                          </p>

                          <p className="text-[9px] text-[#747b7f]">
                            cards from {preview.pages} pages
                          </p>
                        </div>

                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#dbe2e9]">
                          <div
                            className="h-full rounded-full bg-[#9b713e]"
                            style={{ width: preview.progress }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-2xl border border-white/10 bg-[#202a35] p-5 text-white shadow-[0_14px_30px_rgba(20,36,59,0.18)] sm:p-6">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#e7dcc9]">
                          Flashcard
                        </span>

                        <span className="text-[8px] text-[#e7dcc9]">
                          08 / 24
                        </span>
                      </div>

                      <p className="mt-8 text-[9px] font-semibold uppercase tracking-wider text-[#e7dcc9]">
                        Question
                      </p>

                      <p className="mt-2 min-h-10 text-sm font-semibold leading-5">
                        {preview.question}
                      </p>

                      <div className="mt-7 flex gap-2">
                        <div className="flex-1 rounded-md border border-white/15 px-2 py-2 text-center text-[8px] font-semibold text-[#c6d3df]">
                          Again
                        </div>

                        <div className="flex-1 rounded-md border border-white/15 px-2 py-2 text-center text-[8px] font-semibold text-[#c6d3df]">
                          Hard
                        </div>

                        <div className="flex-1 rounded-md bg-[#9b713e] px-2 py-2 text-center text-[8px] font-semibold text-white">
                          Easy
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

                <div className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-white bg-white/95 px-4 py-3 shadow-[0_15px_35px_rgba(20,36,59,0.15)] backdrop-blur sm:block">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ede5d8] text-[#9b713e]">
                    <Repeat2 size={16} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[#202a35]">
                      Chapter ready
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#747b7f]">
                      Pick pages. Build your deck.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME / POSITIONING */}
      <section className="border-b border-[#202a35]/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b713e]">
              A BETTER WAY TO REVISE
            </p>

            <h2 className="mt-3 max-w-md font-sans text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#202a35] sm:text-4xl">
              Study less passively. Recall more actively.
            </h2>
          </div>

          <div className="max-w-2xl">
            <p className="text-[15px] leading-7 text-[#4e5963] sm:text-base">
              Good revision is not only about reading your notes repeatedly.
              It is about asking yourself questions, retrieving information,
              identifying what you have forgotten, and returning to it at the
              right time.
            </p>

            <p className="mt-4 text-[15px] leading-7 text-[#4e5963] sm:text-base">
              StudyBuddy gives students one place to turn their existing
              material into that kind of revision workflow.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 bg-[#eee9df]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b713e]">
              WHAT YOU CAN DO
            </p>

            <h2 className="mt-3 font-sans text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#202a35] sm:text-4xl">
              Everything you need for a more organised revision routine.
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-[#4e5963]">
              StudyBuddy is designed around the actual work students need to
              do: create material, practise it, review it, and keep track of
              what still needs attention.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-[#202a35]/10 bg-[#202a35]/10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group bg-white p-7 transition-colors hover:bg-[#fbfaf7]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#ede5d8] text-[#9b713e] transition-transform group-hover:-translate-y-1">
                    <Icon size={18} />
                  </div>

                  <h3 className="mt-6 text-[15px] font-bold text-[#202a35]">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-[#606a72]">
                    {feature.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="scroll-mt-24 border-y border-[#202a35]/10 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b713e]">
                HOW IT WORKS
              </p>

              <h2 className="mt-3 font-sans text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#202a35] sm:text-4xl">
                A simple workflow from notes to revision.
              </h2>

              <p className="mt-5 text-[15px] leading-7 text-[#4e5963]">
                No complicated setup. Start with the material you already have
                and build your revision deck from there.
              </p>

              <Link
                href="/create"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#202a35] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#354552]"
              >
                Create a deck
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="divide-y divide-[#202a35]/10 border-y border-[#202a35]/10">
              {process.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.number}
                    className="group grid gap-5 py-7 sm:grid-cols-[70px_1fr_auto] sm:items-center"
                  >
                    <span className="font-sans text-2xl font-medium text-[#7f8b91]">
                      {item.number}
                    </span>

                    <div>
                      <h3 className="text-base font-bold text-[#202a35]">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 max-w-lg text-[13px] leading-6 text-[#606a72]">
                        {item.text}
                      </p>
                    </div>

                    <div className="hidden h-9 w-9 items-center justify-center rounded-md border border-[#202a35]/10 text-[#9b713e] transition-colors group-hover:border-[#9b713e]/30 sm:flex">
                      <Icon size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="scroll-mt-24 bg-[#202a35] text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#e2d2b8]">
                ABOUT STUDYBUDDY
              </p>

              <h2 className="mt-4 max-w-xl font-sans text-3xl font-semibold leading-tight tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                Built around the way students actually revise.
              </h2>
            </div>

            <div className="max-w-xl">
              <p className="text-[15px] leading-7 text-[#cfc8bb]">
                StudyBuddy is a study tool for students who want a more
                structured way to turn their course material into revision
                practice.
              </p>

              <p className="mt-5 text-[15px] leading-7 text-[#cfc8bb]">
                Instead of separating notes, flashcards, and revision into
                different tools, StudyBuddy brings these steps together. You
                provide the material, review the generated cards, and then
                practise them in a dedicated study experience.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold text-white">
                    Your material
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#c6bdaf]">
                    Start with the notes and resources you already use.
                  </p>
                </div>

                <div className="border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold text-white">
                    Your control
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#c6bdaf]">
                    Review and edit cards before they become part of your deck.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#eee9df]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="border-y border-[#202a35]/15 py-12 text-center sm:py-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#9b713e]">
              START YOUR NEXT REVISION SESSION
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl font-sans text-3xl font-semibold leading-tight tracking-[-0.025em] text-[#202a35] sm:text-4xl lg:text-5xl">
              Your next chapter is already there.
              <br />
              <span className="text-[#9b713e]">
                Make it stick.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-[14px] leading-6 text-[#606a72]">
              Choose a chapter or page range, make a focused deck, and start learning through active recall.
            </p>

            <Link
              href="/create"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#202a35] px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#354552] hover:shadow-xl"
            >
              Create your first deck
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#202a35]/10 bg-[#eee9df]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#202a35] text-white">
              <BookOpen size={15} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#202a35]">
                StudyBuddy
              </p>

              <p className="text-[9px] uppercase tracking-[0.14em] text-[#747b7f]">
                Your study companion
              </p>
            </div>
          </Link>

          <p className="text-xs text-[#747b7f]">
            Study smarter. Prepare with purpose.
          </p>
        </div>
      </footer>
    </main>
  );
}
