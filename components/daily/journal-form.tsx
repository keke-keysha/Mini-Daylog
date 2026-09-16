"use client";

import { useState, useTransition } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";

import { saveJournal } from "@/actions/daily";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/form-fields";

export function JournalForm({ date, initialJournal }: { date: string; initialJournal: string }) {
  const [journal, setJournal] = useState(initialJournal);
  const [pending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    startTransition(async () => {
      const result = await saveJournal(date, journal);
      if (result.ok) toast.success("Journal saved");
      else toast.error(result.error);
    });
  }

  return (
    <form onSubmit={submit} noValidate>
      <Textarea value={journal} onChange={(event) => setJournal(event.target.value)} placeholder="What’s happening…" className="min-h-56 border-0 bg-white/35 px-5 py-4 leading-7 shadow-none hover:bg-white/50 focus-visible:bg-white/65 dark:bg-white/5 dark:hover:bg-white/[0.08] dark:focus-visible:bg-white/10" maxLength={20_000} />
      <div className="mt-3 flex justify-end">
        <Button disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Save />}{pending ? "Saving..." : "Save"}</Button>
      </div>
    </form>
  );
}
