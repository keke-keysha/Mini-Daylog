import Link from "next/link";
import { NotebookPen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/presentation";

export default function ThoughtNotFound() {
  return <main className="page-shell"><EmptyState icon={NotebookPen} title="Thought not found" description="This note may have been deleted." action={<Button asChild><Link href="/thoughts">Back to Thoughts</Link></Button>} /></main>;
}
