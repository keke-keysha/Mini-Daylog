import "server-only";

import { and, asc, desc, eq, lt } from "drizzle-orm";

import { addDays, todayJakarta } from "@/lib/date";
import { getDb } from "@/lib/db";
import { activityLogs, books, focusMaterials, focusTasks, media, trackerDays } from "@/lib/db/schema";

export async function getDashboardData() {
  const today = todayJakarta();
  const weekStart = addDays(today, -6);
  const [tasks, activities, currentBook, currentSeries] = await Promise.all([
    getDb().select({ id: focusTasks.id, title: focusTasks.title, deadline: focusTasks.deadline, materialTitle: focusMaterials.title }).from(focusTasks).innerJoin(focusMaterials, eq(focusTasks.materialId, focusMaterials.id)).where(eq(focusTasks.isCompleted, false)).orderBy(asc(focusTasks.deadline)),
    getDb().select({ date: trackerDays.date, activity: activityLogs.activity, distanceKm: activityLogs.distanceKm, durationMinutes: activityLogs.durationMinutes }).from(activityLogs).innerJoin(trackerDays, eq(activityLogs.trackerDayId, trackerDays.id)).orderBy(desc(trackerDays.date), desc(activityLogs.createdAt)),
    getDb().select().from(books).where(lt(books.currentPage, books.totalPages)).orderBy(desc(books.updatedAt)).limit(1),
    getDb().select().from(media).where(and(eq(media.category, "SERIES"), lt(media.watchedEpisodes, media.totalEpisodes))).orderBy(desc(media.updatedAt)).limit(1),
  ]);
  const week = activities.filter((item) => item.date >= weekStart && item.date <= today);
  return { tasks, lastActivity: activities[0] ?? null, weeklyDistance: week.reduce((sum, item) => sum + Number(item.distanceKm ?? 0), 0), weeklyDuration: week.reduce((sum, item) => sum + item.durationMinutes, 0), currentBook: currentBook[0] ?? null, currentSeries: currentSeries[0] ?? null };
}
