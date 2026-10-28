"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { setMood } from "@/actions/daily";
import { cn } from "@/lib/utils";

export type Mood = "SAD" | "FLAT" | "HAPPY" | "ANGRY";

export const moods: { value: Mood; emoji: string; label: string; className: string }[] = [
  { value: "SAD", emoji: "😔", label: "Sad", className: "mood-sad" },
  { value: "FLAT", emoji: "😐", label: "Flat", className: "mood-flat" },
  { value: "HAPPY", emoji: "😊", label: "Happy", className: "mood-happy" },
  { value: "ANGRY", emoji: "😠", label: "Angry", className: "mood-angry" },
];

export function MoodPicker({ date, initialMood, compact = false }: { date: string; initialMood: Mood; compact?: boolean }) {
  const router = useRouter();
  const [selected, setSelected] = useState(initialMood);
  const [pending, startTransition] = useTransition();

  function chooseMood(mood: Mood) {
    const previous = selected;
    setSelected(mood);
    startTransition(async () => {
      try {
        const result = await setMood(date, mood);
        if (!result.ok) {
          setSelected(previous);
          toast.error(result.error);
          return;
        }
        toast.success("Mood updated");
        router.refresh();
      } catch {
        setSelected(previous);
        toast.error("Unable to save mood. Please try again.");
      }
    });
  }

  return (
    <div className={cn("grid grid-cols-4 gap-2 sm:gap-3", pending && "opacity-80")} role="group" aria-label="Choose mood for this day">
      {moods.map((mood) => (
        <button
          key={mood.value}
          type="button"
          className={cn("mood-option", mood.className, selected === mood.value && "is-selected", compact && "is-compact")}
          onClick={() => chooseMood(mood.value)}
          aria-label={`${mood.label} mood`}
          aria-pressed={selected === mood.value}
          disabled={pending}
        >
          <span aria-hidden="true">{mood.emoji}</span>
          {!compact && <small>{mood.label}</small>}
        </button>
      ))}
    </div>
  );
}
