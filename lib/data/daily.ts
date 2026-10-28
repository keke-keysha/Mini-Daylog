import "server-only";

import { and, asc, eq, gte, lte } from "drizzle-orm";

import { todayJakarta } from "@/lib/date";
import { getDb } from "@/lib/db";
import { appSettings, dailyEntries, dailyTodos, trackerDays } from "@/lib/db/schema";

export async function ensureAppSettings() {
  const today = todayJakarta();
  await getDb().insert(appSettings).values({ id: 1, firstUsedDate: today }).onConflictDoNothing();
  const [settings] = await getDb().select().from(appSettings).where(eq(appSettings.id, 1)).limit(1);
  return settings;
}

export async function getDailyEntry(date: string) {
  const [entry] = await getDb().select().from(dailyEntries).where(eq(dailyEntries.date, date)).limit(1);
  if (!entry) return { id: null, date, mood: "FLAT" as const, journal: "", todos: [] };
  const todos = await getDb()
    .select()
    .from(dailyTodos)
    .where(eq(dailyTodos.dailyEntryId, entry.id))
    .orderBy(asc(dailyTodos.sortOrder), asc(dailyTodos.createdAt));
  return { ...entry, todos };
}

export type DailyCalendarEntry = {
  date: string;
  mood: "SAD" | "FLAT" | "HAPPY" | "ANGRY";
  journal: string;
  totalTodos: number;
  completedTodos: number;
  isFasting: boolean;
  isSick: boolean;
  isRedDay: boolean;
};

export async function getDailyCalendarData(start: string, end: string) {
  const rows = await getDb()
    .select({
      date: dailyEntries.date,
      mood: dailyEntries.mood,
      journal: dailyEntries.journal,
      todoId: dailyTodos.id,
      isCompleted: dailyTodos.isCompleted,
    })
    .from(dailyEntries)
    .leftJoin(dailyTodos, eq(dailyTodos.dailyEntryId, dailyEntries.id))
    .where(and(gte(dailyEntries.date, start), lte(dailyEntries.date, end)));

  const entries = new Map<string, DailyCalendarEntry>();
  for (const row of rows) {
    const entry = entries.get(row.date) ?? { date: row.date, mood: row.mood, journal: row.journal, totalTodos: 0, completedTodos: 0, isFasting: false, isSick: false, isRedDay: false };
    if (row.todoId) {
      entry.totalTodos += 1;
      if (row.isCompleted) entry.completedTodos += 1;
    }
    entries.set(row.date, entry);
  }
  // Query tracker days directly so check-ins without a daily entry or activity are included.
  const statuses = await getDb()
    .select({ date: trackerDays.date, isFasting: trackerDays.isFasting, isSick: trackerDays.isSick, isRedDay: trackerDays.isRedDay })
    .from(trackerDays)
    .where(and(gte(trackerDays.date, start), lte(trackerDays.date, end)));
  for (const status of statuses) {
    const entry = entries.get(status.date) ?? { date: status.date, mood: "FLAT" as const, journal: "", totalTodos: 0, completedTodos: 0 };
    entries.set(status.date, { ...entry, ...status });
  }
  return [...entries.values()];
}
