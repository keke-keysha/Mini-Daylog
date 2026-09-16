"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingInput({ initial }: { initial: number | null }) {
  const [rating, setRating] = useState(initial ?? 0);
  return (
    <div><input type="hidden" name="rating" value={rating || ""} /><div className="flex gap-1" aria-label="Rating from one to five stars">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className="grid size-11 place-items-center rounded-xl transition hover:-translate-y-0.5 hover:bg-white/60 active:scale-95 dark:hover:bg-white/5" aria-label={`${value} stars`} aria-pressed={rating === value}><Star className={cn("size-7 transition", value <= rating ? "fill-amber-400 text-amber-500" : "text-muted-foreground/45")} /></button>)}</div></div>
  );
}
