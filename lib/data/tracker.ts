import "server-only";

import { desc, eq } from "drizzle-orm";

import { addDays, todayJakarta } from "@/lib/date";
import { getDb } from "@/lib/db";
import { activityLogs, trackerDays } from "@/lib/db/schema";

export async function getTrackerData() {
  const today = todayJakarta();
  const [rows, todayStatusRows] = await Promise.all([
    getDb()
      .select({
        id: activityLogs.id,
        date: trackerDays.date,
        activity: activityLogs.activity,
        distanceKm: activityLogs.distanceKm,
        durationMinutes: activityLogs.durationMinutes,
        paceSecondsPerKm: activityLogs.paceSecondsPerKm,
        isFasting: trackerDays.isFasting,
        isSick: trackerDays.isSick,
        isRedDay: trackerDays.isRedDay,
      })
      .from(activityLogs)
      .innerJoin(trackerDays, eq(activityLogs.trackerDayId, trackerDays.id))
      .orderBy(desc(trackerDays.date), desc(activityLogs.createdAt)),
    getDb()
      .select({ isFasting: trackerDays.isFasting, isSick: trackerDays.isSick, isRedDay: trackerDays.isRedDay })
      .from(trackerDays)
      .where(eq(trackerDays.date, today))
      .limit(1),
  ]);

  const chartMap = new Map<string, { date: string; distance: number; duration: number; paceTotal: number; paceCount: number }>();
  for (const row of rows) {
    const item = chartMap.get(row.date) ?? { date: row.date, distance: 0, duration: 0, paceTotal: 0, paceCount: 0 };
    item.distance += Number(row.distanceKm ?? 0);
    item.duration += row.durationMinutes;
    if (row.paceSecondsPerKm != null) {
      item.paceTotal += row.paceSecondsPerKm;
      item.paceCount += 1;
    }
    chartMap.set(row.date, item);
  }
  const chart = [...chartMap.values()].sort((a, b) => a.date.localeCompare(b.date)).map((item) => ({
    date: item.date,
    distance: Number(item.distance.toFixed(2)),
    duration: item.duration,
    pace: item.paceCount ? Math.round(item.paceTotal / item.paceCount) : null,
  }));

  const weekStart = addDays(today, -6);
  const weeklyRows = rows.filter((row) => row.date >= weekStart && row.date <= today);
  return {
    rows,
    chart,
    todayStatus: todayStatusRows[0] ?? { isFasting: false, isSick: false, isRedDay: false },
    weekly: {
      distance: weeklyRows.reduce((total, row) => total + Number(row.distanceKm ?? 0), 0),
      duration: weeklyRows.reduce((total, row) => total + row.durationMinutes, 0),
    },
  };
}
