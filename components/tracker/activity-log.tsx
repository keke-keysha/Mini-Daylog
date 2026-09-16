"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { deleteActivity } from "@/actions/tracker";
import { ActivityForm, type Activity } from "@/components/tracker/activity-form";
import { Button } from "@/components/ui/button";
import { ConfirmButton } from "@/components/ui/confirm-button";
import { Modal } from "@/components/ui/modal";
import { formatDisplayDate } from "@/lib/date";
import { cn } from "@/lib/utils";

function pace(seconds: number | null) {
  if (seconds == null) return "—";
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")} /km`;
}

export function ActivityLog({ rows, today }: { rows: Activity[]; today: string }) {
  const router = useRouter();
  async function remove(id: string) {
    const result = await deleteActivity(id);
    if (!result.ok) return void toast.error(result.error);
    toast.success("Activity deleted");
    router.refresh();
  }
  if (rows.length === 0) return <p className="rounded-3xl border border-dashed border-foreground/10 bg-white/30 px-6 py-10 text-center text-sm text-muted-foreground dark:bg-white/[0.03]">No activity logged yet. Add your first activity above.</p>;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground"><span className="legend fasting">Fasting</span><span className="legend sick">Sick</span><span className="legend red-day">Red Day</span><span className="legend">Normal</span></div>
      <div className="overflow-x-auto rounded-3xl bg-white/45 dark:bg-black/10">
        <table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-white/55 text-xs text-muted-foreground dark:bg-white/5"><tr>{["Date", "Activity", "Distance", "Duration", "Pace"].map((header) => <th key={header} className="px-4 py-3.5 font-bold">{header}</th>)}</tr></thead><tbody>
          {rows.map((row) => {
            const priority = row.isRedDay ? "row-red-day" : row.isSick ? "row-sick" : row.isFasting ? "row-fasting" : "";
            return <tr key={row.id} className={cn("border-t border-foreground/5 transition-colors hover:bg-white/50 dark:hover:bg-white/5", priority)}><td className="px-4 py-2.5"><Modal title={`Edit ${row.activity}`} trigger={<Button variant="ghost" className="-ml-3">{formatDisplayDate(row.date)}</Button>}><ActivityForm today={today} initial={row} /><div className="mt-4"><ConfirmButton title="Delete activity?" description="This activity record will be permanently deleted." action={() => remove(row.id)} /></div></Modal></td><td className="px-4 py-4 font-bold">{row.activity}</td><td className="px-4 py-4">{row.distanceKm == null ? "—" : `${Number(row.distanceKm).toFixed(2)} km`}</td><td className="px-4 py-4">{row.durationMinutes} min</td><td className="px-4 py-4">{pace(row.paceSecondsPerKm)}</td></tr>;
          })}
        </tbody></table>
      </div>
    </div>
  );
}
