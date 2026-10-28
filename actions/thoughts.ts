"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import type { MutationResult } from "@/actions/daily";
import { assetUrl } from "@/lib/asset-url";
import { imageErrorMessage, persistImage } from "@/lib/assets";
import { requireSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { thoughts } from "@/lib/db/schema";
import { idSchema } from "@/lib/validations/daily";
import { thoughtSchema } from "@/lib/validations/thought";

function refreshThoughts(id: string) {
  revalidatePath("/thoughts");
  revalidatePath(`/thoughts/${id}`);
}

export async function createThought(input: unknown): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  await requireSession();
  const parsed = thoughtSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    const [thought] = await getDb().insert(thoughts).values(parsed.data).returning({ id: thoughts.id });
    refreshThoughts(thought.id);
    return { ok: true, id: thought.id };
  } catch (error) {
    console.error("Failed to create thought", error);
    return { ok: false, error: "Unable to save thought. Please try again." };
  }
}

export async function updateThought(idInput: string, input: unknown): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  const parsed = thoughtSchema.safeParse(input);
  if (!id.success) return { ok: false, error: "Invalid thought" };
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  try {
    const [thought] = await getDb().update(thoughts).set({ ...parsed.data, updatedAt: new Date() }).where(eq(thoughts.id, id.data)).returning({ id: thoughts.id });
    if (!thought) return { ok: false, error: "Thought not found" };
    refreshThoughts(thought.id);
    return { ok: true };
  } catch (error) {
    console.error("Failed to update thought", error);
    return { ok: false, error: "Unable to update thought. Please try again." };
  }
}

export async function deleteThought(idInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid thought" };
  try {
    const [thought] = await getDb().delete(thoughts).where(eq(thoughts.id, id.data)).returning({ id: thoughts.id });
    if (!thought) return { ok: false, error: "Thought not found" };
    // Leave embedded assets intact: other notes may still reference them.
    refreshThoughts(thought.id);
    return { ok: true };
  } catch (error) {
    console.error("Failed to delete thought", error);
    return { ok: false, error: "Unable to delete thought. Please try again." };
  }
}

export async function uploadThoughtImage(formData: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireSession();
  const image = formData.get("image");
  if (!(image instanceof File) || !image.size) return { ok: false, error: "Choose an image to upload" };
  try {
    const id = await persistImage(image);
    const url = assetUrl(id);
    if (!url) return { ok: false, error: "Choose an image to upload" };
    return { ok: true, url };
  } catch (error) {
    console.error("Failed to upload thought image", error);
    return { ok: false, error: imageErrorMessage(error) };
  }
}
