import Link from "next/link";
import { ArrowUpRight, BookOpen, CalendarDays, Crosshair, Route } from "lucide-react";

import { DashboardFocusTasks } from "@/components/dashboard/focus-task-list";
import { MoodPicker } from "@/components/daily/mood-picker";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { auth } from "@/lib/auth";
import { greetingForJakarta, todayJakarta } from "@/lib/date";
import { getDailyEntry } from "@/lib/data/daily";
import { getDashboardData } from "@/lib/data/dashboard";

export const dynamic = "force-dynamic";

function WidgetHeader({ href, title, icon: Icon }: { href: string; title: string; icon: typeof CalendarDays }) {
  return <Link href={href} className="-m-2 mb-4 flex min-h-11 items-center justify-between rounded-xl p-2 hover:bg-muted"><span className="flex items-center gap-2 font-semibold"><Icon className="size-5 text-primary" />{title}</span><ArrowUpRight className="size-4 text-muted-foreground" /></Link>;
}

export default async function HomePage() {
  const session = await auth();
  const today = todayJakarta();
  const [daily, dashboard] = await Promise.all([getDailyEntry(today), getDashboardData()]);
  const username = session?.user?.name ?? "You";
  return <main className="page-shell">
    <header className="rounded-3xl bg-primary p-5 text-primary-foreground sm:p-6"><p className="text-sm opacity-80">{today}</p><h1 className="mt-1 text-2xl font-semibold tracking-tight">{greetingForJakarta()}, {username}</h1><p className="mt-2 text-sm opacity-80">A calm look at what matters today.</p></header>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="min-h-80"><WidgetHeader href="/daily" title="Daily" icon={CalendarDays} /><div className="mb-5"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">To Do List</p>{daily.todos.length ? <ul className="space-y-1.5">{daily.todos.slice(0, 4).map((todo) => <li key={todo.id} className="flex gap-2 text-sm"><span className={todo.isCompleted ? "text-primary" : "text-muted-foreground"}>{todo.isCompleted ? "✓" : "○"}</span><span className={todo.isCompleted ? "text-muted-foreground line-through" : ""}>{todo.text}</span></li>)}</ul> : <Link href="/daily" className="text-sm text-muted-foreground hover:text-primary">Set to do list now</Link>}</div><p className="mb-2 mt-auto text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today&apos;s Mood</p><MoodPicker date={today} initialMood={daily.mood} compact /></Card>
      <Card className="min-h-80"><WidgetHeader href="/focus" title="Focus" icon={Crosshair} /><DashboardFocusTasks initialTasks={dashboard.tasks} /></Card>
      <Card className="min-h-80"><WidgetHeader href="/tracker" title="Tracker" icon={Route} />{dashboard.lastActivity ? <Link href="/tracker" className="grid flex-1 content-start gap-3"><div className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">Last activity</p><p className="mt-1 font-semibold">{dashboard.lastActivity.activity}</p><p className="text-xs text-muted-foreground">{dashboard.lastActivity.date}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Distance this week</p><p className="mt-1 text-lg font-semibold">{dashboard.weeklyDistance.toFixed(2)} km</p></div><div className="rounded-2xl border p-4"><p className="text-xs text-muted-foreground">Duration this week</p><p className="mt-1 text-lg font-semibold">{dashboard.weeklyDuration} min</p></div></div></Link> : <Link href="/tracker" className="py-8 text-sm text-muted-foreground">No activity logged yet</Link>}</Card>
      <Card className="min-h-80"><WidgetHeader href="/library" title="Library" icon={BookOpen} /><Link href="/library" className="grid gap-5">{dashboard.currentBook ? <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Currently Reading</p><p className="mt-2 text-sm font-semibold">{dashboard.currentBook.title}</p><Progress value={(dashboard.currentBook.currentPage / dashboard.currentBook.totalPages) * 100} className="mt-2" /><p className="mt-1 text-xs text-muted-foreground">{dashboard.currentBook.currentPage} / {dashboard.currentBook.totalPages}</p></div> : <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Currently Reading</p><p className="mt-2 text-sm text-muted-foreground">No active book.</p></div>}{dashboard.currentSeries ? <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Currently Watching</p><p className="mt-2 text-sm font-semibold">{dashboard.currentSeries.title}</p><Progress value={((dashboard.currentSeries.watchedEpisodes ?? 0) / (dashboard.currentSeries.totalEpisodes ?? 1)) * 100} className="mt-2" /><p className="mt-1 text-xs text-muted-foreground">{dashboard.currentSeries.watchedEpisodes} / {dashboard.currentSeries.totalEpisodes} episodes</p></div> : <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Currently Watching</p><p className="mt-2 text-sm text-muted-foreground">No active series.</p></div>}</Link></Card>
    </div>
  </main>;
}
