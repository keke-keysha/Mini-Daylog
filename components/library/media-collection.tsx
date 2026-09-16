"use client";

import Image from "next/image";
import { Clapperboard, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteMedia, deleteMediaQuote, updateMediaQuote } from "@/actions/media";
import { MediaForm, type MediaItem } from "@/components/library/media-form";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { assetUrl } from "@/lib/asset-url";
import { differenceInDays } from "@/lib/date";

type Quote = { id: string; mediaId: string; quote: string };
type Log = { mediaId: string; date: string; episodeDelta: number };

export function MediaCollection({ items, quotes, logs }: { items: MediaItem[]; quotes: Quote[]; logs: Log[] }) {
  const router = useRouter();
  async function removeItem(id: string) { const result = await deleteMedia(id); if (result.ok) { toast.success("Media deleted"); router.refresh(); } else toast.error(result.error); }
  async function saveQuote(id: string, quote: string) { const result = await updateMediaQuote(id, quote); if (result.ok) { toast.success("Quote updated"); router.refresh(); } else toast.error(result.error); }
  async function removeQuote(id: string) { const result = await deleteMediaQuote(id); if (result.ok) { toast.success("Quote deleted"); router.refresh(); } else toast.error(result.error); }
  return <div className="book-grid">{items.map((item) => {
    const progress = item.category === "MOVIE" ? 100 : ((item.watchedEpisodes ?? 0) / (item.totalEpisodes ?? 1)) * 100; const itemQuotes = quotes.filter((quote) => quote.mediaId === item.id); const positiveLogs = logs.filter((log) => log.mediaId === item.id && log.episodeDelta > 0); const activeDays = new Set(positiveLogs.map((log) => log.date)).size; const episodes = positiveLogs.reduce((sum, log) => sum + log.episodeDelta, 0);
    return <Modal key={item.id} title={item.title} description={`${item.category === "MOVIE" ? "Movie" : "Series"} · ${Math.round(progress)}% complete`} contentClassName="sm:w-[min(94vw,780px)]" trigger={<button className="overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted">{item.coverAssetId ? <Image src={assetUrl(item.coverAssetId)!} alt={`Cover of ${item.title}`} fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover" unoptimized /> : <div className="grid h-full place-items-center"><Clapperboard className="size-10 text-muted-foreground/50" /></div>}</div><h2 className="mt-3 truncate text-sm font-semibold">{item.title}</h2><p className="truncate text-xs text-muted-foreground">{item.genre} · {item.category === "MOVIE" ? "Movie" : "Series"}</p><Progress value={progress} className="mt-2" /><p className="mt-1 text-[11px] text-muted-foreground">{item.category === "MOVIE" ? "Watched" : `${item.watchedEpisodes} / ${item.totalEpisodes} episodes`}</p></button>}>
      <div className="space-y-7">{item.completedAt && <section className="rounded-2xl bg-muted p-4"><h3 className="font-semibold">Watch Analysis</h3><p className="mt-2 text-sm">Completed in {differenceInDays(item.startedAt, item.completedAt)} days</p>{item.category === "SERIES" && <p className="mt-1 text-sm text-muted-foreground">Average {activeDays ? (episodes / activeDays).toFixed(1) : "0"} episodes / active day</p>}{item.documentationAssetId && <div className="relative mt-4 aspect-video overflow-hidden rounded-xl"><Image src={assetUrl(item.documentationAssetId)!} alt={`Documentation for ${item.title}`} fill sizes="700px" className="object-cover" unoptimized /></div>}</section>}<MediaForm initial={item} /><section><h3 className="mb-3 font-semibold">Saved Quotes</h3><div className="space-y-3">{itemQuotes.map((quote) => <form key={quote.id} className="flex gap-2" noValidate onSubmit={(event) => { event.preventDefault(); void saveQuote(quote.id, new FormData(event.currentTarget).get("quote")?.toString() ?? ""); }}><Input name="quote" defaultValue={quote.quote} /><Button>Save</Button><ConfirmButton title="Delete quote?" description="The movie or series will remain." action={() => removeQuote(quote.id)} /></form>)}{itemQuotes.length === 0 && <p className="text-sm text-muted-foreground">No quotes saved yet.</p>}</div></section><ConfirmButton title="Delete media?" description="This deletes the item, images, quotes, and progress permanently." action={() => removeItem(item.id)} /></div>
    </Modal>;
  })}<Modal title="Add Movie / Series" description="Record something you watched or are currently watching." contentClassName="sm:w-[min(94vw,780px)]" trigger={<button className="flex aspect-[2/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"><Plus className="size-7" /> Add Movie / Series</button>}><MediaForm /></Modal></div>;
}
