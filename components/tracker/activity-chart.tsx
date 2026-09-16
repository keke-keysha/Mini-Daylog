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
  if (data.length === 0) return <p className="grid min-h-52 place-items-center text-sm text-muted-foreground">No activity logged yet.</p>;
  const labels = { distance: "Distance (km)", duration: "Duration (min)", pace: "Pace (sec/km)" };
  return (
    <div>
      <div className="mb-4 flex justify-end"><Select className="w-40" value={metric} onChange={(event) => setMetric(event.target.value as Metric)} aria-label="Chart metric"><option value="distance">Distance</option><option value="duration">Duration</option><option value="pace">Pace</option></Select></div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.35} />
            <XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} width={52} />
            <Tooltip labelFormatter={(value) => formatDisplayDate(String(value))} formatter={(value) => [metric === "pace" ? formatPace(Number(value)) : Number(value).toFixed(metric === "distance" ? 2 : 0), labels[metric]]} />
            <Line type="monotone" dataKey={metric} stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} connectNulls={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
