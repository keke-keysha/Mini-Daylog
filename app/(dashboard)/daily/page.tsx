import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { DailyTodos } from "@/components/daily/daily-todos";
import { JournalForm } from "@/components/daily/journal-form";
import { MoodPicker } from "@/components/daily/mood-picker";
import { Card } from "@/components/ui/card";
import { formatDisplayDate, todayJakarta } from "@/lib/date";
import { ensureAppSettings, getDailyEntry } from "@/lib/data/daily";

export const dynamic = "force-dynamic";

export default async function DailyPage() {
  const today = todayJakarta();
  await ensureAppSettings();
  const entry = await getDailyEntry(today);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div><p className="eyebrow">Make today count</p><h1>Daily</h1></div>
        <Link href="/daily/calendar" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-muted"><CalendarDays className="size-4" />{formatDisplayDate(today)}</Link>
      </header>
      <Card><h2 className="section-title">Today&apos;s Mood</h2><MoodPicker date={today} initialMood={entry.mood} /></Card>
      <Card><h2 className="section-title">To Do List</h2><DailyTodos key={entry.todos.map((todo) => todo.id).join(",")} date={today} initialTodos={entry.todos.map(({ id, text, isCompleted }) => ({ id, text, isCompleted }))} /></Card>
      <Card><h2 className="section-title">Quick Journaling</h2><JournalForm date={today} initialJournal={entry.journal} /></Card>
    </main>
  );
}
