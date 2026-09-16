"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog } from "radix-ui";

import { Button } from "@/components/ui/button";
import { formatDisplayDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { moods, type Mood } from "@/components/daily/mood-picker";

type Entry = { date: string; mood: Mood; journal: string; totalTodos: number; completedTodos: number };

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
          const entry = lookup.get(date) ?? { date, mood: "FLAT" as Mood, journal: "", totalTodos: 0, completedTodos: 0 };
          const mood = moods.find((item) => item.value === entry.mood)!;
          const disabled = date < firstUsedDate || date > today;
          return (
            <Dialog.Root key={date}>
              <Dialog.Trigger asChild>
                <button disabled={disabled} className={cn("calendar-day", `calendar-${entry.mood.toLowerCase()}`, date === today && "is-today")}>
                  <span className="font-semibold">{day}</span><small>{entry.completedTodos}/{entry.totalTodos}</small>
                </button>
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-[#292633]/35 backdrop-blur-sm" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,500px)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-white/70 bg-background/95 p-6 text-center shadow-[0_28px_80px_rgba(44,38,59,0.22)] backdrop-blur-xl dark:border-white/10">
                  <Dialog.Title className="sr-only">Daily entry for {formatDisplayDate(date)}</Dialog.Title>
                  <Dialog.Description className="sr-only">Mood and journal detail</Dialog.Description>
                  <span className={cn("mx-auto grid size-20 place-items-center rounded-[1.6rem] text-5xl", mood.className)} aria-label={`${mood.label} mood`}>{mood.emoji}</span>
                  <p className="mt-4 font-heading text-xl font-semibold">{formatDisplayDate(date)}</p>
                  <p className="mt-4 min-h-24 whitespace-pre-wrap rounded-[1.25rem] bg-white/45 p-4 text-left text-sm leading-6 text-muted-foreground dark:bg-white/5">{entry.journal || "No journal entry"}</p>
                  <Dialog.Close className="absolute right-4 top-4 grid size-10 place-items-center rounded-2xl text-muted-foreground transition hover:bg-white/70 focus-visible:ring-3 focus-visible:ring-ring/30 dark:hover:bg-white/10" aria-label="Close"><X /></Dialog.Close>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          );
        })}
      </div>
    </div>
  );
}
