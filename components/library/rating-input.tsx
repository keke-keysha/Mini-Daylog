"use client";

import { useState } from "react";
import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingInput({ initial }: { initial: number | null }) {
  const [rating, setRating] = useState(initial ?? 0);
  return (
    <div><input type="hidden" name="rating" value={rating || ""} /><div className="flex gap-1" aria-label="Rating from one to five stars">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className="grid size-10 place-items-center rounded-lg hover:bg-muted" aria-label={`${value} stars`} aria-pressed={rating === value}><Star className={cn("size-6", value <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} /></button>)}</div></div>
  );
}
