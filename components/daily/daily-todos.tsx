"use client";

import { useState, useTransition } from "react";
import { Check, ListChecks, LoaderCircle, MoreHorizontal, Pencil, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { createTodo, deleteTodo, toggleTodo, updateTodo } from "@/actions/daily";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

type Todo = { id: string; text: string; isCompleted: boolean };

export function DailyTodos({ date, initialTodos }: { date: string; initialTodos: Todo[] }) {
  const router = useRouter();
  const [todos, setTodos] = useState(initialTodos);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function add(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = new FormData(form).get("text")?.toString() ?? "";
    startTransition(async () => {
      const result = await createTodo(date, input);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Todo added");
      form.reset();
      setAdding(false);
      router.refresh();
    });
  }

  function toggle(todo: Todo) {
    const nextValue = !todo.isCompleted;
    setTodos((items) => items.map((item) => item.id === todo.id ? { ...item, isCompleted: nextValue } : item));
    startTransition(async () => {
      const result = await toggleTodo(todo.id, nextValue);
      if (!result.ok) {
        setTodos((items) => items.map((item) => item.id === todo.id ? todo : item));
        toast.error(result.error);
      } else toast.success(nextValue ? "Todo completed" : "Todo reopened");
    });
  }

  function saveEdit(todo: Todo, event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get("text")?.toString() ?? "";
    startTransition(async () => {
      const result = await updateTodo(todo.id, text);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setTodos((items) => items.map((item) => item.id === todo.id ? { ...item, text: text.trim() } : item));
      setEditingId(null);
      toast.success("Todo updated");
    });
  }

  async function remove(id: string) {
    const result = await deleteTodo(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setTodos((items) => items.filter((item) => item.id !== id));
    toast.success("Todo deleted");
  }

  const complete = todos.filter((todo) => todo.isCompleted).length;

  return (
    <div>
      <div className="space-y-2.5">
        {todos.length === 0 && <div className="grid min-h-36 place-items-center rounded-[1.4rem] border border-dashed border-daylog-yellow-ink/20 bg-white/30 p-5 text-center dark:bg-white/5"><div><span className="mx-auto grid size-11 place-items-center rounded-2xl bg-white/60 text-daylog-yellow-ink dark:bg-white/10"><ListChecks className="size-5" /></span><p className="mt-3 font-heading text-base font-semibold">A clear little list</p><p className="mt-1 text-xs font-bold text-foreground/50">Add one thing you&apos;d like to finish.</p></div></div>}
        {todos.map((todo) => (
          <div key={todo.id} className={cn("group flex min-h-14 items-center gap-2 rounded-[1.15rem] bg-white/45 px-3 transition-all hover:-translate-y-0.5 hover:bg-white/70 dark:bg-white/5 dark:hover:bg-white/10", todo.isCompleted && "bg-daylog-mint/55")}>
            <button type="button" onClick={() => toggle(todo)} className={cn("grid size-8 shrink-0 place-items-center rounded-xl border-2 border-foreground/15 bg-white/55 transition hover:scale-105 focus-visible:ring-3 focus-visible:ring-ring/30 dark:bg-white/10", todo.isCompleted && "border-daylog-mint-ink/20 bg-daylog-mint-strong text-daylog-mint-ink")} aria-label={todo.isCompleted ? `Mark ${todo.text} unfinished` : `Mark ${todo.text} finished`} disabled={pending}>
              {todo.isCompleted && <Check className="size-4" />}
            </button>
            {editingId === todo.id ? (
              <form className="flex min-w-0 flex-1 gap-2" onSubmit={(event) => saveEdit(todo, event)} noValidate>
                <Input name="text" defaultValue={todo.text} autoFocus />
                <Button size="icon" aria-label="Save todo"><Check /></Button>
                <Button size="icon" variant="ghost" type="button" onClick={() => setEditingId(null)} aria-label="Cancel editing"><X /></Button>
              </form>
            ) : (
              <button type="button" onClick={() => setEditingId(todo.id)} className={cn("min-w-0 flex-1 py-2 text-left text-sm font-bold", todo.isCompleted && "text-muted-foreground line-through")}>
                {todo.text}
              </button>
            )}
            {editingId !== todo.id && (
              <Modal
                title="Todo actions"
                trigger={<Button variant="ghost" size="icon" aria-label={`Actions for ${todo.text}`}><MoreHorizontal /></Button>}
              >
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setEditingId(todo.id)}><Pencil /> Edit</Button>
                  <ConfirmButton title="Delete todo?" description="This todo will be removed permanently." action={() => remove(todo.id)} />
                </div>
              </Modal>
            )}
          </div>
        ))}
      </div>
      {adding ? (
        <form className="mt-3 flex gap-2 rounded-[1.2rem] bg-white/35 p-2 dark:bg-white/5" onSubmit={add} noValidate>
          <Input name="text" placeholder="What needs to be done?" autoFocus />
          <Button disabled={pending} aria-label="Save todo">{pending ? <LoaderCircle className="animate-spin" /> : <Check />}</Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setAdding(false)} aria-label="Cancel"><X /></Button>
        </form>
      ) : (
        <Button variant="ghost" className="mt-3 w-full justify-start border border-dashed border-daylog-yellow-ink/20 bg-white/25 text-daylog-yellow-ink hover:bg-white/55" onClick={() => setAdding(true)}><Plus /> Add todo</Button>
      )}
      <p className="mt-4 text-right text-xs font-extrabold text-foreground/45">{complete} / {todos.length} complete</p>
    </div>
  );
}
