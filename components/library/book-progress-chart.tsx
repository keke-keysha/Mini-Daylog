"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BookProgressChart({ data }: { data: { date: string; pages: number }[] }) {
  if (data.length < 2) return null;
  return <div className="mt-5 h-44 rounded-2xl bg-white/35 p-3 dark:bg-black/10"><p className="mb-2 text-xs font-bold text-muted-foreground">Pages Read per Day</p><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ left: -28, right: 4, bottom: 14 }}><XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} /><YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} /><Tooltip contentStyle={{ border: 0, borderRadius: 14, background: "var(--popover)", boxShadow: "var(--daylog-shadow-hover)" }} /><Bar dataKey="pages" fill="var(--daylog-mint-strong)" radius={[8, 8, 3, 3]} /></BarChart></ResponsiveContainer></div>;
}
