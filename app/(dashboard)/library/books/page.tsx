import { BookCollection } from "@/components/library/book-collection";
import { getBooksData } from "@/lib/data/books";

export const dynamic = "force-dynamic";

export default async function BooksPage() {
  const data = await getBooksData();
  const version = [...data.books, ...data.quotes].map((item) => `${item.id}-${item.updatedAt.getTime()}`).join("_");
  return <main className="page-shell"><header className="page-header"><div><p className="eyebrow">Stories and ideas</p><h1>Books</h1></div></header>{data.books.length === 0 && <p className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">No books yet. Add your first book.</p>}<BookCollection key={version} books={data.books.map((book) => ({ id: book.id, title: book.title, author: book.author, genre: book.genre, ownership: book.ownership, coverAssetId: book.coverAssetId, totalPages: book.totalPages, currentPage: book.currentPage, rating: book.rating, thoughts: book.thoughts, startedAt: book.startedAt, completedAt: book.completedAt }))} quotes={data.quotes.map((quote) => ({ id: quote.id, bookId: quote.bookId, quote: quote.quote }))} logs={data.progressLogs.map((log) => ({ bookId: log.bookId, date: log.date, pagesDelta: log.pagesDelta }))} /></main>;
}
