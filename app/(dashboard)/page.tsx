import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays, Clock3, Crosshair, Footprints, Route, Sparkles } from "lucide-react";

import { DashboardFocusTasks } from "@/components/dashboard/focus-task-list";
import { MoodPicker } from "@/components/daily/mood-picker";
import { Card } from "@/components/ui/card";
import { PastelIcon, type PastelTone } from "@/components/ui/presentation";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/auth";
import { formatDisplayDate, greetingForJakarta, todayJakarta } from "@/lib/date";
import { getDailyEntry } from "@/lib/data/daily";
import { getDashboardData } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

function WidgetHeader({ href, title, subtitle, icon, tone }: { href: string; title: string; subtitle: string; icon: typeof CalendarDays; tone: PastelTone }) {
  return (
    <Link href={href} className="group -m-2 mb-5 flex min-h-14 items-center justify-between rounded-2xl p-2 focus-visible:ring-3 focus-visible:ring-ring/30">
      <span className="flex items-center gap-3">
        <PastelIcon icon={icon} tone={tone} className="bg-white/60 shadow-sm dark:bg-white/10" />
        <span><span className="block font-heading text-xl font-semibold">{title}</span><span className="block text-xs font-bold text-foreground/55">{subtitle}</span></span>
      </span>
      <span className="grid size-9 place-items-center rounded-2xl bg-white/45 text-foreground/55 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:bg-white/75 dark:bg-white/5 dark:group-hover:bg-white/10"><ArrowUpRight className="size-4" /></span>
    </Link>
  );
}

export default async function HomePage() {
  const session = await auth();
  const today = todayJakarta();
  const [daily, dashboard] = await Promise.all([getDailyEntry(today), getDashboardData()]);
  const username = session?.user?.name ?? "You";

  return (
    <main className="page-shell">
      <header className="relative isolate min-h-52 overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,var(--daylog-lavender-soft),var(--daylog-blue-soft))] p-6 shadow-[0_16px_44px_rgba(62,48,91,0.09)] sm:min-h-56 sm:p-8">
        <div aria-hidden="true" className="pastel-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 -z-10 size-48 rounded-full bg-white/45" />
        <div aria-hidden="true" className="pointer-events-none absolute bottom-5 right-8 -z-10 size-20 rotate-12 rounded-[1.75rem] bg-daylog-yellow/70 sm:right-20" />
        <div className="flex h-full max-w-2xl flex-col justify-between">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/55 px-3 py-1.5 text-xs font-extrabold text-daylog-lavender-ink shadow-sm dark:bg-white/10 dark:text-foreground"><CalendarDays className="size-3.5" />{formatDisplayDate(today)}</span>
          <div className="mt-10">
            <p className="flex items-center gap-2 text-sm font-bold text-foreground/60"><Sparkles className="size-4" /> Your day, at a glance</p>
            <h1 className="mt-2 font-heading text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-4xl">{greetingForJakarta()}, {username}</h1>
            <p className="mt-3 text-sm font-semibold text-foreground/60 sm:text-base">How&apos;s your day going? Keep what matters close.</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
        <Card className="bento-blue min-h-[22rem] lg:col-span-7">
          <WidgetHeader href="/daily" title="Daily" subtitle="Plans & mood" icon={CalendarDays} tone="blue" />
          <div className="mb-6 rounded-[1.35rem] bg-white/45 p-4 dark:bg-white/5">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-daylog-blue-ink/65">To Do List</p>
            {daily.todos.length ? (
              <ul className="space-y-2.5">{daily.todos.slice(0, 4).map((todo) => <li key={todo.id} className="flex items-center gap-2.5 text-sm font-semibold"><span className={`grid size-5 shrink-0 place-items-center rounded-lg text-[10px] ${todo.isCompleted ? "bg-daylog-mint-strong text-daylog-mint-ink" : "bg-white/65 text-foreground/35 dark:bg-white/10"}`}>{todo.isCompleted ? "✓" : ""}</span><span className={todo.isCompleted ? "text-foreground/45 line-through" : ""}>{todo.text}</span></li>)}</ul>
            ) : <Link href="/daily" className="inline-flex min-h-11 items-center rounded-xl text-sm font-bold text-daylog-blue-ink hover:underline">Set to do list now</Link>}
          </div>
          <p className="mb-2 mt-auto text-xs font-extrabold uppercase tracking-[0.14em] text-daylog-blue-ink/65">Today&apos;s Mood</p>
          <MoodPicker date={today} initialMood={daily.mood} compact />
        </Card>

        <Card className="bento-lavender min-h-[22rem] lg:col-span-5">
          <WidgetHeader href="/focus" title="Focus" subtitle="What needs attention" icon={Crosshair} tone="lavender" />
          <DashboardFocusTasks initialTasks={dashboard.tasks} />
        </Card>

        <Card className="bento-peach min-h-80 lg:col-span-5">
          <WidgetHeader href="/tracker" title="Tracker" subtitle="Movement this week" icon={Route} tone="peach" />
          {dashboard.lastActivity ? (
            <Link href="/tracker" className="grid flex-1 content-start gap-4 focus-visible:ring-3 focus-visible:ring-ring/30">
              <div className="rounded-[1.35rem] bg-white/45 p-4 dark:bg-white/5"><p className="text-xs font-bold text-foreground/55">Last activity · {formatDisplayDate(dashboard.lastActivity.date)}</p><p className="mt-1 font-heading text-xl font-semibold">{dashboard.lastActivity.activity}</p></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1.35rem] bg-white/45 p-4 dark:bg-white/5"><Footprints className="size-5 text-daylog-peach-ink/65" /><p className="mt-5 font-heading text-2xl font-semibold">{dashboard.weeklyDistance.toFixed(2)} <span className="text-base">km</span></p><p className="text-xs font-bold text-foreground/50">this week</p></div>
                <div className="rounded-[1.35rem] bg-white/45 p-4 dark:bg-white/5"><Clock3 className="size-5 text-daylog-peach-ink/65" /><p className="mt-5 font-heading text-2xl font-semibold">{dashboard.weeklyDuration} <span className="text-base">min</span></p><p className="text-xs font-bold text-foreground/50">active time</p></div>
              </div>
            </Link>
          ) : <Link href="/tracker" className="grid flex-1 place-items-center rounded-[1.4rem] border border-dashed border-daylog-peach-ink/20 bg-white/30 text-sm font-bold text-foreground/55 dark:bg-white/5">No activity logged yet</Link>}
        </Card>

        <Card className="bento-pink min-h-80 lg:col-span-7">
          <WidgetHeader href="/library" title="Library" subtitle="Stories you keep" icon={BookOpen} tone="pink" />
          <Link href="/library" className="grid gap-3 sm:grid-cols-2 focus-visible:ring-3 focus-visible:ring-ring/30">
            {dashboard.currentBook ? <div className="rounded-[1.35rem] bg-white/45 p-4 dark:bg-white/5"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-daylog-pink-ink/65">Currently Reading</p><p className="mt-5 truncate font-heading text-lg font-semibold">{dashboard.currentBook.title}</p><Progress value={(dashboard.currentBook.currentPage / dashboard.currentBook.totalPages) * 100} indicatorClassName="bg-daylog-lavender-strong" className="mt-3" /><p className="mt-2 text-xs font-bold text-foreground/50">{dashboard.currentBook.currentPage} / {dashboard.currentBook.totalPages} pages</p></div> : <div className="rounded-[1.35rem] bg-white/35 p-4 dark:bg-white/5"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-daylog-pink-ink/65">Currently Reading</p><p className="mt-5 text-sm font-bold text-foreground/50">No active book.</p></div>}
            {dashboard.currentSeries ? <div className="rounded-[1.35rem] bg-white/45 p-4 dark:bg-white/5"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-daylog-pink-ink/65">Currently Watching</p><p className="mt-5 truncate font-heading text-lg font-semibold">{dashboard.currentSeries.title}</p><Progress value={((dashboard.currentSeries.watchedEpisodes ?? 0) / (dashboard.currentSeries.totalEpisodes ?? 1)) * 100} indicatorClassName="bg-daylog-pink-strong" className="mt-3" /><p className="mt-2 text-xs font-bold text-foreground/50">{dashboard.currentSeries.watchedEpisodes} / {dashboard.currentSeries.totalEpisodes} episodes</p></div> : <div className="rounded-[1.35rem] bg-white/35 p-4 dark:bg-white/5"><p className="text-xs font-extrabold uppercase tracking-[0.12em] text-daylog-pink-ink/65">Currently Watching</p><p className="mt-5 text-sm font-bold text-foreground/50">No active series.</p></div>}
          </Link>
        </Card>
      </div>
    </main>
  );
}
