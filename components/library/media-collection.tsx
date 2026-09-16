"use client";

import Image from "next/image";
import { Clapperboard, Plus, Quote, Sparkles } from "lucide-react";
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

type QuoteItem = { id: string; mediaId: string; quote: string };
type Log = { mediaId: string; date: string; episodeDelta: number };

export function MediaCollection({ items, quotes, logs }: { items: MediaItem[]; quotes: QuoteItem[]; logs: Log[] }) {
  const router = useRouter();
  async function removeItem(id: string) { const result = await deleteMedia(id); if (result.ok) { toast.success("Media deleted"); router.refresh(); } else toast.error(result.error); }
  async function saveQuote(id: string, quote: string) { const result = await updateMediaQuote(id, quote); if (result.ok) { toast.success("Quote updated"); router.refresh(); } else toast.error(result.error); }
  async function removeQuote(id: string) { const result = await deleteMediaQuote(id); if (result.ok) { toast.success("Quote deleted"); router.refresh(); } else toast.error(result.error); }

  return (
    <div className="book-grid">
      {items.map((item) => {
        const progress = item.category === "MOVIE" ? 100 : ((item.watchedEpisodes ?? 0) / (item.totalEpisodes ?? 1)) * 100;
        const itemQuotes = quotes.filter((quote) => quote.mediaId === item.id);
        const positiveLogs = logs.filter((log) => log.mediaId === item.id && log.episodeDelta > 0);
        const activeDays = new Set(positiveLogs.map((log) => log.date)).size;
        const episodes = positiveLogs.reduce((sum, log) => sum + log.episodeDelta, 0);
        const category = item.category === "MOVIE" ? "Movie" : "Series";
        return (
          <Modal
            key={item.id}
            title={item.title}
            description={`${category} · ${Math.round(progress)}% complete`}
            contentClassName="sm:w-[min(94vw,780px)]"
            trigger={
              <button className="group overflow-hidden rounded-3xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                <div className="relative aspect-[2/3] overflow-hidden rounded-3xl bg-daylog-pink shadow-[0_12px_26px_rgba(49,44,70,0.11)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--daylog-shadow-hover)]">
                  {item.coverAssetId ? <Image src={assetUrl(item.coverAssetId)!} alt={`Cover of ${item.title}`} fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover" unoptimized /> : <div className="relative grid h-full place-items-center"><span className="absolute -right-8 -top-8 size-28 rounded-full bg-white/30" aria-hidden="true" /><Clapperboard className="size-11 text-daylog-pink-ink/55" /></div>}
                  <span className="absolute left-3 top-3 rounded-full bg-background/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-foreground shadow-sm backdrop-blur">{category}</span>
                </div>
                <h2 className="mt-3 line-clamp-2 min-h-10 text-sm font-bold leading-5">{item.title}</h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.genre} · {category}</p>
                <Progress value={progress} className="mt-3 h-2 bg-daylog-pink/65" indicatorClassName="bg-daylog-pink-strong" />
                <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{item.category === "MOVIE" ? "Watched" : `${item.watchedEpisodes} / ${item.totalEpisodes} episodes`}</p>
              </button>
            }
          >
            <div className="space-y-5">
              {item.completedAt && <section className="rounded-3xl bg-daylog-mint/60 p-4 sm:p-5"><div className="flex items-center gap-2"><Sparkles className="size-5 text-daylog-mint-ink" /><h3 className="font-display text-lg font-semibold">Watch Analysis</h3></div><div className="mt-4 rounded-2xl bg-white/50 p-3 text-sm dark:bg-black/10"><p className="font-bold">Completed in {differenceInDays(item.startedAt, item.completedAt)} days</p>{item.category === "SERIES" && <p className="mt-1 text-muted-foreground">Average {activeDays ? (episodes / activeDays).toFixed(1) : "0"} episodes / active day</p>}</div>{item.documentationAssetId && <div className="relative mt-4 aspect-video overflow-hidden rounded-2xl"><Image src={assetUrl(item.documentationAssetId)!} alt={`Documentation for ${item.title}`} fill sizes="700px" className="object-cover" unoptimized /></div>}</section>}
              <MediaForm initial={item} />
              <section className="rounded-3xl bg-daylog-peach/45 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2"><Quote className="size-5 text-daylog-peach-ink" /><h3 className="font-display text-lg font-semibold">Saved Quotes</h3></div>
                <div className="space-y-3">
                  {itemQuotes.map((quote) => <form key={quote.id} className="grid gap-2 rounded-2xl bg-white/50 p-3 sm:grid-cols-[1fr_auto_auto] dark:bg-black/10" noValidate onSubmit={(event) => { event.preventDefault(); void saveQuote(quote.id, new FormData(event.currentTarget).get("quote")?.toString() ?? ""); }}><Input name="quote" defaultValue={quote.quote} /><Button>Save</Button><ConfirmButton title="Delete quote?" description="The movie or series will remain." action={() => removeQuote(quote.id)} /></form>)}
                  {itemQuotes.length === 0 && <p className="rounded-2xl bg-white/40 p-5 text-center text-sm text-muted-foreground dark:bg-black/10">No quotes saved yet.</p>}
                </div>
              </section>
              <ConfirmButton title="Delete media?" description="This deletes the item, images, quotes, and progress permanently." action={() => removeItem(item.id)} />
            </div>
          </Modal>
        );
      })}
      <Modal title="Add Movie / Series" description="Record something you watched or are currently watching." contentClassName="sm:w-[min(94vw,780px)]" trigger={<button className="group flex aspect-[2/3] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-daylog-pink-strong bg-daylog-pink/40 p-4 text-center text-sm font-bold text-muted-foreground transition duration-200 hover:-translate-y-1 hover:bg-daylog-pink/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><span className="grid size-12 place-items-center rounded-2xl bg-daylog-pink-strong text-daylog-pink-ink transition group-hover:scale-105"><Plus className="size-6" /></span><span className="font-display text-base">Add Movie / Series</span></button>}><MediaForm /></Modal>
    </div>
  );
}
