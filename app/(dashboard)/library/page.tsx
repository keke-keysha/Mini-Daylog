import Link from "next/link";
import { ArrowUpRight, BookOpen, Clapperboard } from "lucide-react";

import { Card } from "@/components/ui/card";
import { currentMonthBounds, jakartaDate } from "@/lib/date";
import { getBooksData } from "@/lib/data/books";
import { getMediaData } from "@/lib/data/media";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [bookData, mediaData] = await Promise.all([getBooksData(), getMediaData()]);
  const month = currentMonthBounds();
  const activeBooks = new Set<string>();
  bookData.books.forEach((book) => { if ((jakartaDate(book.createdAt) >= month.start && jakartaDate(book.createdAt) <= month.end) || (book.completedAt && book.completedAt >= month.start && book.completedAt <= month.end)) activeBooks.add(book.id); });
  bookData.progressLogs.forEach((log) => { if (log.date >= month.start && log.date <= month.end) activeBooks.add(log.bookId); });
  const activeMedia = new Set<string>();
  mediaData.items.forEach((item) => { if ((jakartaDate(item.createdAt) >= month.start && jakartaDate(item.createdAt) <= month.end) || (item.completedAt && item.completedAt >= month.start && item.completedAt <= month.end)) activeMedia.add(item.id); });
  mediaData.logs.forEach((log) => { if (log.date >= month.start && log.date <= month.end) activeMedia.add(log.mediaId); });
  const bookTitles = new Map(bookData.books.map((book) => [book.id, book.title]));
  const mediaTitles = new Map(mediaData.items.map((item) => [item.id, item.title]));
  const quotes = [...bookData.quotes.map((quote) => ({ id: `book-${quote.id}`, quote: quote.quote, title: bookTitles.get(quote.bookId) ?? "Book", createdAt: quote.createdAt })), ...mediaData.quotes.map((quote) => ({ id: `media-${quote.id}`, quote: quote.quote, title: mediaTitles.get(quote.mediaId) ?? "Movie / Series", createdAt: quote.createdAt }))].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return <main className="page-shell"><header className="page-header"><div><p className="eyebrow">What you read and watch</p><h1>Library</h1></div></header><div className="grid gap-4 sm:grid-cols-2"><Link href="/library/books" className="group rounded-3xl border bg-card p-6"><div className="flex items-start justify-between"><BookOpen className="size-7 text-primary" /><ArrowUpRight className="size-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div><h2 className="mt-10 text-xl font-semibold">Books</h2><p className="mt-1 text-sm text-muted-foreground">Reading progress, quotes, and thoughts.</p></Link><Link href="/library/movies" className="group rounded-3xl border bg-card p-6"><div className="flex items-start justify-between"><Clapperboard className="size-7 text-primary" /><ArrowUpRight className="size-5 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div><h2 className="mt-10 text-xl font-semibold">Movies</h2><p className="mt-1 text-sm text-muted-foreground">Movies, series, episodes, and memories.</p></Link></div><Card><h2 className="section-title">Monthly Summary</h2><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">Books this month</p><p className="mt-1 text-2xl font-semibold">{activeBooks.size}</p></div><div className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">Movies this month</p><p className="mt-1 text-2xl font-semibold">{activeMedia.size}</p></div></div></Card><Card><h2 className="section-title">Quotes</h2>{quotes.length ? <div className="max-h-[34rem] space-y-4 overflow-y-auto pr-1">{quotes.map((quote) => <blockquote key={quote.id} className="rounded-2xl bg-muted/70 p-4"><p className="whitespace-pre-wrap text-sm leading-6">“{quote.quote}”</p><footer className="mt-2 text-xs font-medium text-muted-foreground">— {quote.title}</footer></blockquote>)}</div> : <p className="text-sm text-muted-foreground">No quotes saved yet.</p>}</Card></main>;
}
