import { z } from "zod";

export const MAX_THOUGHT_BYTES = 200_000;
export const EMPTY_THOUGHT = { type: "doc" as const, content: [{ type: "paragraph" as const, content: [] }] };

export function isSafeThoughtLink(value: string): boolean {
  if (!value || /[\u0000-\u0020\u007f]/.test(value)) return false;
  try {
    const url = new URL(value);
    return ["https:", "http:", "mailto:"].includes(url.protocol);
  } catch {
    return false;
  }
}

export function isThoughtImageUrl(value: string): boolean {
  return /^\/api\/assets\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

const markSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("bold") }),
  z.object({ type: z.literal("italic") }),
  z.object({ type: z.literal("highlight") }),
  z.object({ type: z.literal("link"), attrs: z.object({ href: z.string().max(2048).refine(isSafeThoughtLink, "Use an http, https, or mailto link") }) }),
]);
const inlineSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), text: z.string().min(1).max(MAX_THOUGHT_BYTES), marks: z.array(markSchema).max(4).optional() }),
  z.object({ type: z.literal("hardBreak") }),
]);
const blockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), content: z.array(inlineSchema).max(10_000).optional() }),
  z.object({
    type: z.literal("image"),
    attrs: z.object({
      src: z.string().refine(isThoughtImageUrl, "Images must be uploaded to DayLog"),
      alt: z.string().max(500).nullish(),
      title: z.string().max(500).nullish(),
    }),
  }),
]);

// Whitelist supported nodes, marks, and attributes. Zod strips every other attribute.
export const thoughtContentSchema = z.object({
  type: z.literal("doc"),
  content: z.array(blockSchema).min(1).max(2000),
}).refine((value) => new TextEncoder().encode(JSON.stringify(value)).length <= MAX_THOUGHT_BYTES, "Thought body must not exceed 200 KB");

export type ThoughtContent = z.infer<typeof thoughtContentSchema>;

export function thoughtPreview(content: ThoughtContent) {
  const thumbnail = content.content.find((node) => node.type === "image")?.attrs.src ?? null;
  const excerpt = content.content
    .filter((node) => node.type === "paragraph")
    .map((node) => (node.content ?? []).map((inline) => inline.type === "text" ? inline.text : " ").join(""))
    .join(" ").replace(/\s+/g, " ").trim().slice(0, 160);
  return { thumbnail, excerpt };
}
