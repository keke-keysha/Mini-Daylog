"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Plus, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { createBook, updateBook } from "@/actions/books";
import { RatingInput } from "@/components/library/rating-input";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form-fields";

export type Book = { id: string; title: string; author: string; genre: string; ownership: string | null; coverAssetId: string | null; totalPages: number; currentPage: number; rating: number | null; thoughts: string; startedAt: string; completedAt: string | null };

export function BookForm({ initial }: { initial?: Book }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [quotes, setQuotes] = useState<string[]>([""]);
  const completed = initial ? initial.currentPage === initial.totalPages : false;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = initial ? await updateBook(initial.id, data) : await createBook(data);
      if (!result.ok) return void toast.error(result.error);
      toast.success(initial ? "Book updated" : "Book added");
      if (!initial) form.reset();
      setQuotes([""]);
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      <Field label={`Cover image${initial ? " (leave empty to keep current)" : ""}`}><><Input name="cover" type="file" accept="image/jpeg,image/png,image/webp" /><span className="text-xs font-normal text-muted-foreground">JPEG, PNG, or WebP. Maximum 1.5 MB.</span></></Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Title"><Input name="title" defaultValue={initial?.title} /></Field>
        <Field label="Author"><Input name="author" defaultValue={initial?.author} /></Field>
        <Field label="Genre"><Input name="genre" defaultValue={initial?.genre} /></Field>
        <Field label="Ownership (optional)"><Input name="ownership" defaultValue={initial?.ownership ?? ""} /></Field>
        <Field label="Total pages"><Input name="totalPages" inputMode="numeric" defaultValue={initial?.totalPages} /></Field>
        <Field label="Current page"><Input name="currentPage" inputMode="numeric" defaultValue={initial?.currentPage ?? 0} /></Field>
      </div>
      <fieldset><legend className="mb-2 text-sm font-medium">New quotes</legend><div className="space-y-2">{quotes.map((quote, index) => <div key={index} className="flex gap-2"><Textarea name="quotes" value={quote} onChange={(event) => setQuotes((all) => all.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className="min-h-20" placeholder="A memorable passage..." /><Button type="button" variant="ghost" size="icon" onClick={() => setQuotes((all) => all.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove quote field"><X /></Button></div>)}</div><Button type="button" variant="ghost" className="mt-2" onClick={() => setQuotes((all) => [...all, ""])}><Plus /> Add quote</Button></fieldset>
      {completed && <><Field label="Rating"><RatingInput initial={initial?.rating ?? null} /></Field><Field label="Thoughts"><Textarea name="thoughts" defaultValue={initial?.thoughts} className="min-h-40" /></Field></>}
      {!completed && <><input type="hidden" name="rating" value={initial?.rating ?? ""} /><input type="hidden" name="thoughts" value={initial?.thoughts ?? ""} /></>}
      <Button disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : initial ? <Save /> : <Plus />}{pending ? "Saving..." : initial ? "Update" : "Add Book"}</Button>
    </form>
  );
}
