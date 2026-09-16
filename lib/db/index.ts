import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { getEnv } from "@/lib/env";
import * as schema from "@/lib/db/schema";

let database: ReturnType<typeof createDatabase> | undefined;

function createDatabase() {
  const sql = neon(getEnv().DATABASE_URL);
  return drizzle({ client: sql, schema });
}

export function getDb() {
  database ??= createDatabase();
  return database;
}
