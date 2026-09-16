"use client";

import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Select } from "@/components/ui/form-fields";
import { formatDisplayDate } from "@/lib/date";

type Point = { date: string; distance: number; duration: number; pace: number | null };
type Metric = "distance" | "duration" | "pace";

function formatPace(value: number | null) {
  if (value == null) return "—";
  return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")} /km`;
}

export function ActivityChart({ data }: { data: Point[] }) {
  const [metric, setMetric] = useState<Metric>("distance");
  if (data.length === 0) return <p className="grid min-h-64 place-items-center rounded-3xl border border-dashed border-foreground/10 bg-white/30 px-6 text-center text-sm text-muted-foreground dark:bg-white/[0.03]">No activity logged yet. Your first movement will appear here.</p>;
  const labels = { distance: "Distance (km)", duration: "Duration (min)", pace: "Pace (sec/km)" };
  return (
    <div className="mt-2 min-w-0">
      <div className="mb-4 flex justify-end"><Select className="w-full bg-white/60 sm:w-40 dark:bg-black/10" value={metric} onChange={(event) => setMetric(event.target.value as Metric)} aria-label="Chart metric"><option value="distance">Distance</option><option value="duration">Duration</option><option value="pace">Pace</option></Select></div>
      <div className="h-64 w-full rounded-3xl bg-white/35 px-1 py-3 sm:px-3 dark:bg-black/10">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="4 6" vertical={false} opacity={0.7} />
            <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={52} />
            <Tooltip contentStyle={{ border: "0", borderRadius: "16px", background: "var(--popover)", boxShadow: "var(--daylog-shadow-hover)", color: "var(--popover-foreground)" }} labelStyle={{ fontWeight: 700, marginBottom: 4 }} labelFormatter={(value) => formatDisplayDate(String(value))} formatter={(value) => [metric === "pace" ? formatPace(Number(value)) : Number(value).toFixed(metric === "distance" ? 2 : 0), labels[metric]]} />
            <Line type="monotone" dataKey={metric} stroke="var(--daylog-blue-ink)" strokeWidth={3} dot={{ r: 3.5, fill: "var(--daylog-blue-strong)", strokeWidth: 0 }} activeDot={{ r: 6, fill: "var(--daylog-blue-strong)", stroke: "var(--background)", strokeWidth: 3 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
