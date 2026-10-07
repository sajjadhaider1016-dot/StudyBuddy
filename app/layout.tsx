import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/ui/app-shell";

export const metadata: Metadata = {
  title:
    "StudyBuddy — AI Flashcards from Books and Notes",
  description:
    "Turn PDF and EPUB books, chapter pages, and notes into editable flashcards with AI and spaced repetition.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body>
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
