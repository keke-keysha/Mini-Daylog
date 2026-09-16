import "server-only";

import { eq } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { storedAssets } from "@/lib/db/schema";

export const MAX_UPLOAD_BYTES = 1_500_000;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export class ImageValidationError extends Error {}

function detectedMimeType(bytes: Buffer): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8
    && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12
    && bytes.subarray(0, 4).toString("ascii") === "RIFF"
    && bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

export function imageErrorMessage(error: unknown): string {
  return error instanceof ImageValidationError ? error.message : "Something went wrong";
}

export async function persistImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;
  if (!allowedMimeTypes.has(file.type)) throw new ImageValidationError("Only JPEG, PNG, or WebP images are supported");
  if (file.size > MAX_UPLOAD_BYTES) throw new ImageValidationError("Image must not exceed 1.5 MB");

  const bytes = Buffer.from(await file.arrayBuffer());
  if (detectedMimeType(bytes) !== file.type) {
    throw new ImageValidationError("The selected file is not a valid JPEG, PNG, or WebP image");
  }
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
