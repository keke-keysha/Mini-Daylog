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
import { media, mediaProgressLogs, mediaQuotes } from "@/lib/db/schema";
import { quoteSchema } from "@/lib/validations/book";
import { idSchema } from "@/lib/validations/daily";
import { mediaSchema } from "@/lib/validations/media";

function refreshMedia() { revalidatePath("/"); revalidatePath("/library"); revalidatePath("/library/movies"); }

function parseMedia(formData: FormData) {
  return mediaSchema.safeParse({
    title: formData.get("title"), genre: formData.get("genre"), category: formData.get("category"), country: formData.get("country"), recommendedBy: formData.get("recommendedBy") ?? "", totalEpisodes: formData.get("totalEpisodes") ?? "", watchedEpisodes: formData.get("watchedEpisodes") ?? "", rating: formData.get("rating") ?? "", thoughts: formData.get("thoughts") ?? "",
  });
}

function parseQuotes(formData: FormData) {
  const values = formData.getAll("quotes").map(String).filter((value) => value.trim());
  if (values.length > 50) return { success: false as const, error: "A maximum of 50 quotes can be added at once" };
  for (const value of values) { const result = quoteSchema.safeParse(value); if (!result.success) return { success: false as const, error: result.error.issues[0].message }; }
  return { success: true as const, data: values };
}

function inputFile(formData: FormData, name: string) { const value = formData.get(name); return value instanceof File ? value : null; }

async function executeBatch(items: BatchItem<"pg">[]) {
  await getDb().batch(items as [BatchItem<"pg">, ...BatchItem<"pg">[]]);
}

export async function createMedia(formData: FormData): Promise<MutationResult> {
  await requireSession();
  const parsed = parseMedia(formData); const quotes = parseQuotes(formData);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  if (!quotes.success) return { ok: false, error: quotes.error };
  let coverAssetId: string | null = null; let documentationAssetId: string | null = null;
  try {
    coverAssetId = await persistImage(inputFile(formData, "cover"));
    documentationAssetId = await persistImage(inputFile(formData, "documentation"));
    const today = todayJakarta();
    const completed = parsed.data.category === "MOVIE" || parsed.data.watchedEpisodes === parsed.data.totalEpisodes;
    const mediaId = randomUUID();
    const queries: BatchItem<"pg">[] = [getDb().insert(media).values({ id: mediaId, ...parsed.data, coverAssetId, documentationAssetId, startedAt: today, completedAt: completed ? today : null })];
    if (quotes.data.length) queries.push(getDb().insert(mediaQuotes).values(quotes.data.map((quote) => ({ mediaId, quote }))));
    if (parsed.data.category === "SERIES" && (parsed.data.watchedEpisodes ?? 0) > 0) queries.push(getDb().insert(mediaProgressLogs).values({ mediaId, date: today, previousEpisodes: 0, newEpisodes: parsed.data.watchedEpisodes ?? 0, episodeDelta: parsed.data.watchedEpisodes ?? 0 }));
    await executeBatch(queries);
    refreshMedia(); return { ok: true };
  } catch (error) {
    console.error("Failed to create media", error); await Promise.all([deleteAsset(coverAssetId).catch(() => undefined), deleteAsset(documentationAssetId).catch(() => undefined)]);
    return { ok: false, error: imageErrorMessage(error) };
  }
}

export async function updateMedia(idInput: string, formData: FormData): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput); const parsed = parseMedia(formData); const quotes = parseQuotes(formData);
  if (!id.success || !parsed.success) return { ok: false, error: parsed.success ? "Invalid media" : parsed.error.issues[0].message };
  if (!quotes.success) return { ok: false, error: quotes.error };
  const [existing] = await getDb().select().from(media).where(eq(media.id, id.data)).limit(1);
  if (!existing) return { ok: false, error: "Media not found" };
  let coverAssetId: string | null = null; let documentationAssetId: string | null = null;
  try {
    coverAssetId = await persistImage(inputFile(formData, "cover")); documentationAssetId = await persistImage(inputFile(formData, "documentation"));
    const today = todayJakarta(); const completed = parsed.data.category === "MOVIE" || parsed.data.watchedEpisodes === parsed.data.totalEpisodes;
    const queries: BatchItem<"pg">[] = [getDb().update(media).set({ ...parsed.data, coverAssetId: coverAssetId ?? existing.coverAssetId, documentationAssetId: documentationAssetId ?? existing.documentationAssetId, completedAt: existing.completedAt ?? (completed ? today : null), updatedAt: new Date() }).where(eq(media.id, id.data))];
    if (parsed.data.category === "SERIES" && existing.watchedEpisodes !== parsed.data.watchedEpisodes) queries.push(getDb().insert(mediaProgressLogs).values({ mediaId: id.data, date: today, previousEpisodes: existing.watchedEpisodes ?? 0, newEpisodes: parsed.data.watchedEpisodes ?? 0, episodeDelta: (parsed.data.watchedEpisodes ?? 0) - (existing.watchedEpisodes ?? 0) }));
    if (quotes.data.length) queries.push(getDb().insert(mediaQuotes).values(quotes.data.map((quote) => ({ mediaId: id.data, quote }))));
    await executeBatch(queries);
    await Promise.all([
      coverAssetId ? deleteAsset(existing.coverAssetId).catch((error) => console.error("Failed to remove replaced media cover", error)) : Promise.resolve(),
      documentationAssetId ? deleteAsset(existing.documentationAssetId).catch((error) => console.error("Failed to remove replaced media documentation", error)) : Promise.resolve(),
    ]);
    refreshMedia(); return { ok: true };
  } catch (error) {
    console.error("Failed to update media", error); await Promise.all([deleteAsset(coverAssetId).catch(() => undefined), deleteAsset(documentationAssetId).catch(() => undefined)]);
    return { ok: false, error: imageErrorMessage(error) };
  }
}

export async function deleteMedia(idInput: string): Promise<MutationResult> {
  await requireSession(); const id = idSchema.safeParse(idInput); if (!id.success) return { ok: false, error: "Invalid media" };
  try { const [item] = await getDb().select({ coverAssetId: media.coverAssetId, documentationAssetId: media.documentationAssetId }).from(media).where(eq(media.id, id.data)).limit(1); await getDb().delete(media).where(eq(media.id, id.data)); await Promise.all([deleteAsset(item?.coverAssetId).catch((error) => console.error("Failed to remove deleted media cover", error)), deleteAsset(item?.documentationAssetId).catch((error) => console.error("Failed to remove deleted media documentation", error))]); refreshMedia(); return { ok: true }; }
  catch (error) { console.error("Failed to delete media", error); return { ok: false, error: "Something went wrong" }; }
}

export async function updateMediaQuote(idInput: string, quoteInput: string): Promise<MutationResult> {
  await requireSession(); const id = idSchema.safeParse(idInput); const quote = quoteSchema.safeParse(quoteInput); if (!id.success || !quote.success) return { ok: false, error: quote.success ? "Invalid quote" : quote.error.issues[0].message };
  try { await getDb().update(mediaQuotes).set({ quote: quote.data, updatedAt: new Date() }).where(eq(mediaQuotes.id, id.data)); refreshMedia(); return { ok: true }; } catch (error) { console.error("Failed to update media quote", error); return { ok: false, error: "Something went wrong" }; }
}

export async function deleteMediaQuote(idInput: string): Promise<MutationResult> {
  await requireSession(); const id = idSchema.safeParse(idInput); if (!id.success) return { ok: false, error: "Invalid quote" };
  try { await getDb().delete(mediaQuotes).where(eq(mediaQuotes.id, id.data)); refreshMedia(); return { ok: true }; } catch (error) { console.error("Failed to delete media quote", error); return { ok: false, error: "Something went wrong" }; }
}
