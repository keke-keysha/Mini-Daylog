import { notFound } from "next/navigation";

import { ThoughtEditor } from "@/components/thoughts/thought-editor";
import { getThought } from "@/lib/data/thoughts";
import { formatDisplayDate, jakartaDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function ThoughtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const thought = await getThought(id);
  if (!thought) notFound();
  return <ThoughtEditor key={thought.id} thought={{ id: thought.id, title: thought.title, content: thought.content, lastEdited: formatDisplayDate(jakartaDate(thought.updatedAt)) }} />;
}
