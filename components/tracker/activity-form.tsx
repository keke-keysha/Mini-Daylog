"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createActivity, updateActivity } from "@/actions/tracker";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form-fields";

export type Activity = {
  id: string;
  date: string;
  activity: string;
  distanceKm: string | null;
  durationMinutes: number;
  paceSecondsPerKm: number | null;
  isFasting: boolean;
  isSick: boolean;
  isRedDay: boolean;
};

function paceValue(seconds: number | null) {
  return seconds == null ? "" : `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function ActivityForm({ today, initial }: { today: string; initial?: Activity }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [distance, setDistance] = useState(initial?.distanceKm ?? "");
  const [duration, setDuration] = useState(initial?.durationMinutes.toString() ?? "");
  const [pace, setPace] = useState(paceValue(initial?.paceSecondsPerKm ?? null));

  function suggestPace(nextDistance: string, nextDuration: string) {
    const km = Number(nextDistance);
    const minutes = Number(nextDuration);
    if (km > 0 && minutes > 0) {
      const totalSeconds = Math.round((minutes * 60) / km);
      setPace(`${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`);
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const input = {
      date: data.get("date")?.toString() ?? "",
      activity: data.get("activity")?.toString() ?? "",
      distanceKm: data.get("distanceKm")?.toString() ?? "",
      durationMinutes: data.get("durationMinutes")?.toString() ?? "",
      pace: data.get("pace")?.toString() ?? "",
      isFasting: data.get("isFasting") === "on",
      isSick: data.get("isSick") === "on",
      isRedDay: data.get("isRedDay") === "on",
    };
    startTransition(async () => {
      const result = initial ? await updateActivity(initial.id, input) : await createActivity(input);
      if (!result.ok) return void toast.error(result.error);
      toast.success(initial ? "Activity updated" : "Activity added");
      if (!initial) {
        form.reset();
        setDistance(""); setDuration(""); setPace("");
      }
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      <fieldset><legend className="mb-3 text-sm font-semibold">Today&apos;s Status</legend><div className="flex flex-wrap gap-4">{[["isFasting", "Fasting", initial?.isFasting], ["isSick", "Sick", initial?.isSick], ["isRedDay", "Red Day", initial?.isRedDay]].map(([name, label, checked]) => <label key={String(name)} className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" name={String(name)} defaultChecked={Boolean(checked)} className="size-4 accent-primary" /> {String(label)}</label>)}</div></fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Date"><Input name="date" type="date" defaultValue={initial?.date ?? today} /></Field>
        <Field label="Activity"><Input name="activity" placeholder="Running, walking, gym..." defaultValue={initial?.activity} /></Field>
        <Field label="Distance (km)"><Input name="distanceKm" inputMode="decimal" value={distance} onChange={(event) => { setDistance(event.target.value); suggestPace(event.target.value, duration); }} placeholder="5.00" /></Field>
        <Field label="Duration (minutes)"><Input name="durationMinutes" inputMode="numeric" value={duration} onChange={(event) => { setDuration(event.target.value); suggestPace(distance, event.target.value); }} placeholder="30" /></Field>
        <Field label="Pace (mm:ss /km)" className="sm:col-span-2"><Input name="pace" inputMode="numeric" value={pace} onChange={(event) => setPace(event.target.value)} placeholder="06:00" /></Field>
      </div>
      <Button disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : initial ? <Save /> : <Plus />}{pending ? "Saving..." : initial ? "Update" : "Add Activity"}</Button>
    </form>
  );
}
