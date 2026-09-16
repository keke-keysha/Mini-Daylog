"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setTrackerStatus } from "@/actions/tracker";
import { Button } from "@/components/ui/button";

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
          <label key={option.key} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border bg-background px-4 py-3 text-sm transition hover:bg-muted/60">
            <input
              type="checkbox"
              checked={status[option.key]}
              onChange={(event) => setStatus((current) => ({ ...current, [option.key]: event.target.checked }))}
              className="size-4 accent-primary"
            />
            <span>
              <span className="block font-medium">{option.label}</span>
              <span className="sr-only">{option.description}</span>
            </span>
          </label>
        ))}
      </div>
      <Button disabled={pending}>
        {pending ? <LoaderCircle className="animate-spin" /> : <Save />}
        {pending ? "Saving..." : "Save Status"}
      </Button>
    </form>
  );
}
