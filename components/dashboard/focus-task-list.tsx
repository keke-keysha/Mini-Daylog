"use client";

import { useState, useTransition } from "react";
import { Check, Clock3 } from "lucide-react";
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

  if (tasks.length === 0) return <p className="py-6 text-sm text-muted-foreground">No upcoming tasks.</p>;
  return <div className={cn("max-h-64 space-y-2 overflow-y-auto pr-1", pending && "opacity-80")}>{tasks.map((task) => <div key={task.id} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3"><button type="button" onClick={() => complete(task)} className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background hover:border-primary hover:text-primary" aria-label={`Finish ${task.title}`}><Check className="size-4" /></button><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{task.title}</p><p className="truncate text-xs text-muted-foreground">{task.materialTitle}</p></div><span className={cn("flex items-center gap-1 text-[11px] text-muted-foreground", task.deadline < today && "font-semibold text-destructive")}><Clock3 className="size-3" />{formatDisplayDate(task.deadline)}</span></div>)}</div>;
}
