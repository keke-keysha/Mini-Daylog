import Link from "next/link";
import { CalendarDays, ListTodo, NotebookPen, Smile } from "lucide-react";

import { DailyTodos } from "@/components/daily/daily-todos";
import { JournalForm } from "@/components/daily/journal-form";
import { MoodPicker } from "@/components/daily/mood-picker";
import { Card } from "@/components/ui/card";
import { PageHeading, PastelIcon } from "@/components/ui/presentation";
import { formatDisplayDate, todayJakarta } from "@/lib/date";
import { ensureAppSettings, getDailyEntry } from "@/lib/data/daily";

export const dynamic = "force-dynamic";

export default async function DailyPage() {
  const today = todayJakarta();
  await ensureAppSettings();
  const entry = await getDailyEntry(today);

  return (
    <main className="page-shell">
      <PageHeading eyebrow="Make today count" title="Daily" description="A gentle place for how you feel, what matters, and what happened." action={<Link href="/daily/calendar" className="flex min-h-11 shrink-0 items-center gap-2 rounded-2xl bg-daylog-blue px-3.5 text-xs font-extrabold text-daylog-blue-ink shadow-sm transition hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/30 sm:text-sm"><CalendarDays className="size-4" />{formatDisplayDate(today)}</Link>} />
      <Card className="bento-blue relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute -right-8 -top-10 size-32 rounded-full bg-white/35" />
        <div className="mb-5 flex items-center gap-3"><PastelIcon icon={Smile} tone="blue" className="bg-white/60 dark:bg-white/10" /><div><h2 className="font-heading text-xl font-semibold">Today&apos;s Mood</h2><p className="text-xs font-bold text-foreground/50">Tap what feels closest right now</p></div></div>
        <MoodPicker date={today} initialMood={entry.mood} />
      </Card>
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-5">
        <Card className="bento-yellow min-h-[23rem]"><div className="mb-5 flex items-center gap-3"><PastelIcon icon={ListTodo} tone="yellow" className="bg-white/60 dark:bg-white/10" /><div><h2 className="font-heading text-xl font-semibold">To Do List</h2><p className="text-xs font-bold text-foreground/50">Small steps for today</p></div></div><DailyTodos key={entry.todos.map((todo) => todo.id).join(",")} date={today} initialTodos={entry.todos.map(({ id, text, isCompleted }) => ({ id, text, isCompleted }))} /></Card>
        <Card className="bento-pink min-h-[23rem]"><div className="mb-5 flex items-center gap-3"><PastelIcon icon={NotebookPen} tone="pink" className="bg-white/60 dark:bg-white/10" /><div><h2 className="font-heading text-xl font-semibold">Quick Journaling</h2><p className="text-xs font-bold text-foreground/50">Leave a little note for yourself</p></div></div><JournalForm date={today} initialJournal={entry.journal} /></Card>
      </div>
    </main>
  );
}
