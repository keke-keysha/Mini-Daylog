"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import type { MutationResult } from "@/actions/daily";
import { requireSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { activityLogs, trackerDays } from "@/lib/db/schema";
import { idSchema } from "@/lib/validations/daily";
import { paceToSeconds, trackerActivitySchema } from "@/lib/validations/tracker";

type ActivityInput = {
  date: string;
  activity: string;
  distanceKm: string;
  durationMinutes: string;
  pace: string;
  isFasting: boolean;
  isSick: boolean;
  isRedDay: boolean;
};

function refreshTracker() {
  revalidatePath("/");
  revalidatePath("/tracker");
}

function parseInput(input: ActivityInput) {
  return trackerActivitySchema.safeParse(input);
}

async function upsertTrackerDay(input: z.infer<typeof trackerActivitySchema>) {
  const [day] = await getDb()
    .insert(trackerDays)
    .values({ date: input.date, isFasting: input.isFasting, isSick: input.isSick, isRedDay: input.isRedDay })
    .onConflictDoUpdate({
      target: trackerDays.date,
      set: { isFasting: input.isFasting, isSick: input.isSick, isRedDay: input.isRedDay, updatedAt: new Date() },
    })
    .returning({ id: trackerDays.id });
  return day.id;
}

import type { z } from "zod";

export async function createActivity(input: ActivityInput): Promise<MutationResult> {
  await requireSession();
  const parsed = parseInput(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    const trackerDayId = await upsertTrackerDay(parsed.data);
    await getDb().insert(activityLogs).values({
      trackerDayId,
      activity: parsed.data.activity,
      distanceKm: parsed.data.distanceKm == null ? null : parsed.data.distanceKm.toFixed(2),
      durationMinutes: parsed.data.durationMinutes,
      paceSecondsPerKm: paceToSeconds(parsed.data.pace),
    });
    refreshTracker();
    return { ok: true };
  } catch (error) {
    console.error("Failed to create activity", error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function updateActivity(idInput: string, input: ActivityInput): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  const parsed = parseInput(input);
  if (!id.success || !parsed.success) return { ok: false, error: parsed.success ? "Invalid activity" : parsed.error.issues[0].message };
  try {
    const trackerDayId = await upsertTrackerDay(parsed.data);
    await getDb().update(activityLogs).set({
      trackerDayId,
      activity: parsed.data.activity,
      distanceKm: parsed.data.distanceKm == null ? null : parsed.data.distanceKm.toFixed(2),
      durationMinutes: parsed.data.durationMinutes,
      paceSecondsPerKm: paceToSeconds(parsed.data.pace),
      updatedAt: new Date(),
    }).where(eq(activityLogs.id, id.data));
    refreshTracker();
    return { ok: true };
  } catch (error) {
    console.error("Failed to update activity", error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function deleteActivity(idInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid activity" };
  try {
    await getDb().delete(activityLogs).where(eq(activityLogs.id, id.data));
    refreshTracker();
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete activity", error);
    return { ok: false, error: "Something went wrong" };
  }
}
