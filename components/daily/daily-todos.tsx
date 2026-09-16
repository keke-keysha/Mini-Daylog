"use client";

import { useState, useTransition } from "react";
import { Check, LoaderCircle, MoreHorizontal, Pencil, Plus, X } from "lucide-react";
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
      <div className="space-y-2">
        {todos.map((todo) => (
          <div key={todo.id} className="group flex min-h-11 items-center gap-2 rounded-xl px-2 hover:bg-muted/70">
            <button type="button" onClick={() => toggle(todo)} className={cn("grid size-7 shrink-0 place-items-center rounded-lg border", todo.isCompleted && "border-primary bg-primary text-primary-foreground")} aria-label={todo.isCompleted ? `Mark ${todo.text} unfinished` : `Mark ${todo.text} finished`} disabled={pending}>
              {todo.isCompleted && <Check className="size-4" />}
            </button>
            {editingId === todo.id ? (
              <form className="flex min-w-0 flex-1 gap-2" onSubmit={(event) => saveEdit(todo, event)} noValidate>
                <Input name="text" defaultValue={todo.text} autoFocus />
                <Button size="icon" aria-label="Save todo"><Check /></Button>
                <Button size="icon" variant="ghost" type="button" onClick={() => setEditingId(null)} aria-label="Cancel editing"><X /></Button>
              </form>
            ) : (
              <button type="button" onClick={() => setEditingId(todo.id)} className={cn("min-w-0 flex-1 py-2 text-left text-sm", todo.isCompleted && "text-muted-foreground line-through")}>
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
        <form className="mt-3 flex gap-2" onSubmit={add} noValidate>
          <Input name="text" placeholder="What needs to be done?" autoFocus />
          <Button disabled={pending} aria-label="Save todo">{pending ? <LoaderCircle className="animate-spin" /> : <Check />}</Button>
          <Button type="button" variant="ghost" size="icon" onClick={() => setAdding(false)} aria-label="Cancel"><X /></Button>
        </form>
      ) : (
        <Button variant="ghost" className="mt-3 w-full justify-start text-muted-foreground" onClick={() => setAdding(true)}><Plus /> Add todo</Button>
      )}
      <p className="mt-4 text-right text-xs text-muted-foreground">{complete} / {todos.length} complete</p>
    </div>
  );
}
