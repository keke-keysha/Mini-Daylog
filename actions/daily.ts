"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { dailyEntries, dailyTodos } from "@/lib/db/schema";
import { idSchema, journalSchema, logicalDateSchema, moodSchema, todoTextSchema } from "@/lib/validations/daily";

export type MutationResult = { ok: true } | { ok: false; error: string };

function refreshDaily() {
  revalidatePath("/");
  revalidatePath("/daily");
  revalidatePath("/daily/calendar");
}

async function ensureEntry(date: string) {
  const [entry] = await getDb()
    .insert(dailyEntries)
    .values({ date })
    .onConflictDoUpdate({ target: dailyEntries.date, set: { updatedAt: new Date() } })
    .returning({ id: dailyEntries.id });
  return entry.id;
}

export async function setMood(dateInput: string, moodInput: string): Promise<MutationResult> {
  await requireSession();
  const date = logicalDateSchema.safeParse(dateInput);
  const mood = moodSchema.safeParse(moodInput);
  if (!date.success || !mood.success) return { ok: false, error: "Invalid mood" };
  try {
    await getDb()
      .insert(dailyEntries)
      .values({ date: date.data, mood: mood.data })
      .onConflictDoUpdate({ target: dailyEntries.date, set: { mood: mood.data, updatedAt: new Date() } });
    refreshDaily();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update mood", error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function createTodo(dateInput: string, textInput: string): Promise<MutationResult> {
  await requireSession();
  const parsed = logicalDateSchema.safeParse(dateInput);
  const text = todoTextSchema.safeParse(textInput);
  if (!parsed.success || !text.success) return { ok: false, error: text.success ? "Invalid date" : text.error.issues[0].message };
  try {
    const entryId = await ensureEntry(parsed.data);
    const [position] = await getDb()
      .select({ value: sql<number>`coalesce(max(${dailyTodos.sortOrder}), -1) + 1` })
      .from(dailyTodos)
      .where(eq(dailyTodos.dailyEntryId, entryId));
    await getDb().insert(dailyTodos).values({ dailyEntryId: entryId, text: text.data, sortOrder: Number(position.value) });
    refreshDaily();
    return { ok: true };
  } catch (error) {
    console.error("Failed to create todo", error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function updateTodo(idInput: string, textInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  const text = todoTextSchema.safeParse(textInput);
  if (!id.success || !text.success) return { ok: false, error: text.success ? "Invalid todo" : text.error.issues[0].message };
  try {
    await getDb().update(dailyTodos).set({ text: text.data, updatedAt: new Date() }).where(eq(dailyTodos.id, id.data));
    refreshDaily();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update todo", error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function toggleTodo(idInput: string, completed: boolean): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid todo" };
  try {
    await getDb().update(dailyTodos).set({ isCompleted: completed, updatedAt: new Date() }).where(eq(dailyTodos.id, id.data));
    refreshDaily();
    return { ok: true };
  } catch (error) {
    console.error("Failed to toggle todo", error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function deleteTodo(idInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid todo" };
  try {
    await getDb().delete(dailyTodos).where(and(eq(dailyTodos.id, id.data)));
    refreshDaily();
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete todo", error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function saveJournal(dateInput: string, journalInput: string): Promise<MutationResult> {
  await requireSession();
  const date = logicalDateSchema.safeParse(dateInput);
  const journal = journalSchema.safeParse(journalInput);
  if (!date.success || !journal.success) return { ok: false, error: "Invalid journal" };
  try {
    await getDb()
      .insert(dailyEntries)
      .values({ date: date.data, journal: journal.data })
      .onConflictDoUpdate({ target: dailyEntries.date, set: { journal: journal.data, updatedAt: new Date() } });
    refreshDaily();
    return { ok: true };
  } catch (error) {
    console.error("Failed to save journal", error);
    return { ok: false, error: "Something went wrong" };
  }
}
