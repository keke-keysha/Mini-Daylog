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
  const [totalPages, setTotalPages] = useState(initial?.totalPages.toString() ?? "");
  const [currentPage, setCurrentPage] = useState(initial?.currentPage.toString() ?? "0");
  const completed = Number(totalPages) > 0 && Number(currentPage) === Number(totalPages);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    startTransition(async () => {
      const result = initial ? await updateBook(initial.id, data) : await createBook(data);
      if (!result.ok) return void toast.error(result.error);
      toast.success(initial ? "Book updated" : "Book added");
      if (!initial) {
        form.reset();
        setTotalPages("");
        setCurrentPage("0");
      }
      setQuotes([""]);
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" noValidate onSubmit={submit}>
      <section className="rounded-3xl bg-daylog-blue/45 p-4 sm:p-5">
        <h3 className="mb-4 font-display text-lg font-semibold">Book information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={`Cover image${initial ? " (leave empty to keep current)" : ""}`} className="sm:col-span-2"><><Input name="cover" type="file" accept="image/jpeg,image/png,image/webp" /><span className="text-xs font-normal text-muted-foreground">JPEG, PNG, or WebP. Maximum 1.5 MB.</span></></Field>
          <Field label="Title"><Input name="title" defaultValue={initial?.title} /></Field>
          <Field label="Author"><Input name="author" defaultValue={initial?.author} /></Field>
          <Field label="Genre"><Input name="genre" defaultValue={initial?.genre} /></Field>
          <Field label="Ownership (optional)"><Input name="ownership" defaultValue={initial?.ownership ?? ""} /></Field>
        </div>
      </section>
      <section className="rounded-3xl bg-daylog-mint/45 p-4 sm:p-5">
        <h3 className="mb-4 font-display text-lg font-semibold">Reading progress</h3>
        <div className="grid gap-4 sm:grid-cols-2"><Field label="Total pages"><Input name="totalPages" inputMode="numeric" value={totalPages} onChange={(event) => setTotalPages(event.target.value)} /></Field><Field label="Current page"><Input name="currentPage" inputMode="numeric" value={currentPage} onChange={(event) => setCurrentPage(event.target.value)} /></Field></div>
      </section>
      <fieldset className="rounded-3xl bg-daylog-pink/40 p-4 sm:p-5"><legend className="px-1 font-display text-lg font-semibold">New quotes</legend><div className="mt-3 space-y-2">{quotes.map((quote, index) => <div key={index} className="flex gap-2"><Textarea name="quotes" value={quote} onChange={(event) => setQuotes((all) => all.map((value, itemIndex) => itemIndex === index ? event.target.value : value))} className="min-h-24 bg-white/55 dark:bg-black/10" placeholder="A memorable passage..." /><Button type="button" variant="ghost" size="icon" onClick={() => setQuotes((all) => all.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove quote field"><X /></Button></div>)}</div><Button type="button" variant="ghost" className="mt-2" onClick={() => setQuotes((all) => [...all, ""])}><Plus /> Add quote</Button></fieldset>
      {completed && <section className="space-y-4 rounded-3xl bg-daylog-yellow/45 p-4 sm:p-5"><h3 className="font-display text-lg font-semibold">Rating &amp; thoughts</h3><Field label="Rating"><RatingInput initial={initial?.rating ?? null} /></Field><Field label="Thoughts"><Textarea name="thoughts" defaultValue={initial?.thoughts} className="min-h-40 bg-white/55 dark:bg-black/10" /></Field></section>}
      {!completed && <><input type="hidden" name="rating" value={initial?.rating ?? ""} /><input type="hidden" name="thoughts" value={initial?.thoughts ?? ""} /></>}
      <Button className="w-full sm:w-auto" disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : initial ? <Save /> : <Plus />}{pending ? "Saving..." : initial ? "Update" : "Add Book"}</Button>
    </form>
  );
}
