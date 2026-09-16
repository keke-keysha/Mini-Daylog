export function assetUrl(id: string | null): string | null {
  return id ? `/api/assets/${id}` : null;
}
