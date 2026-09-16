import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { storedAssets } from "@/lib/db/schema";

export const MAX_UPLOAD_BYTES = 1_500_000;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function persistImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!allowedMimeTypes.has(file.type)) throw new Error("Only JPEG, PNG, or WebP images are supported");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Image must not exceed 1.5 MB");

  const bytes = Buffer.from(await file.arrayBuffer());
  const [asset] = await getDb()
    .insert(storedAssets)
    .values({
      originalName: file.name.slice(0, 255),
      mimeType: file.type,
      sizeBytes: file.size,
      data: bytes,
    })
    .returning({ id: storedAssets.id });
  return asset.id;
}

export async function deleteAsset(id: string | null | undefined) {
  if (id) await getDb().delete(storedAssets).where(eq(storedAssets.id, id));
}

export function assetUrl(id: string | null): string | null {
  return id ? `/api/assets/${id}` : null;
}
