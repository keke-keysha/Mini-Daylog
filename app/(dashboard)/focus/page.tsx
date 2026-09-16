import { FocusBoard } from "@/components/focus/focus-board";
import { getFocusData } from "@/lib/data/focus";

export const dynamic = "force-dynamic";

export default async function FocusPage() {
  const { materials, subtopics, tasks } = await getFocusData();
  const version = [...materials, ...subtopics, ...tasks].map((item) => `${item.id}-${item.updatedAt.getTime()}`).join("_");
  return (
    <main className="page-shell">
      <header className="page-header"><div><p className="eyebrow">Learn with intention</p><h1>Focus</h1></div></header>
      {materials.length === 0 ? <div className="rounded-3xl border bg-card p-6"><p className="text-sm text-muted-foreground">No focus material yet. Create your first material.</p></div> : null}
      <FocusBoard key={version} materials={materials.map(({ id, title }) => ({ id, title }))} initialSubtopics={subtopics.map(({ id, materialId, title, isCompleted }) => ({ id, materialId, title, isCompleted }))} initialTasks={tasks.map(({ id, materialId, title, deadline, isCompleted }) => ({ id, materialId, title, deadline, isCompleted }))} />
    </main>
  );
}
