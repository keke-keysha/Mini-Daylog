import { z } from "zod";

import { logicalDateSchema } from "@/lib/validations/daily";

const optionalNumber = z.preprocess((value) => value === "" || value == null ? null : Number(value), z.number().min(0).nullable());

export const trackerActivitySchema = z.object({
  date: logicalDateSchema,
  activity: z.string().trim().min(1, "Activity is required").max(120),
  distanceKm: optionalNumber,
  durationMinutes: z.preprocess((value) => Number(value), z.number().int().positive("Duration must be greater than zero").max(100_000)),
  pace: z.string().trim().regex(/^$|^\d{1,3}:[0-5]\d$/, "Use pace format mm:ss"),
  isFasting: z.boolean(),
  isSick: z.boolean(),
  isRedDay: z.boolean(),
});

export function paceToSeconds(value: string): number | null {
  if (!value) return null;
  const [minutes, seconds] = value.split(":").map(Number);
  return minutes * 60 + seconds;
}
