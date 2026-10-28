"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bold, Highlighter, ImagePlus, Italic, Link as LinkIcon, LoaderCircle, Save, Unlink } from "lucide-react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapLink from "@tiptap/extension-link";
import TiptapImage from "@tiptap/extension-image";
import Highlight from "@tiptap/extension-highlight";
import { toast } from "sonner";

import { createThought, deleteThought, updateThought, uploadThoughtImage } from "@/actions/thoughts";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { PageHeading } from "@/components/ui/presentation";
import { EMPTY_THOUGHT, isSafeThoughtLink, isThoughtImageUrl, thoughtContentSchema, type ThoughtContent } from "@/lib/thoughts/content";

const SafeImage = TiptapImage.extend({
  parseHTML() {
    return [{ tag: "img[src]", getAttrs: (element) => isThoughtImageUrl(element.getAttribute("src") ?? "") ? null : false }];
  },
});

const extensions = [
  StarterKit.configure({
    blockquote: false, bulletList: false, orderedList: false, listItem: false, listKeymap: false,
    code: false, codeBlock: false, heading: false, horizontalRule: false, strike: false, underline: false, link: false,
  }),
  TiptapLink.configure({ openOnClick: false, defaultProtocol: "https", isAllowedUri: isSafeThoughtLink }),
  SafeImage.configure({ allowBase64: false }),
  Highlight,
];

type Thought = { id: string; title: string; content: ThoughtContent; lastEdited: string };

export function ThoughtEditor({ thought }: { thought?: Thought }) {
  const router = useRouter();
  const [title, setTitle] = useState(thought?.title ?? "");
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const busy = pending || uploading;

  function markDirty() { dirtyRef.current = true; setDirty(true); }
  function markSaved() { dirtyRef.current = false; setDirty(false); }

  const editor = useEditor({
    extensions,
    content: thought?.content ?? EMPTY_THOUGHT,
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: { attributes: { class: "thought-body", "aria-label": "Thought body", role: "textbox", "aria-multiline": "true" } },
    onUpdate: markDirty,
  });

  useEffect(() => { editor?.setEditable(!busy, false); }, [editor, busy]);

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    }
    function beforeLink(event: MouseEvent) {
      if (!dirtyRef.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!link || link.target === "_blank" || link.hasAttribute("download") || link.href === window.location.href || link.getAttribute("href")?.startsWith("#")) return;
      if (!window.confirm("Leave without saving your changes?")) { event.preventDefault(); event.stopPropagation(); }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeLink, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", beforeLink, true);
    };
  }, []);

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor || busy) return;
    // Normalize ProseMirror's attribute objects before crossing the Server Action boundary.
    const content = thoughtContentSchema.safeParse(editor.getJSON());
    if (!content.success) return void toast.error(content.error.issues[0].message);
    const input = { title, content: content.data };
    startTransition(async () => {
      try {
        const result = thought ? await updateThought(thought.id, input) : await createThought(input);
        if (!result.ok) return void toast.error(result.error);
        markSaved();
        setTitle(title.trim());
        toast.success(thought ? "Thought updated" : "Thought saved");
        if ("id" in result) router.replace(`/thoughts/${result.id}`);
        else router.refresh();
      } catch { toast.error("Unable to save thought. Please try again."); }
    });
  }

  function remove() {
    if (!thought || busy) return;
    startTransition(async () => {
      try {
        const result = await deleteThought(thought.id);
        if (!result.ok) return void toast.error(result.error);
        markSaved();
        toast.success("Thought deleted");
        router.replace("/thoughts");
      } catch { toast.error("Unable to delete thought. Please try again."); }
    });
  }

  function editLink() {
    if (!editor) return;
    const previous = String(editor.getAttributes("link").href ?? "");
    const url = window.prompt("Link URL (https://, http://, or mailto:). Leave empty to remove.", previous);
    if (url === null) return;
    const href = url.trim();
    if (!href) { editor.chain().focus().extendMarkRange("link").unsetLink().run(); return; }
    if (!isSafeThoughtLink(href)) return void toast.error("Use an http, https, or mailto link");
    editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
  }

  async function insertImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !editor || busy) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) return void toast.error("Choose a JPEG, PNG, or WebP image");
    if (file.size > 1_500_000) return void toast.error("Image must not exceed 1.5 MB");
    const position = editor.state.selection.from;
    setUploading(true);
    try {
      const form = new FormData(); form.set("image", file);
      const result = await uploadThoughtImage(form);
      if (!result.ok) return void toast.error(result.error);
      editor.chain().focus().setTextSelection(position).setImage({ src: result.url, alt: file.name.slice(0, 255) }).run();
      toast.success("Image inserted. Save your thought to keep it.");
    } catch { toast.error("Unable to upload image. Please try again."); }
    finally { setUploading(false); }
  }

  const tools = [
    { label: "Bold", icon: Bold, active: editor?.isActive("bold"), action: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: editor?.isActive("italic"), action: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Insert or edit link", icon: LinkIcon, active: editor?.isActive("link"), action: editLink },
    { label: "Remove link", icon: Unlink, action: () => editor?.chain().focus().extendMarkRange("link").unsetLink().run() },
    { label: "Highlight", icon: Highlighter, active: editor?.isActive("highlight"), action: () => editor?.chain().focus().toggleHighlight().run() },
  ];

  return (
    <main className="page-shell max-w-5xl">
      <PageHeading eyebrow="A little space for your words" title={thought ? "Your Thought" : "New Thought"} action={<Button asChild variant="outline" className="min-h-11"><Link href="/thoughts"><ArrowLeft />Thoughts</Link></Button>} />
      <form onSubmit={save} className="grid min-w-0 gap-4" aria-busy={busy}>
        <Card className="bento-lavender">
          <label htmlFor="thought-title" className="mb-2 block text-xs font-extrabold uppercase tracking-wider text-muted-foreground">Title</label>
          <textarea id="thought-title" value={title} onChange={(event) => { setTitle(event.target.value); markDirty(); }} placeholder="What’s on your mind?" maxLength={200} rows={2} required disabled={busy} className="w-full resize-none rounded-2xl bg-transparent p-2 font-heading text-3xl font-semibold leading-tight outline-none placeholder:text-foreground/35 focus-visible:ring-3 focus-visible:ring-ring/30 sm:text-4xl" />
        </Card>
        <Card className="min-w-0 overflow-hidden">
          <div role="group" aria-label="Text formatting" className="mb-4 flex max-w-full gap-1 overflow-x-auto rounded-2xl bg-daylog-blue/60 p-1.5">
            {tools.map(({ label, icon: Icon, active, action }) => <Button key={label} type="button" variant={active ? "secondary" : "ghost"} size="icon" className="size-11" title={label} aria-label={label} aria-pressed={active} disabled={!editor || busy} onClick={action}><Icon aria-hidden="true" /></Button>)}
            <Button type="button" variant="ghost" size="icon" className="size-11" title="Insert image" aria-label="Insert image" disabled={!editor || busy} onClick={() => fileInput.current?.click()}><ImagePlus aria-hidden="true" /></Button>
          </div>
          <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={insertImage} className="hidden" aria-label="Upload thought image" disabled={busy} />
          {editor ? <EditorContent editor={editor} /> : <p className="min-h-80 text-sm text-muted-foreground" role="status">Opening your notebook...</p>}
          <p className="mt-4 text-xs text-muted-foreground">Images: JPEG, PNG or WebP, up to 1.5 MB. Changes are kept when you save.</p>
        </Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs font-bold text-muted-foreground" role="status">{uploading ? "Uploading image..." : pending ? "Saving changes..." : dirty ? "Unsaved changes" : thought ? `Last edited ${thought.lastEdited}` : "Ready for your first thought"}</p>
          <div className="flex flex-wrap gap-2">
            {thought && <fieldset disabled={busy} className="contents"><ConfirmButton title="Delete this thought?" description="This note will be permanently deleted." action={remove} /></fieldset>}
            <Button type="submit" className="min-h-11" disabled={!editor || busy || !title.trim()}>{busy ? <LoaderCircle className="animate-spin" /> : <Save />}{pending ? "Saving..." : uploading ? "Uploading..." : thought ? "Update Thought" : "Save Thought"}</Button>
          </div>
        </div>
      </form>
    </main>
  );
}
