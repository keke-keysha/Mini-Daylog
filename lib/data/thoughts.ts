import "server-only";

import { desc, eq } from "drizzle-orm";

import { requireSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { thoughts } from "@/lib/db/schema";
import { thoughtContentSchema, thoughtPreview } from "@/lib/thoughts/content";
import { idSchema } from "@/lib/validations/daily";

export async function getThoughts() {
  await requireSession();
  const rows = await getDb().select().from(thoughts).orderBy(desc(thoughts.updatedAt));
  return rows.map(({ id, title, content, updatedAt }) => ({ id, title, updatedAt, ...thoughtPreview(thoughtContentSchema.parse(content)) }));
}

export async function getThought(idInput: string) {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return null;
  const [thought] = await getDb().select().from(thoughts).where(eq(thoughts.id, id.data)).limit(1);
  return thought ? { ...thought, content: thoughtContentSchema.parse(thought.content) } : null;
}
