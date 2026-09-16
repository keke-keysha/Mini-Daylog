import { BookCollection } from "@/components/library/book-collection";
import { PageHeading } from "@/components/ui/presentation";
import { getBooksData } from "@/lib/data/books";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const data = await getBooksData();
  const version = [...data.books, ...data.quotes].map((item) => `${item.id}-${item.updatedAt.getTime()}`).join("_");
  return <main className="page-shell"><PageHeading eyebrow="Stories and ideas" title="Books" description="A cozy shelf for everything you are reading." /><BookCollection key={version} books={data.books.map((book) => ({ id: book.id, title: book.title, author: book.author, genre: book.genre, ownership: book.ownership, coverAssetId: book.coverAssetId, totalPages: book.totalPages, currentPage: book.currentPage, rating: book.rating, thoughts: book.thoughts, startedAt: book.startedAt, completedAt: book.completedAt }))} quotes={data.quotes.map((quote) => ({ id: quote.id, bookId: quote.bookId, quote: quote.quote }))} logs={data.progressLogs.map((log) => ({ bookId: log.bookId, date: log.date, pagesDelta: log.pagesDelta }))} /></main>;
}
