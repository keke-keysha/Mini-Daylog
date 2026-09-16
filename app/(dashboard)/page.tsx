import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Your personal space</p>
          <h1>Home</h1>
        </div>
      </header>
      <Card className="min-h-52 items-center justify-center text-center">
        <p className="text-muted-foreground">Your DayLog dashboard is being prepared.</p>
      </Card>
    </main>
  );
}
