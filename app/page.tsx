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
import { useState } from "react";

const features = [
  {
    icon: Brain,
    title: "Build better flashcards",
    text: "Convert your study material into focused questions and answers instead of spending hours creating cards manually.",
  },
  {
    icon: FileText,
    title: "Bring your own material",
    text: "Start with lecture notes, PDFs, Word documents, text files, Markdown, or study images.",
  },
  {
    icon: Repeat2,
    title: "Review at the right time",
    text: "Use spaced repetition to revisit cards according to how well you remember them.",
  },
  {
    icon: Target,
    title: "Practise active recall",
    text: "Test yourself instead of simply reading the same material again and again.",
  },
  {
    icon: Layers3,
    title: "Stay in control",
    text: "Review every generated card, edit the wording, remove cards, or add your own before studying.",
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
    text: "Paste your notes or upload the material you are already studying.",
    icon: Upload,
  },
  {
    number: "02",
    title: "Create your deck",
    text: "StudyBuddy turns the material into structured flashcards for revision.",
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

  const closeMobile = () => setMobileOpen(false);

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#132238]">
      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-[#132238]/10 bg-[#f7f5f0]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#132238] text-[#f7f5f0] transition-transform group-hover:-rotate-3">
              <BookOpen size={20} strokeWidth={2} />
            </div>

            <div>
              <div className="text-[17px] font-bold tracking-[-0.02em] text-[#132238]">
                StudyBuddy
              </div>

              <div className="hidden text-[9px] font-semibold uppercase tracking-[0.18em] text-[#64748b] sm:block">
                Your study companion
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#features"
              className="text-[13px] font-semibold text-[#526174] transition-colors hover:text-[#132238]"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-[13px] font-semibold text-[#526174] transition-colors hover:text-[#132238]"
            >
              How it works
            </a>

            <a
              href="#about"
              className="text-[13px] font-semibold text-[#526174] transition-colors hover:text-[#132238]"
            >
              About
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/dashboard"
              className="px-3 py-2 text-[13px] font-semibold text-[#526174] transition-colors hover:text-[#132238]"
            >
              Dashboard
            </Link>

            <Link
              href="/create"
              className="inline-flex items-center gap-2 rounded-lg bg-[#132238] px-4 py-2.5 text-[13px] font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1b304b] hover:shadow-lg"
            >
              Start studying
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label={
              mobileOpen ? "Close navigation" : "Open navigation"
            }
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#132238]/10 bg-white md:hidden"
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-[#132238]/10 bg-[#f7f5f0] md:hidden">
            <div className="mx-auto flex max-w-7xl flex-col px-5 py-4">
              <a
                href="#features"
                onClick={closeMobile}
                className="border-b border-[#132238]/5 py-3 text-sm font-semibold text-[#526174]"
              >
                Features
              </a>

              <a
                href="#how-it-works"
                onClick={closeMobile}
                className="border-b border-[#132238]/5 py-3 text-sm font-semibold text-[#526174]"
              >
                How it works
              </a>

              <a
                href="#about"
                onClick={closeMobile}
                className="border-b border-[#132238]/5 py-3 text-sm font-semibold text-[#526174]"
              >
                About
              </a>

              <Link
                href="/dashboard"
                onClick={closeMobile}
                className="border-b border-[#132238]/5 py-3 text-sm font-semibold text-[#526174]"
              >
                Dashboard
              </Link>

              <Link
                href="/create"
                onClick={closeMobile}
                className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-[#132238] px-4 py-3 text-sm font-bold text-white"
              >
                Start studying
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[#132238]/10">
        <div className="absolute right-[-160px] top-[-120px] h-[420px] w-[420px] rounded-full bg-[#dce7f2] blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pb-24 sm:pt-20 lg:grid-cols-[1fr_0.92fr] lg:px-10 lg:py-28">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 border-l-2 border-[#2563a8] pl-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563a8]">
                Welcome to StudyBuddy
              </span>
            </div>

            <h1 className="max-w-3xl font-serif text-[44px] font-medium leading-[1.04] tracking-[-0.035em] text-[#132238] sm:text-[56px] lg:text-[68px]">
              Turn your study material into a{" "}
              <span className="text-[#2563a8]">
                smarter revision system.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-[16px] leading-7 text-[#526174] sm:text-[17px]">
              From lecture notes to exam preparation, StudyBuddy helps you
              transform what you already study into organised flashcards,
              active recall practice, and structured revision.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="group inline-flex items-center justify-center gap-3 rounded-lg bg-[#132238] px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1b304b] hover:shadow-xl"
              >
                Create your first deck
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>

              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#132238]/15 bg-white px-6 py-3.5 text-sm font-bold text-[#132238] transition-all hover:border-[#132238]/30 hover:bg-[#fbfaf7]"
              >
                See how it works
                <ChevronRight size={16} />
              </a>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-[11px] font-semibold text-[#64748b]">
              <span className="flex items-center gap-2">
                <Check size={14} className="text-[#2563a8]" />
                Review before studying
              </span>

              <span className="flex items-center gap-2">
                <Check size={14} className="text-[#2563a8]" />
                Your material, your decks
              </span>

              <span className="flex items-center gap-2">
                <Check size={14} className="text-[#2563a8]" />
                Built for students
              </span>
            </div>
          </div>

          {/* PRODUCT PREVIEW */}
          <div className="relative lg:pl-4">
            <div className="relative mx-auto max-w-[510px]">
              <div className="overflow-hidden rounded-xl border border-[#132238]/15 bg-white shadow-[0_30px_80px_rgba(19,34,56,0.14)]">
                <div className="flex h-12 items-center justify-between border-b border-[#132238]/10 bg-[#fbfaf7] px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#132238] text-white">
                      <BookOpen size={14} />
                    </div>

                    <span className="text-xs font-bold text-[#132238]">
                      StudyBuddy
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#cbd5e1]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#cbd5e1]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-[#cbd5e1]" />
                  </div>
                </div>

                <div className="grid grid-cols-[92px_1fr]">
                  <aside className="border-r border-[#132238]/10 bg-[#f7f5f0] p-3">
                    <div className="mb-6 h-2 w-14 rounded bg-[#132238]/10" />

                    <div className="space-y-2">
                      <div className="rounded-md bg-[#132238] px-2 py-2 text-[8px] font-bold text-white">
                        Overview
                      </div>

                      <div className="px-2 py-2 text-[8px] font-semibold text-[#718096]">
                        My decks
                      </div>

                      <div className="px-2 py-2 text-[8px] font-semibold text-[#718096]">
                        Review
                      </div>

                      <div className="px-2 py-2 text-[8px] font-semibold text-[#718096]">
                        Progress
                      </div>
                    </div>
                  </aside>

                  <div className="bg-white p-4 sm:p-5">
                    <div className="mb-5">
                      <p className="text-[9px] font-semibold uppercase tracking-wider text-[#7a8797]">
                        Today&apos;s study
                      </p>

                      <p className="mt-1 text-lg font-bold tracking-tight text-[#132238]">
                        Ready when you are.
                      </p>
                    </div>

                    <div className="rounded-lg border border-[#132238]/10 bg-[#f7f5f0] p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-wider text-[#2563a8]">
                            Review session
                          </p>

                          <p className="mt-1 text-sm font-bold text-[#132238]">
                            Computer Science
                          </p>

                          <p className="mt-1 text-[9px] text-[#718096]">
                            Active recall practice
                          </p>
                        </div>

                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#dce7f2] text-[#2563a8]">
                          <Brain size={14} />
                        </div>
                      </div>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="text-2xl font-bold text-[#132238]">
                            24
                          </p>

                          <p className="text-[9px] text-[#718096]">
                            cards to review
                          </p>
                        </div>

                        <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#dbe2e9]">
                          <div className="h-full w-[68%] rounded-full bg-[#2563a8]" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 rounded-lg border border-[#132238]/10 bg-[#132238] p-5 text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-wider text-[#9fb6cd]">
                          Flashcard
                        </span>

                        <span className="text-[8px] text-[#9fb6cd]">
                          08 / 24
                        </span>
                      </div>

                      <p className="mt-8 text-[9px] font-semibold uppercase tracking-wider text-[#9fb6cd]">
                        Question
                      </p>

                      <p className="mt-2 text-sm font-semibold leading-5">
                        What is the purpose of an algorithm?
                      </p>

                      <div className="mt-7 flex gap-2">
                        <div className="flex-1 rounded-md border border-white/15 px-2 py-2 text-center text-[8px] font-semibold text-[#c6d3df]">
                          Again
                        </div>

                        <div className="flex-1 rounded-md border border-white/15 px-2 py-2 text-center text-[8px] font-semibold text-[#c6d3df]">
                          Hard
                        </div>

                        <div className="flex-1 rounded-md bg-[#2563a8] px-2 py-2 text-center text-[8px] font-semibold text-white">
                          Easy
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-5 -left-4 hidden rounded-lg border border-[#132238]/10 bg-white px-4 py-3 shadow-xl sm:block">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#e8f0f7] text-[#2563a8]">
                    <Repeat2 size={15} />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-[#132238]">
                      Spaced repetition
                    </p>

                    <p className="mt-0.5 text-[9px] text-[#718096]">
                      Review what needs attention
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WELCOME / POSITIONING */}
      <section className="border-b border-[#132238]/10 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:px-10 lg:py-20">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563a8]">
              A BETTER WAY TO REVISE
            </p>

            <h2 className="mt-3 max-w-md font-serif text-3xl font-medium leading-tight tracking-[-0.025em] text-[#132238] sm:text-4xl">
              Study less passively. Recall more actively.
            </h2>
          </div>

          <div className="max-w-2xl">
            <p className="text-[15px] leading-7 text-[#526174] sm:text-base">
              Good revision is not only about reading your notes repeatedly.
              It is about asking yourself questions, retrieving information,
              identifying what you have forgotten, and returning to it at the
              right time.
            </p>

            <p className="mt-4 text-[15px] leading-7 text-[#526174] sm:text-base">
              StudyBuddy gives students one place to turn their existing
              material into that kind of revision workflow.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-24 bg-[#f7f5f0]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563a8]">
              WHAT YOU CAN DO
            </p>

            <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-[-0.025em] text-[#132238] sm:text-4xl">
              Everything you need for a more organised revision routine.
            </h2>

            <p className="mt-4 text-[15px] leading-7 text-[#526174]">
              StudyBuddy is designed around the actual work students need to
              do: create material, practise it, review it, and keep track of
              what still needs attention.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-[#132238]/10 bg-[#132238]/10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="group bg-white p-7 transition-colors hover:bg-[#fbfaf7]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e8f0f7] text-[#2563a8] transition-transform group-hover:-translate-y-1">
                    <Icon size={18} />
                  </div>

                  <h3 className="mt-6 text-[15px] font-bold text-[#132238]">
                    {feature.title}
                  </h3>

                  <p className="mt-2 text-[13px] leading-6 text-[#64748b]">
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
        className="scroll-mt-24 border-y border-[#132238]/10 bg-white"
      >
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563a8]">
                HOW IT WORKS
              </p>

              <h2 className="mt-3 font-serif text-3xl font-medium leading-tight tracking-[-0.025em] text-[#132238] sm:text-4xl">
                A simple workflow from notes to revision.
              </h2>

              <p className="mt-5 text-[15px] leading-7 text-[#526174]">
                No complicated setup. Start with the material you already have
                and build your revision deck from there.
              </p>

              <Link
                href="/create"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#132238] px-5 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1b304b]"
              >
                Create a deck
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="divide-y divide-[#132238]/10 border-y border-[#132238]/10">
              {process.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.number}
                    className="group grid gap-5 py-7 sm:grid-cols-[70px_1fr_auto] sm:items-center"
                  >
                    <span className="font-serif text-2xl text-[#a3afbd]">
                      {item.number}
                    </span>

                    <div>
                      <h3 className="text-base font-bold text-[#132238]">
                        {item.title}
                      </h3>

                      <p className="mt-1.5 max-w-lg text-[13px] leading-6 text-[#64748b]">
                        {item.text}
                      </p>
                    </div>

                    <div className="hidden h-9 w-9 items-center justify-center rounded-md border border-[#132238]/10 text-[#2563a8] transition-colors group-hover:border-[#2563a8]/30 sm:flex">
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
      <section id="about" className="scroll-mt-24 bg-[#132238] text-white">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
          <div className="grid gap-14 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8db3d6]">
                ABOUT STUDYBUDDY
              </p>

              <h2 className="mt-4 max-w-xl font-serif text-3xl font-medium leading-tight tracking-[-0.025em] sm:text-4xl lg:text-5xl">
                Built around the way students actually revise.
              </h2>
            </div>

            <div className="max-w-xl">
              <p className="text-[15px] leading-7 text-[#c4d0dc]">
                StudyBuddy is a study tool for students who want a more
                structured way to turn their course material into revision
                practice.
              </p>

              <p className="mt-5 text-[15px] leading-7 text-[#c4d0dc]">
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

                  <p className="mt-1 text-xs leading-5 text-[#9fb0c1]">
                    Start with the notes and resources you already use.
                  </p>
                </div>

                <div className="border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-bold text-white">
                    Your control
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#9fb0c1]">
                    Review and edit cards before they become part of your deck.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#f7f5f0]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="border-y border-[#132238]/15 py-12 text-center sm:py-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#2563a8]">
              START YOUR NEXT REVISION SESSION
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl font-serif text-3xl font-medium leading-tight tracking-[-0.025em] text-[#132238] sm:text-4xl lg:text-5xl">
              Your notes are already there.
              <br />
              <span className="text-[#2563a8]">
                Now make them work for you.
              </span>
            </h2>

            <p className="mx-auto mt-5 max-w-xl text-[14px] leading-6 text-[#64748b]">
              Create a deck from your study material and start building a
              revision routine around active recall.
            </p>

            <Link
              href="/create"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#132238] px-6 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#1b304b] hover:shadow-xl"
            >
              Create your first deck
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#132238]/10 bg-[#f7f5f0]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#132238] text-white">
              <BookOpen size={15} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#132238]">
                StudyBuddy
              </p>

              <p className="text-[9px] uppercase tracking-[0.14em] text-[#718096]">
                Your study companion
              </p>
            </div>
          </Link>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-semibold text-[#64748b]">
            <a href="#features" className="hover:text-[#132238]">
              Features
            </a>

            <a href="#how-it-works" className="hover:text-[#132238]">
              How it works
            </a>

            <a href="#about" className="hover:text-[#132238]">
              About
            </a>

            <Link href="/dashboard" className="hover:text-[#132238]">
              Dashboard
            </Link>

            <Link href="/create" className="hover:text-[#132238]">
              Create deck
            </Link>
          </div>

          <p className="text-xs text-[#718096]">
            Study smarter. Prepare with purpose.
          </p>
        </div>
      </footer>
    </main>
  );
}