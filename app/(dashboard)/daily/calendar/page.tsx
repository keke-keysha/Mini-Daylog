import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { DailyCalendar } from "@/components/daily/daily-calendar";
import { Card } from "@/components/ui/card";
import { PageHeading } from "@/components/ui/presentation";
import { todayJakarta } from "@/lib/date";
import { ensureAppSettings, getDailyCalendarData } from "@/lib/data/daily";

export const dynamic = "force-dynamic";

export default async function DailyCalendarPage() {
  const today = todayJakarta();
  const settings = await ensureAppSettings();
  const entries = await getDailyCalendarData(settings.firstUsedDate, today);
  return (
    <main className="page-shell">
      <PageHeading eyebrow="Your daily history" title="Calendar" description="Open a past day to revisit and edit its journal." action={<Link href="/daily" className="flex min-h-11 items-center gap-2 rounded-2xl bg-daylog-blue px-3.5 text-sm font-extrabold text-daylog-blue-ink transition hover:-translate-y-0.5 focus-visible:ring-3 focus-visible:ring-ring/30"><ArrowLeft className="size-4" /> Daily</Link>} />
      <Card className="bento-lavender overflow-hidden"><div className="mb-5 flex items-center gap-3"><span className="grid size-11 place-items-center rounded-2xl bg-white/60 text-daylog-lavender-ink shadow-sm dark:bg-white/10"><CalendarDays className="size-5" /></span><div><h2 className="font-heading text-xl font-semibold">Daily Story</h2><p className="text-xs font-bold text-foreground/50">Every color holds a little piece of your day</p></div></div><DailyCalendar firstUsedDate={settings.firstUsedDate} today={today} entries={entries} /></Card>
    </main>
  );
}
