import assert from "node:assert/strict";
import { test } from "node:test";

import { EMPTY_THOUGHT, isSafeThoughtLink, isThoughtImageUrl, thoughtContentSchema, thoughtPreview } from "./content";

const image = "/api/assets/12345678-1234-4234-8234-123456789abc";

test("allows only explicit safe link protocols", () => {
  for (const url of ["https://example.com/a?q=b", "http://example.com", "mailto:me@example.com"]) assert.equal(isSafeThoughtLink(url), true);
  for (const url of ["javascript:alert(1)", "java\nscript:alert(1)", "data:text/html,x", "//example.com", "/relative", "ftp://example.com", " https://example.com"]) assert.equal(isSafeThoughtLink(url), false);
});

test("accepts only authenticated DayLog asset image URLs", () => {
  assert.equal(isThoughtImageUrl(image), true);
  for (const url of ["https://example.com/image.png", "data:image/png;base64,abc", "javascript:alert(1)", `${image}?extra=1`, "/api/assets/not-an-id"]) assert.equal(isThoughtImageUrl(url), false);
});

test("preserves essential formatting while removing arbitrary HTML attributes", () => {
  const parsed = thoughtContentSchema.parse({ type: "doc", content: [
    { type: "paragraph", attrs: { onclick: "alert(1)" }, content: [
      { type: "text", text: "A thought", marks: [{ type: "bold" }, { type: "italic" }, { type: "highlight", attrs: { style: "evil" } }, { type: "link", attrs: { href: "https://example.com", onclick: "evil" } }] },
      { type: "hardBreak" }, { type: "text", text: "Next line" },
    ] },
    { type: "image", attrs: { src: image, alt: "My image", onerror: "evil" } },
  ] });
  assert.equal(JSON.stringify(parsed).includes("evil"), false);
  assert.equal(JSON.stringify(parsed).includes("onclick"), false);
  assert.deepEqual(thoughtPreview(parsed), { thumbnail: image, excerpt: "A thought Next line" });
  assert.equal(thoughtContentSchema.safeParse(parsed).success, true);
});

test("rejects unsafe nodes, links, images, and oversized bodies", () => {
  const documents = [
    { type: "doc", content: [{ type: "script", text: "alert(1)" }] },
    { type: "doc", content: [{ type: "image", attrs: { src: "data:image/png;base64,abc" } }] },
    { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "link", attrs: { href: "javascript:alert(1)" } }] }] }] },
    { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "😊".repeat(60_000) }] }] },
    { type: "doc", content: [] },
  ];
  for (const document of documents) assert.equal(thoughtContentSchema.safeParse(document).success, false);
});

test("empty thoughts and text-only previews do not invent a thumbnail", () => {
  assert.deepEqual(thoughtPreview(thoughtContentSchema.parse(EMPTY_THOUGHT)), { thumbnail: null, excerpt: "" });
});
