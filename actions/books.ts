"use server";

import { randomUUID } from "node:crypto";

import type { BatchItem } from "drizzle-orm/batch";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import type { MutationResult } from "@/actions/daily";
import { deleteAsset, imageErrorMessage, persistImage } from "@/lib/assets";
import { requireSession } from "@/lib/auth";
import { todayJakarta } from "@/lib/date";
import { getDb } from "@/lib/db";
import { bookProgressLogs, bookQuotes, books } from "@/lib/db/schema";
import { idSchema } from "@/lib/validations/daily";
import { bookSchema, quoteSchema } from "@/lib/validations/book";

function refreshBooks() {
  revalidatePath("/");
  revalidatePath("/library");
  revalidatePath("/library/books");
}

function parseBook(formData: FormData) {
  return bookSchema.safeParse({
    title: formData.get("title"),
    author: formData.get("author"),
    genre: formData.get("genre"),
    ownership: formData.get("ownership") ?? "",
    totalPages: formData.get("totalPages"),
    currentPage: formData.get("currentPage"),
    rating: formData.get("rating") ?? "",
    thoughts: formData.get("thoughts") ?? "",
  });
}

function parseNewQuotes(formData: FormData) {
  const quotes = formData.getAll("quotes").map(String).filter((value) => value.trim());
  const parsed = z.array(quoteSchema).max(50).safeParse(quotes);
  return parsed;
}

import { z } from "zod";

async function executeBatch(items: BatchItem<"pg">[]) {
  await getDb().batch(items as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
}

export async function createBook(formData: FormData): Promise<MutationResult> {
  await requireSession();
  const parsed = parseBook(formData);
  const quotes = parseNewQuotes(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!quotes.success) return { ok: false, error: quotes.error.issues[0].message };
  let coverAssetId: string | null = null;
  try {
    coverAssetId = await persistImage(formData.get("cover") instanceof File ? formData.get("cover") as File : null);
    const today = todayJakarta();
    const bookId = randomUUID();
    const queries: BatchItem<"pg">[] = [getDb().insert(books).values({
      id: bookId,
      ...parsed.data,
      coverAssetId,
      startedAt: today,
      completedAt: parsed.data.currentPage === parsed.data.totalPages ? today : null,
    })];
    if (quotes.data.length) queries.push(getDb().insert(bookQuotes).values(quotes.data.map((quote) => ({ bookId, quote }))));
    if (parsed.data.currentPage > 0) queries.push(getDb().insert(bookProgressLogs).values({ bookId, date: today, previousPage: 0, newPage: parsed.data.currentPage, pagesDelta: parsed.data.currentPage }));
    await executeBatch(queries);
    refreshBooks();
    return { ok: true };
  } catch (error) {
    console.error("Failed to create book", error);
    await deleteAsset(coverAssetId).catch(() => undefined);
    return { ok: false, error: imageErrorMessage(error) };
  }
}

export async function updateBook(idInput: string, formData: FormData): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  const parsed = parseBook(formData);
  const quotes = parseNewQuotes(formData);
  if (!id.success || !parsed.success || !quotes.success) return { ok: false, error: !parsed.success ? parsed.error.issues[0].message : !quotes.success ? quotes.error.issues[0].message : "Invalid book" };
  const [existing] = await getDb().select().from(books).where(eq(books.id, id.data)).limit(1);
  if (!existing) return { ok: false, error: "Book not found" };
  let newCoverId: string | null = null;
  try {
    newCoverId = await persistImage(formData.get("cover") instanceof File ? formData.get("cover") as File : null);
    const today = todayJakarta();
    const queries: BatchItem<"pg">[] = [getDb().update(books).set({
      ...parsed.data,
      coverAssetId: newCoverId ?? existing.coverAssetId,
      completedAt: existing.completedAt ?? (parsed.data.currentPage === parsed.data.totalPages ? today : null),
      updatedAt: new Date(),
    }).where(eq(books.id, id.data))];
    if (existing.currentPage !== parsed.data.currentPage) queries.push(getDb().insert(bookProgressLogs).values({
      bookId: id.data,
      date: today,
      previousPage: existing.currentPage,
      newPage: parsed.data.currentPage,
      pagesDelta: parsed.data.currentPage - existing.currentPage,
    }));
    if (quotes.data.length) queries.push(getDb().insert(bookQuotes).values(quotes.data.map((quote) => ({ bookId: id.data, quote }))));
    await executeBatch(queries);
    if (newCoverId) await deleteAsset(existing.coverAssetId).catch((error) => console.error("Failed to remove replaced book cover", error));
    refreshBooks();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update book", error);
    await deleteAsset(newCoverId).catch(() => undefined);
    return { ok: false, error: imageErrorMessage(error) };
  }
}

export async function deleteBook(idInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid book" };
  try {
    const [book] = await getDb().select({ coverAssetId: books.coverAssetId }).from(books).where(eq(books.id, id.data)).limit(1);
    await getDb().delete(books).where(eq(books.id, id.data));
    await deleteAsset(book?.coverAssetId).catch((error) => console.error("Failed to remove deleted book cover", error));
    refreshBooks();
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete book", error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function createBookQuote(bookIdInput: string, quoteInput: string): Promise<MutationResult> {
  await requireSession();
  const bookId = idSchema.safeParse(bookIdInput);
  const quote = quoteSchema.safeParse(quoteInput);
  if (!bookId.success || !quote.success) return { ok: false, error: quote.success ? "Invalid book" : quote.error.issues[0].message };
  try { await getDb().insert(bookQuotes).values({ bookId: bookId.data, quote: quote.data }); refreshBooks(); return { ok: true }; }
  catch (error) { console.error("Failed to create book quote", error); return { ok: false, error: "Something went wrong" }; }
}

export async function updateBookQuote(idInput: string, quoteInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  const quote = quoteSchema.safeParse(quoteInput);
  if (!id.success || !quote.success) return { ok: false, error: quote.success ? "Invalid quote" : quote.error.issues[0].message };
  try { await getDb().update(bookQuotes).set({ quote: quote.data, updatedAt: new Date() }).where(eq(bookQuotes.id, id.data)); refreshBooks(); return { ok: true }; }
  catch (error) { console.error("Failed to update book quote", error); return { ok: false, error: "Something went wrong" }; }
}

export async function deleteBookQuote(idInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid quote" };
  try { await getDb().delete(bookQuotes).where(eq(bookQuotes.id, id.data)); refreshBooks(); return { ok: true }; }
  catch (error) { console.error("Failed to delete book quote", error); return { ok: false, error: "Something went wrong" }; }
}
