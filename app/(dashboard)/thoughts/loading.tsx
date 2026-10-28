import { Card } from "@/components/ui/card";

export default function ThoughtsLoading() {
  return (
    <main className="page-shell" aria-busy="true" aria-label="Loading thoughts">
      <p className="font-heading text-2xl font-semibold" role="status">Gathering your thoughts...</p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {["bento-lavender", "bento-peach", "bento-blue"].map((tone) => <Card key={tone} className={`${tone} min-h-48 animate-pulse motion-reduce:animate-none`} />)}
      </div>
    </main>
  );
}
