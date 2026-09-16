"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createMedia, updateMedia } from "@/actions/media";
import { RatingInput } from "@/components/library/rating-input";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/form-fields";

export type MediaItem = { id: string; title: string; genre: string; category: "MOVIE" | "SERIES"; country: string; recommendedBy: string | null; coverAssetId: string | null; documentationAssetId: string | null; totalEpisodes: number | null; watchedEpisodes: number | null; rating: number | null; thoughts: string; startedAt: string; completedAt: string | null };

export function MediaForm({ initial }: { initial?: MediaItem }) {
  const router = useRouter(); const [pending, startTransition] = useTransition(); const [category, setCategory] = useState<"MOVIE" | "SERIES">(initial?.category ?? "MOVIE"); const [quotes, setQuotes] = useState([""]);
  const [totalEpisodes, setTotalEpisodes] = useState(initial?.totalEpisodes?.toString() ?? "");
  const [watchedEpisodes, setWatchedEpisodes] = useState(initial?.watchedEpisodes?.toString() ?? "0");
  const completed = category === "MOVIE" || (Number(totalEpisodes) > 0 && Number(watchedEpisodes) === Number(totalEpisodes));
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget; const data = new FormData(form);
    startTransition(async () => { const result = initial ? await updateMedia(initial.id, data) : await createMedia(data); if (!result.ok) return void toast.error(result.error); toast.success(initial ? "Media updated" : "Media added"); if (!initial) { form.reset(); setCategory("MOVIE"); setTotalEpisodes(""); setWatchedEpisodes("0"); } setQuotes([""]); router.refresh(); });
  }
  return <form className="space-y-5" noValidate onSubmit={submit}>
    <div className="grid gap-4 sm:grid-cols-2"><Field label={`Cover image${initial ? " (optional replacement)" : ""}`}><><Input name="cover" type="file" accept="image/jpeg,image/png,image/webp" /><span className="text-xs font-normal text-muted-foreground">Maximum 1.5 MB.</span></></Field><Field label={`Documentation image${initial ? " (optional replacement)" : " (optional)"}`}><><Input name="documentation" type="file" accept="image/jpeg,image/png,image/webp" /><span className="text-xs font-normal text-muted-foreground">Maximum 1.5 MB.</span></></Field></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Title"><Input name="title" defaultValue={initial?.title} /></Field><Field label="Genre"><Input name="genre" defaultValue={initial?.genre} /></Field><Field label="Category"><Select name="category" value={category} onChange={(event) => setCategory(event.target.value as "MOVIE" | "SERIES")}><option value="MOVIE">Movie</option><option value="SERIES">Series</option></Select></Field><Field label="Country"><Input name="country" defaultValue={initial?.country} /></Field><Field label="Recommended from (optional)" className="sm:col-span-2"><Input name="recommendedBy" defaultValue={initial?.recommendedBy ?? ""} /></Field>{category === "SERIES" && <><Field label="Total episodes"><Input name="totalEpisodes" inputMode="numeric" value={totalEpisodes} onChange={(event) => setTotalEpisodes(event.target.value)} /></Field><Field label="Watched episodes"><Input name="watchedEpisodes" inputMode="numeric" value={watchedEpisodes} onChange={(event) => setWatchedEpisodes(event.target.value)} /></Field></>}</div>
    <fieldset><legend className="mb-2 text-sm font-medium">New quotes</legend><div className="space-y-2">{quotes.map((quote, index) => <div key={index} className="flex gap-2"><Textarea name="quotes" value={quote} onChange={(event) => setQuotes((all) => all.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className="min-h-20" placeholder="A memorable line..." /><Button type="button" variant="ghost" size="icon" onClick={() => setQuotes((all) => all.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove quote field"><X /></Button></div>)}</div><Button type="button" variant="ghost" className="mt-2" onClick={() => setQuotes((all) => [...all, ""])}><Plus /> Add quote</Button></fieldset>
    {completed ? <><Field label="Rating"><RatingInput initial={initial?.rating ?? null} /></Field><Field label="Thoughts"><Textarea name="thoughts" defaultValue={initial?.thoughts} className="min-h-40" /></Field></> : <><input type="hidden" name="rating" value={initial?.rating ?? ""} /><input type="hidden" name="thoughts" value={initial?.thoughts ?? ""} /></>}
    <Button disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : initial ? <Save /> : <Plus />}{pending ? "Saving..." : initial ? "Update" : "Add Movie / Series"}</Button>
  </form>;
}
