"use client";

import { useState, useTransition } from "react";
import { CalendarClock, Check, LoaderCircle, MoreHorizontal, Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  createFocusTask,
  createMaterial,
  createSubtopic,
  deleteFocusTask,
  deleteMaterial,
  deleteSubtopic,
  renameMaterial,
  toggleFocusTask,
  toggleSubtopic,
  updateFocusTask,
  updateSubtopic,
} from "@/actions/focus";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Input } from "@/components/ui/form-fields";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/progress";
import { formatDisplayDate } from "@/lib/date";
import { cn } from "@/lib/utils";

type Material = { id: string; title: string };
type Subtopic = { id: string; materialId: string; title: string; isCompleted: boolean };
type Task = { id: string; materialId: string; title: string; deadline: string; isCompleted: boolean };

function ResultToast({ ok, error, success }: { ok: boolean; error?: string; success: string }) {
  if (ok) toast.success(success);
  else toast.error(error ?? "Something went wrong");
  return null;
}

export function FocusBoard({ materials, initialSubtopics, initialTasks }: { materials: Material[]; initialSubtopics: Subtopic[]; initialTasks: Task[] }) {
  const router = useRouter();
  const [subtopics, setSubtopics] = useState(initialSubtopics);
  const [tasks, setTasks] = useState(initialTasks);
  const [pending, startTransition] = useTransition();

  function refreshResult(result: { ok: boolean; error?: string }, success: string) {
    ResultToast({ ...result, success });
    if (result.ok) router.refresh();
  }

  function submitSimple(event: React.FormEvent<HTMLFormElement>, action: (value: string) => Promise<{ ok: boolean; error?: string }>, success: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const value = new FormData(form).get("title")?.toString() ?? "";
    startTransition(async () => {
      const result = await action(value);
      refreshResult(result, success);
      if (result.ok) form.reset();
    });
  }

  function toggleSubtopicItem(item: Subtopic) {
    const completed = !item.isCompleted;
    setSubtopics((all) => all.map((value) => value.id === item.id ? { ...value, isCompleted: completed } : value));
    startTransition(async () => {
      const result = await toggleSubtopic(item.id, completed);
      if (!result.ok) setSubtopics((all) => all.map((value) => value.id === item.id ? item : value));
      refreshResult(result, completed ? "Subtopic completed" : "Subtopic reopened");
    });
  }

  function toggleTaskItem(item: Task) {
    const completed = !item.isCompleted;
    setTasks((all) => all.map((value) => value.id === item.id ? { ...value, isCompleted: completed } : value));
    startTransition(async () => {
      const result = await toggleFocusTask(item.id, completed);
      if (!result.ok) setTasks((all) => all.map((value) => value.id === item.id ? item : value));
      refreshResult(result, completed ? "Task completed" : "Task reopened");
    });
  }

  async function remove(action: () => Promise<{ ok: boolean; error?: string }>, success: string) {
    const result = await action();
    refreshResult(result, success);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {materials.map((material) => {
        const materialSubtopics = subtopics.filter((item) => item.materialId === material.id);
        const materialTasks = tasks.filter((item) => item.materialId === material.id);
        const progress = materialSubtopics.length ? (materialSubtopics.filter((item) => item.isCompleted).length / materialSubtopics.length) * 100 : 0;
        return (
          <Modal
            key={material.id}
            title={material.title}
            description="Track topics and deadline-based tasks for this material."
            contentClassName="sm:w-[min(94vw,760px)]"
            trigger={
              <button className="rounded-3xl text-left focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
                <Card className="min-h-44 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
                  <div className="mb-auto flex items-start justify-between gap-3"><h2 className="text-lg font-semibold">{material.title}</h2><span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span></div>
                  <Progress value={progress} className="mt-8" />
                  <p className="mt-3 text-xs text-muted-foreground">{materialSubtopics.filter((item) => item.isCompleted).length} of {materialSubtopics.length} subtopics completed</p>
                </Card>
              </button>
            }
          >
            <div className="space-y-7">
              <section>
                <div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Material</h3><ConfirmButton title="Delete material?" description="All subtopics and tasks inside this material will also be deleted." action={() => remove(() => deleteMaterial(material.id), "Material deleted")} /></div>
                <form className="flex gap-2" noValidate onSubmit={(event) => submitSimple(event, (title) => renameMaterial(material.id, title), "Material updated")}>
                  <Input name="title" defaultValue={material.title} />
                  <Button disabled={pending}><Pencil /> Rename</Button>
                </form>
              </section>
              <section>
                <h3 className="mb-3 font-semibold">Subtopics</h3>
                <div className="space-y-2">
                  {materialSubtopics.map((item) => (
                    <div key={item.id} className="flex min-h-11 items-center gap-2 rounded-xl bg-muted/50 px-2">
                      <button type="button" onClick={() => toggleSubtopicItem(item)} className={cn("grid size-7 shrink-0 place-items-center rounded-lg border", item.isCompleted && "border-primary bg-primary text-primary-foreground")} aria-label={`Mark ${item.title} ${item.isCompleted ? "unfinished" : "finished"}`}>{item.isCompleted && <Check className="size-4" />}</button>
                      <span className={cn("min-w-0 flex-1 text-sm", item.isCompleted && "text-muted-foreground line-through")}>{item.title}</span>
                      <Modal title="Edit subtopic" trigger={<Button size="icon" variant="ghost" aria-label={`Edit ${item.title}`}><MoreHorizontal /></Button>}>
                        <form className="space-y-3" noValidate onSubmit={(event) => submitSimple(event, (title) => updateSubtopic(item.id, title), "Subtopic updated")}><Input name="title" defaultValue={item.title} /><div className="flex justify-between"><ConfirmButton title="Delete subtopic?" description="This cannot be undone." action={() => remove(() => deleteSubtopic(item.id), "Subtopic deleted")} /><Button disabled={pending}>Save</Button></div></form>
                      </Modal>
                    </div>
                  ))}
                  {materialSubtopics.length === 0 && <p className="text-sm text-muted-foreground">No subtopics yet.</p>}
                </div>
                <form className="mt-3 flex gap-2" noValidate onSubmit={(event) => submitSimple(event, (title) => createSubtopic(material.id, title), "Subtopic added")}><Input name="title" placeholder="Add a subtopic" /><Button disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Plus />} Add</Button></form>
              </section>
              <section>
                <h3 className="mb-3 font-semibold">Tasks</h3>
                <div className="space-y-2">
                  {materialTasks.map((task) => (
                    <div key={task.id} className="flex min-h-12 items-center gap-2 rounded-xl bg-muted/50 px-2">
                      <button type="button" onClick={() => toggleTaskItem(task)} className={cn("grid size-7 shrink-0 place-items-center rounded-lg border", task.isCompleted && "border-primary bg-primary text-primary-foreground")} aria-label={`Mark ${task.title} ${task.isCompleted ? "unfinished" : "finished"}`}>{task.isCompleted && <Check className="size-4" />}</button>
                      <div className={cn("min-w-0 flex-1", task.isCompleted && "opacity-60")}><p className={cn("truncate text-sm", task.isCompleted && "line-through")}>{task.title}</p><p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><CalendarClock className="size-3" /> {formatDisplayDate(task.deadline)}</p></div>
                      <Modal title="Edit task" trigger={<Button size="icon" variant="ghost" aria-label={`Edit ${task.title}`}><MoreHorizontal /></Button>}>
                        <TaskForm initial={task} pending={pending} onSubmit={(title, deadline) => updateFocusTask(task.id, title, deadline).then((result) => refreshResult(result, "Task updated"))} />
                        <div className="mt-3"><ConfirmButton title="Delete task?" description="This task will be removed permanently." action={() => remove(() => deleteFocusTask(task.id), "Task deleted")} /></div>
                      </Modal>
                    </div>
                  ))}
                  {materialTasks.length === 0 && <p className="text-sm text-muted-foreground">No tasks yet.</p>}
                </div>
                <div className="mt-3"><TaskForm pending={pending} onSubmit={(title, deadline) => createFocusTask(material.id, title, deadline).then((result) => refreshResult(result, "Task added"))} /></div>
              </section>
            </div>
          </Modal>
        );
      })}
      <Modal title="New Material" description="Create a learning area, project, or topic." trigger={<button className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-3xl border border-dashed text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"><Plus className="size-6" /> New Material</button>}>
        <form className="flex gap-2" noValidate onSubmit={(event) => submitSimple(event, createMaterial, "Material added")}><Input name="title" placeholder="Material title" autoFocus /><Button disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Plus />} Create</Button></form>
      </Modal>
    </div>
  );
}

function TaskForm({ initial, pending, onSubmit }: { initial?: Task; pending: boolean; onSubmit: (title: string, deadline: string) => Promise<unknown> }) {
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = new FormData(form);
    void onSubmit(values.get("title")?.toString() ?? "", values.get("deadline")?.toString() ?? "").then(() => {
      if (!initial) form.reset();
    });
  }
  return (
    <form className="grid gap-2 sm:grid-cols-[1fr_170px_auto]" noValidate onSubmit={submit}>
      <Input name="title" placeholder="Task title" defaultValue={initial?.title} />
      <Input name="deadline" type="date" defaultValue={initial?.deadline} aria-label="Deadline" />
      <Button disabled={pending}>{pending ? <LoaderCircle className="animate-spin" /> : <Plus />} {initial ? "Save" : "Add task"}</Button>
    </form>
  );
}
