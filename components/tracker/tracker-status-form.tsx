"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setTrackerStatus } from "@/actions/tracker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TrackerStatus = {
  isFasting: boolean;
  isSick: boolean;
  isRedDay: boolean;
};

const statusOptions: { key: keyof TrackerStatus; label: string; description: string }[] = [
  { key: "isFasting", label: "Fasting", description: "Mark today as a fasting day" },
  { key: "isSick", label: "Sick", description: "Mark today as a recovery or sick day" },
  { key: "isRedDay", label: "Red Day", description: "Mark today as a red day" },
];

export function TrackerStatusForm({ date, initialStatus }: { date: string; initialStatus: TrackerStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await setTrackerStatus({ date, ...status });
      if (!result.ok) return void toast.error(result.error);
      toast.success("Status updated");
      router.refresh();
    });
  }

  return (
    <form className="space-y-4" noValidate onSubmit={submit}>
      <div className="grid gap-2 sm:grid-cols-3">
        {statusOptions.map((option) => (
          <label key={option.key} className={cn("flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-2 border-transparent bg-white/50 px-4 py-3 text-sm transition duration-200 hover:bg-white/75 dark:bg-black/10 dark:hover:bg-black/20", status[option.key] && "border-daylog-mint-strong bg-daylog-mint/80 shadow-sm")}>
            <input
              type="checkbox"
              checked={status[option.key]}
              onChange={(event) => setStatus((current) => ({ ...current, [option.key]: event.target.checked }))}
              className="size-5 rounded-lg accent-[var(--daylog-mint-ink)]"
            />
            <span>
              <span className="block font-bold">{option.label}</span>
              <span className="sr-only">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
      <Button className="w-full sm:w-auto" disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Save />}
        {pending ? "Saving..." : "Save Status"}
      </Button>
    </form>
  );
}
