import { ThoughtEditor } from "@/components/thoughts/thought-editor";
import { requireSession } from "@/lib/auth";

export default async function NewThoughtPage() {
  await requireSession();
  return <ThoughtEditor />;
}
