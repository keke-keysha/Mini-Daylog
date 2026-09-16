import "server-only";

import { asc, desc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { bookProgressLogs, bookQuotes, books } from "@/lib/db/schema";

export async function getBooksData() {
  const [bookRows, quotes, progressLogs] = await Promise.all([
    getDb().select().from(books).orderBy(desc(books.updatedAt)),
    getDb().select().from(bookQuotes).orderBy(desc(bookQuotes.createdAt)),
    getDb().select().from(bookProgressLogs).orderBy(asc(bookProgressLogs.date), asc(bookProgressLogs.createdAt)),
  ]);
  return { books: bookRows, quotes, progressLogs };
}
