"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function BookProgressChart({ data }: { data: { date: string; pages: number }[] }) {
  if (data.length < 2) return null;
  return <div className="mt-5 h-44"><p className="mb-2 text-xs font-medium text-muted-foreground">Pages Read per Day</p><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ left: -28, right: 4, bottom: 14 }}><XAxis dataKey="date" tickFormatter={(value: string) => value.slice(5)} tick={{ fontSize: 10 }} /><YAxis tick={{ fontSize: 10 }} /><Tooltip /><Bar dataKey="pages" fill="var(--primary)" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
