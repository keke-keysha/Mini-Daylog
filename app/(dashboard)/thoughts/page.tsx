import Image from "next/image";
import Link from "next/link";
import { NotebookPen, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState, PageHeading } from "@/components/ui/presentation";
import { getThoughts } from "@/lib/data/thoughts";
import { formatDisplayDate, jakartaDate } from "@/lib/date";

export const dynamic = "force-dynamic";

export default async function ThoughtsPage() {
  const thoughts = await getThoughts();
  const newThought = <Button asChild className="min-h-11"><Link href="/thoughts/new"><Plus />New Thought</Link></Button>;
  const tones = ["bento-lavender", "bento-peach", "bento-blue", "bento-mint"];
  return (
    <main className="page-shell">
      <PageHeading eyebrow="Room for your ideas" title="Thoughts" description="Notes and little stories to return to anytime." action={newThought} />
      {thoughts.length ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {thoughts.map((thought, index) => (
            <Link key={thought.id} href={`/thoughts/${thought.id}`} className="min-w-0 rounded-[1.75rem] outline-none focus-visible:ring-3 focus-visible:ring-ring/40">
              <Card className={`${tones[index % tones.length]} h-full overflow-hidden transition hover:-translate-y-1`}>
                {thought.thumbnail && <div className="relative mb-4 aspect-video overflow-hidden rounded-2xl"><Image src={thought.thumbnail} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw" className="object-cover" unoptimized /></div>}
                <h2 className="break-words font-heading text-xl font-semibold">{thought.title}</h2>
                <p className="mt-2 text-xs font-bold text-muted-foreground">Last edited <time dateTime={thought.updatedAt.toISOString()}>{formatDisplayDate(jakartaDate(thought.updatedAt))}</time></p>
                {thought.excerpt && <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-foreground/75">{thought.excerpt}</p>}
              </Card>
            </Link>
          ))}
        </div>
      ) : <EmptyState icon={NotebookPen} title="A little room to think" description="Save an idea, a story, or anything you want to remember." action={newThought} />}
    </main>
  );
}
