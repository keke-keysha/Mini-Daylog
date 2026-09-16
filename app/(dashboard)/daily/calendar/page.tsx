import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DailyCalendar } from "@/components/daily/daily-calendar";
import { Card } from "@/components/ui/card";
import { todayJakarta } from "@/lib/date";
import { ensureAppSettings, getDailyCalendarData } from "@/lib/data/daily";

export const dynamic = "force-dynamic";

export default async function DailyCalendarPage() {
  const today = todayJakarta();
  const settings = await ensureAppSettings();
  const entries = await getDailyCalendarData(settings.firstUsedDate, today);
  return (
    <main className="page-shell">
      <header className="page-header"><div><p className="eyebrow">Your daily history</p><h1>Calendar</h1></div><Link href="/daily" className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-medium hover:bg-muted"><ArrowLeft className="size-4" /> Daily</Link></header>
      <Card><DailyCalendar firstUsedDate={settings.firstUsedDate} today={today} entries={entries} /></Card>
    </main>
  );
}
