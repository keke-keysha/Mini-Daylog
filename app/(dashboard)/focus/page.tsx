import { FocusBoard } from "@/components/focus/focus-board";
import { PageHeading } from "@/components/ui/presentation";
import { getFocusData } from "@/lib/data/focus";

export const dynamic = "force-dynamic";

export default async function FocusPage() {
  const { materials, subtopics, tasks } = await getFocusData();
  const version = [...materials, ...subtopics, ...tasks].map((item) => `${item.id}-${item.updatedAt.getTime()}`).join("_");
  return (
    <main className="page-shell">
      <PageHeading
        eyebrow="Learn with intention"
        title="Focus"
        description="Turn learning goals into calm, manageable steps."
      />
      <FocusBoard key={version} materials={materials.map(({ id, title }) => ({ id, title }))} initialSubtopics={subtopics.map(({ id, materialId, title, isCompleted }) => ({ id, materialId, title, isCompleted }))} initialTasks={tasks.map(({ id, materialId, title, deadline, isCompleted }) => ({ id, materialId, title, deadline, isCompleted }))} />
    </main>
  );
}
