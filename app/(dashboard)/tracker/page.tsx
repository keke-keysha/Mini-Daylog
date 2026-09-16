import { ActivityChart } from "@/components/tracker/activity-chart";
import { ActivityForm } from "@/components/tracker/activity-form";
import { ActivityLog } from "@/components/tracker/activity-log";
import { Card } from "@/components/ui/card";
import { todayJakarta } from "@/lib/date";
import { getTrackerData } from "@/lib/data/tracker";

export const dynamic = "force-dynamic";

function durationLabel(minutes: number) { return `${Math.floor(minutes / 60)}h ${minutes % 60}m`; }

export default async function TrackerPage() {
  const data = await getTrackerData();
  const today = todayJakarta();
  return (
    <main className="page-shell">
      <header className="page-header"><div><p className="eyebrow">Move and recover</p><h1>Tracker</h1></div></header>
      <Card><h2 className="section-title">Activity Chart</h2><ActivityChart data={data.chart} /></Card>
      <Card><h2 className="section-title">Activity Log</h2><ActivityLog today={today} rows={data.rows} /></Card>
      <Card><h2 className="section-title">Weekly Summary</h2><div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">Total Distance</p><p className="mt-1 text-xl font-semibold">{data.weekly.distance.toFixed(2)} km</p></div><div className="rounded-2xl bg-muted p-4"><p className="text-xs text-muted-foreground">Total Duration</p><p className="mt-1 text-xl font-semibold">{durationLabel(data.weekly.duration)}</p></div></div></Card>
      <Card><h2 className="section-title">Add Activity</h2><ActivityForm today={today} /></Card>
    </main>
  );
}
