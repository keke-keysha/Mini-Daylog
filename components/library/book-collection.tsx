"use client";

import Image from "next/image";
import { BookOpen, Plus } from "lucide-react";
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

type Quote = { id: string; bookId: string; quote: string };
type Log = { bookId: string; date: string; pagesDelta: number };

export function BookCollection({ books, quotes, logs }: { books: Book[]; quotes: Quote[]; logs: Log[] }) {
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
        return <Modal key={book.id} title={book.title} description={`${book.author} · ${Math.round(progress)}% complete`} contentClassName="sm:w-[min(94vw,780px)]" trigger={<button className="overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40"><div className="relative aspect-[2/3] overflow-hidden rounded-2xl bg-muted">{book.coverAssetId ? <Image src={assetUrl(book.coverAssetId)!} alt={`Cover of ${book.title}`} fill sizes="(max-width: 640px) 45vw, 220px" className="object-cover" unoptimized /> : <div className="grid h-full place-items-center"><BookOpen className="size-10 text-muted-foreground/50" /></div>}</div><h2 className="mt-3 truncate text-sm font-semibold">{book.title}</h2><p className="truncate text-xs text-muted-foreground">{book.author}</p><Progress value={progress} className="mt-2" /><p className="mt-1 text-[11px] text-muted-foreground">{book.currentPage} / {book.totalPages}</p></button>}>
          <div className="space-y-7">
            {book.completedAt && <section className="rounded-2xl bg-muted p-4"><h3 className="font-semibold">Reading Analysis</h3><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-xs text-muted-foreground">Reading duration</p><p className="font-semibold">Finished in {differenceInDays(book.startedAt, book.completedAt)} days</p></div><div><p className="text-xs text-muted-foreground">Average</p><p className="font-semibold">{chart.length ? Math.round(totalPositive / chart.length) : 0} pages/day</p></div></div><BookProgressChart data={chart} /></section>}
            <BookForm initial={book} />
            <section><h3 className="mb-3 font-semibold">Saved Quotes</h3><div className="space-y-3">{bookQuotes.map((quote) => <form key={quote.id} className="flex gap-2" onSubmit={(event) => { event.preventDefault(); void saveQuote(quote.id, new FormData(event.currentTarget).get("quote")?.toString() ?? ""); }} noValidate><Input name="quote" defaultValue={quote.quote} /><Button type="submit">Save</Button><ConfirmButton label="Delete" title="Delete quote?" description="The book will remain in your library." action={() => removeQuote(quote.id)} /></form>)}{bookQuotes.length === 0 && <p className="text-sm text-muted-foreground">No quotes saved yet.</p>}</div></section>
            <ConfirmButton title="Delete book?" description="This deletes the book, cover, quotes, and reading progress permanently." action={() => removeBook(book)} />
          </div>
        </Modal>;
      })}
      <Modal title="Add Book" description="Start or record a book in your personal library." contentClassName="sm:w-[min(94vw,780px)]" trigger={<button className="flex aspect-[2/3] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"><Plus className="size-7" /> Add Book</button>}><BookForm /></Modal>
    </div>
  );
}
