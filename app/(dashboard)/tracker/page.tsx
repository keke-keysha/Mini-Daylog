import { Activity, ChartNoAxesCombined, Clock3, Footprints, Plus } from "lucide-react";

import { ActivityChart } from "@/components/tracker/activity-chart";
import { ActivityForm } from "@/components/tracker/activity-form";
import { ActivityLog } from "@/components/tracker/activity-log";
import { Card } from "@/components/ui/card";
import { MetricCard, PageHeading, PastelIcon } from "@/components/ui/presentation";
import { todayJakarta } from "@/lib/date";
import { getTrackerData } from "@/lib/data/tracker";

export const dynamic = "force-dynamic";

function durationLabel(minutes: number) { return `${Math.floor(minutes / 60)}h ${minutes % 60}m`; }

export default async function TrackerPage() {
  const data = await getTrackerData();
  const today = todayJakarta();
  return (
    <main className="page-shell">
      <PageHeading eyebrow="Move and recover" title="Activity" description="Keep your movement in one gentle rhythm." />
      <div className="grid gap-4 xl:grid-cols-12">
        <Card className="bento-peach border-0 xl:col-span-12">
          <div className="mb-5 flex items-center gap-3"><PastelIcon icon={Plus} tone="peach" className="bg-daylog-peach-strong" /><div><p className="eyebrow">Log movement</p><h2 className="section-title mb-0">Add Activity</h2></div></div>
          <ActivityForm today={today} />
        </Card>
        <Card className="bento-blue border-0 xl:col-span-8">
          <div className="mb-2 flex items-center gap-3"><PastelIcon icon={ChartNoAxesCombined} tone="blue" className="bg-daylog-blue-strong" /><div><p className="eyebrow">Your pattern</p><h2 className="section-title mb-0">Activity Chart</h2></div></div>
          <ActivityChart data={data.chart} />
        </Card>
        <Card className="bento-lavender border-0 xl:col-span-4">
          <div className="mb-5 flex items-center gap-3"><PastelIcon icon={Activity} tone="lavender" className="bg-daylog-lavender-strong" /><div><p className="eyebrow">Last 7 days</p><h2 className="section-title mb-0">Weekly Summary</h2></div></div>
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-1">
            <MetricCard icon={Footprints} value={`${data.weekly.distance.toFixed(2)} km`} label="Total Distance" tone="mint" />
            <MetricCard icon={Clock3} value={durationLabel(data.weekly.duration)} label="Total Duration" tone="yellow" />
          </div>
        </Card>
        <Card className="bento-pink min-w-0 border-0 xl:col-span-12">
          <div className="mb-5 flex items-center gap-3"><PastelIcon icon={Footprints} tone="pink" className="bg-daylog-pink-strong" /><div><p className="eyebrow">Your movement diary</p><h2 className="section-title mb-0">Activity Log</h2></div></div>
          <ActivityLog today={today} rows={data.rows} />
        </Card>
      </div>
    </main>
  );
}
