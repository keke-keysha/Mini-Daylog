"use client";

import Image from "next/image";
import { BookOpen, Plus, Quote, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteBook, deleteBookQuote, updateBookQuote } from "@/actions/books";
import { BookForm, type Book } from "@/components/library/book-form";
import { BookProgressChart } from "@/components/library/book-progress-chart";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { assetUrl } from "@/lib/asset-url";
import { differenceInDays } from "@/lib/date";

type QuoteItem = { id: string; bookId: string; quote: string };
type Log = { bookId: string; date: string; pagesDelta: number };

export function BookCollection({ books, quotes, logs }: { books: Book[]; quotes: QuoteItem[]; logs: Log[] }) {
  const router = useRouter();
  async function removeBook(book: Book) { const result = await deleteBook(book.id); if (result.ok) { toast.success("Book deleted"); router.refresh(); } else toast.error(result.error); }
  async function saveQuote(id: string, value: string) { const result = await updateBookQuote(id, value); if (result.ok) { toast.success("Quote updated"); router.refresh(); } else toast.error(result.error); }
  async function removeQuote(id: string) { const result = await deleteBookQuote(id); if (result.ok) { toast.success("Quote deleted"); router.refresh(); } else toast.error(result.error); }

  return (
    <div className="book-grid">
      {books.map((book) => {
        const progress = (book.currentPage / book.totalPages) * 100;
        const bookQuotes = quotes.filter((quote) => quote.bookId === book.id);
        const aggregate = new Map<string, number>();
        logs.filter((log) => log.bookId === book.id && log.pagesDelta > 0).forEach((log) => aggregate.set(log.date, (aggregate.get(log.date) ?? 0) + log.pagesDelta));
        const chart = [...aggregate].map(([date, pages]) => ({ date, pages }));
        const totalPositive = chart.reduce((sum, item) => sum + item.pages, 0);
        return (
          <Modal
            key={book.id}
            title={book.title}
            description={`${book.author} · ${Math.round(progress)}% complete`}
            contentClassName="sm:w-[min(94vw,780px)]"
            trigger={
              <button className="group overflow-hidden rounded-3xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                <div className="relative aspect-[2/3] overflow-hidden rounded-3xl bg-daylog-lavender shadow-[0_12px_26px_rgba(49,44,70,0.11)] transition duration-200 group-hover:-translate-y-1 group-hover:shadow-[var(--daylog-shadow-hover)]">
                  {book.coverAssetId ? <Image src={assetUrl(book.coverAssetId)!} alt={`Cover of ${book.title}`} fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover" unoptimized /> : <div className="relative grid h-full place-items-center"><span className="absolute -right-8 -top-8 size-28 rounded-full bg-white/30" aria-hidden="true" /><BookOpen className="size-11 text-daylog-lavender-ink/55" /></div>}
                </div>
                <h2 className="mt-3 line-clamp-2 min-h-10 text-sm font-bold leading-5">{book.title}</h2>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{book.author}</p>
                <Progress value={progress} className="mt-3 h-2 bg-daylog-lavender/65" indicatorClassName="bg-daylog-lavender-strong" />
                <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{book.currentPage} / {book.totalPages} pages</p>
              </button>
            }
          >
            <div className="space-y-5">
              {book.completedAt && <section className="rounded-3xl bg-daylog-mint/60 p-4 sm:p-5"><div className="flex items-center gap-2"><Sparkles className="size-5 text-daylog-mint-ink" /><h3 className="font-display text-lg font-semibold">Reading Analysis</h3></div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-2xl bg-white/50 p-3 dark:bg-black/10"><p className="text-xs text-muted-foreground">Reading duration</p><p className="mt-1 font-bold">Finished in {differenceInDays(book.startedAt, book.completedAt)} days</p></div><div className="rounded-2xl bg-white/50 p-3 dark:bg-black/10"><p className="text-xs text-muted-foreground">Average</p><p className="mt-1 font-bold">{chart.length ? Math.round(totalPositive / chart.length) : 0} pages/day</p></div></div><BookProgressChart data={chart} /></section>}
              <BookForm initial={book} />
              <section className="rounded-3xl bg-daylog-pink/45 p-4 sm:p-5">
                <div className="mb-3 flex items-center gap-2"><Quote className="size-5 text-daylog-pink-ink" /><h3 className="font-display text-lg font-semibold">Saved Quotes</h3></div>
                <div className="space-y-3">
                  {bookQuotes.map((quote) => <form key={quote.id} className="grid gap-2 rounded-2xl bg-white/50 p-3 sm:grid-cols-[1fr_auto_auto] dark:bg-black/10" onSubmit={(event) => { event.preventDefault(); void saveQuote(quote.id, new FormData(event.currentTarget).get("quote")?.toString() ?? ""); }} noValidate><Input name="quote" defaultValue={quote.quote} /><Button type="submit">Save</Button><ConfirmButton label="Delete" title="Delete quote?" description="The book will remain in your library." action={() => removeQuote(quote.id)} /></form>)}
                  {bookQuotes.length === 0 && <p className="rounded-2xl bg-white/40 p-5 text-center text-sm text-muted-foreground dark:bg-black/10">No quotes saved yet.</p>}
                </div>
              </section>
              <ConfirmButton title="Delete book?" description="This deletes the book, cover, quotes, and reading progress permanently." action={() => removeBook(book)} />
            </div>
          </Modal>
        );
      })}
      <Modal title="Add Book" description="Start or record a book in your personal library." contentClassName="sm:w-[min(94vw,780px)]" trigger={<button className="group flex aspect-[2/3] flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-daylog-lavender-strong bg-daylog-lavender/40 p-4 text-center text-sm font-bold text-muted-foreground transition duration-200 hover:-translate-y-1 hover:bg-daylog-lavender/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><span className="grid size-12 place-items-center rounded-2xl bg-daylog-lavender-strong text-daylog-lavender-ink transition group-hover:scale-105"><Plus className="size-6" /></span><span className="font-display text-base">Add Book</span></button>}><BookForm /></Modal>
    </div>
  );
}
