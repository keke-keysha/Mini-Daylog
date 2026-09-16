import "server-only";

import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL URL"),
  AUTH_SECRET: z.string().min(32, "AUTH_SECRET must contain at least 32 characters"),
  PERSONAL_USERNAME: z.string().trim().min(1, "PERSONAL_USERNAME is required"),
  PERSONAL_PASSWORD: z.string().min(8, "PERSONAL_PASSWORD must contain at least 8 characters"),
  APP_TIMEZONE: z.literal("Asia/Jakarta").default("Asia/Jakarta"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | undefined;

export function getEnv(): AppEnv {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    AUTH_SECRET: process.env.AUTH_SECRET,
    PERSONAL_USERNAME: process.env.PERSONAL_USERNAME,
    PERSONAL_PASSWORD: process.env.PERSONAL_PASSWORD,
    APP_TIMEZONE: process.env.APP_TIMEZONE,
  });

  if (!result.success) {
    const fields = result.error.issues.map((issue) => issue.path.join(".")).join(", ");
    throw new Error(`Invalid server environment configuration: ${fields}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}
