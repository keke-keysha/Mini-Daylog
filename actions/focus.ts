"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import type { MutationResult } from "@/actions/daily";
import { requireSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { focusMaterials, focusSubtopics, focusTasks } from "@/lib/db/schema";
import { focusTaskSchema, focusTitleSchema, idSchema } from "@/lib/validations/focus";

function refreshFocus() {
  revalidatePath("/");
  revalidatePath("/focus");
}

async function mutate(operation: () => Promise<unknown>, logMessage: string): Promise<MutationResult> {
  try {
    await operation();
    refreshFocus();
    return { ok: true };
  } catch (error) {
    console.error(logMessage, error);
    return { ok: false, error: "Something went wrong" };
  }
}

export async function createMaterial(titleInput: string): Promise<MutationResult> {
  await requireSession();
  const title = focusTitleSchema.safeParse(titleInput);
  if (!title.success) return { ok: false, error: title.error.issues[0].message };
  return mutate(() => getDb().insert(focusMaterials).values({ title: title.data }), "Failed to create material");
}

export async function renameMaterial(idInput: string, titleInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  const title = focusTitleSchema.safeParse(titleInput);
  if (!id.success || !title.success) return { ok: false, error: title.success ? "Invalid material" : title.error.issues[0].message };
  return mutate(() => getDb().update(focusMaterials).set({ title: title.data, updatedAt: new Date() }).where(eq(focusMaterials.id, id.data)), "Failed to rename material");
}

export async function deleteMaterial(idInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid material" };
  return mutate(() => getDb().delete(focusMaterials).where(eq(focusMaterials.id, id.data)), "Failed to delete material");
}

export async function createSubtopic(materialIdInput: string, titleInput: string): Promise<MutationResult> {
  await requireSession();
  const materialId = idSchema.safeParse(materialIdInput);
  const title = focusTitleSchema.safeParse(titleInput);
  if (!materialId.success || !title.success) return { ok: false, error: title.success ? "Invalid material" : title.error.issues[0].message };
  return mutate(() => getDb().insert(focusSubtopics).values({ materialId: materialId.data, title: title.data }), "Failed to create subtopic");
}

export async function updateSubtopic(idInput: string, titleInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  const title = focusTitleSchema.safeParse(titleInput);
  if (!id.success || !title.success) return { ok: false, error: title.success ? "Invalid subtopic" : title.error.issues[0].message };
  return mutate(() => getDb().update(focusSubtopics).set({ title: title.data, updatedAt: new Date() }).where(eq(focusSubtopics.id, id.data)), "Failed to update subtopic");
}

export async function toggleSubtopic(idInput: string, completed: boolean): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid subtopic" };
  return mutate(() => getDb().update(focusSubtopics).set({ isCompleted: completed, updatedAt: new Date() }).where(eq(focusSubtopics.id, id.data)), "Failed to toggle subtopic");
}

export async function deleteSubtopic(idInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid subtopic" };
  return mutate(() => getDb().delete(focusSubtopics).where(eq(focusSubtopics.id, id.data)), "Failed to delete subtopic");
}

export async function createFocusTask(materialIdInput: string, titleInput: string, deadlineInput: string): Promise<MutationResult> {
  await requireSession();
  const materialId = idSchema.safeParse(materialIdInput);
  const task = focusTaskSchema.safeParse({ title: titleInput, deadline: deadlineInput });
  if (!materialId.success || !task.success) return { ok: false, error: task.success ? "Invalid material" : task.error.issues[0].message };
  return mutate(() => getDb().insert(focusTasks).values({ materialId: materialId.data, ...task.data }), "Failed to create focus task");
}

export async function updateFocusTask(idInput: string, titleInput: string, deadlineInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  const task = focusTaskSchema.safeParse({ title: titleInput, deadline: deadlineInput });
  if (!id.success || !task.success) return { ok: false, error: task.success ? "Invalid task" : task.error.issues[0].message };
  return mutate(() => getDb().update(focusTasks).set({ ...task.data, updatedAt: new Date() }).where(eq(focusTasks.id, id.data)), "Failed to update focus task");
}

export async function toggleFocusTask(idInput: string, completed: boolean): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid task" };
  return mutate(() => getDb().update(focusTasks).set({ isCompleted: completed, updatedAt: new Date() }).where(eq(focusTasks.id, id.data)), "Failed to toggle focus task");
}

export async function deleteFocusTask(idInput: string): Promise<MutationResult> {
  await requireSession();
  const id = idSchema.safeParse(idInput);
  if (!id.success) return { ok: false, error: "Invalid task" };
  return mutate(() => getDb().delete(focusTasks).where(eq(focusTasks.id, id.data)), "Failed to delete focus task");
}
