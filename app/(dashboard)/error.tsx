"use client";

import { Button } from "@/components/ui/button";

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-[70dvh] place-items-center px-5 text-center">
      <div>
        <p className="eyebrow">DayLog could not load this page</p>
        <h1 className="mt-2 text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">Check the database connection and try again.</p>
        <Button className="mt-5 h-11 px-5" onClick={reset}>Try again</Button>
      </div>
    </main>
  );
}
