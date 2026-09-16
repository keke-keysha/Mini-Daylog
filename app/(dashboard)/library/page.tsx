import Link from "next/link";
import { ArrowUpRight, BookOpen, Clapperboard, Clock3, LibraryBig, Quote } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState, MetricCard, PageHeading, PastelIcon } from "@/components/ui/presentation";
import { currentMonthBounds, jakartaDate } from "@/lib/date";
import { getBooksData } from "@/lib/data/books";
import { getMediaData } from "@/lib/data/media";

export const dynamic = "force-dynamic";

export default async function LibraryPage() {
  const [bookData, mediaData] = await Promise.all([getBooksData(), getMediaData()]);
  const month = currentMonthBounds();
  const activeBooks = new Set<string>();
  bookData.books.forEach((book) => {
    if ((jakartaDate(book.createdAt) >= month.start && jakartaDate(book.createdAt) <= month.end) || (book.completedAt && book.completedAt >= month.start && book.completedAt <= month.end)) activeBooks.add(book.id);
  });
  bookData.progressLogs.forEach((log) => {
    if (log.date >= month.start && log.date <= month.end) activeBooks.add(log.bookId);
  });
  const activeMedia = new Set<string>();
  mediaData.items.forEach((item) => {
    if ((jakartaDate(item.createdAt) >= month.start && jakartaDate(item.createdAt) <= month.end) || (item.completedAt && item.completedAt >= month.start && item.completedAt <= month.end)) activeMedia.add(item.id);
  });
  mediaData.logs.forEach((log) => {
    if (log.date >= month.start && log.date <= month.end) activeMedia.add(log.mediaId);
  });
  const bookTitles = new Map(bookData.books.map((book) => [book.id, book.title]));
  const mediaTitles = new Map(mediaData.items.map((item) => [item.id, item.title]));
  const quotes = [
    ...bookData.quotes.map((quote) => ({ id: `book-${quote.id}`, quote: quote.quote, title: bookTitles.get(quote.bookId) ?? "Book", createdAt: quote.createdAt })),
    ...mediaData.quotes.map((quote) => ({ id: `media-${quote.id}`, quote: quote.quote, title: mediaTitles.get(quote.mediaId) ?? "Movie / Series", createdAt: quote.createdAt })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <main className="page-shell">
      <PageHeading eyebrow="What you read and watch" title="Library" description="Your little collection of stories, ideas, and memorable moments." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/library/books" className="group relative min-h-56 overflow-hidden rounded-[var(--daylog-radius-card)] bg-daylog-lavender p-6 text-daylog-lavender-ink shadow-[var(--daylog-shadow)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--daylog-shadow-hover)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          <span className="pointer-events-none absolute -bottom-10 -right-8 size-40 rounded-full bg-white/30" aria-hidden="true" />
          <div className="relative flex items-start justify-between"><PastelIcon icon={BookOpen} tone="lavender" className="bg-daylog-lavender-strong" /><ArrowUpRight className="size-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
          <div className="relative mt-12"><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-65">{bookData.books.length} titles</p><h2 className="mt-1 font-display text-2xl font-semibold">Books</h2><p className="mt-1 max-w-xs text-sm opacity-75">Reading progress, quotes, and thoughts.</p></div>
        </Link>
        <Link href="/library/movies" className="group relative min-h-56 overflow-hidden rounded-[var(--daylog-radius-card)] bg-daylog-pink p-6 text-daylog-pink-ink shadow-[var(--daylog-shadow)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[var(--daylog-shadow-hover)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
          <span className="pointer-events-none absolute -bottom-8 -right-6 size-36 rounded-full bg-white/30" aria-hidden="true" />
          <div className="relative flex items-start justify-between"><PastelIcon icon={Clapperboard} tone="pink" className="bg-daylog-pink-strong" /><ArrowUpRight className="size-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></div>
          <div className="relative mt-12"><p className="text-xs font-bold uppercase tracking-[0.16em] opacity-65">{mediaData.items.length} titles</p><h2 className="mt-1 font-display text-2xl font-semibold">Movies</h2><p className="mt-1 max-w-xs text-sm opacity-75">Movies, series, episodes, and memories.</p></div>
        </Link>
      </div>
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="bento-mint border-0 xl:col-span-4">
          <div className="mb-5 flex items-center gap-3"><PastelIcon icon={Clock3} tone="mint" className="bg-daylog-mint-strong" /><div><p className="eyebrow">This month</p><h2 className="section-title mb-0">Monthly Summary</h2></div></div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
            <MetricCard icon={BookOpen} value={String(activeBooks.size)} label="Books this month" tone="lavender" />
            <MetricCard icon={Clapperboard} value={String(activeMedia.size)} label="Movies this month" tone="pink" />
          </div>
        </Card>
        <Card className="bento-peach min-w-0 border-0 xl:col-span-8">
          <div className="mb-5 flex items-center gap-3"><PastelIcon icon={Quote} tone="peach" className="bg-daylog-peach-strong" /><div><p className="eyebrow">Words worth keeping</p><h2 className="section-title mb-0">Quotes</h2></div></div>
          {quotes.length ? (
            <div className="max-h-[34rem] space-y-3 overflow-y-auto pr-1">
              {quotes.map((quote, index) => (
                <blockquote key={quote.id} className={index % 2 === 0 ? "rounded-3xl bg-white/55 p-5 dark:bg-black/10" : "rounded-3xl bg-daylog-lavender/50 p-5"}>
                  <Quote className="mb-3 size-5 text-daylog-peach-ink opacity-55" aria-hidden="true" />
                  <p className="whitespace-pre-wrap text-sm font-semibold leading-6">“{quote.quote}”</p>
                  <footer className="mt-3 text-xs font-bold text-muted-foreground">— {quote.title}</footer>
                </blockquote>
              ))}
            </div>
          ) : <EmptyState icon={LibraryBig} title="No quotes saved yet" description="Memorable lines from your books and movies will gather here." tone="peach" />}
        </Card>
      </div>
    </main>
  );
}
