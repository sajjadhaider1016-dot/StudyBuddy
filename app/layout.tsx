import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/ui/app-shell";

export const metadata: Metadata = {
  title:
    "StudyBuddy — AI-Powered Smart Flashcards",
  description:
    "Turn your notes into smarter study sessions with AI-powered flashcards and spaced repetition.",
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