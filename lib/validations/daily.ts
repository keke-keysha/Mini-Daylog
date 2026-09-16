import { z } from "zod";

export const logicalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date")
  .refine((value) => {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(Date.UTC(year, month - 1, day));
    return parsed.getUTCFullYear() === year
      && parsed.getUTCMonth() === month - 1
      && parsed.getUTCDate() === day;
  }, "Invalid date");
export const moodSchema = z.enum(["SAD", "FLAT", "HAPPY", "ANGRY"]);
export const completedSchema = z.boolean();
export const todoTextSchema = z.string().trim().min(1, "Todo cannot be empty").max(240, "Todo is too long");
export const journalSchema = z.string().max(20_000, "Journal is too long");
export const idSchema = z.string().uuid("Invalid item");
