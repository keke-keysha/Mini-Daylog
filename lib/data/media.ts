import "server-only";

import { asc, desc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { media, mediaProgressLogs, mediaQuotes } from "@/lib/db/schema";

export async function getMediaData() {
  const [items, quotes, logs] = await Promise.all([
    getDb().select().from(media).orderBy(desc(media.updatedAt)),
    getDb().select().from(mediaQuotes).orderBy(desc(mediaQuotes.createdAt)),
    getDb().select().from(mediaProgressLogs).orderBy(asc(mediaProgressLogs.date), asc(mediaProgressLogs.createdAt)),
  ]);
  return { items, quotes, logs };
}
