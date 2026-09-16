import "server-only";

import { asc } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { focusMaterials, focusSubtopics, focusTasks } from "@/lib/db/schema";

export async function getFocusData() {
  const [materials, subtopics, tasks] = await Promise.all([
    getDb().select().from(focusMaterials).orderBy(asc(focusMaterials.createdAt)),
    getDb().select().from(focusSubtopics).orderBy(asc(focusSubtopics.sortOrder), asc(focusSubtopics.createdAt)),
    getDb().select().from(focusTasks).orderBy(asc(focusTasks.deadline), asc(focusTasks.createdAt)),
  ]);
  return { materials, subtopics, tasks };
}
