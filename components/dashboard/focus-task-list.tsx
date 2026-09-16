"use client";

import { useState, useTransition } from "react";
import { Check, Clock3, ListChecks } from "lucide-react";
import { toast } from "sonner";

import { toggleFocusTask } from "@/actions/focus";
import { formatDisplayDate, todayJakarta } from "@/lib/date";
import { cn } from "@/lib/utils";

type Task = { id: string; title: string; materialTitle: string; deadline: string };

export function DashboardFocusTasks({ initialTasks }: { initialTasks: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [pending, startTransition] = useTransition();
  const today = todayJakarta();

  function complete(task: Task) {
    setTasks((all) => all.filter((item) => item.id !== task.id));
    startTransition(async () => {
      const result = await toggleFocusTask(task.id, true);
      if (!result.ok) {
        setTasks((all) => [...all, task].sort((a, b) => a.deadline.localeCompare(b.deadline)));
        toast.error(result.error);
      } else toast.success("Task completed");
    });
  }

  if (tasks.length === 0) return <div className="grid flex-1 place-items-center rounded-[1.4rem] border border-dashed border-daylog-lavender-ink/20 bg-white/30 py-8 text-center dark:bg-white/5"><div><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-white/55 text-daylog-lavender-ink dark:bg-white/10"><ListChecks className="size-5" /></span><p className="mt-3 text-sm font-bold text-foreground/55">No upcoming tasks.</p></div></div>;
  return <div className={cn("max-h-[17rem] space-y-2.5 overflow-y-auto pr-1", pending && "opacity-80")}>{tasks.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-[1.2rem] bg-white/45 p-3.5 transition hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10"><button type="button" onClick={() => complete(task)} className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/60 bg-white/55 text-daylog-lavender-ink transition hover:scale-105 hover:bg-daylog-mint focus-visible:ring-3 focus-visible:ring-ring/30 dark:border-white/10 dark:bg-white/10" aria-label={`Finish ${task.title}`}><Check className="size-4" /></button><div className="min-w-0 flex-1"><p className="truncate text-sm font-extrabold">{task.title}</p><p className="truncate text-xs font-semibold text-foreground/50">{task.materialTitle}</p></div><span className={cn("flex shrink-0 items-center gap-1 rounded-full bg-white/55 px-2 py-1 text-[10px] font-extrabold text-foreground/55 dark:bg-white/10", task.deadline < today && "bg-daylog-pink text-daylog-pink-ink")}><Clock3 className="size-3" />{formatDisplayDate(task.deadline)}</span></div>)}</div>;
}
