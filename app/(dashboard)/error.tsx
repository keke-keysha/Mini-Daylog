"use client";

import { RefreshCw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-4 py-10 text-center">
      <div className="relative w-full max-w-lg overflow-hidden rounded-[2rem] bg-daylog-lavender p-7 shadow-[var(--daylog-shadow)] sm:p-10">
        <span className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-white/30" aria-hidden="true" />
        <span className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-daylog-lavender-strong text-daylog-lavender-ink"><Sparkles className="size-6" /></span>
        <p className="eyebrow mt-5">DayLog could not load this page</p>
        <h1 className="mt-2 font-display text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Check the database connection and try again.</p>
        <Button className="mt-5 h-11 px-5" onClick={reset}><RefreshCw /> Try again</Button>
      </div>
    </main>
  );
}
