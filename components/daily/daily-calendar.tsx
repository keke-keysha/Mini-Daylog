"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { JournalForm } from "@/components/daily/journal-form";
import { formatDisplayDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { MoodPicker, type Mood } from "@/components/daily/mood-picker";

import type { DailyCalendarEntry as Entry } from "@/lib/data/daily";

const statusDots = [
  { key: "isFasting", label: "Fasting", color: "bg-green-800" },
  { key: "isSick", label: "Sick", color: "bg-yellow-700" },
  { key: "isRedDay", label: "Red Day", color: "bg-red-800" },
] as const;

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthKey(date: string) { return date.slice(0, 7); }

export function DailyCalendar({ firstUsedDate, today, entries }: { firstUsedDate: string; today: string; entries: Entry[] }) {
  const [month, setMonth] = useState(monthKey(today));
  const lookup = useMemo(() => new Map(entries.map((entry) => [entry.date, entry])), [entries]);
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = (new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay() + 6) % 7;
  const cells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  const title = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  const canPrevious = month > monthKey(firstUsedDate);
  const canNext = month < monthKey(today);

  function move(amount: number) {
    const date = new Date(Date.UTC(year, monthNumber - 1 + amount, 1));
    setMonth(`${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between rounded-[1.25rem] bg-white/40 p-2 dark:bg-white/5">
        <Button variant="outline" size="icon" disabled={!canPrevious} onClick={() => move(-1)} aria-label="Previous month"><ChevronLeft /></Button>
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
        <Button variant="outline" size="icon" disabled={!canNext} onClick={() => move(1)} aria-label="Next month"><ChevronRight /></Button>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-extrabold text-muted-foreground sm:gap-2 sm:text-xs">
        {weekdays.map((day) => <div key={day} className="py-1.5">{day}</div>)}
        {cells.map((day, index) => {
          if (!day) return <div key={`empty-${index}`} />;
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const entry = lookup.get(date) ?? { date, mood: "FLAT" as Mood, journal: "", totalTodos: 0, completedTodos: 0, isFasting: false, isSick: false, isRedDay: false };
          const disabled = date < firstUsedDate || date > today;
          return (
            <Dialog.Root key={date}>
              <Dialog.Trigger asChild>
                <button disabled={disabled} className={cn("calendar-day relative min-h-14 pb-3", `calendar-${entry.mood.toLowerCase()}`, date === today && "is-today")}>
                  <span className="font-semibold">{day}</span><small>{entry.completedTodos}/{entry.totalTodos}</small>
                  <span className="absolute bottom-1.5 right-1 flex gap-0.5 sm:right-2">
                    {statusDots.filter((status) => entry[status.key]).map((status) => <span key={status.key} title={status.label} className={cn("size-1.5 rounded-full ring-1 ring-white/60", status.color)}><span className="sr-only">{status.label}</span></span>)}
                  </span>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-[#292633]/35 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[min(92vw,500px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[1.75rem] border border-white/70 bg-background/95 p-6 text-center shadow-[0_28px_80px_rgba(44,38,59,0.22)] backdrop-blur-xl dark:border-white/10">
                  <Dialog.Title className="sr-only">Daily entry for {formatDisplayDate(date)}</Dialog.Title>
                  <Dialog.Description className="sr-only">Mood and journal detail</Dialog.Description>
                  <div className="pt-8"><MoodPicker key={date} date={date} initialMood={entry.mood} /></div>
                  <p className="mt-4 font-heading text-xl font-semibold">{formatDisplayDate(date)}</p>
                  {date < today ? (
                    <div className="mt-4 text-left">
                      <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.14em] text-foreground/50">Edit journal</p>
                      <JournalForm date={date} initialJournal={entry.journal} />
                    </div>
                  ) : (
                    <p className="mt-4 min-h-24 whitespace-pre-wrap rounded-[1.25rem] bg-white/45 p-4 text-left text-sm leading-6 text-muted-foreground dark:bg-white/5">{entry.journal || "No journal entry"}</p>
                  )}
                  <Dialog.Close className="absolute right-4 top-4 grid size-10 place-items-center rounded-2xl text-muted-foreground transition hover:bg-white/70 focus-visible:ring-3 focus-visible:ring-ring/30 dark:hover:bg-white/10" aria-label="Close"><X /></Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground" aria-label="Calendar status colors">
        {statusDots.map((status) => <span key={status.key} className="inline-flex items-center gap-1.5"><span aria-hidden="true" className={cn("size-1.5 rounded-full ring-1 ring-white/60", status.color)} />{status.label}</span>)}
      </div>
    </div>
  );
}
